import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

/**
 * Maps Escape to "go back" everywhere, matching a TV remote's back button.
 *
 * If a text input currently has real focus (e.g. a search box entered via
 * Enter), Escape blurs it and returns to spatial navigation instead of
 * leaving the page — otherwise you'd never be able to stop typing without
 * the whole screen navigating away.
 *
 * `onEscape` lets a page intercept Escape first (e.g. to close an overlay
 * player or a modal) — return true once handled to skip the navigate(-1).
 */
export function useBackNavigation(onEscape?: () => boolean) {
  const navigate = useNavigate()

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      // 461 is the LG remote's hardware Back button (webOS delivers it as a
      // plain keydown since appinfo.json sets disableBackHistoryAPI: true,
      // rather than silently navigating browser history itself).
      const isBack =
        event.key === 'Escape' ||
        event.key === 'GoBack' ||
        event.keyCode === 461
      if (!isBack) return

      const active = document.activeElement
      if (
        active instanceof HTMLInputElement ||
        active instanceof HTMLTextAreaElement
      ) {
        active.blur()
        return
      }

      const handled = onEscape?.() ?? false
      if (!handled) navigate(-1)
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [navigate, onEscape])
}
