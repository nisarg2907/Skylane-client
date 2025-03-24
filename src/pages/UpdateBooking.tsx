import { Button } from '../components/ui/Button';
import api from '../lib/utils';
import { formatPrice } from '../lib/utils';
import { ArrowLeft, Calendar, Loader2, Plane, User, Users } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

interface Passenger {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth?: string | null;
  nationality?: string | null;
  passportNumber?: string | null;
  passportExpiry?: string | null;
  passengerType: 'ADULT' | 'CHILD' | 'INFANT';
}

interface Airport {
  id: string;
  code: string;
  name: string;
  city: string;
  country: string;
}

interface Flight {
  id: string;
  flightNumber: string;
  departureTime: string;
  arrivalTime: string;
  departureAirport: Airport;
  arrivalAirport: Airport;
  airline: {
    id: string;
    code: string;
    name: string;
  };
}

interface FlightSegment {
  id: string;
  bookingId: string;
  flightId: string;
  cabinClass: string;
  fareAmount: number;
  isReturn: boolean;
  flight: Flight;
}

interface Booking {
  id: string;
  userId: string;
  totalAmount: number;
  status: string;
  bookingDate: string;
  paymentStatus: string;
  ticketUrl?: string;
  createdAt: string;
  updatedAt: string;
  passengers: Passenger[];
  flightSegments: FlightSegment[];
}

export function UpdateBookingPage() {
  const location = useLocation();
  const id = location.state?.id;
  const navigate = useNavigate();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [passengers, setPassengers] = useState<Passenger[]>([]);
  console.log('id', id);

  useEffect(() => {
    const fetchBooking = async () => {
      if (!id) {
        toast.error('No booking ID provided');
        navigate('/bookings');
        return;
      }
      
      try {
        const response = await api.get(`/bookings/${id}`);
        console.log("response data", response.data);
        setBooking(response.data);
        setPassengers(response.data.passengers);
      } catch (error) {
        console.error('Failed to fetch booking:', error);
        toast.error('Failed to fetch booking');
      }
    };

    fetchBooking();
  }, [id, navigate]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Prepare the data to match what your API expects
      const updatedData = {
        id: booking.id,
        passengers: passengers.map(p => ({
          id: p.id,
          firstName: p.firstName,
          lastName: p.lastName,
          nationality: p.nationality,
        }))
      };
      
      await api.put(`/bookings/${id}`, updatedData);
      toast.success('Booking updated successfully');
      navigate('/user-bookings');
    } catch (error) {
      console.error('Error updating booking:', error);
      toast.error('Failed to update booking');
    } finally {
      setIsLoading(false);
    }
  };

  const updatePassenger = (id: string, data: Partial<Passenger>) => {
    setPassengers(current =>
      current.map(passenger =>
        passenger.id === id ? { ...passenger, ...data } : passenger
      )
    );
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return isNaN(date.getTime()) ? 'Invalid Date' : format(date, 'MMM d, yyyy');
    } catch  {
      return 'Invalid Date';
    }
  };

  // Get flight details from the first segment
  const mainFlightSegment = booking.flightSegments[0];
  const flight = mainFlightSegment?.flight;
  const departureAirport = flight?.departureAirport;
  const arrivalAirport = flight?.arrivalAirport;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Button
        variant="ghost"
        className="mb-6"
        onClick={() => navigate('/bookings')}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Bookings
      </Button>

      <div className="space-y-6">
        {/* Flight Details Card */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-blue-50 px-6 py-4">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Update Booking</h1>
            <div className="flex flex-col sm:flex-row justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 bg-white rounded-full flex items-center justify-center">
                  <Plane className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <div className="font-medium text-gray-900">
                    {flight?.airline?.name} {flight?.flightNumber}
                  </div>
                  <div className="text-sm text-gray-500">
                    {mainFlightSegment?.cabinClass?.replace('_', ' ')}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">
                  {formatPrice(booking.totalAmount)}
                </div>
                <div className="text-sm text-gray-500">
                  Booked on {formatDate(booking.bookingDate)}
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <div className="flex-1">
                <div className="text-xl font-semibold">
                  {departureAirport?.code}
                </div>
                <div className="text-sm text-gray-500">
                  {departureAirport?.city}, {departureAirport?.country}
                </div>
              </div>

              <div className="flex flex-col items-center gap-2">
                <Plane className="h-5 w-5 text-blue-600 rotate-90" />
                <div className="text-sm text-gray-500">Direct Flight</div>
              </div>

              <div className="flex-1 text-right">
                <div className="text-xl font-semibold">
                  {arrivalAirport?.code}
                </div>
                <div className="text-sm text-gray-500">
                  {arrivalAirport?.city}, {arrivalAirport?.country}
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="h-4 w-4" />
              <span>Departure: {formatDate(flight?.departureTime)}</span>
              <span>-</span>
              <span>Arrival: {formatDate(flight?.arrivalTime)}</span>
            </div>
          </div>
        </div>

        {/* Passengers Form */}
        <form onSubmit={handleSubmit}>
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
                        Passenger {index + 1} ({passenger.passengerType})
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
                        value={passenger.nationality || ''}
                        onChange={(e) => updatePassenger(passenger.id, { nationality: e.target.value })}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              ))}

              <div className="flex justify-end">
                <Button type="submit" disabled={isLoading}>
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
    </div>
  );
}