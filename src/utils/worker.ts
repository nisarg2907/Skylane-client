import { Flight } from '../types/flight';

type SortOption = 'price' | 'departure' | 'duration';

interface WorkerMessage {
  type: 'process';
  flights: {
    outboundFlights: Flight[];
    returnFlights: Flight[];
  };
  filters?: {
    minPrice?: number;
    maxPrice?: number;
    departureTimeRange?: { start: string; end: string };
    arrivalTimeRange?: { start: string; end: string };
    maxDuration?: number;
    cabinClass?: 'ECONOMY' | 'PREMIUM_ECONOMY' | 'BUSINESS' | 'FIRST';
  };
  sortBy?: SortOption;
  mode: 'outbound' | 'return';
  selectedCabinClass?: 'ECONOMY' | 'PREMIUM_ECONOMY' | 'BUSINESS' | 'FIRST';
}

self.onmessage = (event: MessageEvent<WorkerMessage>) => {
  const { flights, filters, sortBy, mode, selectedCabinClass } = event.data;

  try {
    // Filter and sort flights for the current mode
    const processed = mode === 'outbound'
      ? processFlights(flights.outboundFlights, filters, sortBy, selectedCabinClass)
      : processFlights(flights.returnFlights, filters, sortBy, selectedCabinClass);

    // Maintain unprocessed flights for the other mode
    const result = {
      outboundFlights: mode === 'outbound' ? processed : flights.outboundFlights,
      returnFlights: mode === 'return' ? processed : flights.returnFlights
    };

    self.postMessage({ type: 'results', flights: result });
  } catch (error) {
    self.postMessage({
      type: 'error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

function processFlights(
  flights: Flight[],
  filters: WorkerMessage['filters'] = {},
  sortBy: SortOption = 'price',
  cabinClass: string = 'ECONOMY'
) {
  const result = filterFlights(flights, filters);
  return sortFlights(result, sortBy, cabinClass);
}

function sortFlights(
  flights: Flight[],
  sortBy: SortOption,
  cabinClass: string
): Flight[] {
  return [...flights].sort((a, b) => {
    const aPrice = getFlightPrice(a, cabinClass);
    const bPrice = getFlightPrice(b, cabinClass);
    
    switch (sortBy) {
      case 'price': return aPrice - bPrice;
      case 'departure': 
        return new Date(a.departureTime).getTime() - new Date(b.departureTime).getTime();
      case 'duration': {
        const aDur = new Date(a.arrivalTime).getTime() - new Date(a.departureTime).getTime();
        const bDur = new Date(b.arrivalTime).getTime() - new Date(b.departureTime).getTime();
        return aDur - bDur;
      }
      default: return 0;
    }
  });
}

function getFlightPrice(flight: Flight, cabinClass: string): number {
  switch (cabinClass) {
    case 'PREMIUM_ECONOMY': return flight.premiumEconomyPrice || flight.economyPrice * 1.5;
    case 'BUSINESS': return flight.businessPrice || flight.economyPrice * 2.5;
    case 'FIRST': return flight.firstClassPrice || flight.economyPrice * 4;
    default: return flight.economyPrice;
  }
}

function filterFlights(flights: Flight[], filters: WorkerMessage['filters']): Flight[] {
  return flights.filter(flight => {
    const cabinClass = filters?.cabinClass || 'ECONOMY';
    const price = getFlightPrice(flight, cabinClass);
    
    // Price filter
    if (filters?.minPrice && price < filters.minPrice) return false;
    if (filters?.maxPrice && price > filters.maxPrice) return false;

    // Departure time filter
    if (filters?.departureTimeRange) {
      const depTime = new Date(flight.departureTime).getTime();
      const start = new Date(filters.departureTimeRange.start).getTime();
      const end = new Date(filters.departureTimeRange.end).getTime();
      if (depTime < start || depTime > end) return false;
    }

    // Arrival time filter
    if (filters?.arrivalTimeRange) {
      const arrTime = new Date(flight.arrivalTime).getTime();
      const start = new Date(filters.arrivalTimeRange.start).getTime();
      const end = new Date(filters.arrivalTimeRange.end).getTime();
      if (arrTime < start || arrTime > end) return false;
    }

    // Duration filter
    if (filters?.maxDuration) {
      const duration = (new Date(flight.arrivalTime).getTime() - 
                       new Date(flight.departureTime).getTime()) / 60000;
      if (duration > filters.maxDuration) return false;
    }

    return true;
  });
}