import type { StorageValue } from 'zustand/middleware';
import type { PersistStorage } from 'zustand/middleware';

/**
 * Helper to check if an object is serializable for IndexedDB
 * Removes functions and non-serializable content
 */
function makeSerializable<T>(value: T): T {
  if (!value || typeof value !== 'object') {
    return value;
  }
  
  if (Array.isArray(value)) {
    return value.map(item => makeSerializable(item)) as unknown as T;
  }
  
  // Create a new object with only serializable properties
  const serializableObj = {} as Record<string, unknown>;
  for (const [key, prop] of Object.entries(value as Record<string, unknown>)) {
    // Skip functions
    if (typeof prop === 'function') continue;
    
    // Recursively make objects serializable
    if (prop && typeof prop === 'object' && !ArrayBuffer.isView(prop)) {
      serializableObj[key] = makeSerializable(prop);
    } else {
      serializableObj[key] = prop;
    }
  }
  
  return serializableObj as T;
}

/**
 * Creates a factory for IndexedDB storage adapters that can be used with Zustand's persist middleware.
 * Supports multiple stores concurrently with a single database connection.
 * 
 * @param dbName The name of the IndexedDB database
 * @param version The version of the database schema
 * @returns A function that creates a storage adapter for a specific store
 */
const createIndexedDBStorageFactory = (dbName = "flight-booking-app", version = 1) => {
  // Shared database instance
  let dbInstance: IDBDatabase | null = null;
  // Track pending database connections
  let dbPromise: Promise<IDBDatabase> | null = null;
  // Set of all store names to ensure they're created during upgrades
  const allStoreNames = new Set<string>();

  // Get or create the database connection
  const getDB = async (): Promise<IDBDatabase> => {
    if (dbInstance) return dbInstance;
    
    // If there's already a connection attempt in progress, return that
    if (dbPromise) return dbPromise;
    
    dbPromise = new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open(dbName, version);
      
      request.onerror = () => {
        console.error("Failed to open IndexedDB:", request.error);
        dbPromise = null;
        reject(request.error);
      };
      
      request.onsuccess = () => {
        dbInstance = request.result;
        dbPromise = null;
        
        // Reset the instance if the connection is closed
        dbInstance.onclose = () => {
          dbInstance = null;
        };
        
        dbInstance.onerror = (event) => {
          console.error("IndexedDB error:", event);
        };
        
        resolve(dbInstance);
      };
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Create all registered stores during upgrade
        [...allStoreNames].forEach(storeName => {
          if (!db.objectStoreNames.contains(storeName)) {
            db.createObjectStore(storeName);
          }
        });
      };
    });
    
    return dbPromise;
  };

  /**
   * Clears all data from all object stores in the database
   * Use this function when user signs out
   * @returns A promise that resolves when all stores are cleared
   */
  const clearAllData = async (): Promise<void> => {
    try {
      const db = await getDB();
      
      return new Promise<void>((resolve, reject) => {
        try {
          // Create a transaction for all object stores
          const storeNames = Array.from(db.objectStoreNames);
          if (storeNames.length === 0) {
            resolve();
            return;
          }
          
          const transaction = db.transaction(storeNames, "readwrite");
          let completedCount = 0;
          let hasError = false;
          
          // Set up transaction completion handler
          transaction.oncomplete = () => {
            if (!hasError) {
              console.log("Successfully cleared all data from IndexedDB");
              resolve();
            }
          };
          
          transaction.onerror = () => {
            console.error("Error clearing data from IndexedDB:", transaction.error);
            hasError = true;
            reject(transaction.error);
          };
          
          // Clear each store
          storeNames.forEach(storeName => {
            const store = transaction.objectStore(storeName);
            const request = store.clear();
            
            request.onsuccess = () => {
              completedCount++;
              console.log(`Cleared data from store: ${storeName}`);
              
              // If all stores are processed, resolve the promise
              if (completedCount === storeNames.length && !hasError) {
                resolve();
              }
            };
            
            request.onerror = () => {
              console.error(`Error clearing store ${storeName}:`, request.error);
              hasError = true;
              reject(request.error);
            };
          });
        } catch (error) {
          console.error("Error in clearAllData transaction:", error);
          reject(error instanceof Error ? error : new Error(String(error)));
        }
      });
    } catch (error) {
      console.error("Database connection error in clearAllData:", error);
      throw error instanceof Error ? error : new Error(String(error));
    }
  };

  /**
   * Create a storage adapter for a specific store
   * @param storeName The name of the object store for this adapter
   * @returns A storage adapter compatible with Zustand's persist middleware
   */
  const createStorage = <T extends Record<string, unknown>>(storeName: string): PersistStorage<T> => {
    // Register this store name for database upgrades
    allStoreNames.add(storeName);
    
    // Create a PersistStorage object
    const storage: PersistStorage<T> = {
      getItem: async (name: string): Promise<StorageValue<T> | null> => {
        try {
          const db = await getDB();
          
          return new Promise<StorageValue<T> | null>((resolve, reject) => {
            try {
              const transaction = db.transaction(storeName, "readonly");
              const store = transaction.objectStore(storeName);
              const request = store.get(name);
              
              request.onsuccess = () => {
                // Return the value or null if not found
                resolve(request.result || null);
              };
              
              request.onerror = () => {
                console.error(`Error getting item '${name}' from store '${storeName}':`, request.error);
                reject(request.error);
              };
              
              // Handle transaction errors
              transaction.onerror = () => {
                reject(transaction.error);
              };
            } catch (error) {
              console.error(`Error in getItem for '${name}' in store '${storeName}':`, error);
              reject(error);
            }
          });
        } catch (error) {
          console.error(`Database connection error in getItem for '${storeName}':`, error);
          return null;
        }
      },
      
      setItem: async (name: string, value: StorageValue<T>): Promise<void> => {
        try {
          const db = await getDB();
          
          return new Promise<void>((resolve, reject) => {
            try {
              const transaction = db.transaction(storeName, "readwrite");
              const store = transaction.objectStore(storeName);
              
              // Make sure the value is serializable before storing
              const serializableValue = makeSerializable(value);
              const request = store.put(serializableValue, name);
              
              request.onsuccess = () => {
                resolve();
              };
              
              request.onerror = () => {
                console.error(`Error setting item '${name}' in store '${storeName}':`, request.error);
                reject(request.error);
              };
              
              // Handle transaction errors
              transaction.onerror = () => {
                reject(transaction.error);
              };
            } catch (error) {
              console.error(`Error in setItem for '${name}' in store '${storeName}':`, error);
              reject(error instanceof Error ? error : new Error(String(error)));
            }
          });
        } catch (error) {
          console.error(`Database connection error in setItem for '${storeName}':`, error);
          throw error instanceof Error ? error : new Error(String(error));
        }
      },
      
      removeItem: async (name: string): Promise<void> => {
        try {
          const db = await getDB();
          
          return new Promise<void>((resolve, reject) => {
            try {
              const transaction = db.transaction(storeName, "readwrite");
              const store = transaction.objectStore(storeName);
              const request = store.delete(name);
              
              request.onsuccess = () => {
                resolve();
              };
              
              request.onerror = () => {
                console.error(`Error removing item '${name}' from store '${storeName}':`, request.error);
                reject(request.error);
              };
              
              // Handle transaction errors
              transaction.onerror = () => {
                reject(transaction.error);
              };
            } catch (error) {
              console.error(`Error in removeItem for '${name}' in store '${storeName}':`, error);
              reject(error instanceof Error ? error : new Error(String(error)));
            }
          });
        } catch (error) {
          console.error(`Database connection error in removeItem for '${storeName}':`, error);
          throw error instanceof Error ? error : new Error(String(error));
        }
      },
    };
    
    return storage;
  };

  // Return both the storage factory and the clearAllData function
  return {
    createStorage,
    clearAllData
  };
};

// Create the storage factory and export its components
const { createStorage, clearAllData } = createIndexedDBStorageFactory("flight-booking-app", 1);

export { createStorage as storageFactory, clearAllData };