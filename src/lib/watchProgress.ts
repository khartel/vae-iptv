const STORAGE_KEY = 'iptv:watch-progress'

export interface WatchProgressEntry {
  key: string
  kind: 'movie' | 'episode'
  title: string
  subtitle?: string
  posterUrl: string
  positionSeconds: number
  durationSeconds: number
  updatedAt: number
  genre?: string
  categoryId?: string
  movieId?: number
  seriesId?: number
  seasonNumber?: number
  episodeIndex?: number
}

type ProgressMap = Record<string, WatchProgressEntry>

function readAll(): ProgressMap {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    const parsed: unknown = JSON.parse(raw)
    return typeof parsed === 'object' && parsed !== null
      ? (parsed as ProgressMap)
      : {}
  } catch {
    return {}
  }
}

function writeAll(map: ProgressMap): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map))
  } catch {
    // Storage full/unavailable — losing resume position isn't worth surfacing.
  }
}

export function movieProgressKey(movieId: number): string {
  return `movie:${movieId}`
}

export function episodeProgressKey(episodeId: number): string {
  return `episode:${episodeId}`
}

export function saveWatchProgress(
  entry: Omit<WatchProgressEntry, 'updatedAt'>,
): void {
  const map = readAll()
  map[entry.key] = { ...entry, updatedAt: Date.now() }
  writeAll(map)
}

export function getWatchProgress(key: string): WatchProgressEntry | undefined {
  return readAll()[key]
}

/** "In progress" — resumable, but not so early or so late that it's not worth remembering. */
function isMeaningful(entry: WatchProgressEntry): boolean {
  if (entry.durationSeconds <= 0) return false
  const ratio = entry.positionSeconds / entry.durationSeconds
  return entry.positionSeconds > 15 && ratio < 0.95
}

export function listContinueWatching(limit = 12): WatchProgressEntry[] {
  return Object.values(readAll())
    .filter(isMeaningful)
    .sort((a, b) => b.updatedAt - a.updatedAt)
    .slice(0, limit)
}
