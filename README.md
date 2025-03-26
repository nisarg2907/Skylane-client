# Skylane Flight Booking System - Frontend

## Project Overview
Skylane is a comprehensive flight booking web application that provides users with a seamless experience for searching, booking, and managing flight reservations.

## Technologies Used
- React (v19)
- Vite
- TypeScript
- Tailwind CSS
- Zustand (State Management)
- Supabase Authentication
- IndexedDB
- Web Workers

## Features
- User Authentication
- Flight Search and Booking
  - One-way and Round-trip Booking
  - Advanced Filtering Options
- Profile Management
  - Personal Information
  - Payment Method Storage
- Booking Management
  - View Bookings
  - Cancel Bookings
  - Download Tickets
- Real-time Seat Updates
- Offline Data Persistence
- Performance Optimizations

## Prerequisites
- Node.js (Latest LTS version)
- npm

## Getting Started

### Installation
1. Clone the repository
```bash
git clone https://github.com/nisarg2907/Skylane-client.git
cd Skylane-client
```

2. Install Dependencies
```bash
npm install
```

### Environment Configuration
Create a `.env` file in the project root with the following variables:
```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_BACKEND_URL=your_backend_service_url
```

### Running the Application
```bash
# Development Mode
npm run dev

# Build for Production
npm run build

# Preview Production Build
npm run preview
```

## Key Architecture Components

### State Management
- Zustand for global state management
- IndexedDB for offline data caching
- Recent searches stored locally

### Performance Optimizations
- Web Workers for CPU-intensive tasks
  - Flight search filtering
  - Large dataset processing
- IndexedDB for offline data persistence

### Authentication
- Supabase Authentication
- Token refresh management on the frontend
- Secure token validation on the backend

## Pages and Functionality

### Dashboard
- Flight search with comprehensive filters
- Origin/Destination selection
- Date range picker
- Passenger count selection
- Cabin class options

### Booking Flow
- One-way and Round-trip booking options
- Passenger information collection
- Payment method selection

### User Profile
- Personal information management
- Payment method storage
- Default payment method setting

### Bookings Management
- View all bookings
- Filter bookings by:
  - Status
  - Trip type (One-way/Round-trip)
- Cancel bookings
- Download e-tickets
## Airport Database

The application comes pre-seeded with a comprehensive database of 50 international airports. Airports can be searched by code, name, or city on the dashboard. 

### Available Airports

