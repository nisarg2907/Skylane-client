import { Button } from './ui/Button';
import { useFlightStore } from '../stores/FlightStore';
import { Minus, Plus, Users } from 'lucide-react';
import { useState } from 'react';

export function PassengerSelector() {
  const [isOpen, setIsOpen] = useState(false);
  const { passengers, setPassengers } = useFlightStore();
  const totalPassengers = passengers.adult + passengers.child;

  const updatePassenger = (type: 'adult' | 'child', increment: boolean) => {
    const current = passengers[type];
    const newValue = increment ? current + 1 : current - 1;

    if (newValue >= 0 && newValue <= 9) {
      if (totalPassengers < 9 || !increment) {
        setPassengers(type, newValue);
      }
    }
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between rounded-md border border-gray-300 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
      >
        <div className="flex items-center">
          <Users className="h-5 w-5 text-gray-400 mr-2" />
          <span className="text-gray-900">{totalPassengers} Passenger{totalPassengers !== 1 ? 's' : ''}</span>
        </div>
        <span className="text-gray-500">▼</span>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 p-4 z-50">
          <div className="space-y-4">
            {/* Adults */}
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Adults</p>
                <p className="text-sm text-gray-500">Age 13+</p>
              </div>
              <div className="flex items-center space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => updatePassenger('adult', false)}
                  disabled={passengers.adult <= 1}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-8 text-center">{passengers.adult}</span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => updatePassenger('adult', true)}
                  disabled={totalPassengers >= 9}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Children */}
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Children</p>
                <p className="text-sm text-gray-500">Age 2-12</p>
              </div>
              <div className="flex items-center space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => updatePassenger('child', false)}
                  disabled={passengers.child <= 0}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-8 text-center">{passengers.child}</span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => updatePassenger('child', true)}
                  disabled={totalPassengers >= 9}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="pt-4 border-t">
              <Button
                type="button"
                className="w-full"
                onClick={() => setIsOpen(false)}
              >
                Done
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}