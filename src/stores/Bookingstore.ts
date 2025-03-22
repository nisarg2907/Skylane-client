import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Booking {
  id: string;
  flightNumber: string;
  from: string;
  to: string;
  departureDate: string;
  returnDate?: string;
  passengers: {
    adult: number;
    child: number;
    infant: number;
  };
  cabinClass: 'economy' | 'premium' | 'business' | 'first';
  status: 'confirmed' | 'cancelled';
  price: number;
  bookingDate: string;
}

interface BookingStore {
  bookings: Booking[];
  addBooking: (booking: Booking) => void;
  cancelBooking: (id: string) => void;
  getBooking: (id: string) => Booking | undefined;
}

export const useBookingStore = create<BookingStore>()(
  persist(
    (set, get) => ({
      bookings: [],
      addBooking: (booking) =>
        set((state) => ({
          bookings: [booking, ...state.bookings],
        })),
      cancelBooking: (id) =>
        set((state) => ({
          bookings: state.bookings.map((booking) =>
            booking.id === id ? { ...booking, status: 'cancelled' } : booking
          ),
        })),
      getBooking: (id) => get().bookings.find((booking) => booking.id === id),
    }),
    {
      name: 'booking-store',
    }
  )
);