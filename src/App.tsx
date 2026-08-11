import type { ReactNode } from 'react'
import { HashRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider, useAuth } from './app/AuthContext'
import { AppBackground } from './components/AppBackground'
import { AppLayout } from './layouts/AppLayout'
import { LoginPage } from './pages/LoginPage'
import { HomePage } from './pages/HomePage'
import { LiveTvPage } from './pages/LiveTvPage'
import { FavoritesPage } from './pages/FavoritesPage'
import { MoviesPage } from './pages/MoviesPage'
import { MovieDetailsPage } from './pages/MovieDetailsPage'
import { SeriesPage } from './pages/SeriesPage'
import { SeriesDetailsPage } from './pages/SeriesDetailsPage'
import { SearchPage } from './pages/SearchPage'
import { PlayerPage } from './pages/PlayerPage'

function RequireAuth({ children }: { children: ReactNode }) {
  const { state } = useAuth()

  if (state.status === 'loading') {
    return (
      <div className="text-on-surface-variant flex min-h-screen items-center justify-center">
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
      <AppBackground />
      <HashRouter>
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
            <Route path="/search" element={<SearchPage />} />
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
      </HashRouter>
    </AuthProvider>
  )
}

export default App
