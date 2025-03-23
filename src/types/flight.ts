export interface Airport {
    id: string;
    code: string;
    name: string;
    city: string;
    country: string;
    latitude?: number;
    longitude?: number;
  }
  
  export interface Airline {
    id: string;
    code: string;
    name: string;
  }
  
  export interface Flight {
    id: string;
    flightNumber: string;
    airlineId: string;
    departureAirportId: string;
    arrivalAirportId: string;
    departureTime: string;
    arrivalTime: string;
    
    economyCapacity: number;
    premiumEconomyCapacity?: number;
    businessCapacity?: number;
    firstClassCapacity?: number;
    
    economyPrice: number;
    premiumEconomyPrice?: number;
    businessPrice?: number;
    firstClassPrice?: number;
    
    status: 'SCHEDULED' | 'DELAYED' | 'DEPARTED' | 'IN_AIR' | 'LANDED' | 'CANCELLED';
    
    // Relations
    airline: Airline;
    departureAirport: Airport;
    arrivalAirport: Airport;
  }