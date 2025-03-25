import axios from 'axios';
import { useAuthStore } from '../stores/AuthStore';
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format } from 'date-fns';
const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
});

// Request interceptor that adds the latest access token
api.interceptors.request.use(
  async (config) => {
    // Use the getAccessToken method which automatically refreshes if needed
    const accessToken = await useAuthStore.getState().getAccessToken();
     console.log("accesstoken",accessToken)
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor that handles auth errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // If we get a 401 and we haven't tried to refresh yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Attempt to refresh the token
        const refreshed = await useAuthStore.getState().refreshSession();
        
        // If refresh was successful
        if (refreshed) {
          // Get the new token
          const accessToken = useAuthStore.getState().accessToken;
          
          // Update the request with the new token
          if (accessToken) {
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            return api(originalRequest);
          }
        }
        
        // If we couldn't refresh, sign out
        useAuthStore.getState().signOut();
        return Promise.reject(error);
      } catch (refreshError) {
        console.error('Failed to refresh token:', refreshError);
        useAuthStore.getState().signOut();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price);
}

export  const formatDate = (dateString: string) => {
  try {
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? 'Invalid Date' : format(date, 'MMM d, yyyy');
  } catch  {
    return 'Invalid Date';
  }
};
export default api;