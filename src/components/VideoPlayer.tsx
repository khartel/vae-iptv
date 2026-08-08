import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react'
import Hls from 'hls.js'

interface VideoPlayerProps {
  src: string
  className?: string
  controls?: boolean
  onPlayingChange?: (isPlaying: boolean) => void
}

type PlayerStatus = 'loading' | 'playing' | 'error'

/**
 * Plays an HLS (.m3u8) stream via hls.js, falling back to the browser's
 * native HLS support (Safari) when hls.js's MSE-based approach isn't usable.
 *
 * Forwards a ref to the underlying <video> element so callers can drive
 * playback imperatively (custom play/pause controls, full-screen layouts).
 */
export const VideoPlayer = forwardRef<HTMLVideoElement, VideoPlayerProps>(
  function VideoPlayer(
    { src, className, controls = true, onPlayingChange },
    forwardedRef,
  ) {
    const videoRef = useRef<HTMLVideoElement>(null)
    useImperativeHandle(
      forwardedRef,
      () => videoRef.current as HTMLVideoElement,
    )

    const [status, setStatus] = useState<PlayerStatus>('loading')
    const [errorMessage, setErrorMessage] = useState('')

    useEffect(() => {
      const video = videoRef.current
      if (!video) return

      setStatus('loading')
      setErrorMessage('')

      let hls: Hls | null = null

      if (Hls.isSupported()) {
        hls = new Hls()
        hls.loadSource(src)
        hls.attachMedia(video)
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          video.play().catch(() => {})
        })
        hls.on(Hls.Events.ERROR, (_event, data) => {
          if (data.fatal) {
            setStatus('error')
            setErrorMessage(`${data.type}: ${data.details}`)
          }
        })
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = src
        video.play().catch(() => {})
      } else {
        setStatus('error')
        setErrorMessage('HLS is not supported in this browser.')
      }

      return () => {
        hls?.destroy()
      }
    }, [src])

    return (
      <div
        className={
          className ??
          'relative aspect-video w-full max-w-3xl overflow-hidden rounded-lg bg-black'
        }
      >
        <video
          ref={videoRef}
          controls={controls}
          className="h-full w-full"
          onPlaying={() => {
            setStatus('playing')
            onPlayingChange?.(true)
          }}
          onPause={() => onPlayingChange?.(false)}
          onWaiting={() => setStatus('loading')}
          onError={() => {
            setStatus('error')
            setErrorMessage('The video failed to load or play.')
          }}
        />
        {status === 'loading' && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 text-neutral-200">
            Loading stream…
          </div>
        )}
        {status === 'error' && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80 p-4 text-center text-red-400">
            Playback failed: {errorMessage}
          </div>
        )}
      </div>
    )
  },
)
