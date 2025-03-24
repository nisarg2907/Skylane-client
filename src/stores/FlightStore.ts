import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { storageFactory } from './indexedDbStorage';

export type PassengerType = 'adult' | 'child' | 'infant';

export interface Passenger {
  type: PassengerType;
  count: number;
}

export interface FlightSearchState {
  from: string;
  to: string;
  departureDate: string;
  returnDate?: string;
  passengers: {
    adult: number;
    child: number;
    infant: number;
  };
  cabinClass: 'ECONOMY' | 'PREMIUM_ECONOMY' | 'BUSINESS' | 'FIRST';
  tripType: 'oneWay' | 'roundTrip';
  recentSearches: Array<{
    from: string;
    to: string;
    date: string;
  }>;
  setFrom: (from: string) => void;
  setTo: (to: string) => void;
  setDepartureDate: (date: string) => void;
  setReturnDate: (date?: string) => void;
  setPassengers: (type: PassengerType, count: number) => void;
  setCabinClass: (cabinClass: 'ECONOMY' | 'PREMIUM_ECONOMY' | 'BUSINESS' | 'FIRST') => void;
  setTripType: (type: 'oneWay' | 'roundTrip') => void;
  addRecentSearch: (search: { from: string; to: string; date: string }) => void;
  swapLocations: () => void;
  reset: () => void;
}

const initialState = {
  from: '',
  to: '',
  departureDate: '',
  returnDate: '',
  passengers: {
    adult: 1,
    child: 0,
    infant: 0,
  },
  cabinClass: 'ECONOMY' as const,
  tripType: 'oneWay' as const,
  recentSearches: [],
};

// Create an IndexedDB storage for flight search
const flightSearchStorage = storageFactory('flight-search');

export const useFlightStore = create<FlightSearchState>()(
  persist(
    (set) => ({
      ...initialState,
      setFrom: (from) => set({ from }),
      setTo: (to) => set({ to }),
      setDepartureDate: (departureDate) => set({ departureDate }),
      setReturnDate: (returnDate) => set({ returnDate }),
      setPassengers: (type, count) =>
        set((state) => ({
          passengers: { ...state.passengers, [type]: count },
        })),
      setCabinClass: (cabinClass) => {
        if (['ECONOMY', 'PREMIUM_ECONOMY', 'BUSINESS', 'FIRST'].includes(cabinClass)) {
          set({ cabinClass });
        } else {
          console.error('Invalid cabin class');
        }
      },
      setTripType: (tripType) => set({ tripType }),
      addRecentSearch: (search) =>
        set((state) => ({
          recentSearches: [search, ...state.recentSearches.slice(0, 2)],
        })),
      swapLocations: () =>
        set((state) => ({
          from: state.to,
          to: state.from,
        })),
      reset: () => set(initialState),
    }),
    {
      name: 'flight-search-store',
      storage: flightSearchStorage,
    }
  )
);