import { useState, type FormEvent } from 'react'
import { motion } from 'motion/react'
import { Loader2, Eye, EyeOff } from 'lucide-react'
import logo from '../assets/logo-full.png'
import { useAuth } from '../app/AuthContext'
import { getEnvCredentials } from '../services/xtreamApi'

export function LoginPage() {
  const { state, login } = useAuth()
  const envDefaults = getEnvCredentials()
  const [serverUrl, setServerUrl] = useState(envDefaults.serverUrl)
  const [username, setUsername] = useState(envDefaults.username)
  const [password, setPassword] = useState(envDefaults.password)
  const [showPassword, setShowPassword] = useState(false)

  const isLoading = state.status === 'loading'

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    void login({ serverUrl, username, password })
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-6">
      <div className="bg-primary/20 pointer-events-none absolute top-1/4 left-1/2 h-[420px] w-[420px] -translate-x-1/2 rounded-full blur-[120px]" />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="relative w-full max-w-sm"
      >
        <div className="mb-10 flex flex-col items-center gap-4">
          <img
            src={logo}
            alt="VAE IPTV"
            className="h-28 w-auto drop-shadow-[0_0_30px_rgba(192,193,255,0.35)]"
          />
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-surface-container/70 border-outline-variant/30 flex flex-col gap-4 rounded-2xl border p-6 shadow-2xl backdrop-blur-xl"
        >
          <h1 className="text-on-surface text-headline-md mb-1 text-center font-bold">
            Enter Xtream Code Login
          </h1>
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
              className="bg-surface-container-high text-on-surface border-outline-variant/30 focus:border-primary w-full rounded-lg border px-4 py-3 outline-none transition-colors"
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
              className="bg-surface-container-high text-on-surface border-outline-variant/30 focus:border-primary w-full rounded-lg border px-4 py-3 outline-none transition-colors"
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="text-on-surface-variant text-label-caps mb-1 block"
            >
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-surface-container-high text-on-surface border-outline-variant/30 focus:border-primary w-full rounded-lg border px-4 py-3 pr-11 outline-none transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="text-on-surface-variant hover:text-on-surface absolute top-1/2 right-3 -translate-y-1/2 outline-none"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {state.status === 'unauthenticated' && state.error && (
            <p className="text-error text-sm">{state.error}</p>
          )}

          <motion.button
            type="submit"
            disabled={isLoading}
            whileHover={{ scale: isLoading ? 1 : 1.02 }}
            whileTap={{ scale: isLoading ? 1 : 0.98 }}
            className="bg-primary text-on-primary mt-2 flex h-14 items-center justify-center gap-2 rounded-xl font-semibold shadow-[0_0_20px_rgba(192,193,255,0.25)] disabled:opacity-60"
          >
            {isLoading && <Loader2 size={18} className="animate-spin" />}
            {isLoading ? 'Connecting…' : 'Sign In'}
          </motion.button>
        </form>
      </motion.div>
    </main>
  )
}
