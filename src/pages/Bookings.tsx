import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowLeft, Inbox, ArrowRightLeft, Plane, CheckCircle2, XCircle } from 'lucide-react';

import { Header } from '../components/Header';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import api from '../lib/utils';
import { formatPrice, formatDate } from '../lib/utils';

// Define the new booking structure
interface BookingFlight {
  flightNumber: string;
  from: string;
  to: string;
  departureDate: string;
  cabinClass: string;
  ticketUrl?: string;
}

export interface MyBooking {
  id: string;
  outboundFlight: BookingFlight;
  returnFlight?: BookingFlight;
  passengers: {
    adult: number;
    child: number;
    infant: number;
  };
  status: string;
  price: number;
  bookingDate: string;
}

export function BookingsPage() {
  const [bookings, setBookings] = useState<MyBooking[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'active' | 'cancelled' | 'roundtrip' | 'oneway'>('all');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const response = await api.get('/bookings');
      setBookings(response.data);
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Failed to fetch bookings');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const filteredBookings = bookings.filter((booking) => {
    if (selectedFilter === 'active') return booking.status === 'confirmed';
    if (selectedFilter === 'cancelled') return booking.status === 'cancelled';
    if (selectedFilter === 'roundtrip') return !!booking.returnFlight;
    if (selectedFilter === 'oneway') return !!booking.outboundFlight && !booking.returnFlight;
    return true;
  });

  const handleCancel = (id: string) => {
    setBookingToCancel(id);
    setShowCancelModal(true);
  };

  const confirmCancel = () => {
    if (bookingToCancel) {
      api.delete(`/bookings/${bookingToCancel}`)
        .then(() => {
          setBookings((prevBookings) => prevBookings.filter((booking) => booking.id !== bookingToCancel));
          toast.success('Booking cancelled successfully');
        })
        .catch(() => {
          toast.error('Failed to cancel booking');
        }).finally(() => {
          fetchBookings();
          setShowCancelModal(false);
          setBookingToCancel(null);
        });
    }
  };

  const handleTicketDownload = (ticketUrl?: string) => {
    if (ticketUrl) {
      window.open(ticketUrl, '_blank');
      toast.success('Ticket downloaded successfully!');
    } else {
      toast.error('Ticket URL not available.');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'cancelled':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return null;
    }
  };

  const BookingCardContent = ({ booking }: { booking: MyBooking }) => {
    const [activeFlightIndex, setActiveFlightIndex] = useState(0);
    const flights = booking.returnFlight 
      ? [booking.outboundFlight, booking.returnFlight] 
      : [booking.outboundFlight];

    const currentFlight = flights[activeFlightIndex];
    const isCancelled = booking.status === 'cancelled';

    return (
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Flight Details Header */}
        <div className="bg-blue-50 px-6 py-4">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-3">
              <Plane className="h-5 w-5 text-blue-600" />
              <span className="font-medium text-gray-900">
                {currentFlight.flightNumber}
              </span>
              {getStatusIcon(booking.status)}
              <span className={`text-sm font-medium ${
                booking.status === 'confirmed' ? 'text-green-600' : 'text-red-600'
              }`}>
                {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
              </span>
            </div>
            <div className="text-xl text-gray-500">
              {currentFlight.cabinClass.replace('_', ' ')}
            </div>
          </div>

          {/* Flight Route */}
          <div className="flex justify-between items-center">
            <div>
              <div className="text-xl font-bold">{currentFlight.from}</div>
              <div className="text-sm text-gray-500">
                {formatDate(currentFlight.departureDate)}
              </div>
            </div>
            {flights.length > 1 && (
              <div className="flex items-center flex-col gap-2">
                <span className="text-2xl font-bold text-black">
                  Round Trip
                </span>
                <button 
                  onClick={() => setActiveFlightIndex(index => index === 0 ? 1 : 0)}
                  className="text-blue-600 hover:bg-blue-100 p-2 rounded-full"
                >
                  <ArrowRightLeft className="h-4 w-4" />
                </button>
                <span className="text-bold text-black">
                  {activeFlightIndex === 0 ? 'Outbound Flight' : 'Return Flight'}
                </span>
              </div>
            )}
            <div className="text-right">
              <div className="text-xl font-bold">{currentFlight.to}</div>
              <div className="text-sm text-gray-500">
                {formatDate(currentFlight.departureDate)}
              </div>
            </div>
          </div>

          {/* Download Ticket */}
          <div className="mt-4 flex justify-between items-center">
            <div className="text-sm text-gray-500">
              Booked on {formatDate(booking.bookingDate)}
            </div>
            {!isCancelled && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleTicketDownload(currentFlight.ticketUrl)}
              >
                Download Ticket
              </Button>
            )}
          </div>
        </div>

        {/* Booking Actions */}
        <div className="px-6 py-4 bg-gray-50 flex justify-between items-center">
          <div className="text-lg font-bold text-gray-900">
            {formatPrice(booking.price)}
          </div>
          {!isCancelled && (
            <div className="flex gap-2">
              <Button 
                variant="default" 
                onClick={() => navigate('/update-booking', { state: { id: booking.id } })}
              >
                Update
              </Button>
              <Button 
                variant="default" 
                onClick={() => handleCancel(booking.id)}
              >
                Cancel
              </Button>
            </div>
          )}
        </div>
      </div>
    );
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
            {['all', 'active', 'cancelled', 'roundtrip', 'oneway'].map((filter) => (
              <button
                key={filter}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  selectedFilter === filter
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                onClick={() => setSelectedFilter(filter as typeof selectedFilter)}
              >
                {filter === 'roundtrip' ? 'Round Trip' : filter.charAt(0).toUpperCase() + filter.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="loader mx-auto h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <h3 className="mt-2 text-sm font-medium text-gray-900">Loading bookings...</h3>
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="text-center py-12">
              <Inbox className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No bookings found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {selectedFilter === 'all'
                  ? "You haven't made any bookings yet."
                  : selectedFilter === 'active'
                  ? "You don't have any active bookings."
                  : selectedFilter === 'cancelled'
                  ? "You don't have any cancelled bookings."
                  : selectedFilter === 'roundtrip'
                  ? "You don't have any round trip bookings."
                  : "You don't have any one-way bookings."}
              </p>
            </div>
          ) : (
            filteredBookings.map((booking) => (
              <BookingCardContent key={booking.id} booking={booking} />
            ))
          )}
        </div>
      </div>

      {showCancelModal && (
        <Modal
          title="Cancel Booking"
          description={
            bookings.find((booking) => booking.id === bookingToCancel)?.returnFlight
              ? "Are you sure you want to cancel the whole round trip?"
              : "Are you sure you want to cancel this booking?"
          }
          onConfirm={confirmCancel}
          onCancel={() => setShowCancelModal(false)}
          confirmLabel="Yes"
          cancelLabel="No"
        />
      )}
    </>
  );
}