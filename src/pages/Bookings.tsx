import { BookingCard } from '../components/BookingCard';
import { type Booking } from "../stores/Bookingstore";
import { ArrowLeft, Inbox } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Header } from '../components/Header';
import toast from 'react-hot-toast';
import api from '../lib/utils';
import { Button } from '../components/ui/Button';
import { useNavigate } from 'react-router-dom';

export function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'active' | 'cancelled'>('all');
  const navigate = useNavigate()
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await api.get('/bookings');
        setBookings(response.data);
      } catch (error) {
        console.error('Failed to fetch bookings:', error);
        toast.error('Failed to fetch bookings');
      }
    };

    fetchBookings();
  }, []);

  const filteredBookings = bookings.filter((booking) => {
    if (selectedFilter === 'active') return booking.status === 'confirmed';
    if (selectedFilter === 'cancelled') return booking.status === 'cancelled';
    return true;
  });

  const handleCancel = (id: string) => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      // Assuming cancelBooking is an API call
      api.delete(`/bookings/${id}`)
        .then(() => {
          setBookings((prevBookings) => prevBookings.filter((booking) => booking.id !== id));
          toast.success('Booking cancelled successfully');
        })
        .catch((error) => {
          console.error('Failed to cancel booking:', error);
          toast.error('Failed to cancel booking');
        });
    }
  };

  const handleTicketDownload = async (booking: Booking) => {
    if (booking.ticketUrl) {
      window.open(booking.ticketUrl, '_blank');
      toast.success('Ticket downloaded successfully!');
    } else {
      toast.error('Ticket URL not available.');
    }
  };

  return (
    <>
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <Button
      variant="ghost"
      className="mb-6 text-xl"
      onClick={() => navigate(-1)}
    >
      <ArrowLeft className="h-4 w-4 mr-2" />
      Go Back 
    </Button>
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
                onCancel={()=>handleCancel(booking.id)}
                onDownloadTicket={handleTicketDownload}
              />
            ))
          )}
        </div>
      </div>
    </>
  );
}