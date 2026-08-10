import {
  useFocusable,
  pause,
  resume,
} from '@noriginmedia/norigin-spatial-navigation'

/**
 * Makes a text input reachable by arrow keys like any other focusable card
 * or button — arrow-key nav can land on it and pass over it freely. Spatial
 * nav only pauses once Enter is pressed to actually start typing (matching
 * "arrow to the search box, press OK to edit it" TV remote conventions) —
 * pausing on focus instead would trap arrow keys the instant nav landed
 * here, since the underlying <input> already has real DOM focus by then
 * (shouldFocusDOMNode) and arrow keys would silently move an empty text
 * cursor instead of navigating. Escape (handled by useBackNavigation) blurs
 * the input, which resumes spatial nav here via onBlur.
 */
export function useSpatialInput<E extends HTMLElement = HTMLInputElement>() {
  const { ref, focused } = useFocusable<E>({
    onEnterPress: () => pause(),
  })

  return {
    ref,
    focused,
    onBlur: () => resume(),
  }
}
