import { useEffect } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import {
  useFocusable,
  FocusContext,
} from '@noriginmedia/norigin-spatial-navigation'
import {
  Home,
  Tv,
  Film,
  Clapperboard,
  Heart,
  CalendarDays,
  Search,
  Settings,
  LogOut,
  type LucideIcon,
} from 'lucide-react'
import logo from '../assets/logo-mark.png'
import { useAuth } from '../app/AuthContext'

interface NavItem {
  to: string
  icon: LucideIcon
  label: string
  disabled?: boolean
}

const NAV_ITEMS: NavItem[] = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/live', icon: Tv, label: 'Live TV' },
  { to: '/movies', icon: Film, label: 'Movies' },
  { to: '/series', icon: Clapperboard, label: 'Series' },
  { to: '/favorites', icon: Heart, label: 'Favorites' },
  { to: '/epg', icon: CalendarDays, label: 'EPG', disabled: true },
  { to: '/search', icon: Search, label: 'Search' },
  { to: '/settings', icon: Settings, label: 'Settings', disabled: true },
]

const NAV_LINK_BASE =
  'flex items-center gap-4 px-4 py-3 rounded-xl transition-colors duration-200 outline-none'

function SideNavLink({ item }: { item: NavItem }) {
  const Icon = item.icon

  if (item.disabled) {
    return (
      <span
        className={`${NAV_LINK_BASE} text-on-surface-variant/40 cursor-not-allowed`}
        title="Coming in a later phase"
      >
        <Icon className="shrink-0" size={20} strokeWidth={1.75} />
        <span className="text-body-md whitespace-nowrap">{item.label}</span>
      </span>
    )
  }

  // A separate component (rather than an early return in SideNavLink above)
  // so useFocusable is only ever called for nav items that actually exist
  // in the focus registry — disabled items never register at all instead
  // of registering with no DOM node attached.
  return <FocusableNavLink item={item} Icon={Icon} />
}

function FocusableNavLink({ item, Icon }: { item: NavItem; Icon: LucideIcon }) {
  const navigate = useNavigate()
  const { ref } = useFocusable<HTMLAnchorElement>({
    onEnterPress: () => navigate(item.to),
  })

  return (
    <NavLink
      ref={ref}
      to={item.to}
      end={item.to === '/'}
      className={({ isActive }) =>
        `${NAV_LINK_BASE} ${
          isActive
            ? 'bg-primary text-on-primary font-semibold shadow-[0_0_20px_rgba(192,193,255,0.3)]'
            : 'text-on-surface-variant hover:bg-surface-bright hover:text-on-surface'
        }`
      }
    >
      <Icon className="shrink-0" size={20} strokeWidth={1.75} />
      <span className="text-body-md whitespace-nowrap">{item.label}</span>
    </NavLink>
  )
}

export function AppLayout() {
  const { logout } = useAuth()
  const location = useLocation()
  const { ref: logoutRef } = useFocusable<HTMLButtonElement>({
    onEnterPress: logout,
  })

  // Spatial nav has no notion of "focus nothing" — arrow keys are no-ops
  // until something is focused. Re-focusing the content area on every route
  // change gives each page a keyboard-only entry point (it delegates to
  // that page's first/last-remembered focusable child) without every page
  // needing to do this itself.
  const {
    ref: contentRef,
    focusKey: contentFocusKey,
    focusSelf: focusContent,
  } = useFocusable<HTMLDivElement>({
    trackChildren: true,
    saveLastFocusedChild: true,
  })

  useEffect(() => {
    focusContent()
  }, [location.pathname, focusContent])

  return (
    <div className="text-on-background min-h-screen">
      <aside className="py-safe-margin-y fixed top-0 left-0 z-50 flex h-full w-64 flex-col bg-surface-container/90 px-4 shadow-2xl backdrop-blur-xl">
        <div className="mb-8 flex items-center gap-3 px-2">
          <img
            src={logo}
            alt="VAE IPTV"
            className="h-9 w-11 shrink-0 object-contain"
          />
          <div className="min-w-0">
            <p className="text-label-caps text-on-surface truncate leading-tight font-bold">
              VAE IPTV
            </p>
            <p className="text-on-surface-variant truncate text-xs">
              Premium Streaming
            </p>
          </div>
        </div>

        <nav className="no-scrollbar flex flex-1 flex-col gap-1 overflow-x-hidden overflow-y-auto">
          {NAV_ITEMS.map((item) => (
            <SideNavLink key={item.to} item={item} />
          ))}
        </nav>

        <div className="mt-auto pt-2">
          <motion.button
            ref={logoutRef}
            type="button"
            onClick={logout}
            whileTap={{ scale: 0.97 }}
            className="text-on-surface-variant hover:bg-surface-bright hover:text-on-surface flex w-full items-center gap-4 rounded-xl px-4 py-3 outline-none transition-colors duration-200"
          >
            <LogOut className="shrink-0" size={20} strokeWidth={1.75} />
            <span className="text-body-md whitespace-nowrap">Logout</span>
          </motion.button>
        </div>
      </aside>

      <div ref={contentRef} className="ml-64">
        <FocusContext.Provider value={contentFocusKey}>
          <Outlet />
        </FocusContext.Provider>
      </div>
    </div>
  )
}
