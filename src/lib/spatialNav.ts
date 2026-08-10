import { init } from '@noriginmedia/norigin-spatial-navigation'

// Runs once at module load (not inside a component), so StrictMode's
// double-invoked effects can't call it twice.
//
// shouldFocusDOMNode: true makes every arrow-key focus change also move
// real browser focus onto the underlying element. That means the existing
// native :focus-visible styling (and handlers like ChannelCard's
// onFocus-triggered EPG fetch) work for remote/keyboard nav without any
// extra plumbing — spatial nav and native focus stay in sync automatically.
init({
  shouldFocusDOMNode: true,
  shouldUseNativeEvents: false,
  // 'corners' (the default) compares nearest edges, which favors whichever
  // element happens to have a corner closest to the source — for a narrow
  // nav rail full of very differently-sized items (icons vs. large tiles),
  // that picked surprising targets (e.g. jumping straight to "Logout" at
  // the bottom instead of the vertically-aligned nav link). Comparing
  // element centers instead matches what a user visually expects "nearest"
  // to mean here.
  distanceCalculationMethod: 'center',
})
