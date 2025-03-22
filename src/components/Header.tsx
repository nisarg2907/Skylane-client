import { useState, useEffect } from 'react'
import { useAuthStore } from '../stores/AuthStore'
import { Link } from 'react-router-dom'
import { Plane } from 'lucide-react'

export const Header = () => {
  const { user, signOut, initializeAuth } = useAuthStore()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  useEffect(() => {
    if (!user) {
      initializeAuth()
    }
  }, [user, initializeAuth])

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setIsMenuOpen(false)
    }
  }

  return (
    <header className="bg-white shadow-sm">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Plane className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
            <Link to="/" className="ml-2 text-2xl font-bold text-indigo-600">
              SkyLane
            </Link>
          </div>

          {/* User Menu */}
          <div className="relative">
            {user ? (
              <>
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 text-white text-lg font-semibold shadow-md hover:shadow-lg transition-all"
                >
                  {user.firstName?.[0]?.toUpperCase() || 'U'}
                </button>

                {isMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10 "
                      onClick={handleBackdropClick}
                    ></div>
                    <div className="absolute right-0 mt-2 w-48 origin-top-right rounded-lg bg-white py-2 shadow-lg ring-1 ring-black ring-opacity-5 transition-opacity z-20">
                      <button
                        onClick={signOut}
                        className="block w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
                      >
                        Sign out
                      </button>
                    </div>
                  </>
                )}
              </>
            ) : (
              <Link
                to="/auth/login"
                className="px-5 py-2 bg-indigo-600 text-white font-medium rounded-full shadow-md hover:bg-indigo-700 transition-all"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </nav>
    </header>
  )
}
