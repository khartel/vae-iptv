import {
  useEffect,
  useRef,
  useState,
  type RefObject,
  type ReactNode,
} from 'react'
import { motion } from 'motion/react'
import {
  useFocusable,
  pause,
  resume,
} from '@noriginmedia/norigin-spatial-navigation'
import {
  ArrowLeft,
  RotateCcw,
  RotateCw,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  SkipBack,
  SkipForward,
  type LucideIcon,
} from 'lucide-react'
import { PlayPauseButton } from './PlayPauseButton'

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00'
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)
  const mm = h > 0 ? String(m).padStart(2, '0') : String(m)
  const ss = String(s).padStart(2, '0')
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`
}

function ChromeButton({
  icon: Icon,
  label,
  onPress,
  size = 22,
  disabled,
}: {
  icon: LucideIcon
  label: string
  onPress: () => void
  size?: number
  disabled?: boolean
}) {
  const { ref } = useFocusable<HTMLButtonElement>({
    focusable: !disabled,
    onEnterPress: onPress,
  })
  return (
    <motion.button
      ref={ref}
      type="button"
      onClick={onPress}
      disabled={disabled}
      whileHover={disabled ? undefined : { scale: 1.1 }}
      whileTap={disabled ? undefined : { scale: 0.9 }}
      aria-label={label}
      className="text-on-surface-variant hover:text-on-surface rounded-full p-2 outline-none transition-colors disabled:opacity-30"
    >
      <Icon size={size} />
    </motion.button>
  )
}

/**
 * Arrow-key nav can land on the slider and pass over it freely; only once
 * Enter is pressed does it pause spatial nav and hand arrow keys to the
 * native range input (matching "arrow to it, press OK to adjust" remote
 * conventions, same pattern as useSpatialInput). Escape/blur resumes nav.
 */
function VolumeSlider({
  volume,
  muted,
  onChange,
}: {
  volume: number
  muted: boolean
  onChange: (value: number) => void
}) {
  const { ref } = useFocusable<HTMLInputElement>({
    onEnterPress: () => pause(),
  })
  return (
    <input
      ref={ref}
      type="range"
      min={0}
      max={1}
      step={0.05}
      value={muted ? 0 : volume}
      onChange={(e) => onChange(Number(e.target.value))}
      onBlur={() => resume()}
      aria-label="Volume"
      className="accent-primary h-1.5 w-24 cursor-pointer outline-none"
    />
  )
}

interface EpisodeNavConfig {
  onPrev: () => void
  prevDisabled: boolean
  onNext: () => void
  nextDisabled: boolean
}

interface VodPlayerChromeProps {
  videoRef: RefObject<HTMLVideoElement | null>
  containerRef: RefObject<HTMLElement | null>
  title: string
  subtitle?: string
  onClose: () => void
  episodeNav?: EpisodeNavConfig
  extraHeaderContent?: ReactNode
}

/**
 * Full custom playback chrome for VOD (movies/episodes), replacing the
 * browser's native <video controls>. The native bar and this overlay used
 * to coexist, and since both anchor to the bottom edge, the overlay's
 * pointer-events-auto region silently ate clicks meant for the native
 * volume/seek/fullscreen controls underneath it — this replaces it
 * entirely with one control surface so nothing overlaps or fights for
 * clicks, and everything shows/hides together on the same timer.
 */
export function VodPlayerChrome({
  videoRef,
  containerRef,
  title,
  subtitle,
  onClose,
  episodeNav,
  extraHeaderContent,
}: VodPlayerChromeProps) {
  const [isPlaying, setIsPlaying] = useState(true)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [muted, setMuted] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [uiVisible, setUiVisible] = useState(true)
  const hideTimeout = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  )

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const onPlay = () => setIsPlaying(true)
    const onPause = () => setIsPlaying(false)
    const onTimeUpdate = () => setCurrentTime(video.currentTime)
    const onLoadedMetadata = () => setDuration(video.duration)
    const onVolumeChange = () => {
      setMuted(video.muted)
      setVolume(video.volume)
    }

    video.addEventListener('play', onPlay)
    video.addEventListener('pause', onPause)
    video.addEventListener('timeupdate', onTimeUpdate)
    video.addEventListener('loadedmetadata', onLoadedMetadata)
    video.addEventListener('volumechange', onVolumeChange)
    if (Number.isFinite(video.duration)) setDuration(video.duration)

    return () => {
      video.removeEventListener('play', onPlay)
      video.removeEventListener('pause', onPause)
      video.removeEventListener('timeupdate', onTimeUpdate)
      video.removeEventListener('loadedmetadata', onLoadedMetadata)
      video.removeEventListener('volumechange', onVolumeChange)
    }
  }, [videoRef])

  useEffect(() => {
    function onFullscreenChange() {
      setIsFullscreen(document.fullscreenElement != null)
    }
    document.addEventListener('fullscreenchange', onFullscreenChange)
    return () =>
      document.removeEventListener('fullscreenchange', onFullscreenChange)
  }, [])

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
  }, [])

  function togglePlayPause() {
    const video = videoRef.current
    if (!video) return
    if (video.paused) void video.play().catch(() => {})
    else video.pause()
  }

  function seekBy(delta: number) {
    const video = videoRef.current
    if (!video) return
    const max = Number.isFinite(video.duration) ? video.duration : Infinity
    video.currentTime = Math.min(Math.max(video.currentTime + delta, 0), max)
  }

  function seekToFraction(fraction: number) {
    const video = videoRef.current
    if (!video || !Number.isFinite(video.duration)) return
    video.currentTime = fraction * video.duration
  }

  function toggleMute() {
    const video = videoRef.current
    if (!video) return
    video.muted = !video.muted
  }

  function setVolumeLevel(value: number) {
    const video = videoRef.current
    if (!video) return
    video.volume = value
    video.muted = value === 0
  }

  function toggleFullscreen() {
    if (document.fullscreenElement) {
      void document.exitFullscreen()
    } else {
      void containerRef.current?.requestFullscreen()
    }
  }

  const progressRatio = duration > 0 ? currentTime / duration : 0

  return (
    <div
      className={`pointer-events-none absolute inset-0 z-20 flex flex-col justify-between transition-opacity duration-300 ${
        uiVisible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div className="from-background pointer-events-auto flex items-center gap-4 bg-gradient-to-b to-transparent p-6">
        <ChromeButton
          icon={ArrowLeft}
          label="Close player"
          onPress={onClose}
          size={24}
        />
        <div className="min-w-0">
          <p className="truncate font-semibold">{title}</p>
          {subtitle && (
            <p className="text-on-surface-variant truncate text-sm">
              {subtitle}
            </p>
          )}
        </div>
        {extraHeaderContent}
      </div>

      <div className="from-background via-background/80 pointer-events-auto bg-gradient-to-t to-transparent px-6 pb-6">
        <div
          className="group relative mb-3 flex h-4 w-full cursor-pointer items-center"
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect()
            seekToFraction((e.clientX - rect.left) / rect.width)
          }}
        >
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/20">
            <div
              className="bg-primary h-full rounded-full"
              style={{ width: `${Math.min(100, progressRatio * 100)}%` }}
            />
          </div>
        </div>
        <div className="text-on-surface-variant mb-2 flex justify-between text-xs">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>

        <div className="flex items-center justify-between gap-4">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <ChromeButton
              icon={muted || volume === 0 ? VolumeX : Volume2}
              label={muted ? 'Unmute' : 'Mute'}
              onPress={toggleMute}
            />
            <VolumeSlider
              volume={volume}
              muted={muted}
              onChange={setVolumeLevel}
            />
          </div>

          <div className="flex shrink-0 items-center gap-4">
            {episodeNav && (
              <ChromeButton
                icon={SkipBack}
                label="Previous episode"
                onPress={episodeNav.onPrev}
                disabled={episodeNav.prevDisabled}
              />
            )}
            <ChromeButton
              icon={RotateCcw}
              label="Back 10 seconds"
              onPress={() => seekBy(-10)}
            />
            <PlayPauseButton isPlaying={isPlaying} onToggle={togglePlayPause} />
            <ChromeButton
              icon={RotateCw}
              label="Forward 10 seconds"
              onPress={() => seekBy(10)}
            />
            {episodeNav && (
              <ChromeButton
                icon={SkipForward}
                label="Next episode"
                onPress={episodeNav.onNext}
                disabled={episodeNav.nextDisabled}
              />
            )}
          </div>

          <div className="flex flex-1 items-center justify-end gap-3">
            <ChromeButton
              icon={isFullscreen ? Minimize : Maximize}
              label={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
              onPress={toggleFullscreen}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
