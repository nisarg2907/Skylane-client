// import { useFlightStore } from '../stores/FlightStore';
// import { Button } from './ui/Button';
// import { useState, useEffect } from 'react';
// import { format } from 'date-fns';
// import { ArrowLeftRight, CalendarRange, Plane } from 'lucide-react';
// import { PassengerSelector } from './PassengerSelector';
// import api from '../lib/utils';
// import { Flight } from '../types/flight';

// interface FlightSearchFormProps {
//     onSearch: (searchParams: Flight[]) => void;
// }

// export function FlightSearchForm({ onSearch }: FlightSearchFormProps) {
//     const {
//         from,
//         to,
//         departureDate,
//         returnDate,
//         cabinClass,
//         tripType,
//         setFrom,
//         setTo,
//         setDepartureDate,
//         setReturnDate,
//         setCabinClass,
//         setTripType,
//         swapLocations,
//         addRecentSearch,
//     } = useFlightStore();

//     const [isLoading, setIsLoading] = useState(false);
//     const [error, setError] = useState<string | null>(null);

//     useEffect(() => {
//         if (tripType === 'oneWay') {
//             setReturnDate(undefined);
//         }
//     }, [tripType, setReturnDate]);

//     const today = format(new Date(), 'yyyy-MM-dd');

//     const handleSubmit = async (e: React.FormEvent) => {
//         e.preventDefault();

//         addRecentSearch({
//             from,
//             to,
//             date: departureDate,
//         });

//         try {
//             setIsLoading(true);
//             setError(null);
//             // Make the API call to fetch flight data
//             const response = await api.get('/api/flights', {
//                 params: {
//                     from,
//                     to,
//                     departureDate,
//                     returnDate: returnDate || '',
//                     cabinClass,
//                 },
//             });
            
//             const data = response.data;
//             onSearch(data);  
//         } catch (error: unknown) {
//             if (error instanceof Error) {
//                 setError(error.message);
//             } else {
//                 setError('An unknown error occurred');
//             }
//         } finally {
//             setIsLoading(false);
//         }
//     };

//     return (
//         <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-4 sm:p-6 relative">
//             <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-white rounded-full p-2 shadow-md">
//                 <div className="flex gap-1 bg-blue-50 rounded-full p-1">
//                     <Button
//                         type="button"
//                         variant={tripType === 'oneWay' ? 'default' : 'ghost'}
//                         size="sm"
//                         onClick={() => setTripType('oneWay')}
//                         className="rounded-full text-xs sm:text-sm"
//                     >
//                         One Way
//                     </Button>
//                     <Button
//                         type="button"
//                         variant={tripType === 'roundTrip' ? 'default' : 'ghost'}
//                         size="sm"
//                         onClick={() => setTripType('roundTrip')}
//                         className="rounded-full text-xs sm:text-sm"
//                     >
//                         Round Trip
//                     </Button>
//                 </div>
//             </div>

//             <div className="mt-8 grid grid-cols-1 gap-4 sm:gap-6">
//                 <div className="relative grid grid-cols-1 sm:grid-cols-2 gap-4">
//                     <div className="space-y-2">
//                         <label className="block text-sm font-medium text-gray-700">From</label>
//                         <div className="relative">
//                             <Plane className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
//                             <input
//                                 type="text"
//                                 value={from}
//                                 onChange={(e) => setFrom(e.target.value)}
//                                 className="pl-10 w-full rounded-md border border-gray-300 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
//                                 placeholder="City or Airport"
//                                 required
//                             />
//                         </div>
//                     </div>

//                     <div className="space-y-2">
//                         <label className="block text-sm font-medium text-gray-700">To</label>
//                         <div className="relative">
//                             <Plane className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 rotate-90" />
//                             <input
//                                 type="text"
//                                 value={to}
//                                 onChange={(e) => setTo(e.target.value)}
//                                 className="pl-10 w-full rounded-md border border-gray-300 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
//                                 placeholder="City or Airport"
//                                 required
//                             />
//                         </div>
//                     </div>

//                     <Button
//                         type="button"
//                         variant="default"
//                         className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white border border-gray-300 shadow-md z-10 no-hover"
//                         onClick={swapLocations}
//                     >
//                         <div className="p-1">
//                             <ArrowLeftRight className="h-6 w-6 text-black  rounded-full p-0.5" />
//                         </div>
//                     </Button>
//                 </div>

//                 <div className="space-y-2">
//                     <label className="block text-sm font-medium text-gray-700">
//                         <div className="flex items-center gap-2">
//                             <CalendarRange className="h-4 w-4" />
//                             {tripType === 'roundTrip' ? 'Dates' : 'Departure'}
//                         </div>
//                     </label>
//                     <div className="flex flex-col sm:flex-row gap-2">
//                         <input
//                             type="date"
//                             value={departureDate}
//                             min={today}
//                             onChange={(e) => setDepartureDate(e.target.value)}
//                             className="w-full rounded-md border border-gray-300 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
//                             required
//                         />
//                         {tripType === 'roundTrip' && (
//                             <input
//                                 type="date"
//                                 value={returnDate}
//                                 min={departureDate || today}
//                                 onChange={(e) => setReturnDate(e.target.value)}
//                                 className="w-full rounded-md border border-gray-300 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
//                                 required
//                             />
//                         )}
//                     </div>
//                 </div>

//                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                     <div className="space-y-2">
//                         <label className="block text-sm font-medium text-gray-700">Passengers</label>
//                         <PassengerSelector />
//                     </div>

