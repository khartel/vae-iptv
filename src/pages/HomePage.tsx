import { useEffect, useState, type ReactNode } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import { useFocusable } from '@noriginmedia/norigin-spatial-navigation'
import {
  Tv,
  Film,
  Clapperboard,
  Heart,
  CalendarDays,
  Settings,
  Search,
  User,
  LogOut,
  type LucideIcon,
} from 'lucide-react'
import { useAuth } from '../app/AuthContext'
import { useLiveCategories } from '../hooks/useLiveCategories'
import { useLiveStreams } from '../hooks/useLiveStreams'
import { useFavorites } from '../hooks/useFavorites'
import { useContinueWatching } from '../hooks/useContinueWatching'
import { useRecommendations } from '../hooks/useRecommendations'
import { ChannelCard } from '../components/ChannelCard'
import { PosterCard } from '../components/PosterCard'

const FEATURED_COUNT = 12

function useClock() {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])
  return now
}

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
      className="bg-surface-container-high text-on-surface flex h-11 w-11 items-center justify-center rounded-full outline-none transition-colors hover:bg-surface-bright"
    >
      <Icon size={19} />
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
        className="bg-surface-container-high text-on-surface flex h-11 w-11 items-center justify-center rounded-full outline-none transition-colors hover:bg-surface-bright"
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

interface BigTileProps {
  icon: LucideIcon
  label: string
  to?: string
  colorClass: string
  disabled?: boolean
}

function BigTile({
  icon: Icon,
  label,
  to,
  colorClass,
  disabled,
}: BigTileProps) {
  const content = (
    <motion.div
      whileHover={disabled ? undefined : { scale: 1.03, y: -2 }}
      whileTap={disabled ? undefined : { scale: 0.98 }}
      className={`relative flex aspect-[4/3] flex-col items-center justify-center gap-3 overflow-hidden rounded-2xl ${colorClass} ${
        disabled ? 'opacity-40' : 'shadow-lg'
      }`}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
      <Icon size={44} className="relative text-white" strokeWidth={1.75} />
      <span className="text-body-lg relative font-extrabold tracking-wide text-white">
        {label}
      </span>
    </motion.div>
  )

  if (disabled || !to) {
    return (
      <div className="cursor-not-allowed" title="Coming in a later phase">
        {content}
      </div>
    )
  }
  return <FocusableTileLink to={to}>{content}</FocusableTileLink>
}

// Separate component so useFocusable is only ever called for tiles that
// actually register in the focus graph — disabled/comingsoon tiles above
// never call it at all instead of registering with no DOM node attached.
function FocusableTileLink({
  to,
  children,
}: {
  to: string
  children: ReactNode
}) {
  const navigate = useNavigate()
  const { ref } = useFocusable<HTMLAnchorElement>({
    onEnterPress: () => navigate(to),
  })
  return (
    <Link ref={ref} to={to} className="block outline-none">
      {children}
    </Link>
  )
}

interface SmallTileProps {
  icon: LucideIcon
  label: string
  to?: string
  disabled?: boolean
}

function SmallTile({ icon: Icon, label, to, disabled }: SmallTileProps) {
  const content = (
    <motion.div
      whileHover={disabled ? undefined : { scale: 1.02 }}
      whileTap={disabled ? undefined : { scale: 0.97 }}
      title={disabled ? 'Coming in a later phase' : undefined}
      className={`bg-surface-container-high flex items-center gap-3 rounded-xl px-5 py-4 ${
        disabled
          ? 'cursor-not-allowed opacity-40'
          : 'hover:bg-surface-bright cursor-pointer'
      }`}
    >
      <Icon size={20} className="text-secondary" />
      <span className="text-on-surface font-semibold">{label}</span>
    </motion.div>
  )

  if (disabled || !to) return content
  return <FocusableTileLink to={to}>{content}</FocusableTileLink>
}

export function HomePage() {
  const navigate = useNavigate()
  const { state, logout } = useAuth()
  const now = useClock()
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

  const continueWatching = useContinueWatching()
  const recommendations = useRecommendations()

  return (
    <main className="pt-safe-margin-y pr-safe-margin-x pb-safe-margin-y pl-safe-margin-x">
      <header className="mb-10 flex items-start justify-between">
        <div>
          <p className="text-headline-lg font-extrabold tracking-tighter">
            {new Intl.DateTimeFormat(undefined, {
              hour: '2-digit',
              minute: '2-digit',
            }).format(now)}
          </p>
          <p className="text-on-surface-variant">
            {new Intl.DateTimeFormat(undefined, {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
            }).format(now)}
          </p>
        </div>
        <div className="flex items-center gap-3">
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
      </header>

      <div className="gap-rail-item-spacing mx-auto grid max-w-3xl grid-cols-3">
        <BigTile icon={Tv} label="LIVE TV" to="/live" colorClass="bg-primary" />
        <BigTile
          icon={Film}
          label="MOVIES"
          to="/movies"
          colorClass="bg-secondary"
        />
        <BigTile
          icon={Clapperboard}
          label="SERIES"
          to="/series"
          colorClass="bg-tertiary"
        />
      </div>

      <div className="gap-rail-item-spacing mx-auto mt-4 grid max-w-3xl grid-cols-3">
        <SmallTile icon={Heart} label="Favorites" to="/favorites" />
        <SmallTile icon={CalendarDays} label="EPG" disabled />
        <SmallTile icon={Settings} label="Settings" disabled />
      </div>

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

      <footer className="text-on-surface-variant border-outline-variant/30 mt-section-gap flex items-center justify-between border-t pt-6 text-sm">
        <span>Expiration: {formatExpiration(userInfo?.exp_date)}</span>
        <span>Logged in: {userInfo?.username ?? '—'}</span>
      </footer>
    </main>
  )
}
