import { useEffect, useState } from 'react'
import { getShortEpg } from '../services/xtreamApi'
import { decodeBase64Utf8 } from '../utils/base64'
import type { XtreamEpgListing } from '../types/xtream'

export interface EpgProgram {
  title: string
  description: string
  start: Date
  end: Date
}

interface EpgResult {
  current: EpgProgram | null
  next: EpgProgram | null
}

type State =
  | { status: 'idle' }
  | { status: 'loading' }
  | ({ status: 'success' } & EpgResult)
  | { status: 'error' }

// Module-level cache: short EPG data doesn't change fast enough to warrant
// refetching every time a card is re-hovered within the same session.
const cache = new Map<number, EpgResult>()

function toProgram(listing: XtreamEpgListing): EpgProgram {
  return {
    title: decodeBase64Utf8(listing.title),
    description: decodeBase64Utf8(listing.description),
    start: new Date(listing.start_timestamp * 1000),
    end: new Date(listing.stop_timestamp * 1000),
  }
}

function resolveCurrentAndNext(listings: XtreamEpgListing[]): EpgResult {
  const programs = listings.map(toProgram)
  const now = Date.now()
  const currentIndex = programs.findIndex(
    (p) => p.start.getTime() <= now && now < p.end.getTime(),
  )
  const current =
    (currentIndex >= 0 ? programs[currentIndex] : programs[0]) ?? null
  const next =
    (currentIndex >= 0 ? programs[currentIndex + 1] : programs[1]) ?? null
  return { current, next }
}

/**
 * Fetches current + next program for one channel. Pass `enabled: false` to
 * skip fetching entirely (e.g. until a card is hovered) — short EPG is cheap
 * per-channel, but fetching it for every visible card at once isn't.
 */
export function useShortEpg(streamId: number, enabled: boolean): State {
  const [state, setState] = useState<State>(() => {
    if (!enabled) return { status: 'idle' }
    const cached = cache.get(streamId)
    return cached ? { status: 'success', ...cached } : { status: 'loading' }
  })

  useEffect(() => {
    if (!enabled) {
      setState({ status: 'idle' })
      return
    }

    const cached = cache.get(streamId)
    if (cached) {
      setState({ status: 'success', ...cached })
      return
    }

    let cancelled = false
    setState({ status: 'loading' })

    getShortEpg(streamId)
      .then((listings) => {
        if (cancelled) return
        const result = resolveCurrentAndNext(listings)
        cache.set(streamId, result)
        setState({ status: 'success', ...result })
      })
      .catch(() => {
        if (!cancelled) setState({ status: 'error' })
      })

    return () => {
      cancelled = true
    }
  }, [streamId, enabled])

  return state
}
