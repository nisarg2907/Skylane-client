import { FlightCard } from './FlightCard';
import { Flight } from '../types/flight';
import { ArrowUpDown, Filter, Loader2, X } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
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
  const [displayedFlights, setDisplayedFlights] = useState<Flight[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [filters, setFilters] = useState({
    minPrice: undefined as number | undefined,
    maxPrice: undefined as number | undefined,
    departureTimeRange: undefined as { start: string; end: string } | undefined,
    arrivalTimeRange: undefined as { start: string; end: string } | undefined,
    maxDuration: undefined as number | undefined,
    cabinClass: selectedCabinClass
  });
  
  const workerRef = useRef<Worker | null>(null);
  const navigate = useNavigate();

  // Initialize worker
  useEffect(() => {
    // Create the worker
    workerRef.current = new Worker(new URL('../utils/worker.ts', import.meta.url), { type: 'module' });
    
    // Set up message handler
    workerRef.current.onmessage = (event) => {
      const { type, flights: processedFlights } = event.data;
      
      if (type === 'sortResult' || type === 'filterResult') {
        setDisplayedFlights(processedFlights);
        setIsProcessing(false);
      }
    };
    
    // Cleanup worker on component unmount
    return () => {
      workerRef.current?.terminate();
    };
  }, []);

  // Update cabin class in filters when it changes in props
  useEffect(() => {
    setFilters(prev => ({ ...prev, cabinClass: selectedCabinClass }));
  }, [selectedCabinClass]);

  // Process flights when they change or sorting/filtering options change
  useEffect(() => {
    if (!workerRef.current || flights.length === 0) {
      setDisplayedFlights(flights);
      return;
    }
    
    setIsProcessing(true);
    
    // Apply filters
    workerRef.current.postMessage({
      type: 'filter',
      flights,
      filters
    });
  }, [flights, filters]);

  // When filter results come back or sortBy changes, sort the results
  useEffect(() => {
    if (!workerRef.current || displayedFlights.length === 0) return;
    
    setIsProcessing(true);
    
    workerRef.current.postMessage({
      type: 'sort',
      flights: displayedFlights,
      sortBy,
      selectedCabinClass
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortBy, displayedFlights.length, selectedCabinClass]);

  const handleBook = (flight: Flight) => {
    navigate('/checkout', { state: { flight } });
    toast.success('Redirecting to booking page...');
  };

  const handleFilterChange = (newFilters: Partial<typeof filters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const clearFilters = () => {
    setFilters({
      minPrice: undefined,
      maxPrice: undefined,
      departureTimeRange: undefined,
      arrivalTimeRange: undefined,
      maxDuration: undefined,
      cabinClass: selectedCabinClass
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="text-sm text-gray-500">
          {isProcessing ? (
            <div className="flex items-center">
              <Loader2 className="h-4 w-4 text-blue-600 animate-spin mr-2" />
              Processing...
            </div>
          ) : (
            <>
              {displayedFlights.length === 0 ? (
                <div className="text-red-500">
                  No flights found matching your criteria
                </div>
              ) : (
                <div className="text-blue-500">
                  Found {displayedFlights.length} {displayedFlights.length === 1 ? 'flight' : 'flights'}
                </div>
              )}
            </>
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
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-medium">Filters</h3>
            <button 
              onClick={clearFilters}
              className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              <X className="h-3 w-3" />
              Clear all
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Price filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price Range</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.minPrice || ''}
                  className="p-2 border rounded text-sm w-full"
                  onChange={(e) => {
                    const value = e.target.value ? Number(e.target.value) : undefined;
                    handleFilterChange({ minPrice: value });
                  }}
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.maxPrice || ''}
                  className="p-2 border rounded text-sm w-full"
                  onChange={(e) => {
                    const value = e.target.value ? Number(e.target.value) : undefined;
                    handleFilterChange({ maxPrice: value });
                  }}
                />
              </div>
            </div>
            
            {/* Departure time filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Departure Time</label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs text-gray-500">From</label>
                  <input
                    type="time"
                    className="p-2 border rounded text-sm w-full"
                    onChange={(e) => {
                      // Create a date object for today with the selected time
                      const date = new Date();
                      const [hours, minutes] = e.target.value.split(':');
                      date.setHours(parseInt(hours || '0', 10));
                      date.setMinutes(parseInt(minutes || '0', 10));
                      
                      handleFilterChange({
                        departureTimeRange: {
                          start: date.toISOString(),
                          end: filters.departureTimeRange?.end || new Date(date.getTime() + 24 * 60 * 60 * 1000).toISOString()
                        }
                      });
                    }}
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500">To</label>
                  <input
                    type="time"
                    className="p-2 border rounded text-sm w-full"
                    onChange={(e) => {
                      // Create a date object for today with the selected time
                      const date = new Date();
                      const [hours, minutes] = e.target.value.split(':');
                      date.setHours(parseInt(hours || '23', 10));
                      date.setMinutes(parseInt(minutes || '59', 10));
                      
                      handleFilterChange({
                        departureTimeRange: {
                          start: filters.departureTimeRange?.start || new Date().toISOString(),
                          end: date.toISOString()
                        }
                      });
                    }}
                  />
                </div>
              </div>
            </div>
            
            {/* Arrival time filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Arrival Time</label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs text-gray-500">From</label>
                  <input
                    type="time"
                    className="p-2 border rounded text-sm w-full"
                    onChange={(e) => {
                      // Create a date object for today with the selected time
                      const date = new Date();
                      const [hours, minutes] = e.target.value.split(':');
                      date.setHours(parseInt(hours || '0', 10));
                      date.setMinutes(parseInt(minutes || '0', 10));
                      
                      handleFilterChange({
                        arrivalTimeRange: {
                          start: date.toISOString(),
                          end: filters.arrivalTimeRange?.end || new Date(date.getTime() + 24 * 60 * 60 * 1000).toISOString()
                        }
                      });
                    }}
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500">To</label>
                  <input
                    type="time"
                    className="p-2 border rounded text-sm w-full"
                    onChange={(e) => {
                      // Create a date object for today with the selected time
                      const date = new Date();
                      const [hours, minutes] = e.target.value.split(':');
                      date.setHours(parseInt(hours || '23', 10));
                      date.setMinutes(parseInt(minutes || '59', 10));
                      
                      handleFilterChange({
                        arrivalTimeRange: {
                          start: filters.arrivalTimeRange?.start || new Date().toISOString(),
                          end: date.toISOString()
                        }
                      });
                    }}
                  />
                </div>
              </div>
            </div>
            
            {/* Duration filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Duration (hours)
              </label>
              <input
                type="number"
                min="1"
                max="24"
                step="0.5"
                placeholder="Max hours"
                value={filters.maxDuration ? filters.maxDuration / 60 : ''}
                className="p-2 border rounded text-sm w-full"
                onChange={(e) => {
                  const hours = parseFloat(e.target.value);
                  const minutes = hours ? Math.floor(hours * 60) : undefined;
                  handleFilterChange({ maxDuration: minutes });
                }}
              />
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {isProcessing ? (
          <div className="text-center py-8">
            <Loader2 className="h-8 w-8 text-blue-600 animate-spin mx-auto" />
            <p className="text-gray-500 mt-2">Processing flight data...</p>
          </div>
        ) : (
          displayedFlights.length > 0 ? (
            displayedFlights.map((flight) => (
              <FlightCard
                key={flight.id}
                flight={flight}
                selectedCabinClass={selectedCabinClass}
                onBook={handleBook}
              />
            ))
          ) : (
            <div className="text-center py-8">
              <div className="text-gray-500">No flights found matching your criteria</div>
              <button
                onClick={clearFilters}
                className="mt-2 text-blue-600 hover:text-blue-800 text-sm"
              >
                Clear filters
              </button>
            </div>
          )
        )}
      </div>
    </div>
  );
}