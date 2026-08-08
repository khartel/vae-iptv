import { useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'motion/react'
import { Search } from 'lucide-react'
import { useLiveCategories } from '../hooks/useLiveCategories'
import { useLiveStreams } from '../hooks/useLiveStreams'
import { useFavorites } from '../hooks/useFavorites'
import { ChannelCard } from '../components/ChannelCard'

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

  // Filters the country/category list itself — separate from the channel
  // search above, which only searches within the currently selected country.
  const [categoryQuery, setCategoryQuery] = useState('')
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)

  const streams = streamsState.status === 'success' ? streamsState.streams : []

  const filteredStreams = useMemo(() => {
    if (!query.trim()) return streams
    const q = query.trim().toLowerCase()
    return streams.filter((s) => s.name.toLowerCase().includes(q))
  }, [streams, query])

  const visibleStreams = filteredStreams.slice(0, visibleCount)
  const hasMore = filteredStreams.length > visibleStreams.length

  const filteredCategories =
    categoriesState.status === 'success'
      ? categoryQuery.trim()
        ? categoriesState.categories.filter((c) =>
            c.category_name
              .toLowerCase()
              .includes(categoryQuery.trim().toLowerCase()),
          )
        : categoriesState.categories
      : []

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
            type="text"
            value={query}
            onChange={(e) => setChannelQuery(e.target.value)}
            placeholder="Search channels…"
            className="bg-surface-container-high text-on-surface border-outline-variant/30 focus:border-primary w-full rounded-xl border py-2.5 pr-4 pl-10 outline-none"
          />
        </div>
      </div>

      <div className="gap-gutter-x flex min-h-0 flex-1">
        <div className="flex h-full w-[240px] shrink-0 flex-col">
          <div className="relative mb-3 shrink-0">
            <Search
              size={16}
              className="text-outline pointer-events-none absolute top-1/2 left-3 -translate-y-1/2"
            />
            <input
              type="text"
              value={categoryQuery}
              onChange={(e) => setCategoryQuery(e.target.value)}
              placeholder="Search countries…"
              className="bg-surface-container-high text-on-surface border-outline-variant/30 focus:border-primary w-full rounded-lg border py-2 pr-3 pl-9 text-sm outline-none"
            />
          </div>

          <div className="no-scrollbar flex-1 space-y-2 overflow-y-auto pb-8">
            <button
              type="button"
              onClick={() => selectCategory(null)}
              className={`w-full rounded-xl px-6 py-3 text-left transition-colors outline-none ${
                selectedCategoryId === null
                  ? 'bg-surface-container-high text-primary border-primary border-l-4 font-bold'
                  : 'text-on-surface-variant hover:bg-surface-container-high'
              }`}
            >
              All
            </button>

            {categoriesState.status === 'loading' && (
              <p className="text-on-surface-variant px-6 py-3 text-sm">
                Loading countries…
              </p>
            )}
            {categoriesState.status === 'error' && (
              <p className="text-error px-6 py-3 text-sm">
                {categoriesState.message}
              </p>
            )}
            {categoriesState.status === 'success' &&
              filteredCategories.length === 0 && (
                <p className="text-on-surface-variant px-6 py-3 text-sm">
                  No countries match.
                </p>
              )}
            {categoriesState.status === 'success' &&
              filteredCategories.map((category) => (
                <button
                  key={category.category_id}
                  type="button"
                  onClick={() => selectCategory(category.category_id)}
                  className={`w-full truncate rounded-xl px-6 py-3 text-left transition-colors outline-none ${
                    selectedCategoryId === category.category_id
                      ? 'bg-surface-container-high text-primary border-primary border-l-4 font-bold'
                      : 'text-on-surface-variant hover:bg-surface-container-high'
                  }`}
                  title={category.category_name}
                >
                  {category.category_name}
                </button>
              ))}
          </div>
        </div>

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
                <div className="flex justify-center pb-12">
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
                    className="bg-surface-container-high text-on-surface hover:bg-surface-bright rounded-xl px-6 py-3 transition-colors"
                  >
                    Load more ({filteredStreams.length - visibleStreams.length}{' '}
                    remaining)
                  </motion.button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </main>
  )
}
