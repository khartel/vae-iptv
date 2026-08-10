import { motion } from 'motion/react'
import { Film, Star } from 'lucide-react'
import { useFocusable } from '@noriginmedia/norigin-spatial-navigation'

interface PosterCardProps {
  title: string
  posterUrl: string
  subtitle?: string
  rating?: number
  onSelect: () => void
}

export function PosterCard({
  title,
  posterUrl,
  subtitle,
  rating,
  onSelect,
}: PosterCardProps) {
  const { ref } = useFocusable<HTMLButtonElement>({ onEnterPress: onSelect })

  return (
    <motion.button
      ref={ref}
      type="button"
      onClick={onSelect}
      whileHover={{ scale: 1.05, y: -4 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 350, damping: 25 }}
      className="group bg-surface-container relative aspect-[2/3] w-full overflow-hidden rounded-xl text-left outline-none"
    >
      {posterUrl ? (
        <img
          src={posterUrl}
          alt=""
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover"
          onError={(e) => {
            e.currentTarget.style.display = 'none'
          }}
        />
      ) : (
        <div className="text-on-surface-variant absolute inset-0 flex items-center justify-center">
          <Film size={32} strokeWidth={1.5} />
        </div>
      )}

      {typeof rating === 'number' && rating > 0 && (
        <div className="text-tertiary absolute top-2 right-2 flex items-center gap-1 rounded bg-black/60 px-1.5 py-0.5 text-xs font-semibold backdrop-blur-md">
          <Star size={11} fill="currentColor" />
          {rating.toFixed(1)}
        </div>
      )}

      <div className="group-focus-visible:opacity-100 absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/95 via-black/30 to-transparent p-3 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
        <p className="truncate text-base font-bold text-white">{title}</p>
        {subtitle && (
          <p className="text-on-surface-variant truncate text-xs">{subtitle}</p>
        )}
      </div>
    </motion.button>
  )
}
