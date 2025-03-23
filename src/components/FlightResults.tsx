import { FlightCard } from './FlightCard';
import { Flight } from '../types/flight';
import { ArrowUpDown, Filter, Loader2 } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

interface FlightSearchResultsProps {
  flights: Flight[];
  isLoading: boolean;
  selectedCabinClass: 'ECONOMY' | 'PREMIUM_ECONOMY' | 'BUSINESS' | 'FIRST';
}

type SortOption = 'price' | 'departure' | 'duration';

export function FlightSearchResults({ flights, isLoading, selectedCabinClass }: FlightSearchResultsProps) {
  const [sortBy, setSortBy] = useState<SortOption>('price');
  const [showFilters, setShowFilters] = useState(false);
  const navigate = useNavigate()
  const sortedFlights = [...flights].sort((a, b) => {
    switch (sortBy) {
      case 'price':
        return (a.economyPrice || 0) - (b.economyPrice || 0);
      case 'departure':
        return new Date(a.departureTime).getTime() - new Date(b.departureTime).getTime();
      case 'duration': {
        const aDuration = new Date(a.arrivalTime).getTime() - new Date(a.departureTime).getTime();
        const bDuration = new Date(b.arrivalTime).getTime() - new Date(b.departureTime).getTime();
        return aDuration - bDuration;
      }
      default:
        return 0;
    }
  });

  const handleBook = (flight: Flight) => {
    navigate('/checkout', { state: { flight } });
    toast.success('Redirecting to booking page...');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (flights.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500">No flights found matching your criteria</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="text-sm text-gray-500">
          {flights.length === 0 && (
            <div className="text-red-500">
              No flights available for the selected dates. Here are some other flights available for these destinations.
            </div>
          )}
          {flights.length > 0 && flights.length <= 2 && (
            <div className="text-blue-500 text-lg">
              These are the {flights.length} flights that best match your search.
            </div>
          )}
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <Filter className="h-4 w-4" />
            Filters
          </button>
          <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg">
            {(['price', 'departure', 'duration'] as const).map((option) => (
              <button
                key={option}
                onClick={() => setSortBy(option)}
                className={`px-3 py-1 rounded text-sm transition-colors ${
                  sortBy === option
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {option.charAt(0).toUpperCase() + option.slice(1)}
                {sortBy === option && <ArrowUpDown className="inline-block ml-1 h-3 w-3" />}
              </button>
            ))}
          </div>
        </div>
      </div>

      {showFilters && (
        <div className="bg-gray-50 p-4 rounded-lg">
          {/* TODO: Implement filters */}
          <div className="text-sm text-gray-500">Filters coming soon...</div>
        </div>
      )}

      <div className="space-y-4">
        {sortedFlights.map((flight) => (
          <FlightCard
            key={flight.id}
            flight={flight}
            selectedCabinClass={selectedCabinClass}
            onBook={handleBook}
          />
        ))}
      </div>
    </div>
  );
}