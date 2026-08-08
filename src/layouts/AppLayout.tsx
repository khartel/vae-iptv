import { NavLink, Outlet } from 'react-router-dom'
import logo from '../assets/logo.png'
import { useAuth } from '../app/AuthContext'

interface NavItem {
  to: string
  icon: string
  label: string
  disabled?: boolean
}

const NAV_ITEMS: NavItem[] = [
  { to: '/', icon: 'home', label: 'Home' },
  { to: '/live', icon: 'live_tv', label: 'Live TV' },
  { to: '/movies', icon: 'movie', label: 'Movies', disabled: true },
  { to: '/series', icon: 'theaters', label: 'Series', disabled: true },
  { to: '/favorites', icon: 'favorite', label: 'Favorites', disabled: true },
  { to: '/epg', icon: 'calendar_view_day', label: 'EPG', disabled: true },
]

function SideNavLink({ item }: { item: NavItem }) {
  const base =
    'flex items-center gap-4 p-4 rounded-xl transition-all duration-200 outline-none'

  if (item.disabled) {
    return (
      <span
        className={`${base} text-on-surface-variant/40 cursor-not-allowed`}
        title="Coming in a later phase"
      >
        <span className="material-symbols-outlined shrink-0">{item.icon}</span>
        <span className="text-label-caps whitespace-nowrap opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          {item.label}
        </span>
      </span>
    )
  }

  return (
    <NavLink
      to={item.to}
      end={item.to === '/'}
      className={({ isActive }) =>
        `${base} ${
          isActive
            ? 'bg-primary-container text-on-primary-container scale-105 border-2 border-primary shadow-[0_0_20px_rgba(192,193,255,0.3)]'
            : 'text-on-surface-variant opacity-70 hover:scale-105 hover:bg-surface-bright hover:text-on-surface'
        }`
      }
    >
      <span className="material-symbols-outlined shrink-0">{item.icon}</span>
      <span className="text-label-caps whitespace-nowrap opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        {item.label}
      </span>
    </NavLink>
  )
}

export function AppLayout() {
  const { logout } = useAuth()

  return (
    <div className="bg-background text-on-background min-h-screen">
      <aside className="group fixed top-0 left-0 z-50 flex h-full w-[96px] flex-col overflow-hidden bg-surface-container/95 px-4 py-safe-margin-y shadow-2xl backdrop-blur-xl transition-all duration-300 hover:w-[320px]">
        <div className="mb-8 flex items-center gap-4 px-2 whitespace-nowrap">
          <img
            src={logo}
            alt="VAE IPTV"
            className="h-12 w-12 shrink-0 rounded-lg object-cover"
          />
          <span className="text-label-caps text-primary opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            VAE IPTV
          </span>
        </div>
        <nav className="flex flex-1 flex-col gap-2 overflow-x-hidden overflow-y-auto no-scrollbar">
          {NAV_ITEMS.map((item) => (
            <SideNavLink key={item.to} item={item} />
          ))}
        </nav>
        <div className="mt-auto">
          <button
            type="button"
            onClick={logout}
            className="flex w-full items-center gap-4 rounded-xl p-4 text-on-surface-variant opacity-70 outline-none transition-all duration-200 hover:scale-105 hover:bg-surface-bright hover:text-on-surface"
          >
            <span className="material-symbols-outlined shrink-0">logout</span>
            <span className="text-label-caps whitespace-nowrap opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              Logout
            </span>
          </button>
        </div>
      </aside>

      <div className="ml-[96px]">
        <Outlet />
      </div>
    </div>
  )
}
