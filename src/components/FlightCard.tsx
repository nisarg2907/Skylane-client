import { Button } from './ui/Button';
import { Flight } from '../types/flight';
import { formatPrice } from '../lib/utils';
import { Clock, Plane } from 'lucide-react';
import { format, formatDistanceStrict, parseISO } from 'date-fns';

interface FlightCardProps {
  flight: Flight;
  selectedCabinClass: 'ECONOMY' | 'PREMIUM_ECONOMY' | 'BUSINESS' | 'FIRST';
  onBook: (flight: Flight) => void;
}

export function FlightCard({ flight, selectedCabinClass, onBook }: FlightCardProps) {
  const departureTime = parseISO(flight.departureTime);
  const arrivalTime = parseISO(flight.arrivalTime);
  const duration = formatDistanceStrict(arrivalTime, departureTime);

  const getPrice = () => {
    switch (selectedCabinClass) {
      case 'ECONOMY':
        return flight.economyPrice;
      case 'PREMIUM_ECONOMY':
        return flight.premiumEconomyPrice;
      case 'BUSINESS':
        return flight.businessPrice;
      case 'FIRST':
        return flight.firstClassPrice;
      default:
        return flight.economyPrice;
    }
  };

  const getAvailableSeats = () => {
    switch (selectedCabinClass) {
      case 'ECONOMY':
        return flight.economyCapacity;
      case 'PREMIUM_ECONOMY':
        return flight.premiumEconomyCapacity;
      case 'BUSINESS':
        return flight.businessCapacity;
      case 'FIRST':
        return flight.firstClassCapacity;
      default:
        return flight.economyCapacity;
    }
  };

  const price = getPrice();
  const availableSeats = getAvailableSeats();

  if (!price || !availableSeats) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 bg-blue-50 rounded-full flex items-center justify-center">
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
          <div className="text-2xl font-bold text-gray-900">{formatPrice(price)}</div>
          <div className="text-sm text-gray-500">{selectedCabinClass.replace('_', ' ')}</div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-6">
        <div className="flex-1">
          <div className="text-xl font-semibold">
            {format(departureTime, 'HH:mm')}
          </div>
          <div className="text-sm text-gray-500">{flight.departureAirport.code}</div>
          <div className="text-sm text-gray-700">{flight.departureAirport.city}</div>
          <div className="text-sm text-gray-500">{format(departureTime, 'PPpp')}</div>
        </div>

        <div className="flex flex-col items-center gap-2">
          <div className="text-sm text-gray-500 flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {duration}
          </div>
          <div className="w-32 h-px bg-gray-300 relative">
            <Plane className="absolute top-1/2 left-1/2 transform -translate-y-1/2 -translate-x-1/2 h-4 w-4 text-blue-600 rotate-90" />
          </div>
          <div className="text-xs text-gray-500">Direct</div>
        </div>

        <div className="flex-1 text-right">
          <div className="text-xl font-semibold">
            {format(arrivalTime, 'HH:mm')}
          </div>
          <div className="text-sm text-gray-500">{flight.arrivalAirport.code}</div>
          <div className="text-sm text-gray-700">{flight.arrivalAirport.city}</div>
          <div className="text-sm text-gray-500">{format(arrivalTime, 'PPpp')}</div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">
          {availableSeats} seats available
        </div>
        <Button onClick={() => onBook(flight)}>
          Book Now
        </Button>
      </div>
    </div>
  );
}