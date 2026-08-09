import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import { ArrowLeft, Play, Clock } from 'lucide-react'
import { useAsyncResource } from '../hooks/useAsyncResource'
import { getVodInfo, buildVodStreamUrl } from '../services/xtreamApi'
import { VideoPlayer } from '../components/VideoPlayer'

export function MovieDetailsPage() {
  const { vodId } = useParams<{ vodId: string }>()
  const navigate = useNavigate()
  const id = Number(vodId)
  const [showPlayer, setShowPlayer] = useState(false)

  const state = useAsyncResource(
    () => getVodInfo(id),
    [id],
    'Failed to load movie details.',
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

  const { info, movie_data } = state.data
  const poster = info.cover_big || info.movie_image
  const year = info.releasedate?.slice(0, 4)
  const streamUrl = buildVodStreamUrl(
    movie_data.stream_id,
    movie_data.container_extension || 'mp4',
  )

  return (
    <main className="relative min-h-screen">
      {poster && (
        <div className="absolute inset-0 h-[60vh] overflow-hidden">
          <img
            src={poster}
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
          {poster && (
            <img
              src={poster}
              alt=""
              className="aspect-[2/3] w-64 shrink-0 rounded-xl object-cover shadow-2xl"
            />
          )}

          <div className="max-w-2xl">
            <h1 className="text-headline-lg font-extrabold tracking-tight">
              {info.name}
            </h1>

            <div className="text-on-surface-variant mt-3 flex flex-wrap items-center gap-4 text-sm">
              {year && <span>{year}</span>}
              {info.duration && (
                <span className="flex items-center gap-1">
                  <Clock size={15} />
                  {info.duration}
                </span>
              )}
              {info.genre && <span>{info.genre}</span>}
            </div>

            <motion.button
              type="button"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setShowPlayer(true)}
              className="bg-primary text-on-primary mt-6 flex items-center gap-2 rounded-xl px-6 py-3 font-semibold shadow-[0_0_20px_rgba(192,193,255,0.25)] outline-none"
            >
              <Play size={20} fill="currentColor" />
              Play
            </motion.button>

            {(info.plot || info.description) && (
              <p className="text-on-surface-variant mt-6 leading-relaxed">
                {info.plot || info.description}
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
      </div>

      <AnimatePresence>
        {showPlayer && (
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
            <button
              type="button"
              onClick={() => setShowPlayer(false)}
              aria-label="Close player"
              className="text-on-background absolute top-6 left-6 z-10 rounded-full bg-black/50 p-2 backdrop-blur-md outline-none"
            >
              <ArrowLeft size={24} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  )
}
