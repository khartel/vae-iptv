import { useEffect, useState } from 'react'
import { getLiveCategories, XtreamApiError } from '../services/xtreamApi'
import type { XtreamLiveCategory } from '../types/xtream'

type State =
  | { status: 'loading' }
  | { status: 'success'; categories: XtreamLiveCategory[] }
  | { status: 'error'; message: string }

export function useLiveCategories(): State {
  const [state, setState] = useState<State>({ status: 'loading' })

  useEffect(() => {
    let cancelled = false
    setState({ status: 'loading' })

    getLiveCategories()
      .then((categories) => {
        if (!cancelled) setState({ status: 'success', categories })
      })
      .catch((error: unknown) => {
        if (cancelled) return
        const message =
          error instanceof XtreamApiError
            ? error.message
            : 'Failed to load categories.'
        setState({ status: 'error', message })
      })

    return () => {
      cancelled = true
    }
  }, [])

  return state
}
