import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'motion/react'
import {
  Tv,
  Film,
  Clapperboard,
  Heart,
  CalendarDays,
  Settings,
  type LucideIcon,
} from 'lucide-react'
import { useAuth } from '../app/AuthContext'
import { useLiveCategories } from '../hooks/useLiveCategories'
import { useLiveStreams } from '../hooks/useLiveStreams'
import { useFavorites } from '../hooks/useFavorites'
import { ChannelCard } from '../components/ChannelCard'

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
  return <Link to={to}>{content}</Link>
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
  return <Link to={to}>{content}</Link>
}

export function HomePage() {
  const navigate = useNavigate()
  const { state } = useAuth()
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

  return (
    <main className="pt-safe-margin-y pr-safe-margin-x pb-safe-margin-y pl-safe-margin-x">
      <header className="mb-10">
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
      </header>

      <div className="gap-rail-item-spacing mx-auto grid max-w-3xl grid-cols-3">
        <BigTile icon={Tv} label="LIVE TV" to="/live" colorClass="bg-primary" />
        <BigTile
          icon={Film}
          label="MOVIES"
          colorClass="bg-secondary"
          disabled
        />
        <BigTile
          icon={Clapperboard}
          label="SERIES"
          colorClass="bg-tertiary"
          disabled
        />
      </div>

      <div className="gap-rail-item-spacing mx-auto mt-4 grid max-w-3xl grid-cols-3">
        <SmallTile icon={Heart} label="Favorites" to="/favorites" />
        <SmallTile icon={CalendarDays} label="EPG" disabled />
        <SmallTile icon={Settings} label="Settings" disabled />
      </div>

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

      <footer className="text-on-surface-variant border-outline-variant/30 mt-section-gap flex items-center justify-between border-t pt-6 text-sm">
        <span>Expiration: {formatExpiration(userInfo?.exp_date)}</span>
        <span>Logged in: {userInfo?.username ?? '—'}</span>
      </footer>
    </main>
  )
}
