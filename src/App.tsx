import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { SignInPage, SignUpPage } from './pages/Auth'
import DashboardPage from './pages/Dashboard'
import { BookingsPage } from './pages/Bookings'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/auth/signup" element={<SignUpPage />} />
        <Route path="/auth/login" element={<SignInPage />} />
        <Route path="/" element={<DashboardPage />} />
        <Route path="/user-bookings" element={<BookingsPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
