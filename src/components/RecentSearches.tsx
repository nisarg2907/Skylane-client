import { useFlightStore } from '../stores/FlightStore';
import { Clock, Plane } from 'lucide-react';
import { format } from 'date-fns';

export function RecentSearches() {
  const { recentSearches } = useFlightStore();

  const dummySearches = [
    { from: 'New York', to: 'Los Angeles', date: '2023-10-01' },
    { from: 'Chicago', to: 'Miami', date: '2023-09-15' },
    { from: 'San Francisco', to: 'Seattle', date: '2023-08-20' },
  ];

  const searchesToDisplay = recentSearches.length > 0 ? recentSearches : dummySearches;

  return (
    <div className="mt-8">
      <div className="flex items-center gap-2 mb-4">
        <Clock className="h-5 w-5 text-gray-400" />
        <h3 className="text-lg font-semibold text-gray-900">Recent Searches</h3>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {searchesToDisplay.map((search, index) => (
          <div
            key={index}
            className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Plane className="h-4 w-4 text-blue-500" />
                <span className="font-medium text-gray-900 text-sm sm:text-base">{search.from}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-900 text-sm sm:text-base">{search.to}</span>
                <Plane className="h-4 w-4 text-blue-500 rotate-90" />
              </div>
            </div>
            <div className="text-xs sm:text-sm text-gray-500">
              {format(new Date(search.date), 'MMM d, yyyy')}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}