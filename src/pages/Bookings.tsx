import { BookingCard } from '../components/BookingCard';
import { useBookingStore, type Booking } from "../stores/Bookingstore"
import { Inbox } from 'lucide-react';
import { useState } from 'react';
import { Header } from '../components/Header';
import toast from 'react-hot-toast';

export function BookingsPage() {
  const { bookings, cancelBooking } = useBookingStore();
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'active' | 'cancelled'>('all');

  const dummyBookings: Booking[] = [
    {
      id: '1',
      flightNumber: 'AA123',
      from: 'New York',
      to: 'Los Angeles',
      departureDate: '2023-10-01',
      returnDate: '2023-10-10',
      passengers: { adult: 1, child: 0, infant: 0 },
      cabinClass: 'economy',
      status: 'confirmed',
      price: 300,
      bookingDate: '2023-09-01',
    },
    {
      id: '2',
      flightNumber: 'BA456',
      from: 'Chicago',
      to: 'Miami',
      departureDate: '2023-09-15',
      returnDate: '2023-09-20',
      passengers: { adult: 2, child: 1, infant: 0 },
      cabinClass: 'business',
      status: 'cancelled',
      price: 1200,
      bookingDate: '2023-08-15',
    },
    {
      id: '3',
      flightNumber: 'UA789',
      from: 'San Francisco',
      to: 'Seattle',
      departureDate: '2023-08-20',
      returnDate: '2023-08-25',
      passengers: { adult: 1, child: 0, infant: 1 },
      cabinClass: 'first',
      status: 'confirmed',
      price: 1500,
      bookingDate: '2023-07-20',
    },
  ];

  const allBookings = [...dummyBookings, ...bookings];

  const filteredBookings = allBookings.filter((booking) => {
    if (selectedFilter === 'active') return booking.status === 'confirmed';
    if (selectedFilter === 'cancelled') return booking.status === 'cancelled';
    return true;
  });

  const handleCancel = (id: string) => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      cancelBooking(id);
      toast.success('Booking cancelled successfully');
    }
  };

 

  const handleEmailTicket = async (booking: Booking) => {
    // TODO: Implement email functionality
    console.log("booking",booking)
    toast.success('Ticket sent to your email!');
  };

  return (
    <>
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">My Bookings</h1>
          <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
            <button
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                selectedFilter === 'all'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              onClick={() => setSelectedFilter('all')}
            >
              All
            </button>
            <button
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                selectedFilter === 'active'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              onClick={() => setSelectedFilter('active')}
            >
              Active
            </button>
            <button
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                selectedFilter === 'cancelled'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              onClick={() => setSelectedFilter('cancelled')}
            >
              Cancelled
            </button>
          </div>
        </div>

        <div className="space-y-6">
          {filteredBookings.length === 0 ? (
            <div className="text-center py-12">
              <Inbox className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No bookings found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {selectedFilter === 'all'
                  ? "You haven't made any bookings yet."
                  : selectedFilter === 'active'
                  ? "You don't have any active bookings."
                  : "You don't have any cancelled bookings."}
              </p>
            </div>
          ) : (
            filteredBookings.map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                onCancel={handleCancel}

                onEmailTicket={handleEmailTicket}
              />
            ))
          )}
        </div>
      </div>
    </>
  );
}