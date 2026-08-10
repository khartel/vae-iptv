import { motion } from 'motion/react'
import { useFocusable } from '@noriginmedia/norigin-spatial-navigation'

interface LoadMoreButtonProps {
  remaining: number
  onClick: () => void
}

export function LoadMoreButton({ remaining, onClick }: LoadMoreButtonProps) {
  const { ref } = useFocusable<HTMLButtonElement>({ onEnterPress: onClick })

  return (
    <div className="flex justify-center pb-12">
      <motion.button
        ref={ref}
        type="button"
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        onClick={onClick}
        className="bg-surface-container-high text-on-surface hover:bg-surface-bright rounded-xl px-6 py-3 outline-none transition-colors"
      >
        Load more ({remaining} remaining)
      </motion.button>
    </div>
  )
}
