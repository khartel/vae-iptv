import { useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'motion/react'
import { Search } from 'lucide-react'
import { useLiveCategories } from '../hooks/useLiveCategories'
import { useLiveStreams } from '../hooks/useLiveStreams'
import { useFavorites } from '../hooks/useFavorites'
import { useSpatialInput } from '../hooks/useSpatialInput'
import { useBackNavigation } from '../hooks/useBackNavigation'
import { ChannelCard } from '../components/ChannelCard'
import { CategorySidebar } from '../components/CategorySidebar'
import { LoadMoreButton } from '../components/LoadMoreButton'

const PAGE_SIZE = 60

export function LiveTvPage() {
  const navigate = useNavigate()
  // Selected category + channel search live in the URL (not local state) so
  // browser/router "back" naturally restores exactly where you were, instead
  // of always resetting to "All" on remount.
  const [searchParams, setSearchParams] = useSearchParams()
  const selectedCategoryId = searchParams.get('category')
  const query = searchParams.get('q') ?? ''

  const categoriesState = useLiveCategories()
  const streamsState = useLiveStreams(selectedCategoryId)
  const { isFavorite, toggleFavorite } = useFavorites()
  const channelSearch = useSpatialInput<HTMLInputElement>()

  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)

  useBackNavigation()

  const streams = streamsState.status === 'success' ? streamsState.streams : []

  const filteredStreams = useMemo(() => {
    if (!query.trim()) return streams
    const q = query.trim().toLowerCase()
    return streams.filter((s) => s.name.toLowerCase().includes(q))
  }, [streams, query])

  const visibleStreams = filteredStreams.slice(0, visibleCount)
  const hasMore = filteredStreams.length > visibleStreams.length

  function selectCategory(categoryId: string | null) {
    setVisibleCount(PAGE_SIZE)
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      if (categoryId) next.set('category', categoryId)
      else next.delete('category')
      next.delete('q')
      return next
    })
  }

  function setChannelQuery(value: string) {
    setVisibleCount(PAGE_SIZE)
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      if (value) next.set('q', value)
      else next.delete('q')
      return next
    })
  }

  return (
    <main className="pt-safe-margin-y pr-safe-margin-x pl-safe-margin-x flex h-screen flex-col">
      <div className="mb-6 flex shrink-0 items-center justify-between gap-6">
        <h1 className="text-headline-md font-extrabold tracking-tighter">
          Live TV
        </h1>
        <div className="relative w-full max-w-xs">
          <Search
            size={18}
            className="text-outline pointer-events-none absolute top-1/2 left-3 -translate-y-1/2"
          />
          <input
            ref={channelSearch.ref}
            type="text"
            value={query}
            onChange={(e) => setChannelQuery(e.target.value)}
            onBlur={channelSearch.onBlur}
            placeholder="Search channels…"
            className="bg-surface-container-high text-on-surface border-outline-variant/30 focus:border-primary w-full rounded-xl border py-2.5 pr-4 pl-10 outline-none"
          />
        </div>
      </div>

      <div className="gap-gutter-x flex min-h-0 flex-1">
        <CategorySidebar
          status={categoriesState.status}
          categories={
            categoriesState.status === 'success'
              ? categoriesState.categories
              : []
          }
          errorMessage={
            categoriesState.status === 'error'
              ? categoriesState.message
              : undefined
          }
          selectedCategoryId={selectedCategoryId}
          onSelectCategory={selectCategory}
          searchPlaceholder="Search countries…"
          loadingLabel="Loading countries…"
          emptyLabel="No countries match."
        />

        <div className="no-scrollbar h-full flex-1 overflow-y-auto pb-8">
          {streamsState.status === 'loading' && (
            <p className="text-on-surface-variant">Loading channels…</p>
          )}
          {streamsState.status === 'error' && (
            <p className="text-error">{streamsState.message}</p>
          )}
          {streamsState.status === 'success' &&
            filteredStreams.length === 0 && (
              <p className="text-on-surface-variant">No channels found.</p>
            )}

          {streamsState.status === 'success' && filteredStreams.length > 0 && (
            <>
              <motion.div
                key={selectedCategoryId ?? 'all'}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className="gap-rail-item-spacing grid grid-cols-2 pb-6 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
              >
                {visibleStreams.map((channel, i) => (
                  <ChannelCard
                    key={channel.stream_id}
                    channel={channel}
                    isFavorite={isFavorite(channel.stream_id)}
                    onSelect={() =>
                      navigate(`/watch/${channel.stream_id}`, {
                        state: { channels: visibleStreams, index: i },
                      })
                    }
                    onToggleFavorite={() => toggleFavorite(channel)}
                  />
                ))}
              </motion.div>
              {hasMore && (
                <LoadMoreButton
                  remaining={filteredStreams.length - visibleStreams.length}
                  onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
                />
              )}
            </>
          )}
        </div>
      </div>
    </main>
  )
}
