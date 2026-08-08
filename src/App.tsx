import type { ReactNode } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider, useAuth } from './app/AuthContext'
import { AppLayout } from './layouts/AppLayout'
import { LoginPage } from './pages/LoginPage'
import { HomePage } from './pages/HomePage'
import { LiveTvPage } from './pages/LiveTvPage'
import { FavoritesPage } from './pages/FavoritesPage'
import { MoviesPage } from './pages/MoviesPage'
import { MovieDetailsPage } from './pages/MovieDetailsPage'
import { SeriesPage } from './pages/SeriesPage'
import { SeriesDetailsPage } from './pages/SeriesDetailsPage'
import { PlayerPage } from './pages/PlayerPage'

function RequireAuth({ children }: { children: ReactNode }) {
  const { state } = useAuth()

  if (state.status === 'loading') {
    return (
      <div className="bg-background text-on-surface-variant flex min-h-screen items-center justify-center">
        Connecting to IPTV server…
      </div>
    )
  }

  if (state.status !== 'authenticated') {
    return <LoginPage />
  }

  return <>{children}</>
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route
            element={
              <RequireAuth>
                <AppLayout />
              </RequireAuth>
            }
          >
            <Route path="/" element={<HomePage />} />
            <Route path="/live" element={<LiveTvPage />} />
            <Route path="/favorites" element={<FavoritesPage />} />
            <Route path="/movies" element={<MoviesPage />} />
            <Route path="/movies/:vodId" element={<MovieDetailsPage />} />
            <Route path="/series" element={<SeriesPage />} />
            <Route path="/series/:seriesId" element={<SeriesDetailsPage />} />
          </Route>
          <Route
            path="/watch/:streamId"
            element={
              <RequireAuth>
                <PlayerPage />
              </RequireAuth>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
