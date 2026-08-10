import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search as SearchIcon } from 'lucide-react'
import { useLiveStreams } from '../hooks/useLiveStreams'
import { useVodStreams } from '../hooks/useVodStreams'
import { useSeriesList } from '../hooks/useSeriesList'
import { useFavorites } from '../hooks/useFavorites'
import { useSpatialInput } from '../hooks/useSpatialInput'
import { useBackNavigation } from '../hooks/useBackNavigation'
import { ChannelCard } from '../components/ChannelCard'
import { PosterCard } from '../components/PosterCard'

const RESULTS_PER_SECTION = 18

export function SearchPage() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const searchInput = useSpatialInput<HTMLInputElement>()
  useBackNavigation()

  // One unfiltered fetch per content type on mount, then filter client-side
  // as the user types — cheaper than re-querying the API on every keystroke,
  // and this is the one page where "search everything" genuinely needs the
  // whole catalog in memory.
  const liveState = useLiveStreams(null)
  const moviesState = useVodStreams(null)
  const seriesState = useSeriesList(null)
  const { isFavorite, toggleFavorite } = useFavorites()

  const q = query.trim().toLowerCase()

  const matchedChannels = useMemo(() => {
    if (!q || liveState.status !== 'success') return []
    return liveState.streams
      .filter((c) => c.name.toLowerCase().includes(q))
      .slice(0, RESULTS_PER_SECTION)
  }, [liveState, q])

  const matchedMovies = useMemo(() => {
    if (!q || moviesState.status !== 'success') return []
    return moviesState.data
      .filter((m) => m.name.toLowerCase().includes(q))
      .slice(0, RESULTS_PER_SECTION)
  }, [moviesState, q])

  const matchedSeries = useMemo(() => {
    if (!q || seriesState.status !== 'success') return []
    return seriesState.data
      .filter((s) => s.name.toLowerCase().includes(q))
      .slice(0, RESULTS_PER_SECTION)
  }, [seriesState, q])

  const isLoadingCatalog =
    liveState.status === 'loading' ||
    moviesState.status === 'loading' ||
    seriesState.status === 'loading'

  const hasAnyResults =
    matchedChannels.length > 0 ||
    matchedMovies.length > 0 ||
    matchedSeries.length > 0

  return (
    <main className="pt-safe-margin-y px-safe-margin-x pb-safe-margin-y">
      <h1 className="text-headline-md mb-6 font-extrabold tracking-tighter">
        Search
      </h1>

      <div className="relative mb-10 max-w-xl">
        <SearchIcon
          size={18}
          className="text-outline pointer-events-none absolute top-1/2 left-4 -translate-y-1/2"
        />
        <input
          ref={searchInput.ref}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onBlur={searchInput.onBlur}
          placeholder="Search channels, movies, and series…"
          className="bg-surface-container-high text-on-surface border-outline-variant/30 focus:border-primary w-full rounded-xl border py-3.5 pr-4 pl-12 text-lg outline-none"
        />
      </div>

      {!q && (
        <p className="text-on-surface-variant">
          Start typing to search across everything.
        </p>
      )}

      {q && isLoadingCatalog && (
        <p className="text-on-surface-variant">Loading catalog…</p>
      )}

      {q && !isLoadingCatalog && !hasAnyResults && (
        <p className="text-on-surface-variant">No matches for "{query}".</p>
      )}

      {matchedChannels.length > 0 && (
        <section className="mb-section-gap">
          <h2 className="text-headline-md mb-4">Live Channels</h2>
          <div className="gap-rail-item-spacing grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {matchedChannels.map((channel, i) => (
              <ChannelCard
                key={channel.stream_id}
                channel={channel}
                isFavorite={isFavorite(channel.stream_id)}
                onSelect={() =>
                  navigate(`/watch/${channel.stream_id}`, {
                    state: { channels: matchedChannels, index: i },
                  })
                }
                onToggleFavorite={() => toggleFavorite(channel)}
              />
            ))}
          </div>
        </section>
      )}

      {matchedMovies.length > 0 && (
        <section className="mb-section-gap">
          <h2 className="text-headline-md mb-4">Movies</h2>
          <div className="gap-rail-item-spacing grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {matchedMovies.map((movie) => (
              <PosterCard
                key={movie.stream_id}
                title={movie.name}
                posterUrl={movie.stream_icon}
                rating={movie.rating_5based}
                onSelect={() => navigate(`/movies/${movie.stream_id}`)}
              />
            ))}
          </div>
        </section>
      )}

      {matchedSeries.length > 0 && (
        <section className="mb-section-gap">
          <h2 className="text-headline-md mb-4">Series</h2>
          <div className="gap-rail-item-spacing grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {matchedSeries.map((series) => (
              <PosterCard
                key={series.series_id}
                title={series.name}
                posterUrl={series.cover}
                subtitle={series.genre}
                rating={series.rating_5based}
                onSelect={() =>
                  navigate(`/series/${series.series_id}`, {
                    state: { categoryId: series.category_id },
                  })
                }
              />
            ))}
          </div>
        </section>
      )}
    </main>
  )
}
