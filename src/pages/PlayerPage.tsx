import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { VideoPlayer } from '../components/VideoPlayer'
import { buildLiveStreamUrl } from '../services/xtreamApi'
import { useFavorites } from '../hooks/useFavorites'
import type { XtreamLiveStream } from '../types/xtream'

interface PlayerLocationState {
  channels?: XtreamLiveStream[]
  index?: number
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

  if (!currentChannel) {
    return (
      <main className="bg-background flex min-h-screen items-center justify-center text-on-surface-variant">
        No channel selected.
      </main>
    )
  }

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
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="hover:text-primary rounded-full p-2 text-on-surface-variant outline-none transition-colors"
            aria-label="Back"
          >
            <span className="material-symbols-outlined text-[28px]">
              arrow_back
            </span>
          </button>
          <span className="text-body-md font-semibold">
            {currentChannel.name}
          </span>
        </header>

        <div className="from-background via-background/80 pointer-events-auto bg-gradient-to-t to-transparent px-6 pb-8">
          <div className="border-outline-variant/30 bg-surface-container/70 flex items-center justify-between rounded-2xl border p-4 backdrop-blur-xl">
            <div className="flex min-w-0 items-center gap-4">
              <div className="border-outline-variant/30 flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border bg-surface-container">
                {currentChannel.stream_icon ? (
                  <img
                    src={currentChannel.stream_icon}
                    alt=""
                    className="h-full w-full object-contain p-1"
                  />
                ) : (
                  <span className="font-bold text-on-surface">
                    {currentChannel.name.charAt(0)}
                  </span>
                )}
              </div>
              <span className="truncate text-body-md font-semibold">
                {currentChannel.name}
              </span>
            </div>

            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => goToIndex(index - 1)}
                disabled={index <= 0}
                aria-label="Previous channel"
                className="rounded-full p-3 text-on-surface-variant outline-none transition-colors hover:text-on-surface disabled:opacity-30"
              >
                <span className="material-symbols-outlined text-[28px]">
                  skip_previous
                </span>
              </button>
              <button
                type="button"
                onClick={togglePlayPause}
                aria-label={isPlaying ? 'Pause' : 'Play'}
                className="bg-primary text-on-primary rounded-full p-4 shadow-[0_0_20px_rgba(192,193,255,0.3)] outline-none transition-transform hover:scale-105"
              >
                <span
                  className="material-symbols-outlined text-[36px]"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  {isPlaying ? 'pause' : 'play_arrow'}
                </span>
              </button>
              <button
                type="button"
                onClick={() => goToIndex(index + 1)}
                disabled={index >= channels.length - 1}
                aria-label="Next channel"
                className="rounded-full p-3 text-on-surface-variant outline-none transition-colors hover:text-on-surface disabled:opacity-30"
              >
                <span className="material-symbols-outlined text-[28px]">
                  skip_next
                </span>
              </button>
              <button
                type="button"
                onClick={() => toggleFavorite(currentChannel.stream_id)}
                aria-label="Toggle favorite"
                className={`rounded-xl p-3 outline-none transition-colors hover:bg-surface-container ${
                  isFavorite(currentChannel.stream_id)
                    ? 'text-primary'
                    : 'text-on-surface-variant'
                }`}
              >
                <span
                  className="material-symbols-outlined"
                  style={{
                    fontVariationSettings: `'FILL' ${isFavorite(currentChannel.stream_id) ? 1 : 0}`,
                  }}
                >
                  favorite
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
