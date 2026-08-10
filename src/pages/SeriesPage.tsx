import { useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'motion/react'
import { Search } from 'lucide-react'
import { useSeriesCategories } from '../hooks/useSeriesCategories'
import { useSeriesList } from '../hooks/useSeriesList'
import { useSpatialInput } from '../hooks/useSpatialInput'
import { useBackNavigation } from '../hooks/useBackNavigation'
import { PosterCard } from '../components/PosterCard'
import { CategorySidebar } from '../components/CategorySidebar'
import { LoadMoreButton } from '../components/LoadMoreButton'

const PAGE_SIZE = 60

export function SeriesPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const selectedCategoryId = searchParams.get('category')
  const query = searchParams.get('q') ?? ''

  const categoriesState = useSeriesCategories()
  const seriesState = useSeriesList(selectedCategoryId)
  const seriesSearch = useSpatialInput<HTMLInputElement>()

  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)

  useBackNavigation()

  const seriesList = seriesState.status === 'success' ? seriesState.data : []

  const filteredSeries = useMemo(() => {
    if (!query.trim()) return seriesList
    const q = query.trim().toLowerCase()
    return seriesList.filter((s) => s.name.toLowerCase().includes(q))
  }, [seriesList, query])

  const visibleSeries = filteredSeries.slice(0, visibleCount)
  const hasMore = filteredSeries.length > visibleSeries.length

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

  function setSeriesQuery(value: string) {
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
          Series
        </h1>
        <div className="relative w-full max-w-xs">
          <Search
            size={18}
            className="text-outline pointer-events-none absolute top-1/2 left-3 -translate-y-1/2"
          />
          <input
            ref={seriesSearch.ref}
            type="text"
            value={query}
            onChange={(e) => setSeriesQuery(e.target.value)}
            onBlur={seriesSearch.onBlur}
            placeholder="Search series…"
            className="bg-surface-container-high text-on-surface border-outline-variant/30 focus:border-primary w-full rounded-xl border py-2.5 pr-4 pl-10 outline-none"
          />
        </div>
      </div>

      <div className="gap-gutter-x flex min-h-0 flex-1">
        <CategorySidebar
          status={categoriesState.status}
          categories={
            categoriesState.status === 'success' ? categoriesState.data : []
          }
          errorMessage={
            categoriesState.status === 'error'
              ? categoriesState.message
              : undefined
          }
          selectedCategoryId={selectedCategoryId}
          onSelectCategory={selectCategory}
          searchPlaceholder="Search categories…"
          loadingLabel="Loading categories…"
          emptyLabel="No categories match."
        />

        <div className="no-scrollbar h-full flex-1 overflow-y-auto pb-8">
          {seriesState.status === 'loading' && (
            <p className="text-on-surface-variant">Loading series…</p>
          )}
          {seriesState.status === 'error' && (
            <p className="text-error">{seriesState.message}</p>
          )}
          {seriesState.status === 'success' && filteredSeries.length === 0 && (
            <p className="text-on-surface-variant">No series found.</p>
          )}

          {seriesState.status === 'success' && filteredSeries.length > 0 && (
            <>
              <motion.div
                key={selectedCategoryId ?? 'all'}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className="gap-rail-item-spacing grid grid-cols-3 pb-6 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
              >
                {visibleSeries.map((series) => (
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
              </motion.div>
              {hasMore && (
                <LoadMoreButton
                  remaining={filteredSeries.length - visibleSeries.length}
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
