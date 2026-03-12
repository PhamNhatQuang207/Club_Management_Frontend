import React from 'react'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import { Home } from './pages/Home'
import { Admin } from './pages/Admin'
import { Login } from './pages/Login'
import { ProtectedRoute } from './components/ProtectedRoute'
import { SocketProvider } from './hooks/useSocket'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
})

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <SocketProvider>
        <Router>
          <Routes>
            <Route path="/" element={<HomeWithLinks />} />
            <Route path="/login" element={<Login />} />
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <Admin />
                </ProtectedRoute>
              }
            />
          </Routes>
        </Router>
      </SocketProvider>
    </QueryClientProvider>
  )
}

// Wrap Home to add the routing link to the header
const HomeWithLinks: React.FC = () => {
  return (
    <div className="relative">
      <div className="absolute top-6 md:top-10 right-6 md:right-10 z-50">
        <Link 
          to="/login"
          className="px-4 py-2 rounded-lg bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 font-sans text-sm tracking-wide transition-all backdrop-blur-md flex items-center gap-2"
        >
          Staff Login
        </Link>
      </div>
      <Home />
    </div>
  )
}

export default App
