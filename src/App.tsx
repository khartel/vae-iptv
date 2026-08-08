import { useEffect, useState } from 'react'
import { login, XtreamApiError } from './services/xtreamApi'
import type { XtreamAuthResponse } from './types/xtream'

type LoginState =
  | { status: 'loading' }
  | { status: 'success'; data: XtreamAuthResponse }
  | { status: 'error'; kind: string; message: string }

function App() {
  const [state, setState] = useState<LoginState>({ status: 'loading' })

  useEffect(() => {
    login()
      .then((data) => setState({ status: 'success', data }))
      .catch((error: unknown) => {
        if (error instanceof XtreamApiError) {
          setState({
            status: 'error',
            kind: error.kind,
            message: error.message,
          })
        } else {
          setState({ status: 'error', kind: 'unknown', message: String(error) })
        }
      })
  }, [])

  return (
    <main className="flex min-h-svh items-center justify-center bg-neutral-950 text-neutral-100">
      <div className="max-w-md text-center">
        <h1 className="text-3xl font-semibold">IPTV Player</h1>
        <p className="mt-2 text-neutral-400">
          Phase 2 test harness — temporary, replaced by real UI in Phase 4.
        </p>

        <div className="mt-6 rounded-lg border border-neutral-800 bg-neutral-900 p-4 text-left text-sm">
          {state.status === 'loading' && (
            <p className="text-neutral-400">Connecting to IPTV server…</p>
          )}
          {state.status === 'success' && (
            <div className="space-y-1 text-green-400">
              <p>Auth succeeded.</p>
              <p>Status: {state.data.user_info.status}</p>
              <p>Max connections: {state.data.user_info.max_connections}</p>
              <p>
                Formats:{' '}
                {state.data.user_info.allowed_output_formats.join(', ')}
              </p>
            </div>
          )}
          {state.status === 'error' && (
            <div className="text-red-400">
              <p>Login failed ({state.kind})</p>
              <p className="mt-1 text-red-300/80">{state.message}</p>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}

export default App
