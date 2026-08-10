import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import { useFocusable } from '@noriginmedia/norigin-spatial-navigation'
import { Play, Info, Search, User, LogOut, type LucideIcon } from 'lucide-react'
import { useAuth } from '../app/AuthContext'
import { useLiveCategories } from '../hooks/useLiveCategories'
import { useLiveStreams } from '../hooks/useLiveStreams'
import { useVodCategories } from '../hooks/useVodCategories'
import { useVodStreams } from '../hooks/useVodStreams'
import { useAsyncResource } from '../hooks/useAsyncResource'
import { useFavorites } from '../hooks/useFavorites'
import { useContinueWatching } from '../hooks/useContinueWatching'
import { useRecommendations } from '../hooks/useRecommendations'
import { getVodInfo } from '../services/xtreamApi'
import { ChannelCard } from '../components/ChannelCard'
import { PosterCard } from '../components/PosterCard'

const FEATURED_COUNT = 12

function formatExpiration(expDate: string | null | undefined): string {
  const timestamp = Number(expDate)
  if (!expDate || !Number.isFinite(timestamp)) return 'N/A'
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'long' }).format(
    new Date(timestamp * 1000),
  )
}

function TopIconButton({
  icon: Icon,
  label,
  onPress,
}: {
  icon: LucideIcon
  label: string
  onPress: () => void
}) {
  const { ref } = useFocusable<HTMLButtonElement>({ onEnterPress: onPress })
  return (
    <motion.button
      ref={ref}
      type="button"
      onClick={onPress}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.92 }}
      aria-label={label}
      className="text-on-surface flex h-11 w-11 items-center justify-center rounded-full bg-black/40 outline-none backdrop-blur-md transition-colors hover:bg-black/60"
    >
      <Icon size={19} />
    </motion.button>
  )
}

function HeroButton({
  primary,
  icon: Icon,
  label,
  onPress,
}: {
  primary?: boolean
  icon: LucideIcon
  label: string
  onPress: () => void
}) {
  const { ref } = useFocusable<HTMLButtonElement>({ onEnterPress: onPress })
  return (
    <motion.button
      ref={ref}
      type="button"
      onClick={onPress}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      className={`flex items-center gap-2 rounded-xl px-6 py-3.5 font-semibold outline-none transition-colors ${
        primary
          ? 'bg-primary text-on-primary shadow-[0_0_25px_rgba(192,193,255,0.35)]'
          : 'bg-surface-container-high/80 text-on-surface hover:bg-surface-bright backdrop-blur-md'
      }`}
    >
      <Icon size={19} fill={primary ? 'currentColor' : 'none'} />
      {label}
    </motion.button>
  )
}

