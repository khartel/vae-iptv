import { useState } from 'react'
import { useAsyncResource } from './useAsyncResource'
import { listContinueWatching } from '../lib/watchProgress'
import { getVodStreams, getSeriesList } from '../services/xtreamApi'

export interface RecommendationItem {
  key: string
  title: string
  posterUrl: string
  subtitle?: string
  rating?: number
  route: string
}

interface RecommendationSignal {
  movieCategoryId?: string
  excludeMovieId?: number
  seriesCategoryId?: string
  excludeSeriesId?: number
  genreLabel?: string
}

function computeSignal(): RecommendationSignal {
  const entries = listContinueWatching()
  const movieEntry = entries.find((e) => e.kind === 'movie' && e.categoryId)
  const episodeEntry = entries.find((e) => e.kind === 'episode' && e.categoryId)
  return {
    movieCategoryId: movieEntry?.categoryId,
    excludeMovieId: movieEntry?.movieId,
    seriesCategoryId: episodeEntry?.categoryId,
    excludeSeriesId: episodeEntry?.seriesId,
    genreLabel: movieEntry?.genre || episodeEntry?.genre,
  }
}

const MAX_ITEMS = 12

/**
 * "More like what you're watching" — real category-matched picks, not a
 * fabricated/random list. Signal comes from Continue Watching: the category
 * of the most recently watched movie, and separately of the series behind
 * the most recently watched episode (get_series_info doesn't return a
 * series' category_id, so SeriesPage/SeriesDetailsPage thread it through
 * navigation state and it's stored alongside watch progress).
 *
 * When there's no watch history yet, `hasSignal` is false — the caller
 * should hide the rail rather than show a fake "recommended" list.
 */
export function useRecommendations() {
  const [signal] = useState(computeSignal)

  const state = useAsyncResource(
    async () => {
      const [movies, series] = await Promise.all([
        signal.movieCategoryId
          ? getVodStreams(signal.movieCategoryId)
          : Promise.resolve([]),
        signal.seriesCategoryId
          ? getSeriesList(signal.seriesCategoryId)
          : Promise.resolve([]),
      ])

      const movieItems: RecommendationItem[] = movies
        .filter((m) => m.stream_id !== signal.excludeMovieId)
        .slice(0, MAX_ITEMS)
        .map((m) => ({
          key: `movie:${m.stream_id}`,
          title: m.name,
          posterUrl: m.stream_icon,
          rating: m.rating_5based,
          route: `/movies/${m.stream_id}`,
        }))

      const seriesItems: RecommendationItem[] = series
        .filter((s) => s.series_id !== signal.excludeSeriesId)
        .slice(0, MAX_ITEMS)
        .map((s) => ({
          key: `series:${s.series_id}`,
          title: s.name,
          posterUrl: s.cover,
          subtitle: s.genre,
          rating: s.rating_5based,
          route: `/series/${s.series_id}`,
        }))

      // Interleave rather than "all movies then all series".
      const combined: RecommendationItem[] = []
      const max = Math.max(movieItems.length, seriesItems.length)
      for (let i = 0; i < max; i++) {
        const movieItem = movieItems[i]
        const seriesItem = seriesItems[i]
        if (movieItem) combined.push(movieItem)
        if (seriesItem) combined.push(seriesItem)
      }
      return combined.slice(0, MAX_ITEMS)
    },
    [signal.movieCategoryId, signal.seriesCategoryId],
    'Failed to load recommendations.',
  )

  const hasSignal = !!(signal.movieCategoryId || signal.seriesCategoryId)

  return { state, genreLabel: signal.genreLabel, hasSignal }
}
