import { useCallback, useEffect, useMemo, useState } from 'react'
import type { XtreamLiveStream } from '../types/xtream'

const STORAGE_KEY = 'iptv:favorite-channels'

type FavoritesMap = Record<number, XtreamLiveStream>

function readStoredFavorites(): FavoritesMap {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    const parsed: unknown = JSON.parse(raw)
    return typeof parsed === 'object' && parsed !== null
      ? (parsed as FavoritesMap)
      : {}
  } catch {
    return {}
  }
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<FavoritesMap>(readStoredFavorites)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites))
  }, [favorites])

  const isFavorite = useCallback(
    (streamId: number) => streamId in favorites,
    [favorites],
  )

  const toggleFavorite = useCallback((channel: XtreamLiveStream) => {
    setFavorites((prev) => {
      const next = { ...prev }
      if (channel.stream_id in next) {
        delete next[channel.stream_id]
      } else {
        next[channel.stream_id] = channel
      }
      return next
    })
  }, [])

  const favoriteChannels = useMemo(() => Object.values(favorites), [favorites])

  return { favoriteChannels, isFavorite, toggleFavorite }
}
