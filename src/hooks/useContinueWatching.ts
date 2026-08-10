import { useState } from 'react'
import {
  listContinueWatching,
  type WatchProgressEntry,
} from '../lib/watchProgress'

/** Reads once on mount — Home fully remounts on navigation, same as useFavorites. */
export function useContinueWatching(limit = 12): WatchProgressEntry[] {
  const [entries] = useState<WatchProgressEntry[]>(() =>
    listContinueWatching(limit),
  )
  return entries
}
