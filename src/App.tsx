import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { SignInPage, SignUpPage } from './pages/Auth';
import DashboardPage from './pages/Dashboard';
import { BookingsPage } from './pages/Bookings';
import { useAuthStore } from './stores/AuthStore';
import { useEffect } from 'react';
import { Checkout } from './pages/Checkout';

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
      </Routes>
    </BrowserRouter>
  );
}

export default App;