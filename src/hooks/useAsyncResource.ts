import { useEffect, useState } from 'react'
import { XtreamApiError } from '../services/xtreamApi'

type State<T> =
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; message: string }

/**
 * Shared data-fetching pattern for "GET one Xtream resource, show it" hooks.
 * Re-fetches whenever `deps` changes; ignores results from a stale run if a
 * new one starts before the previous one resolves.
 */
export function useAsyncResource<T>(
  fetcher: () => Promise<T>,
  deps: unknown[],
  fallbackMessage: string,
): State<T> {
  const [state, setState] = useState<State<T>>({ status: 'loading' })

  // deps is caller-controlled and intentionally used as the effect's dep
  // list — that's the whole point of this generic hook. Static analysis
  // can't see through the indirection, hence the disable below.
  // oxlint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    let cancelled = false
    setState({ status: 'loading' })

    fetcher()
      .then((data) => {
        if (!cancelled) setState({ status: 'success', data })
      })
      .catch((error: unknown) => {
        if (cancelled) return
        const message =
          error instanceof XtreamApiError ? error.message : fallbackMessage
        setState({ status: 'error', message })
      })

    return () => {
      cancelled = true
    }
    // oxlint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return state
}
