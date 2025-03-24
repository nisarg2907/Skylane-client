import { Flight } from '../types/flight';

type SortOption = 'price' | 'departure' | 'duration';

interface WorkerMessage {
  type: 'sort' | 'filter';
  flights: Flight[];
  sortBy?: SortOption;
  filters?: {
    minPrice?: number;
    maxPrice?: number;
    airlines?: string[];
    departureTimeRange?: {
      start: string; // ISO string
      end: string;   // ISO string
    };
    arrivalTimeRange?: {
      start: string; // ISO string
      end: string;   // ISO string
    };
    maxDuration?: number; // in minutes
    cabinClass?: 'ECONOMY' | 'PREMIUM_ECONOMY' | 'BUSINESS' | 'FIRST';
  };
  selectedCabinClass?: 'ECONOMY' | 'PREMIUM_ECONOMY' | 'BUSINESS' | 'FIRST';
}

self.onmessage = (event: MessageEvent<WorkerMessage>) => {
  const { type, flights, sortBy, filters, selectedCabinClass } = event.data;

  if (type === 'sort' && sortBy) {
    const sortedFlights = sortFlights(flights, sortBy, selectedCabinClass);
    self.postMessage({ type: 'sortResult', flights: sortedFlights });
  } else if (type === 'filter' && filters) {
    const filteredFlights = filterFlights(flights, filters);
    self.postMessage({ type: 'filterResult', flights: filteredFlights });
  }
};

function sortFlights(
  flights: Flight[], 
  sortBy: SortOption, 
  cabinClass: 'ECONOMY' | 'PREMIUM_ECONOMY' | 'BUSINESS' | 'FIRST' = 'ECONOMY'
): Flight[] {
  return [...flights].sort((a, b) => {
    switch (sortBy) {
      case 'price':
        return getFlightPrice(a, cabinClass) - getFlightPrice(b, cabinClass);
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
}

function getFlightPrice(flight: Flight, cabinClass: 'ECONOMY' | 'PREMIUM_ECONOMY' | 'BUSINESS' | 'FIRST'): number {
  switch (cabinClass) {
    case 'ECONOMY':
      return flight.economyPrice || 0;
    case 'PREMIUM_ECONOMY':
      return flight.premiumEconomyPrice || flight.economyPrice * 1.5 || 0;
    case 'BUSINESS':
      return flight.businessPrice || flight.economyPrice * 2.5 || 0;
    case 'FIRST':
      return flight.firstClassPrice || flight.economyPrice * 4 || 0;
    default:
      return flight.economyPrice || 0;
  }
}

function filterFlights(flights: Flight[], filters: NonNullable<WorkerMessage['filters']>): Flight[] {
  return flights.filter(flight => {
    // Price filter based on selected cabin class
    const cabinClass = filters.cabinClass || 'ECONOMY';
    const flightPrice = getFlightPrice(flight, cabinClass);
    
    if (filters.minPrice !== undefined && flightPrice < filters.minPrice) {
      return false;
    }
    
    if (filters.maxPrice !== undefined && flightPrice > filters.maxPrice) {
      return false;
    }
    
    // Airline filter
    if (filters.airlines && filters.airlines.length > 0) {
      // Convert flight.airline to string if it's not already
      const flightAirline = typeof flight.airline === 'string' 
        ? flight.airline 
        : String(flight.airline);
        
      if (!filters.airlines.includes(flightAirline)) {
        return false;
      }
    }
    
    // Departure time range filter
    if (filters.departureTimeRange) {
      const departureTime = new Date(flight.departureTime).getTime();
      const startTime = new Date(filters.departureTimeRange.start).getTime();
      const endTime = new Date(filters.departureTimeRange.end).getTime();
      
      if (departureTime < startTime || departureTime > endTime) {
        return false;
      }
    }
    
    // Arrival time range filter
    if (filters.arrivalTimeRange) {
      const arrivalTime = new Date(flight.arrivalTime).getTime();
      const startTime = new Date(filters.arrivalTimeRange.start).getTime();
      const endTime = new Date(filters.arrivalTimeRange.end).getTime();
      
      if (arrivalTime < startTime || arrivalTime > endTime) {
        return false;
      }
    }
    
    // Duration filter
    if (filters.maxDuration !== undefined) {
      const durationMs = new Date(flight.arrivalTime).getTime() - new Date(flight.departureTime).getTime();
      const durationMinutes = durationMs / (1000 * 60);
      
      if (durationMinutes > filters.maxDuration) {
        return false;
      }
    }
    
    return true;
  });
}