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

## Deployment
- Deployed URL: https://skylane-server-1xqw.vercel.app/
- Hosted on Vercel



Project Link: https://github.com/nisarg2907/Skylane-client