// src/components/SeatAvailability.tsx
import { useSeatUpdates } from '../hooks/useSeatUpdates';

interface SeatAvailabilityProps {
  flightId: string;
  initialSeats: number;
  cabinClass: string;
}

export const SeatAvailability = ({ 
  flightId, 
  initialSeats, 
}: SeatAvailabilityProps) => {
  const { currentSeats, error, isConnected } = useSeatUpdates(flightId);
  
  const availableSeats = currentSeats ?? initialSeats;
  const seatsText = `${availableSeats} ${availableSeats === 1 ? 'seat' : 'seats'}`;
  const lowAvailability = availableSeats < 10;

  return (
    <div className="flex items-center gap-2">
      <span className="font-medium">
        {seatsText} available
      </span>
      
      {lowAvailability && (
        <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">
          Selling fast!
        </span>
      )}

      {error && (
        <span className="text-xs text-yellow-600">
          (Updates paused)
        </span>
      )}

      <span 
        className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-gray-300'}`}
        title={isConnected ? 'Live updates connected' : 'Disconnected'}
      />
    </div>
  );
};