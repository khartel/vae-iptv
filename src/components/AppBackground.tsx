import backgroundImage from '../assets/background.webp'

/**
 * Fixed, blurred backdrop shown behind every page. Sits at z-[-1] so
 * page content (which no longer paints its own opaque background)
 * shows it through — surfaces layer glassmorphic panels on top via
 * their existing translucent bg-surface tokens plus backdrop-blur.
 */
export function AppBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-background">
      <div
        className="absolute inset-0 scale-110 bg-cover bg-center blur-2xl"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      />
      <div className="absolute inset-0 bg-black/65" />
    </div>
  )
}
