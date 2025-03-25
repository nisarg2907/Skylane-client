import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase } from '../lib/supabase'
import type { User as SupabaseUser } from '@supabase/supabase-js'
import axios from 'axios'
import { storageFactory, clearAllData } from './indexedDbStorage'

const API_URL = import.meta.env.VITE_BACKEND_URL;

interface AppUser {
  id: string | undefined;
  email: string;
  firstName: string;
  lastName: string;
}

interface AuthState {
  user: AppUser | null;
  loading: boolean;
  error: string | null;
  accessToken: string | null;
  refreshToken: string | null;
  tokenRefreshInterval: NodeJS.Timeout | null;
  signUp: (email: string, password: string, firstName: string, lastName: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  initializeAuth: () => () => void;
  refreshSession: () => Promise<boolean>;
  getAccessToken: () => Promise<string | null>;
  updateUserInStore: (updatedUser: AppUser) => Promise<void>;
}

const mapSupabaseUser = (user: SupabaseUser | null): AppUser | null => {
  if (!user) return null;
  
  return {
    id: user.id,
    email: user.email ?? '',
    firstName: user.user_metadata?.first_name ?? '',
    lastName: user.user_metadata?.last_name ?? ''
  };
};

const syncUserWithBackend = async (user: SupabaseUser | null) => {
  if (!user) {
    return null;
  }
  
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const accessToken = sessionData.session?.access_token;
    
    const response = await axios.post(
      `${API_URL}/auth/sync`,
      {
        authId: user.id,
        email: user.email,
        firstName: user.user_metadata?.first_name,
        lastName: user.user_metadata?.last_name
      },
      {
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined
      }
    );
    return response.data;
  } catch {
    return null;
  }
}

