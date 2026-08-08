import { useCallback, useEffect, useState } from 'react'

const STORAGE_KEY = 'iptv:favorite-stream-ids'

function readStoredFavorites(): number[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    return Array.isArray(parsed)
      ? parsed.filter((id) => typeof id === 'number')
      : []
  } catch {
    return []
  }
}

export function useFavorites() {
  const [favoriteIds, setFavoriteIds] = useState<number[]>(readStoredFavorites)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favoriteIds))
  }, [favoriteIds])

  const isFavorite = useCallback(
    (streamId: number) => favoriteIds.includes(streamId),
    [favoriteIds],
  )

  const toggleFavorite = useCallback((streamId: number) => {
    setFavoriteIds((prev) =>
      prev.includes(streamId)
        ? prev.filter((id) => id !== streamId)
        : [...prev, streamId],
    )
  }, [])

  return { favoriteIds, isFavorite, toggleFavorite }
}
