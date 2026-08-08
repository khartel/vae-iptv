import { useState, type FormEvent } from 'react'
import logo from '../assets/logo.png'
import { useAuth } from '../app/AuthContext'
import { getEnvCredentials } from '../services/xtreamApi'

export function LoginPage() {
  const { state, login } = useAuth()
  const envDefaults = getEnvCredentials()
  const [serverUrl, setServerUrl] = useState(envDefaults.serverUrl)
  const [username, setUsername] = useState(envDefaults.username)
  const [password, setPassword] = useState(envDefaults.password)

  const isLoading = state.status === 'loading'

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    void login({ serverUrl, username, password })
  }

  return (
    <main className="bg-background flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-4">
          <img src={logo} alt="VAE IPTV" className="h-16 w-auto rounded-lg" />
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-surface-container border-outline-variant/30 flex flex-col gap-4 rounded-2xl border p-6"
        >
          <div>
            <label
              htmlFor="serverUrl"
              className="text-on-surface-variant text-label-caps mb-1 block"
            >
              Server URL
            </label>
            <input
              id="serverUrl"
              type="text"
              required
              value={serverUrl}
              onChange={(e) => setServerUrl(e.target.value)}
              placeholder="http://your-server.com:port"
              className="bg-surface-container-high text-on-surface border-outline-variant/30 focus:border-primary w-full rounded-lg border px-4 py-3 outline-none"
            />
          </div>
          <div>
            <label
              htmlFor="username"
              className="text-on-surface-variant text-label-caps mb-1 block"
            >
              Username
            </label>
            <input
              id="username"
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="bg-surface-container-high text-on-surface border-outline-variant/30 focus:border-primary w-full rounded-lg border px-4 py-3 outline-none"
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="text-on-surface-variant text-label-caps mb-1 block"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-surface-container-high text-on-surface border-outline-variant/30 focus:border-primary w-full rounded-lg border px-4 py-3 outline-none"
            />
          </div>

          {state.status === 'unauthenticated' && state.error && (
            <p className="text-error text-sm">{state.error}</p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="bg-primary text-on-primary mt-2 flex h-14 items-center justify-center rounded-xl font-semibold transition-transform hover:scale-[1.02] disabled:opacity-60"
          >
            {isLoading ? 'Connecting…' : 'Sign In'}
          </button>
        </form>
      </div>
    </main>
  )
}
