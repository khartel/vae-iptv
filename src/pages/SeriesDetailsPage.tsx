import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import { ArrowLeft, Play, SkipBack, SkipForward } from 'lucide-react'
import { useAsyncResource } from '../hooks/useAsyncResource'
import { getSeriesInfo, buildEpisodeStreamUrl } from '../services/xtreamApi'
import { VideoPlayer } from '../components/VideoPlayer'

export function SeriesDetailsPage() {
  const { seriesId } = useParams<{ seriesId: string }>()
  const navigate = useNavigate()
  const id = Number(seriesId)
  const [selectedSeason, setSelectedSeason] = useState<number | null>(null)
  const [playingIndex, setPlayingIndex] = useState<number | null>(null)

  const state = useAsyncResource(
    () => getSeriesInfo(id),
    [id],
    'Failed to load series details.',
  )

  if (state.status === 'loading') {
    return (
      <main className="bg-background text-on-surface-variant flex min-h-screen items-center justify-center">
        Loading…
      </main>
    )
  }

  if (state.status === 'error') {
    return (
      <main className="bg-background flex min-h-screen flex-col items-center justify-center gap-4">
        <p className="text-error">{state.message}</p>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="bg-surface-container-high hover:bg-surface-bright rounded-xl px-4 py-2 outline-none transition-colors"
        >
          Go back
        </button>
      </main>
    )
  }

  const { info, episodes } = state.data
  const seasonNumbers = Object.keys(episodes)
    .map(Number)
    .sort((a, b) => a - b)
  const activeSeason = selectedSeason ?? seasonNumbers[0] ?? null
  const activeEpisodes =
    activeSeason !== null ? (episodes[String(activeSeason)] ?? []) : []

  const playingEpisode =
    playingIndex !== null ? (activeEpisodes[playingIndex] ?? null) : null
  const streamUrl = playingEpisode
    ? buildEpisodeStreamUrl(
        playingEpisode.id,
        playingEpisode.container_extension || 'mp4',
      )
    : ''

  return (
    <main className="bg-background relative min-h-screen">
      {info.cover && (
        <div className="absolute inset-0 h-[50vh] overflow-hidden">
          <img
            src={info.cover}
            alt=""
            className="h-full w-full object-cover opacity-25"
          />
          <div className="from-background via-background/70 absolute inset-0 bg-gradient-to-t to-transparent" />
        </div>
      )}

      <div className="pt-safe-margin-y px-safe-margin-x pb-safe-margin-y relative">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="text-on-surface-variant hover:text-on-surface mb-8 flex items-center gap-2 outline-none transition-colors"
        >
          <ArrowLeft size={20} />
          Back
        </button>

        <div className="flex flex-col gap-10 md:flex-row">
          {info.cover && (
            <img
              src={info.cover}
              alt=""
              className="aspect-[2/3] w-64 shrink-0 rounded-xl object-cover shadow-2xl"
            />
          )}

          <div className="max-w-2xl">
            <h1 className="text-headline-lg font-extrabold tracking-tight">
              {info.name}
            </h1>
            {info.genre && (
              <p className="text-on-surface-variant mt-2 text-sm">
                {info.genre}
              </p>
            )}
            {info.plot && (
              <p className="text-on-surface-variant mt-4 leading-relaxed">
                {info.plot}
              </p>
            )}
            {info.director && (
              <p className="mt-4 text-sm">
                <span className="text-on-surface-variant">Director: </span>
                {info.director}
              </p>
            )}
            {info.cast && (
              <p className="mt-1 text-sm">
                <span className="text-on-surface-variant">Cast: </span>
                {info.cast}
              </p>
            )}
          </div>
        </div>

        <div className="mt-section-gap">
          <div className="mb-4 flex gap-2">
            {seasonNumbers.map((season) => (
              <button
                key={season}
                type="button"
                onClick={() => setSelectedSeason(season)}
                className={`rounded-xl px-5 py-2.5 text-sm font-semibold outline-none transition-colors ${
                  season === activeSeason
                    ? 'bg-primary text-on-primary'
                    : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-bright'
                }`}
              >
                Season {season}
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-3">
            {activeEpisodes.map((episode, i) => (
              <motion.button
                key={episode.id}
                type="button"
                whileHover={{ scale: 1.01 }}
                onClick={() => setPlayingIndex(i)}
                className="bg-surface-container hover:bg-surface-container-high flex items-center gap-4 rounded-xl p-3 text-left outline-none transition-colors"
              >
                {episode.info.movie_image ? (
                  <img
                    src={episode.info.movie_image}
                    alt=""
                    className="h-20 w-32 shrink-0 rounded-lg object-cover"
                  />
                ) : (
                  <div className="bg-surface-container-high flex h-20 w-32 shrink-0 items-center justify-center rounded-lg">
                    <Play size={20} className="text-on-surface-variant" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">
                    {episode.episode_num}. {episode.title}
                  </p>
                  {episode.info.duration &&
                    episode.info.duration !== '00:00:00' && (
                      <p className="text-on-surface-variant text-sm">
                        {episode.info.duration}
                      </p>
                    )}
                  {episode.info.plot && (
                    <p className="text-on-surface-variant mt-1 line-clamp-2 text-sm">
                      {episode.info.plot}
                    </p>
                  )}
                </div>
                <Play size={22} className="text-on-surface-variant shrink-0" />
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {playingEpisode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black"
          >
            <VideoPlayer
              src={streamUrl}
              className="relative h-full w-full bg-black"
            />
            <div className="pointer-events-none absolute inset-0 flex flex-col justify-between">
              <div className="from-background pointer-events-auto flex items-center gap-4 bg-gradient-to-b to-transparent p-6">
                <button
                  type="button"
                  onClick={() => setPlayingIndex(null)}
                  aria-label="Close player"
                  className="text-on-background rounded-full p-2 outline-none"
                >
                  <ArrowLeft size={24} />
                </button>
                <span className="font-semibold">
                  {playingEpisode.episode_num}. {playingEpisode.title}
                </span>
              </div>
              <div className="pointer-events-auto flex justify-center gap-4 p-6">
                <button
                  type="button"
                  onClick={() =>
                    setPlayingIndex((idx) => (idx !== null ? idx - 1 : null))
                  }
                  disabled={playingIndex === null || playingIndex <= 0}
                  aria-label="Previous episode"
                  className="text-on-surface-variant hover:text-on-surface rounded-full bg-black/50 p-3 outline-none backdrop-blur-md disabled:opacity-30"
                >
                  <SkipBack size={22} fill="currentColor" />
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setPlayingIndex((idx) =>
                      idx !== null && idx < activeEpisodes.length - 1
                        ? idx + 1
                        : idx,
                    )
                  }
                  disabled={
                    playingIndex === null ||
                    playingIndex >= activeEpisodes.length - 1
                  }
                  aria-label="Next episode"
                  className="text-on-surface-variant hover:text-on-surface rounded-full bg-black/50 p-3 outline-none backdrop-blur-md disabled:opacity-30"
                >
                  <SkipForward size={22} fill="currentColor" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  )
}
