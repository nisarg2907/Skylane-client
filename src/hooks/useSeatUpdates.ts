import { useEffect, useState, useCallback } from 'react';

interface SeatUpdate {
  flightId: string;
  cabinClass: string;
  availableSeats: number;
  timestamp: string;
}

export const useSeatUpdates = (flightId: string) => {
  const [seatData, setSeatData] = useState<SeatUpdate | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const handleMessage = useCallback((event: MessageEvent) => {
    try {
      const data = JSON.parse(event.data);
      console.log('Received seat update:', data);
      if (data.type === 'seatUpdate') {
        setSeatData({
          flightId: data.flightId,
          cabinClass: data.cabinClass,
          availableSeats: data.availableSeats,
          timestamp: data.timestamp
        });
        console.log('Seat data updated:', {
          flightId: data.flightId,
          cabinClass: data.cabinClass,
          availableSeats: data.availableSeats,
          timestamp: data.timestamp
        });
      }
    } catch (err) {
      console.error('Error parsing seat update:', err);
      setError(`Parsing error: ${err instanceof Error ? err.message : String(err)}`);
    }
  }, []);

  useEffect(() => {
    if (!flightId) return;

    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    if (!backendUrl) {
      setError('Backend URL is not configured');
      return;
    }

    console.log('Attempting SSE Connection', {
      backendUrl,
      flightId
    });

    const url = new URL('/sse/seat-updates', backendUrl);
    url.searchParams.append('flightId', flightId);

    let eventSource: EventSource | null = null;

    try {
      eventSource = new EventSource(url.toString());

      eventSource.onopen = () => {
        console.log('SSE Connection Opened');
        setIsConnected(true);
        setError(null);
      };

      eventSource.onmessage = handleMessage;

      eventSource.onerror = (error) => {
        console.error('SSE Connection Error', error);
        setError(`Connection failed: ${JSON.stringify(error)}`);
        setIsConnected(false);
        
        // Optional: Attempt reconnection
        if (eventSource) {
          eventSource.close();
        }
      };
    } catch (err) {
      console.error('Failed to create EventSource', err);
      setError(`Setup error: ${err instanceof Error ? err.message : String(err)}`);
    }

    return () => {
      if (eventSource) {
        eventSource.close();
        console.log('SSE Connection Closed');
      }
      setIsConnected(false);
    };
  }, [flightId, handleMessage]);

  return {
    seatData,
    error,
    isConnected,
    currentSeats: seatData?.availableSeats
  };
};