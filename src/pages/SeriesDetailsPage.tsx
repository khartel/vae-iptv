import { useRef, useState } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import { useFocusable } from '@noriginmedia/norigin-spatial-navigation'
import { ArrowLeft, Play } from 'lucide-react'
import { useAsyncResource } from '../hooks/useAsyncResource'
import { useBackNavigation } from '../hooks/useBackNavigation'
import { getSeriesInfo, buildEpisodeStreamUrl } from '../services/xtreamApi'
import { VideoPlayer } from '../components/VideoPlayer'
import { VodPlayerChrome } from '../components/VodPlayerChrome'
import {
  getWatchProgress,
  saveWatchProgress,
  episodeProgressKey,
} from '../lib/watchProgress'
import type { XtreamEpisode } from '../types/xtream'

interface SeriesDetailsLocationState {
  resumeSeason?: number
  resumeEpisodeIndex?: number
  categoryId?: string
}

function SeasonTabButton({
  season,
  active,
  onSelect,
}: {
  season: number
  active: boolean
  onSelect: () => void
}) {
  const { ref } = useFocusable<HTMLButtonElement>({ onEnterPress: onSelect })
  return (
    <button
      ref={ref}
      type="button"
      onClick={onSelect}
      className={`rounded-xl px-5 py-2.5 text-sm font-semibold outline-none transition-colors ${
        active
          ? 'bg-primary text-on-primary'
          : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-bright'
      }`}
    >
      Season {season}
    </button>
  )
}

function EpisodeRow({
  episode,
  onPlay,
}: {
  episode: XtreamEpisode
  onPlay: () => void
}) {
  const { ref } = useFocusable<HTMLButtonElement>({ onEnterPress: onPlay })
  return (
    <motion.button
      ref={ref}
      type="button"
      whileHover={{ scale: 1.01 }}
      onClick={onPlay}
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
        {episode.info.duration && episode.info.duration !== '00:00:00' && (
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
  )
}

export function SeriesDetailsPage() {
  const { seriesId } = useParams<{ seriesId: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const id = Number(seriesId)
  const resumeState = location.state as SeriesDetailsLocationState | null
  const [selectedSeason, setSelectedSeason] = useState<number | null>(
    resumeState?.resumeSeason ?? null,
  )
  const [playingIndex, setPlayingIndex] = useState<number | null>(
    resumeState?.resumeEpisodeIndex ?? null,
  )
  const [categoryId] = useState(() => resumeState?.categoryId)
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const { ref: backRef } = useFocusable<HTMLButtonElement>({
    onEnterPress: () => navigate(-1),
  })

  useBackNavigation(() => {
    if (playingIndex !== null) {
      setPlayingIndex(null)
      return true
    }
    return false
  })

  const state = useAsyncResource(
    () => getSeriesInfo(id),
    [id],
    'Failed to load series details.',
  )

  if (state.status === 'loading') {
    return (
      <main className="text-on-surface-variant flex min-h-screen items-center justify-center">
        Loading…
      </main>
    )
  }

  if (state.status === 'error') {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4">
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
    <main className="relative min-h-screen">
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
          ref={backRef}
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
              <SeasonTabButton
                key={season}
                season={season}
                active={season === activeSeason}
                onSelect={() => setSelectedSeason(season)}
              />
            ))}
          </div>

          <div className="flex flex-col gap-3">
            {activeEpisodes.map((episode, i) => (
              <EpisodeRow
                key={episode.id}
                episode={episode}
                onPlay={() => setPlayingIndex(i)}
              />
            ))}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {playingEpisode && (
          <motion.div
            ref={containerRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black"
          >
            <VideoPlayer
              ref={videoRef}
              src={streamUrl}
              controls={false}
              className="relative h-full w-full bg-black"
              initialTime={
                getWatchProgress(episodeProgressKey(playingEpisode.id))
                  ?.positionSeconds
              }
              onProgress={(positionSeconds, durationSeconds) =>
                saveWatchProgress({
                  key: episodeProgressKey(playingEpisode.id),
                  kind: 'episode',
                  title: info.name,
                  subtitle: `S${activeSeason} · E${playingEpisode.episode_num}`,
                  posterUrl: playingEpisode.info.movie_image || info.cover,
                  positionSeconds,
                  durationSeconds,
                  genre: info.genre,
                  categoryId,
                  seriesId: id,
                  seasonNumber: activeSeason ?? undefined,
                  episodeIndex: playingIndex ?? undefined,
                })
              }
            />
            <VodPlayerChrome
              videoRef={videoRef}
              containerRef={containerRef}
              title={`${playingEpisode.episode_num}. ${playingEpisode.title}`}
              subtitle={`${info.name} · S${activeSeason}`}
              onClose={() => setPlayingIndex(null)}
              episodeNav={{
                prevDisabled: playingIndex === null || playingIndex <= 0,
                onPrev: () =>
                  setPlayingIndex((idx) => (idx !== null ? idx - 1 : null)),
                nextDisabled:
                  playingIndex === null ||
                  playingIndex >= activeEpisodes.length - 1,
                onNext: () =>
                  setPlayingIndex((idx) =>
                    idx !== null && idx < activeEpisodes.length - 1
                      ? idx + 1
                      : idx,
                  ),
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  )
}