function ProfileMenu({
  username,
  expiration,
  onLogout,
}: {
  username: string
  expiration: string
  onLogout: () => void
}) {
  const [open, setOpen] = useState(false)
  const { ref } = useFocusable<HTMLButtonElement>({
    onEnterPress: () => setOpen((v) => !v),
  })

  return (
    <div className="relative">
      <motion.button
        ref={ref}
        type="button"
        onClick={() => setOpen((v) => !v)}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        aria-label="Account"
        className="text-on-surface flex h-11 w-11 items-center justify-center rounded-full bg-black/40 outline-none backdrop-blur-md transition-colors hover:bg-black/60"
      >
        <User size={19} />
      </motion.button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="border-outline-variant/30 bg-surface-container absolute top-14 right-0 z-20 w-64 rounded-2xl border p-4 shadow-2xl"
          >
            <p className="text-on-surface truncate font-bold">{username}</p>
            <p className="text-on-surface-variant mt-1 text-sm">
              Expires {expiration}
            </p>
            <button
              type="button"
              onClick={onLogout}
              className="text-error hover:bg-error/10 mt-4 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-semibold outline-none transition-colors"
            >
              <LogOut size={16} />
              Logout
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function HomePage() {
  const navigate = useNavigate()
  const { state, logout } = useAuth()
  const userInfo =
    state.status === 'authenticated' ? state.data.user_info : null

  const categoriesState = useLiveCategories()
  const firstCategoryId =
    categoriesState.status === 'success'
      ? (categoriesState.categories[0]?.category_id ?? null)
      : null
  const streamsState = useLiveStreams(firstCategoryId)
  const { isFavorite, toggleFavorite } = useFavorites()

  const featured =
    streamsState.status === 'success'
      ? streamsState.streams.slice(0, FEATURED_COUNT)
      : []

  // Hero: feature a movie (real poster art + a real plot/genre, unlike live
  // channels which only have a small logo) from the first VOD category.
  const vodCategoriesState = useVodCategories()
  const heroCategoryId =
    vodCategoriesState.status === 'success'
      ? (vodCategoriesState.data[0]?.category_id ?? null)
      : null
  const heroCandidatesState = useVodStreams(heroCategoryId)
  const heroCandidateId =
    heroCandidatesState.status === 'success'
      ? heroCandidatesState.data.find((m) => m.stream_icon)?.stream_id
      : undefined
  const heroState = useAsyncResource(
    () =>
      heroCandidateId
        ? getVodInfo(heroCandidateId)
        : Promise.reject(new Error('no hero candidate yet')),
    [heroCandidateId],
    'Failed to load featured title.',
  )

  const continueWatching = useContinueWatching()
  const recommendations = useRecommendations()

  return (
    <main className="pb-section-gap">
      <section className="relative h-[70vh] min-h-[480px] w-full overflow-hidden">
        {heroState.status === 'success' ? (
          <>
            <img
              src={
                heroState.data.info.cover_big || heroState.data.info.movie_image
              }
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="from-background via-background/50 absolute inset-0 bg-gradient-to-t to-transparent" />
            <div className="from-background/95 absolute inset-0 bg-gradient-to-r via-transparent to-transparent" />

            <div className="px-safe-margin-x absolute right-0 bottom-0 left-0 max-w-2xl pb-14">
              <h1 className="text-display-hero font-extrabold tracking-tight text-white">
                {heroState.data.info.name}
              </h1>
              {(heroState.data.info.plot || heroState.data.info.genre) && (
                <p className="text-on-surface-variant mt-4 line-clamp-3 leading-relaxed">
                  {heroState.data.info.plot}
                </p>
              )}
              {heroState.data.info.genre && (
                <p className="text-label-caps text-primary mt-3">
                  {heroState.data.info.genre}
                </p>
              )}
              <div className="mt-6 flex gap-4">
                <HeroButton
                  primary
                  icon={Play}
                  label="Watch Now"
                  onPress={() =>
                    navigate(`/movies/${heroCandidateId}`, {
                      state: { autoplay: true },
                    })
                  }
                />
                <HeroButton
                  icon={Info}
                  label="More Info"
                  onPress={() => navigate(`/movies/${heroCandidateId}`)}
                />
              </div>
            </div>
          </>
        ) : (
          <div className="bg-surface h-full w-full" />
        )}

        <div className="absolute top-6 right-8 z-10 flex items-center gap-3">
          <TopIconButton
            icon={Search}
            label="Search"
            onPress={() => navigate('/search')}
          />
          <ProfileMenu
            username={userInfo?.username ?? '—'}
            expiration={formatExpiration(userInfo?.exp_date)}
            onLogout={logout}
          />
        </div>
      </section>

      <div className="px-safe-margin-x">
        {continueWatching.length > 0 && (
          <section className="mt-section-gap">
            <h2 className="text-headline-md mb-4">Continue Watching</h2>
            <div className="gap-rail-item-spacing grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6">
              {continueWatching.map((entry) => (
                <PosterCard
                  key={entry.key}
                  title={entry.title}
                  posterUrl={entry.posterUrl}
                  subtitle={entry.subtitle}
                  progressRatio={entry.positionSeconds / entry.durationSeconds}
                  onSelect={() =>
                    entry.kind === 'movie'
                      ? navigate(`/movies/${entry.movieId}`, {
                          state: { autoplay: true },
                        })
                      : navigate(`/series/${entry.seriesId}`, {
                          state: {
                            resumeSeason: entry.seasonNumber,
                            resumeEpisodeIndex: entry.episodeIndex,
                          },
                        })
                  }
                />
              ))}
            </div>
          </section>
        )}

        <section className="mt-section-gap">
          <h2 className="text-headline-md mb-4">Live Now</h2>

          {(categoriesState.status === 'loading' ||
            streamsState.status === 'loading') && (
            <p className="text-on-surface-variant">Loading channels…</p>
          )}
          {categoriesState.status === 'error' && (
            <p className="text-error">{categoriesState.message}</p>
          )}
          {streamsState.status === 'error' && (
            <p className="text-error">{streamsState.message}</p>
          )}

          {featured.length > 0 && (
            <div className="gap-rail-item-spacing no-scrollbar flex overflow-x-auto pb-4">
              {featured.map((channel, i) => (
                <div key={channel.stream_id} className="w-[280px] shrink-0">
                  <ChannelCard
                    channel={channel}
                    isFavorite={isFavorite(channel.stream_id)}
                    onSelect={() =>
                      navigate(`/watch/${channel.stream_id}`, {
                        state: { channels: featured, index: i },
                      })
                    }
                    onToggleFavorite={() => toggleFavorite(channel)}
                  />
                </div>
              ))}
            </div>
          )}
        </section>

        {recommendations.hasSignal &&
          recommendations.state.status === 'success' &&
          recommendations.state.data.length > 0 && (
            <section className="mt-section-gap">
              <h2 className="text-headline-md mb-1">Recommended for You</h2>
              {recommendations.genreLabel && (
                <p className="text-on-surface-variant mb-4 text-sm">
                  Because you watched {recommendations.genreLabel}
                </p>
              )}
              <div className="gap-rail-item-spacing grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6">
                {recommendations.state.data.map((item) => (
                  <PosterCard
                    key={item.key}
                    title={item.title}
                    posterUrl={item.posterUrl}
                    subtitle={item.subtitle}
                    rating={item.rating}
                    onSelect={() => navigate(item.route)}
                  />
                ))}
              </div>
            </section>
          )}
      </div>
    </main>
  )
}
