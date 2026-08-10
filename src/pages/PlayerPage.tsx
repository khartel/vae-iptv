import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import { useFocusable } from '@noriginmedia/norigin-spatial-navigation'
import {
  ArrowLeft,
  Clock,
  SkipBack,
  Play,
  Pause,
  SkipForward,
  Heart,
  X,
} from 'lucide-react'
import { VideoPlayer } from '../components/VideoPlayer'
import { buildLiveStreamUrl } from '../services/xtreamApi'
import { useFavorites } from '../hooks/useFavorites'
import { useShortEpg } from '../hooks/useShortEpg'
import { useBackNavigation } from '../hooks/useBackNavigation'
import type { XtreamLiveStream } from '../types/xtream'

interface PlayerLocationState {
  channels?: XtreamLiveStream[]
  index?: number
}

function formatTime(date: Date): string {
  return new Intl.DateTimeFormat(undefined, {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

function EpgCurrentButton({
  title,
  onPress,
}: {
  title: string
  onPress: () => void
}) {
  const { ref } = useFocusable<HTMLButtonElement>({ onEnterPress: onPress })
  return (
    <button
      ref={ref}
      type="button"
      onClick={onPress}
      className="hover:text-on-surface text-on-surface-variant block max-w-full truncate text-left text-sm underline decoration-dotted outline-none"
    >
      {title}
    </button>
  )
}

function EpgModalCloseButton({ onClose }: { onClose: () => void }) {
  const { ref } = useFocusable<HTMLButtonElement>({ onEnterPress: onClose })
  return (
    <button
      ref={ref}
      type="button"
      onClick={onClose}
      aria-label="Close"
      className="text-on-surface-variant hover:text-on-surface absolute top-4 right-4 outline-none"
    >
      <X size={20} />
    </button>
  )
}

function ChannelSkipButton({
  direction,
  disabled,
  onClick,
}: {
  direction: 'prev' | 'next'
  disabled: boolean
  onClick: () => void
}) {
  const { ref } = useFocusable<HTMLButtonElement>({
    focusable: !disabled,
    onEnterPress: onClick,
  })
  const Icon = direction === 'prev' ? SkipBack : SkipForward
  return (
    <motion.button
      ref={ref}
      type="button"
      onClick={onClick}
      disabled={disabled}
      whileHover={disabled ? undefined : { scale: 1.1 }}
      whileTap={disabled ? undefined : { scale: 0.9 }}
      aria-label={direction === 'prev' ? 'Previous channel' : 'Next channel'}
      className="text-on-surface-variant hover:text-on-surface rounded-full p-3 outline-none transition-colors disabled:opacity-30"
    >
      <Icon size={24} fill="currentColor" />
    </motion.button>
  )
}

export function PlayerPage() {
  const { streamId } = useParams<{ streamId: string }>()
  const location = useLocation()
  const navigate = useNavigate()
  const { isFavorite, toggleFavorite } = useFavorites()

  const state = (location.state as PlayerLocationState | null) ?? {}
  const channels = state.channels ?? []
  const [index, setIndex] = useState(state.index ?? 0)

  // Keep index in sync if we arrived fresh (e.g. direct URL) without a channel list.
  const currentChannel: XtreamLiveStream | undefined =
    channels[index] ??
    (streamId
      ? {
          stream_id: Number(streamId),
          name: `Channel ${streamId}`,
          num: 0,
          stream_type: 'live',
          stream_icon: '',
          epg_channel_id: null,
          category_id: '',
          custom_sid: null,
          tv_archive: 0,
          direct_source: '',
          tv_archive_duration: 0,
        }
      : undefined)

  const streamUrl = currentChannel
    ? buildLiveStreamUrl(currentChannel.stream_id, 'm3u8')
    : ''

  const epg = useShortEpg(
    currentChannel?.stream_id ?? 0,
    currentChannel !== undefined,
  )
  const [showDetail, setShowDetail] = useState(false)

  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(true)

  function togglePlayPause() {
    const video = videoRef.current
    if (!video) return
    if (video.paused) video.play().catch(() => {})
    else video.pause()
  }

  const [uiVisible, setUiVisible] = useState(true)
  const hideTimeout = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  )

  useEffect(() => {
    function showUi() {
      setUiVisible(true)
      clearTimeout(hideTimeout.current)
      hideTimeout.current = setTimeout(() => setUiVisible(false), 4000)
    }
    showUi()
    window.addEventListener('mousemove', showUi)
    window.addEventListener('keydown', showUi)
    return () => {
      clearTimeout(hideTimeout.current)
      window.removeEventListener('mousemove', showUi)
      window.removeEventListener('keydown', showUi)
    }
  }, [currentChannel])

  function goToIndex(next: number) {
    if (next < 0 || next >= channels.length) return
    setIndex(next)
    navigate(`/watch/${channels[next]?.stream_id}`, {
      replace: true,
      state: { channels, index: next },
    })
  }

  const { ref: backRef } = useFocusable<HTMLButtonElement>({
    onEnterPress: () => navigate(-1),
  })
  const { ref: playPauseRef, focusSelf: focusPlayPause } =
    useFocusable<HTMLButtonElement>({
      onEnterPress: togglePlayPause,
    })

  // Player is a standalone route (no shared layout to do this for it) —
  // give arrow-key nav a starting point the moment controls exist.
  useEffect(() => {
    focusPlayPause()
  }, [focusPlayPause])
  const { ref: favoriteRef } = useFocusable<HTMLButtonElement>({
    onEnterPress: () => currentChannel && toggleFavorite(currentChannel),
  })

  useBackNavigation(() => {
    if (showDetail) {
      setShowDetail(false)
      return true
    }
    return false
  })

  if (!currentChannel) {
    return (
      <main className="text-on-surface-variant flex min-h-screen items-center justify-center">
        No channel selected.
      </main>
    )
  }

  const favorited = isFavorite(currentChannel.stream_id)

  return (
    <main className="relative h-screen w-screen overflow-hidden bg-black">
      <div className="absolute inset-0">
        <VideoPlayer
          ref={videoRef}
          src={streamUrl}
          controls={false}
          className="relative h-full w-full bg-black"
          onPlayingChange={setIsPlaying}
        />
      </div>

      <div
        className={`pointer-events-none absolute inset-0 z-20 flex flex-col justify-between transition-opacity duration-300 ${
          uiVisible ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <header className="from-background pointer-events-auto flex items-center gap-4 bg-gradient-to-b to-transparent p-6">
          <motion.button
            ref={backRef}
            type="button"
            onClick={() => navigate(-1)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="hover:text-primary text-on-surface-variant rounded-full p-2 outline-none transition-colors"
            aria-label="Back"
          >
            <ArrowLeft size={26} />
          </motion.button>
          <span className="text-body-md font-semibold">
            {currentChannel.name}
          </span>

          {epg.status === 'success' && epg.next && (
            <div className="border-outline-variant/30 bg-surface-container/60 ml-auto flex items-center gap-4 rounded-xl border p-4 backdrop-blur-xl">
              <Clock size={20} className="text-outline" />
              <div>
                <p className="text-label-caps text-outline">
                  UP NEXT • {formatTime(epg.next.start)}
                </p>
                <p className="text-body-md text-on-surface font-semibold">
                  {epg.next.title}
                </p>
              </div>
            </div>
          )}
        </header>

        <div className="from-background via-background/80 pointer-events-auto bg-gradient-to-t to-transparent px-6 pb-8">
          <div className="border-outline-variant/30 bg-surface-container/70 flex items-center justify-between rounded-2xl border p-4 backdrop-blur-xl">
            <div className="flex min-w-0 items-center gap-4">
              <div className="border-outline-variant/30 bg-surface-container flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border">
                {currentChannel.stream_icon ? (
                  <img
                    src={currentChannel.stream_icon}
                    alt=""
                    className="h-full w-full object-contain p-1"
                  />
                ) : (
                  <span className="text-on-surface font-bold">
                    {currentChannel.name.charAt(0)}
                  </span>
                )}
              </div>
              <div className="min-w-0">
                <span className="text-body-md block truncate font-semibold">
                  {currentChannel.name}
                </span>
                {epg.status === 'success' && epg.current && (
                  <EpgCurrentButton
                    title={epg.current.title}
                    onPress={() => setShowDetail(true)}
                  />
                )}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <ChannelSkipButton
                direction="prev"
                disabled={index <= 0}
                onClick={() => goToIndex(index - 1)}
              />
              <motion.button
                ref={playPauseRef}
                type="button"
                onClick={togglePlayPause}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
                aria-label={isPlaying ? 'Pause' : 'Play'}
                className="bg-primary text-on-primary rounded-full p-4 shadow-[0_0_20px_rgba(192,193,255,0.3)] outline-none"
              >
                {isPlaying ? (
                  <Pause size={30} fill="currentColor" />
                ) : (
                  <Play size={30} fill="currentColor" />
                )}
              </motion.button>
              <ChannelSkipButton
                direction="next"
                disabled={index >= channels.length - 1}
                onClick={() => goToIndex(index + 1)}
              />
              <motion.button
                ref={favoriteRef}
                type="button"
                onClick={() => toggleFavorite(currentChannel)}
                whileTap={{ scale: 0.85 }}
                aria-label="Toggle favorite"
                className={`rounded-xl p-3 outline-none transition-colors ${
                  favorited
                    ? 'text-primary'
                    : 'text-on-surface-variant hover:bg-surface-container'
                }`}
              >
                <Heart size={22} fill={favorited ? 'currentColor' : 'none'} />
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showDetail && epg.status === 'success' && epg.current && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-30 flex items-center justify-center bg-black/70 p-6"
            onClick={() => setShowDetail(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: 'spring', stiffness: 350, damping: 30 }}
              className="border-outline-variant/30 bg-surface-container relative max-w-lg rounded-2xl border p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <EpgModalCloseButton onClose={() => setShowDetail(false)} />
              <p className="text-label-caps text-primary mb-1">
                {formatTime(epg.current.start)} – {formatTime(epg.current.end)}
              </p>
              <h2 className="text-headline-md mb-3 pr-6 font-bold">
                {epg.current.title}
              </h2>
              <p className="text-on-surface-variant">
                {epg.current.description || 'No description available.'}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  )
}
