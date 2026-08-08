import { useEffect, useState } from 'react'
import { getLiveStreams, XtreamApiError } from '../services/xtreamApi'
import type { XtreamLiveStream } from '../types/xtream'

type State =
  | { status: 'loading' }
  | { status: 'success'; streams: XtreamLiveStream[] }
  | { status: 'error'; message: string }

/** Pass undefined/null categoryId to fetch every channel across all categories. */
export function useLiveStreams(categoryId: string | null): State {
  const [state, setState] = useState<State>({ status: 'loading' })

  useEffect(() => {
    let cancelled = false
    setState({ status: 'loading' })

    getLiveStreams(categoryId ?? undefined)
      .then((streams) => {
        if (!cancelled) setState({ status: 'success', streams })
      })
      .catch((error: unknown) => {
        if (cancelled) return
        const message =
          error instanceof XtreamApiError
            ? error.message
            : 'Failed to load channels.'
        setState({ status: 'error', message })
      })

    return () => {
      cancelled = true
    }
  }, [categoryId])

  return state
}
