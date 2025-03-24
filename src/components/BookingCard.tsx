import { Button } from './ui/Button';
import { Booking } from '../stores/Bookingstore';
import { formatPrice } from '../lib/utils';
import { Calendar, Download, Plane, Users } from 'lucide-react';
import { format } from 'date-fns';

interface BookingCardProps {
  booking: Booking;
  onCancel: (id: string) => void;
  onDownloadTicket: (booking: Booking) => void;
}

export function BookingCard({ booking, onCancel, onDownloadTicket }: BookingCardProps) {
  const totalPassengers = booking.passengers.adult + booking.passengers.child + booking.passengers.infant;

  return (
    <div className="bg-white rounded-lg shadow-md p-6 relative">
      <div className="flex flex-col sm:flex-row justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 bg-blue-50 rounded-full flex items-center justify-center">
            <Plane className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Flight {booking.flightNumber}</h3>
            <p className="text-sm text-gray-500">{format(new Date(booking.bookingDate), 'MMM d, yyyy')}</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold text-gray-900">{formatPrice(booking.price)}</div>
          <div className="text-sm text-gray-500">{booking.cabinClass}</div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="text-sm text-gray-500">From</div>
            <div className="font-medium">{booking.from}</div>
          </div>
          <Plane className="h-4 w-4 text-gray-400 rotate-90" />
          <div className="flex-1">
            <div className="text-sm text-gray-500">To</div>
            <div className="font-medium">{booking.to}</div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calendar className="h-4 w-4" />
          <span>{format(new Date(booking.departureDate), 'MMM d, yyyy')}</span>
          {booking.returnDate && (
            <>
              <span>-</span>
              <span>{format(new Date(booking.returnDate), 'MMM d, yyyy')}</span>
            </>
          )}
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Users className="h-4 w-4" />
          <span>{totalPassengers} Passenger{totalPassengers !== 1 ? 's' : ''}</span>
        </div>
      </div>

      {/* Status indicator moved next to buttons instead of absolute positioning */}
      <div className="mt-6 flex flex-col sm:flex-row justify-between items-center">
        <div className="text-sm font-semibold text-gray-600 mb-3 sm:mb-0">
          Status: <span className={booking.status === 'cancelled' ? 'text-red-600' : 'text-green-600'}>
            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
          </span>
        </div>
        
        {booking.status !== 'cancelled' && (
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              className="flex-1 min-w-[200px]"
              onClick={() => onDownloadTicket(booking)}
            >
              <Download className="h-4 w-4 mt-0.5 mr-2" />
              Download Ticket
            </Button>
            <Button
              variant="outline"
              className="flex-1 min-w-[150px] text-red-600 hover:bg-red-50 hover:border-red-600"
              onClick={() => onCancel(booking.id)}
            >
              Cancel Ticket
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}