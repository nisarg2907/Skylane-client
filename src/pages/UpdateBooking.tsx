import { Button } from '../components/ui/Button';
import api, { formatDate } from '../lib/utils';
import { formatPrice } from '../lib/utils';
import { ArrowLeft, ArrowRightLeft, Plane, Loader2, User, Users, CheckCircle2, XCircle } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Header } from '../components/Header';

interface BookingFlight {
  flightNumber: string;
  from: string;
  to: string;
  departureDate: string;
  cabinClass: string;
  ticketUrl?: string;
}

interface Booking {
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

export function UpdateBookingPage() {
  const location = useLocation();
  const id = location.state?.id;
  const navigate = useNavigate();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [passengers, setPassengers] = useState<{
    id: string;
    firstName: string;
    lastName: string;
    nationality: string;
    type: 'ADULT' | 'CHILD' | 'INFANT';
  }[]>([]);
  const [activeFlightIndex, setActiveFlightIndex] = useState(0);
  const originalPassengers = useRef(passengers);

  useEffect(() => {
    const fetchBooking = async () => {
      if (!id) {
        toast.error('No booking ID provided');
        navigate('/user-bookings');
        return;
      }
      
      try {
        const response = await api.get(`/bookings/${id}`);
        setBooking(response.data);
        setPassengers(response.data.passengers);
        originalPassengers.current = response.data.passengers;
      } catch  {
        toast.error('Failed to fetch booking');
      }
    };

    fetchBooking();
  }, [id, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Implement booking update logic
      await api.put(`/bookings/${id}`, { 
        passengers: passengers 
      });
      toast.success('Booking updated successfully');
      navigate('/user-bookings');
    } catch  {
      toast.error('Failed to update booking');
    } finally {
      setIsLoading(false);
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

  const updatePassenger = (id: string, data: Partial<{
    firstName: string;
    lastName: string;
    nationality: string;
  }>) => {
    setPassengers(current =>
      current.map(passenger =>
        passenger.id === id ? { ...passenger, ...data } : passenger
      )
    );
  };

  const isPassengersChanged = () => {
    return JSON.stringify(passengers) !== JSON.stringify(originalPassengers.current);
  };

  if (!booking) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Loading Booking...</h2>
          <p className="text-gray-600 mb-4">Please wait while we fetch your booking information.</p>
        </div>
      </div>
    );
  }

  const flights = booking.returnFlight 
    ? [booking.outboundFlight, booking.returnFlight] 
    : [booking.outboundFlight];

  const currentFlight = flights[activeFlightIndex];

  return (
    <>
    <Header/>
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Button
        variant="ghost"
        className="mb-6 text-xl"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Go Back
      </Button>

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

          {/* Booking Details */}
          <div className="mt-4 flex justify-between items-center">
            <div className="text-sm text-gray-500">
              Booked on {formatDate(booking.bookingDate)}
            </div>
            <div className="text-lg font-bold text-gray-900">
              {formatPrice(booking.price)}
            </div>
          </div>
        </div>
      </div>

      {/* Passenger Update Form */}
      <form onSubmit={handleSubmit} className="mt-6">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-gray-400" />
              <h2 className="text-xl font-semibold text-gray-900">Passenger Details</h2>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {passengers.map((passenger, index) => (
              <div key={passenger.id} className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <User className="h-5 w-5 text-gray-400" />
                    <h3 className="font-medium text-gray-900">
                      Passenger {index + 1} ({passenger.type})
                    </h3>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      First Name
                    </label>
                    <input
                      type="text"
                      value={passenger.firstName}
                      onChange={(e) => updatePassenger(passenger.id, { firstName: e.target.value })}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={passenger.lastName}
                      onChange={(e) => updatePassenger(passenger.id, { lastName: e.target.value })}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Nationality
                    </label>
                    <input
                      type="text"
                      value={passenger.nationality}
                      onChange={(e) => updatePassenger(passenger.id, { nationality: e.target.value })}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>
              </div>
            ))}

            <div className="flex justify-end">
              <Button type="submit" disabled={isLoading || !isPassengersChanged()}>
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'Update Booking'
                )}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
    </>
  );
}