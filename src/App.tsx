import { useEffect, useState } from 'react'
import { login, buildLiveStreamUrl, XtreamApiError } from './services/xtreamApi'
import { VideoPlayer } from './components/VideoPlayer'
import type { XtreamAuthResponse } from './types/xtream'

// Hardcoded for the Phase 3 "first stream" milestone. Real channel
// selection UI (categories, search, click-to-play) arrives in Phase 4.
const TEST_CHANNEL = { streamId: 17402, name: 'UK - BBC 1 HD' }

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
    <main className="flex min-h-svh flex-col items-center justify-center gap-6 bg-neutral-950 p-6 text-neutral-100">
      <div className="text-center">
        <h1 className="text-3xl font-semibold">IPTV Player</h1>
        <p className="mt-2 text-neutral-400">
          Phase 3 test harness — one hardcoded channel, replaced by real UI in
          Phase 4.
        </p>
      </div>

      {state.status === 'loading' && (
        <p className="text-neutral-400">Connecting to IPTV server…</p>
      )}

      {state.status === 'error' && (
        <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-4 text-red-400">
          <p>Login failed ({state.kind})</p>
          <p className="mt-1 text-red-300/80">{state.message}</p>
        </div>
      )}

      {state.status === 'success' && (
        <>
          <p className="text-sm text-neutral-400">
            Playing:{' '}
            <span className="text-neutral-200">{TEST_CHANNEL.name}</span>
          </p>
          <VideoPlayer
            src={buildLiveStreamUrl(TEST_CHANNEL.streamId, 'm3u8')}
          />
        </>
      )}
    </main>
  )
}

export default App
