import { useState } from 'react';
import { FlightSearchForm } from '../components/FlightSearch';
import { Header } from '../components/Header';
import { Globe2 } from 'lucide-react';
import { RecentSearches } from '../components/RecentSearches';
import { FlightSearchResults } from '../components/FlightResults';
import { Flight } from '../types/flight';
import { useFlightStore } from '../stores/FlightStore';

const Dashboard = () => {
    const [isSearching, setIsSearching] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    const [flights, setFlights] = useState<Flight[]>([]);  // Store flight results
    const { recentSearches } = useFlightStore();

    const handleSearch = async (flightData: Flight[]) => {
        setIsSearching(true);
        setHasSearched(true);

        setFlights(flightData); 
        setIsSearching(false);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
                <div className="text-center mb-8 sm:mb-12">
                    <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                        Find and Book Your Perfect Flight
                    </h2>
                    <p className="text-base sm:text-lg text-gray-600 flex items-center justify-center gap-2">
                        <Globe2 className="h-5 w-5" />
                        Search thousands of flights at the best prices
                    </p>
                </div>

                <div className="max-w-5xl mx-auto">
                    <FlightSearchForm onSearch={handleSearch} />
                </div>

                {isSearching && (
                    <div className="mt-8 text-center">
                        <div className="inline-flex items-center px-4 py-2 font-semibold leading-6 text-blue-600">
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Searching for flights...
                        </div>
                    </div>
                )}

                {recentSearches.length > 0 && <RecentSearches />}

                {hasSearched && !isSearching && (
                    <div className="mt-8">
                        <FlightSearchResults flights={flights} isLoading={isSearching} selectedCabinClass="ECONOMY" />
                    </div>
                )}
            </main>
        </div>
    );
};

export default Dashboard;