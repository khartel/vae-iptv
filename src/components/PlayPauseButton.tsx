import { motion } from 'motion/react'
import { useFocusable } from '@noriginmedia/norigin-spatial-navigation'
import { Play, Pause } from 'lucide-react'

export function PlayPauseButton({
  isPlaying,
  onToggle,
}: {
  isPlaying: boolean
  onToggle: () => void
}) {
  const { ref } = useFocusable<HTMLButtonElement>({ onEnterPress: onToggle })
  return (
    <motion.button
      ref={ref}
      type="button"
      onClick={onToggle}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.92 }}
      aria-label={isPlaying ? 'Pause' : 'Play'}
      className="bg-primary text-on-primary rounded-full p-4 shadow-[0_0_20px_rgba(192,193,255,0.3)] outline-none"
    >
      {isPlaying ? (
        <Pause size={28} fill="currentColor" />
      ) : (
        <Play size={28} fill="currentColor" />
      )}
    </motion.button>
  )
}
