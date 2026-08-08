import { useNavigate, Link } from 'react-router-dom'
import { useLiveCategories } from '../hooks/useLiveCategories'
import { useLiveStreams } from '../hooks/useLiveStreams'
import { useFavorites } from '../hooks/useFavorites'
import { ChannelCard } from '../components/ChannelCard'

const FEATURED_COUNT = 12

export function HomePage() {
  const navigate = useNavigate()
  const categoriesState = useLiveCategories()
  const firstCategoryId =
    categoriesState.status === 'success'
      ? (categoriesState.categories[0]?.category_id ?? null)
      : null
  const streamsState = useLiveStreams(firstCategoryId)
  const { isFavorite, toggleFavorite } = useFavorites()

  const featured =
    streamsState.status === 'success'
      ? streamsState.streams.slice(0, FEATURED_COUNT)
      : []

  return (
    <main className="pt-safe-margin-y pr-safe-margin-x pb-safe-margin-y pl-safe-margin-x">
      <div className="mb-2">
        <h1 className="text-headline-lg font-extrabold tracking-tighter">
          Welcome back
        </h1>
        <p className="mt-2 text-on-surface-variant">
          Jump into{' '}
          <Link to="/live" className="text-primary underline">
            Live TV
          </Link>{' '}
          — Movies, Series, and EPG land in later phases.
        </p>
      </div>

      <section className="mt-section-gap">
        <h2 className="text-headline-md mb-4">Live Now</h2>

        {(categoriesState.status === 'loading' ||
          streamsState.status === 'loading') && (
          <p className="text-on-surface-variant">Loading channels…</p>
        )}
        {categoriesState.status === 'error' && (
          <p className="text-error">{categoriesState.message}</p>
        )}
        {streamsState.status === 'error' && (
          <p className="text-error">{streamsState.message}</p>
        )}

        {featured.length > 0 && (
          <div className="flex gap-rail-item-spacing overflow-x-auto pb-4 no-scrollbar">
            {featured.map((channel, i) => (
              <div key={channel.stream_id} className="w-[280px] shrink-0">
                <ChannelCard
                  channel={channel}
                  isFavorite={isFavorite(channel.stream_id)}
                  onSelect={() =>
                    navigate(`/watch/${channel.stream_id}`, {
                      state: { channels: featured, index: i },
                    })
                  }
                  onToggleFavorite={() => toggleFavorite(channel.stream_id)}
                />
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}
