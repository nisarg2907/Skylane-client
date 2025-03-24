import { Button } from '../components/ui/Button';
import { useFlightStore } from '../stores/FlightStore';
import { Flight } from '../types/flight';
import { formatPrice } from '../lib/utils';
import { ArrowLeft, CreditCard, Loader2, Plane, User, Users } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { format, formatDistanceStrict, parseISO } from 'date-fns';
import { Header } from '../components/Header';
import api from "../lib/utils";

interface PaymentMethod {
  id: string;
  cardType: string;
  lastFourDigits: string;
  expiryMonth: number;
  expiryYear: number;
  isDefault: boolean;
  cardHolderName: string;
}

interface PassengerFormData {
  firstName: string;
  lastName: string;
  nationality: string;
  type: 'ADULT' | 'CHILD' | 'INFANT';
}

export function Checkout() {
  const navigate = useNavigate();
  const location = useLocation();
  const flight = location.state?.flight as Flight;
  const { passengers, cabinClass } = useFlightStore();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingPaymentMethods, setIsLoadingPaymentMethods] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState<string | null>(null);
  const [passengerForms, setPassengerForms] = useState<PassengerFormData[]>(
    Array(passengers.adult + passengers.child + passengers.infant)
      .fill(null)
      .map((_, index) => ({
        firstName: '',
        lastName: '',
        nationality: '',
        type: index < passengers.adult 
          ? 'ADULT' 
          : index < passengers.adult + passengers.child 
            ? 'CHILD' 
            : 'INFANT'
      }))
  );

  // Fetch payment methods when entering payment step
  useEffect(() => {
    if (currentStep === 2) {
      fetchPaymentMethods();
    }
  }, [currentStep]);

  // Function to fetch payment methods from API
  const fetchPaymentMethods = async () => {
    try {
      setIsLoadingPaymentMethods(true);
  
      const response = await api.get('/users/payment-methods');
      setPaymentMethods(response.data);
      
      // Select default payment method if available
      const defaultMethod = response.data.find((method: PaymentMethod) => method.isDefault);
      if (defaultMethod) {
        setSelectedPaymentMethodId(defaultMethod.id);
      } else if (response.data.length > 0) {
        setSelectedPaymentMethodId(response.data[0].id);
      } else {
        toast.error('No payment methods available');
      }
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      toast.error('Failed to load payment methods');
    } finally {
      setIsLoadingPaymentMethods(false);
    }
  };

  if (!flight) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">No Flight Selected</h2>
          <p className="text-gray-600 mb-4">Please select a flight to proceed with booking.</p>
          <Button onClick={() => navigate('/')}>Return to Search</Button>
        </div>
      </div>
    );
  }

  const departureTime = parseISO(flight.departureTime);
  const arrivalTime = parseISO(flight.arrivalTime);
  const duration = formatDistanceStrict(arrivalTime, departureTime);

  const totalPrice = (() => {
    switch (cabinClass.toUpperCase()) {
      case 'ECONOMY':
        return flight.economyPrice * (passengers.adult + passengers.child);
      case 'PREMIUM_ECONOMY':
        return (flight.premiumEconomyPrice || 0) * (passengers.adult + passengers.child);
      case 'BUSINESS':
        return (flight.businessPrice || 0) * (passengers.adult + passengers.child);
      case 'FIRST':
        return (flight.firstClassPrice || 0) * (passengers.adult + passengers.child);
      default:
        return flight.economyPrice * (passengers.adult + passengers.child);
    }
  })();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (currentStep === 2 && !selectedPaymentMethodId) {
      toast.error('Please select a payment method');
      return;
    }
    
    setIsLoading(true);
    
    try {
       await api.post('/bookings', {
        flightId: flight.id,
        passengers: passengerForms,
        cabinClass: cabinClass.toUpperCase(),
        totalAmount: totalPrice,
        paymentMethodId: selectedPaymentMethodId,
      });

      toast.success('Booking confirmed! Check your email for details.');
      navigate('/user-bookings');
    } catch (error) {
      console.error('Error creating booking:', error);
      toast.error('Failed to create booking. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const updatePassenger = (index: number, data: Partial<PassengerFormData>) => {
    setPassengerForms(forms => 
      forms.map((form, i) => i === index ? { ...form, ...data } : form)
    );
  };

  const isStepValid = () => {
    if (currentStep === 1) {
      return passengerForms.every(form => 
        form.firstName && 
        form.lastName && 
        form.nationality
      );
    }
    
    if (currentStep === 2) {
      return !!selectedPaymentMethodId;
    }
    
    return true;
  };

  return (
    <>
    <Header/>
     <div className="max-w-5xl mx-auto px-4 py-8">
    <Button
      variant="ghost"
      className="mb-6 text-xl"
      onClick={() => navigate(-1)}
    >
      <ArrowLeft className="h-4 w-4 mr-2" />
      Back to Flights
    </Button>

    <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
      <div className="bg-blue-50 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 bg-white rounded-full flex items-center justify-center">
              <img
                src={`https://api.dicebear.com/7.x/initials/svg?seed=${flight.airline.name}`}
                alt={flight.airline.name}
                className="h-8 w-8"
              />
            </div>
            <div>
              <div className="font-medium text-gray-900">{flight.airline.name}</div>
              <div className="text-sm text-gray-500">Flight {flight.flightNumber}</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900">{formatPrice(totalPrice)}</div>
            <div className="text-sm text-gray-500">{cabinClass.toUpperCase().replace('_', ' ')}</div>
          </div>
        </div>

        <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div className="flex-1">
            <div className="text-xl font-semibold">
              {format(departureTime, 'HH:mm')}
            </div>
            <div className="text-sm text-gray-500">{flight.departureAirport.code}</div>
            <div className="text-sm text-gray-700">{flight.departureAirport.city}</div>
          </div>

          <div className="flex flex-col items-center gap-2">
            <div className="text-sm text-gray-500 flex items-center gap-1">
              <Plane className="h-4 w-4" />
              {duration}
            </div>
            <div className="w-32 h-px bg-gray-300 relative">
              <div className="absolute top-1/2 left-1/2 transform -translate-y-1/2 -translate-x-1/2 h-2 w-2 bg-blue-600 rounded-full" />
            </div>
            <div className="text-xs text-gray-500">Direct</div>
          </div>

          <div className="flex-1 text-right">
            <div className="text-xl font-semibold">
              {format(arrivalTime, 'HH:mm')}
            </div>
            <div className="text-sm text-gray-500">{flight.arrivalAirport.code}</div>
            <div className="text-sm text-gray-700">{flight.arrivalAirport.city}</div>
          </div>
        </div>
      </div>

      <div className="px-6 py-4 border-b">
        <div className="flex items-center gap-4">
          <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
            currentStep === 1 ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500'
          }`}>
            1
          </div>
          <div className="flex-1 h-px bg-gray-200" />
          <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
            currentStep === 2 ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500'
          }`}>
            2
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6">
        {currentStep === 1 && (
          <div className="space-y-6">
            <div className="flex items-center gap-2 text-lg font-medium text-gray-900">
              <Users className="h-5 w-5" />
              Passenger Details
            </div>

            {passengerForms.map((form, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <User className="h-5 w-5 text-gray-400" />
                    <h3 className="font-medium text-gray-900">
                      Passenger {index + 1} ({form.type})
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
                      value={form.firstName}
                      onChange={(e) => updatePassenger(index, { firstName: e.target.value })}
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
                      value={form.lastName}
                      onChange={(e) => updatePassenger(index, { lastName: e.target.value })}
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
                      value={form.nationality}
                      onChange={(e) => updatePassenger(index, { nationality: e.target.value })}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-6">
            <div className="flex items-center gap-2 text-lg font-medium text-gray-900">
              <CreditCard className="h-5 w-5" />
              Payment Method
            </div>

            {isLoadingPaymentMethods ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  {paymentMethods.length === 0 ? (
                    <div className="text-center py-4">
                      <p className="text-gray-500">No payment methods found.</p>
                      <Button onClick={() => navigate('/profile')}>Add Payment Method</Button>
                    </div>
                  ) : (
                    paymentMethods.map((method) => (
                      <div
                        key={method.id}
                        className={`flex items-center justify-between p-4 rounded-lg cursor-pointer border-2 ${
                          selectedPaymentMethodId === method.id
                            ? 'border-blue-600 bg-blue-50'
                            : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                        }`}
                        onClick={() => setSelectedPaymentMethodId(method.id)}
                      >
                        <div className="flex items-center gap-4">
                          <input
                            type="radio"
                            checked={selectedPaymentMethodId === method.id}
                            onChange={() => setSelectedPaymentMethodId(method.id)}
                            className="h-5 w-5 text-blue-600 focus:ring-blue-500"
                          />
                          <div className="h-10 w-10 bg-white rounded-full flex items-center justify-center">
                            <CreditCard className="h-5 w-5 text-gray-400" />
                          </div>
                          <div>
                            <div className="font-medium">
                              {method.cardType} •••• {method.lastFourDigits}
                            </div>
                            <div className="text-sm text-gray-500">
                              Expires {method.expiryMonth}/{method.expiryYear}
                            </div>
                            {method.isDefault && (
                              <span className="mt-1 inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                                Default
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </>
            )}

            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">{formatPrice(totalPrice)}</span>
              </div>
              <div className="flex items-center justify-between text-sm mt-2">
                <span className="text-gray-600">Taxes & Fees</span>
                <span className="font-medium">{formatPrice(totalPrice * 0.1)}</span>
              </div>
              <div className="border-t mt-2 pt-2">
                <div className="flex items-center justify-between font-medium">
                  <span>Total</span>
                  <span className="text-lg">{formatPrice(totalPrice * 1.1)}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mt-6 flex items-center justify-between">
          {currentStep === 2 ? (
            <Button
              type="button"
              variant="outline"
              onClick={() => setCurrentStep(1)}
            >
              Back
            </Button>
          ) : (
            <div /> // Empty div for spacing
          )}

          <Button
            type={currentStep === 2 ? 'submit' : 'button'}
            disabled={!isStepValid() || isLoading}
            onClick={currentStep === 1 ? () => setCurrentStep(2) : undefined}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : currentStep === 1 ? (
              'Continue to Payment'
            ) : (
              'Confirm Booking'
            )}
          </Button>
        </div>
      </form>
    </div>
  </div></>
   
  );
}