//                     <div className="space-y-2">
//                         <label className="block text-sm font-medium text-gray-700">Cabin Class</label>
//                         <select
//                             value={cabinClass}
//                             onChange={(e) => setCabinClass(e.target.value as "economy" | "premium" | "business" | "first")}
//                             className="w-full rounded-md border border-gray-300 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
//                             required
//                         >
//                             <option value="economy">Economy</option>
//                             <option value="premium">Premium Economy</option>
//                             <option value="business">Business</option>
//                             <option value="first">First Class</option>
//                         </select>
//                     </div>
//                 </div>
//             </div>

//             <div className="mt-6">
//                 <Button type="submit" className="w-full" disabled={isLoading}>
//                     {isLoading ? 'Searching...' : 'Search Flights'}
//                 </Button>
//             </div>

//             {error && <div className="text-red-500 mt-2">{error}</div>}
//         </form>
//     );
// }
import { useFlightStore } from '../stores/FlightStore';
import { Button } from './ui/Button';
import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { ArrowLeftRight, CalendarRange, Plane } from 'lucide-react';
import { PassengerSelector } from './PassengerSelector';
import api from '../lib/utils';
import { Flight } from '../types/flight';

interface FlightSearchFormProps {
    onSearch: (searchParams: Flight[]) => void;  
}

export function FlightSearchForm({ onSearch }: FlightSearchFormProps) {
    const {
        from,
        to,
        departureDate,
        returnDate,
        cabinClass,
        tripType,
        setFrom,
        setTo,
        setDepartureDate,
        setReturnDate,
        setCabinClass,
        setTripType,
        swapLocations,
        addRecentSearch,
    } = useFlightStore();

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (tripType === 'oneWay') {
            setReturnDate(undefined);  
        }
    }, [tripType, setReturnDate]);

    const today = format(new Date(), 'yyyy-MM-dd');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Add search to recent searches
        addRecentSearch({
            from,
            to,
            date: departureDate,
        });

        try {
            setIsLoading(true);
            setError(null);
            console.log('Fetching flight data with params:', {
                from,
                to,
                departureDate,
                returnDate: returnDate || '',
                cabinClass,
                tripType,
            });
            // Make the API call to fetch flight data
            const response = await api.get('/flights', {
                params: {
                    from,
                    to,
                    departureDate,
                    returnDate: returnDate || null, // Optional return date for round-trip
                    cabinClass:cabinClass.toUpperCase(),
                    tripType,
                },
            });
    
            const data = response.data;
            console.log('Flight data received:', data);
            onSearch(data);  // Pass the data to the parent component
        } catch (error: unknown) {
            if (error instanceof Error) {
                console.error('Error fetching flight data:', error.message);
                setError(error.message);
            } else {
                console.error('An unknown error occurred');
                setError('An unknown error occurred');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-4 sm:p-6 relative">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-white rounded-full p-2 shadow-md">
                <div className="flex gap-1 bg-blue-50 rounded-full p-1">
                    <Button
                        type="button"
                        variant={tripType === 'oneWay' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setTripType('oneWay')}
                        className="rounded-full text-xs sm:text-sm"
                    >
                        One Way
                    </Button>
                    <Button
                        type="button"
                        variant={tripType === 'roundTrip' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setTripType('roundTrip')}
                        className="rounded-full text-xs sm:text-sm"
                    >
                        Round Trip
                    </Button>
                </div>
            </div>

            <div className="mt-8 grid grid-cols-1 gap-4 sm:gap-6">
                <div className="relative grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">From</label>
                        <div className="relative">
                            <Plane className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                                type="text"
                                value={from}
                                onChange={(e) => setFrom(e.target.value)}
                                className="pl-10 w-full rounded-md border border-gray-300 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="City or Airport"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">To</label>
                        <div className="relative">
                            <Plane className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 rotate-90" />
                            <input
                                type="text"
                                value={to}
                                onChange={(e) => setTo(e.target.value)}
                                className="pl-10 w-full rounded-md border border-gray-300 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="City or Airport"
                                required
                            />
                        </div>
                    </div>

                    <Button
                        type="button"
                        variant="default"
                        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white border border-gray-300 shadow-md z-10 no-hover"
                        onClick={swapLocations}
                    >
                        <div className="p-1">
                            <ArrowLeftRight className="h-6 w-6 text-black rounded-full p-0.5" />
                        </div>
                    </Button>
                </div>

                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                        <div className="flex items-center gap-2">
                            <CalendarRange className="h-4 w-4" />
                            {tripType === 'roundTrip' ? 'Dates' : 'Departure'}
                        </div>
                    </label>
                    <div className="flex flex-col sm:flex-row gap-2">
                        <input
                            type="date"
                            value={departureDate}
                            min={today}
                            onChange={(e) => setDepartureDate(e.target.value)}
                            className="w-full rounded-md border border-gray-300 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                        {tripType === 'roundTrip' && (
                            <input
                                type="date"
                                value={returnDate}
                                min={departureDate || today}
                                onChange={(e) => setReturnDate(e.target.value)}
                                className="w-full rounded-md border border-gray-300 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Passengers</label>
                        <PassengerSelector />
                    </div>
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Cabin Class</label>
                        <select
                            value={cabinClass}
                            onChange={(e) => setCabinClass(e.target.value as "ECONOMY" | "PREMIUM_ECONOMY" | "BUSINESS" | "FIRST")}
                            className="w-full rounded-md border border-gray-300 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        >
                            <option value="ECONOMY">Economy</option>
                            <option value="PREMIUM_ECONOMY">Premium Economy</option>
                            <option value="BUSINESS">Business</option>
                            <option value="FIRST">First Class</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="mt-6">
                <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? 'Searching...' : 'Search Flights'}
                </Button>
            </div>

            {error && <div className="text-red-500 mt-2">{error}</div>}
        </form>
    );
}