// Create an IndexedDB storage for auth data
const authStorage = storageFactory('auth-store');

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      loading: false,
      error: null,
      accessToken: null,
      refreshToken: null,
      tokenRefreshInterval: null,

      // Get a valid access token, refreshing if necessary
      getAccessToken: async () => {
        // First check if we have a current session
        const { data: sessionData } = await supabase.auth.getSession();
        
        if (!sessionData.session) {
          return null;
        }
        
        // Check if token is about to expire (less than 5 minutes remaining)
        const expiresAt = sessionData.session.expires_at ? sessionData.session.expires_at * 1000 : 0;
        const now = Date.now();
        const timeUntilExpiry = expiresAt - now;
        
        // If token is about to expire, refresh it first
        if (timeUntilExpiry < 5 * 60 * 1000) {
          const refreshed = await get().refreshSession();
          if (!refreshed) {
            return null;
          }
        }
        
        // Return the current token (either existing or newly refreshed)
        const currentToken = get().accessToken;
        return currentToken;
      },

      refreshSession: async () => {
        try {
          // First check if we have a session
          const { data: sessionData } = await supabase.auth.getSession();
          if (!sessionData.session) {
            return false;
          }

          const { data, error } = await supabase.auth.refreshSession();
          
          if (error) {
            
            // If token refresh fails, clear the user session
            set({ 
              user: null, 
              accessToken: null, 
              refreshToken: null 
            });
            return false;
          }
          
          if (data.session) {
            set({
              accessToken: data.session.access_token,
              refreshToken: data.session.refresh_token,
            });
            return true;
          }
          
          return false;
        } catch  {
          return false;
        }
      },

      signUp: async (email, password, firstName, lastName) => {
        set({ loading: true, error: null });
        try {
          const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                first_name: firstName,
                last_name: lastName,
              },
              emailRedirectTo: window.location.origin,
            }
          });
          
          if (error) {
            throw error;
          }
          
          set({ loading: false });
          alert('Please check your email to verify your account.');
        } catch (err) {
          const errorMessage = (err instanceof Error) ? err.message : 'An unknown error occurred';
          set({ error: errorMessage, loading: false });
        }
      },

      signIn: async (email, password) => {
        set({ loading: true, error: null });
        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });
          
          if (error) {
            throw error;
          }
          
          
          if (data.session) {
            set({
              accessToken: data.session.access_token,
              refreshToken: data.session.refresh_token,
            });
          }

          if (data.user) {
            await syncUserWithBackend(data.user);
            const mappedUser = mapSupabaseUser(data.user);
            set({ user: mappedUser, loading: false, error: null });
          } else {
            throw new Error('No user returned from sign in');
          }
        } catch (err) {
          const errorMessage = (err instanceof Error) ? err.message : 'An unknown error occurred';
          set({ error: errorMessage, loading: false });
        }
      },

      signOut: async () => {
        set({ loading: true });
        try {
          // Clear any refresh intervals
          const interval = get().tokenRefreshInterval;
          if (interval) {
            clearInterval(interval);
          }
          
          const { error } = await supabase.auth.signOut();
          if (error) throw error;
          
          set({ 
            user: null, 
            loading: false, 
            accessToken: null, 
            refreshToken: null,
            tokenRefreshInterval: null
          });
          await clearAllData()
        } catch (err) {
          const errorMessage = (err instanceof Error) ? err.message : 'An unknown error occurred';
          set({ error: errorMessage, loading: false });
        }
      },   
      
      initializeAuth: () => {
        set({ loading: true });
        
        // Handle session setup
        const setupSession = async () => {
          try {
            const { data, error } = await supabase.auth.getSession();
            
            if (error) {
              set({ loading: false });
              return;
            }
            
            if (data.session) {
              
              // Store tokens
              set({
                accessToken: data.session.access_token,
                refreshToken: data.session.refresh_token,
              });
              
              // Sync user with backend
              if (data.session.user) {
                await syncUserWithBackend(data.session.user);
              }
              
              // Map user data
              const mappedUser = mapSupabaseUser(data.session.user || null);
              set({ user: mappedUser, loading: false });
              
              // Check if token needs immediate refresh (if less than 10 minutes left)
              const expiresAt = data.session.expires_at ? data.session.expires_at * 1000 : 0;
              const now = Date.now();
              const timeUntilExpiry = expiresAt - now;
              
              if (timeUntilExpiry > 0 && timeUntilExpiry < 10 * 60 * 1000) {
                await get().refreshSession();
              }
            } else {
              set({ loading: false });
            }
          } catch  {
            set({ loading: false });
          }
        };
        
        // Check for tokens in URL
        const urlParams = new URLSearchParams(window.location.search);
        const accessToken = urlParams.get('access_token');
        const refreshToken = urlParams.get('refresh_token');
        
        if (accessToken && refreshToken) {
          supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          }).then(() => {
            setupSession();
            // Clean URL
            window.history.replaceState({}, document.title, window.location.pathname);
          }).catch(() => {
            set({ loading: false });
          });
        } else {
          setupSession();
        }
        
        // Create an actual token refresh function
        const refreshTokenIfNeeded = async () => {
          try {
            // Only run this if we have a user
            if (!get().user) return;
            
            const { data } = await supabase.auth.getSession();
            if (!data.session) {
              return;
            }
            
            const expiresAt = data.session.expires_at ? data.session.expires_at * 1000 : 0;
            const now = Date.now();
            const timeUntilExpiry = expiresAt - now;
            
            // Refresh if less than 10 minutes until expiry
            if (timeUntilExpiry < 10 * 60 * 1000) {
              await get().refreshSession();
            } 
          } catch {
            console.error('Error in token refresh check:');
          }
        };
        
        // Set up auth state change listener
        const authListener = supabase.auth.onAuthStateChange(async (event, session) => {
  
          if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
            if (session) {
              set({
                accessToken: session.access_token,
                refreshToken: session.refresh_token,
              });
              
              const mappedUser = mapSupabaseUser(session.user || null);
              set({ user: mappedUser, loading: false });
            }
          } else if (event === 'SIGNED_OUT') {
            set({ 
              user: null, 
              accessToken: null, 
              refreshToken: null,
            });
          }
        });
        
        // Run refresh check immediately
        refreshTokenIfNeeded();
        
        // Set up more frequent token refresh interval (every 5 minutes)
        const tokenRefreshInterval = setInterval(refreshTokenIfNeeded, 5 * 60 * 1000);
        set({ tokenRefreshInterval });
        
        // Return a cleanup function
        return () => {
          if (authListener && 'subscription' in authListener.data) {
            authListener.data.subscription.unsubscribe();
          }
          
          clearInterval(tokenRefreshInterval);
          set({ tokenRefreshInterval: null });
        };
      },

      updateUserInStore: async (updatedUser: AppUser) => {
        if (!updatedUser) return;
        
        try {
          // Update the user in the store
          set({ user: updatedUser });
          
          // Optionally, you could sync with Supabase metadata here
          const { error } = await supabase.auth.updateUser({
            data: {
              first_name: updatedUser.firstName,
              last_name: updatedUser.lastName
            }
          });
          
          if (error) {
            console.error('Error updating user metadata in Supabase:', error);
          }
        } catch  {
          console.error('Error updating user in store:');
        }
      },
    }),
    {
      name: 'auth-store',
      storage: authStorage,
      // Only persist safe fields (not functions or intervals)
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        // Don't persist loading state, error messages, or the interval
      }),
    }
  )
);