| Code | Airport Name | City | Country | Latitude | Longitude |
|------|--------------|------|---------|----------|-----------|
| ATL | Hartsfield-Jackson Atlanta International Airport | Atlanta | USA | 33.6407 | -84.4277 |
| PEK | Beijing Capital International Airport | Beijing | China | 40.0799 | 116.6031 |
| LHR | London Heathrow Airport | London | United Kingdom | 51.47 | -0.4543 |
| HND | Tokyo Haneda Airport | Tokyo | Japan | 35.5494 | 139.7798 |
| LAX | Los Angeles International Airport | Los Angeles | USA | 33.9416 | -118.4085 |
| CDG | Paris Charles de Gaulle Airport | Paris | France | 49.0097 | 2.5479 |
| DXB | Dubai International Airport | Dubai | UAE | 25.2528 | 55.3644 |
| FRA | Frankfurt Airport | Frankfurt | Germany | 50.0379 | 8.5622 |
| HKG | Hong Kong International Airport | Hong Kong | China | 22.308 | 113.9185 |
| DFW | Dallas/Fort Worth International Airport | Dallas | USA | 32.8998 | -97.0403 |
| CGK | Soekarno-Hatta International Airport | Jakarta | Indonesia | -6.1256 | 106.6558 |
| AMS | Amsterdam Airport Schiphol | Amsterdam | Netherlands | 52.3105 | 4.7683 |
| SIN | Singapore Changi Airport | Singapore | Singapore | 1.3644 | 103.9915 |
| CAN | Guangzhou Baiyun International Airport | Guangzhou | China | 23.3959 | 113.308 |
| JFK | John F. Kennedy International Airport | New York | USA | 40.6413 | -73.7781 |
| DEL | Indira Gandhi International Airport | New Delhi | India | 28.5562 | 77.1 |
| ICN | Incheon International Airport | Seoul | South Korea | 37.4602 | 126.4407 |
| IST | Istanbul Airport | Istanbul | Turkey | 41.2608 | 28.7418 |
| SYD | Sydney Kingsford Smith Airport | Sydney | Australia | -33.9399 | 151.1753 |
| MEX | Mexico City International Airport | Mexico City | Mexico | 19.4361 | -99.0719 |
| MUC | Munich Airport | Munich | Germany | 48.3537 | 11.786 |
| YYZ | Toronto Pearson International Airport | Toronto | Canada | 43.6777 | -79.6248 |
| BOM | Chhatrapati Shivaji International Airport | Mumbai | India | 19.0896 | 72.8656 |
| MAD | Adolfo Suárez Madrid–Barajas Airport | Madrid | Spain | 40.4983 | -3.5676 |
| BCN | Barcelona-El Prat Airport | Barcelona | Spain | 41.2971 | 2.0785 |
| LGW | London Gatwick Airport | London | United Kingdom | 51.1537 | -0.1821 |
| SEA | Seattle-Tacoma International Airport | Seattle | USA | 47.4502 | -122.3088 |
| BKK | Suvarnabhumi Airport | Bangkok | Thailand | 13.69 | 100.7501 |
| SFO | San Francisco International Airport | San Francisco | USA | 37.6213 | -122.379 |
| ORD | O'Hare International Airport | Chicago | USA | 41.9742 | -87.9073 |
| KUL | Kuala Lumpur International Airport | Kuala Lumpur | Malaysia | 2.7456 | 101.7099 |
| VIE | Vienna International Airport | Vienna | Austria | 48.1102 | 16.5697 |
| ZRH | Zurich Airport | Zurich | Switzerland | 47.4582 | 8.5555 |
| DUB | Dublin Airport | Dublin | Ireland | 53.4264 | -6.2499 |
| CPH | Copenhagen Airport | Copenhagen | Denmark | 55.618 | 12.656 |
| DOH | Hamad International Airport | Doha | Qatar | 25.273 | 51.6083 |
| HEL | Helsinki Airport | Helsinki | Finland | 60.3183 | 24.9497 |
| LIS | Lisbon Airport | Lisbon | Portugal | 38.7742 | -9.1342 |
| OSL | Oslo Airport | Oslo | Norway | 60.1976 | 11.1004 |
| AKL | Auckland Airport | Auckland | New Zealand | -37.0082 | 174.785 |
| ARN | Stockholm Arlanda Airport | Stockholm | Sweden | 59.6498 | 17.9238 |
| MNL | Ninoy Aquino International Airport | Manila | Philippines | 14.5086 | 121.0195 |
| NRT | Narita International Airport | Tokyo | Japan | 35.7719 | 140.3928 |
| GRU | São Paulo–Guarulhos International Airport | São Paulo | Brazil | -23.4356 | -46.4731 |
| BWI | Baltimore/Washington International Airport | Baltimore | USA | 39.1774 | -76.6684 |
| DEN | Denver International Airport | Denver | USA | 39.8561 | -104.6737 |
| MIA | Miami International Airport | Miami | USA | 25.7952 | -80.2714 |
| BOS | Boston Logan International Airport | Boston | USA | 42.3656 | -71.0096 |
| CAI | Cairo International Airport | Cairo | Egypt | 30.1219 | 31.4056 |

### Search Capabilities
- Search airports by:
  - Airport Code (e.g., 'ATL', 'LHR')
  - Airport Name (e.g., 'Heathrow', 'Haneda')
  - City (e.g., 'London', 'Tokyo')


## Deployment
- Deployed URL: https://skylane-server-1xqw.vercel.app/
- Hosted on Vercel

## Project Links
- GitHub Repository: https://github.com/nisarg2907/Skylane-client

