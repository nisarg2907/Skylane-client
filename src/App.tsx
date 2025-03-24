import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { SignInPage, SignUpPage } from './pages/Auth';
import DashboardPage from './pages/Dashboard';
import { BookingsPage } from './pages/Bookings';
import { useAuthStore } from './stores/AuthStore';
import { useEffect } from 'react';
import { Checkout } from './pages/Checkout';
import { ProfilePage } from './pages/Profile';
import { UpdateBookingPage } from './pages/UpdateBooking';
import NotFoundPage from './pages/NotFound';

function App() {
  const { initializeAuth } = useAuthStore();

  useEffect(() => {
    console.log("rerendered")
    initializeAuth();
  }, [initializeAuth]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/auth/signup" element={<SignUpPage />} />
        <Route path="/auth/login" element={<SignInPage />} />
        <Route path="/" element={<DashboardPage />} />
        <Route path="/user-bookings" element={<BookingsPage />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/update-booking" element={<UpdateBookingPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;