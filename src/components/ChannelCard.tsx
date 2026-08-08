import { useRef, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Heart, Radio } from 'lucide-react'
import { useShortEpg } from '../hooks/useShortEpg'
import type { XtreamLiveStream } from '../types/xtream'

interface ChannelCardProps {
  channel: XtreamLiveStream
  isFavorite: boolean
  onSelect: () => void
  onToggleFavorite: () => void
}

export function ChannelCard({
  channel,
  isFavorite,
  onSelect,
  onToggleFavorite,
}: ChannelCardProps) {
  // Fetch EPG only after a brief hover/focus, not on mount — with dozens of
  // cards visible at once, fetching short EPG for all of them immediately
  // would fire that many concurrent requests. On-demand keeps it cheap.
  const [epgEnabled, setEpgEnabled] = useState(false)
  const hoverTimeout = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  )
  const epg = useShortEpg(channel.stream_id, epgEnabled)

  function startHover() {
    hoverTimeout.current = setTimeout(() => setEpgEnabled(true), 300)
  }
  function endHover() {
    clearTimeout(hoverTimeout.current)
  }

  return (
    <motion.button
      type="button"
      onClick={onSelect}
      onMouseEnter={startHover}
      onMouseLeave={endHover}
      onFocus={startHover}
      onBlur={endHover}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className="group focus-visible:border-primary bg-surface-container relative aspect-video w-full overflow-hidden rounded-lg border-2 border-transparent text-left outline-none focus-visible:shadow-[0_0_20px_rgba(192,193,255,0.3)]"
    >
      <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
      {channel.stream_icon && (
        <img
          src={channel.stream_icon}
          alt=""
          loading="lazy"
          className="absolute inset-0 h-full w-full object-contain p-6 opacity-70 transition-opacity group-hover:opacity-90"
          onError={(e) => {
            e.currentTarget.style.display = 'none'
          }}
        />
      )}
      <div className="absolute inset-0 z-20 flex flex-col justify-between p-3">
        <div className="flex items-start justify-between">
          <span className="bg-error text-on-error flex items-center gap-1 rounded px-2 py-0.5 text-[11px] font-bold tracking-wider uppercase">
            <Radio size={10} className="animate-pulse" />
            Live
          </span>
          <motion.span
            role="button"
            tabIndex={-1}
            whileTap={{ scale: 0.8 }}
            onClick={(e) => {
              e.stopPropagation()
              onToggleFavorite()
            }}
            className={`rounded-full bg-black/50 p-1.5 backdrop-blur-md transition-colors ${
              isFavorite
                ? 'text-primary'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={isFavorite ? 'filled' : 'empty'}
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                className="block"
              >
                <Heart size={16} fill={isFavorite ? 'currentColor' : 'none'} />
              </motion.span>
            </AnimatePresence>
          </motion.span>
        </div>
        <div>
          <h3 className="truncate text-sm font-semibold text-white">
            {channel.name}
          </h3>
          {epg.status === 'success' && epg.current && (
            <p className="text-on-surface-variant truncate text-xs">
              {epg.current.title}
            </p>
          )}
        </div>
      </div>
    </motion.button>
  )
}
