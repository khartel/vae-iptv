import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import {
  login as apiLogin,
  getEnvCredentials,
  XtreamApiError,
} from '../services/xtreamApi'
import type { XtreamAuthResponse, XtreamCredentials } from '../types/xtream'

type AuthState =
  | { status: 'loading' }
  | {
      status: 'authenticated'
      data: XtreamAuthResponse
      credentials: XtreamCredentials
    }
  | { status: 'unauthenticated'; error?: string }

interface AuthContextValue {
  state: AuthState
  login: (credentials: XtreamCredentials) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

// Session-only (not localStorage): cleared when the tab closes, so credentials
// don't sit around indefinitely in the browser. Acceptable for a personal,
// single-user app; revisit if this ever becomes multi-user or shared-device.
const SESSION_KEY = 'iptv:session-credentials'

function readStoredCredentials(): XtreamCredentials | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY)
    return raw ? (JSON.parse(raw) as XtreamCredentials) : null
  } catch {
    return null
  }
}

function readInitialCredentials(): XtreamCredentials | null {
  const stored = readStoredCredentials()
  if (stored) return stored
  // Dev convenience: fall back to .env credentials if present, so the app
  // doesn't force a manual login on every reload during development.
  const envCredentials = getEnvCredentials()
  return envCredentials.serverUrl ? envCredentials : null
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ status: 'loading' })

  const attemptLogin = useCallback(async (credentials: XtreamCredentials) => {
    setState({ status: 'loading' })
    try {
      const data = await apiLogin(credentials)
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(credentials))
      setState({ status: 'authenticated', data, credentials })
    } catch (error) {
      const message =
        error instanceof XtreamApiError ? error.message : 'Failed to connect.'
      setState({ status: 'unauthenticated', error: message })
    }
  }, [])

  const logout = useCallback(() => {
    sessionStorage.removeItem(SESSION_KEY)
    setState({ status: 'unauthenticated' })
  }, [])

  useEffect(() => {
    const initial = readInitialCredentials()
    if (initial) {
      void attemptLogin(initial)
    } else {
      setState({ status: 'unauthenticated' })
    }
    // Only run once on mount — attemptLogin is stable (useCallback, no deps).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <AuthContext.Provider value={{ state, login: attemptLogin, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
