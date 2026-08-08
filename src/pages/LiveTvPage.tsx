import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLiveCategories } from '../hooks/useLiveCategories'
import { useLiveStreams } from '../hooks/useLiveStreams'
import { useFavorites } from '../hooks/useFavorites'
import { ChannelCard } from '../components/ChannelCard'

const PAGE_SIZE = 60

export function LiveTvPage() {
  const navigate = useNavigate()
  const categoriesState = useLiveCategories()
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null,
  )
  const streamsState = useLiveStreams(selectedCategoryId)
  const { isFavorite, toggleFavorite } = useFavorites()
  const [query, setQuery] = useState('')
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)

  const streams = streamsState.status === 'success' ? streamsState.streams : []

  const filteredStreams = useMemo(() => {
    if (!query.trim()) return streams
    const q = query.trim().toLowerCase()
    return streams.filter((s) => s.name.toLowerCase().includes(q))
  }, [streams, query])

  const visibleStreams = filteredStreams.slice(0, visibleCount)
  const hasMore = filteredStreams.length > visibleStreams.length

  function selectCategory(categoryId: string | null) {
    setSelectedCategoryId(categoryId)
    setQuery('')
    setVisibleCount(PAGE_SIZE)
  }

  return (
    <main className="pt-safe-margin-y pr-safe-margin-x pb-safe-margin-y pl-safe-margin-x h-screen overflow-y-auto no-scrollbar">
      <div className="mb-8 flex items-center justify-between gap-6">
        <h1 className="text-headline-md font-extrabold tracking-tighter">
          Live TV
        </h1>
        <div className="relative w-full max-w-xs">
          <span className="material-symbols-outlined text-outline pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-[20px]">
            search
          </span>
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setVisibleCount(PAGE_SIZE)
            }}
            placeholder="Search channels…"
            className="bg-surface-container-high text-on-surface border-outline-variant/30 focus:border-primary w-full rounded-xl border py-2.5 pr-4 pl-10 outline-none"
          />
        </div>
      </div>

      <div className="flex gap-gutter-x">
        <div className="flex w-[240px] shrink-0 flex-col gap-2">
          <button
            type="button"
            onClick={() => selectCategory(null)}
            className={`rounded-xl px-6 py-3 text-left transition-colors outline-none ${
              selectedCategoryId === null
                ? 'bg-surface-container-high text-primary border-primary border-l-4 font-bold'
                : 'text-on-surface-variant hover:bg-surface-container-high'
            }`}
          >
            All
          </button>

          {categoriesState.status === 'loading' && (
            <p className="text-on-surface-variant px-6 py-3 text-sm">
              Loading categories…
            </p>
          )}
          {categoriesState.status === 'error' && (
            <p className="text-error px-6 py-3 text-sm">
              {categoriesState.message}
            </p>
          )}
          {categoriesState.status === 'success' &&
            categoriesState.categories.map((category) => (
              <button
                key={category.category_id}
                type="button"
                onClick={() => selectCategory(category.category_id)}
                className={`truncate rounded-xl px-6 py-3 text-left transition-colors outline-none ${
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

        <div className="flex-1">
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
              <div className="grid grid-cols-2 gap-rail-item-spacing pb-20 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
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
                    onToggleFavorite={() => toggleFavorite(channel.stream_id)}
                  />
                ))}
              </div>
              {hasMore && (
                <div className="flex justify-center pb-12">
                  <button
                    type="button"
                    onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
                    className="bg-surface-container-high text-on-surface hover:bg-surface-bright rounded-xl px-6 py-3 transition-colors"
                  >
                    Load more ({filteredStreams.length - visibleStreams.length}{' '}
                    remaining)
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </main>
  )
}
