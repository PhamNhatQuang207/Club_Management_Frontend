import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useLogin } from '../hooks/useAuth'
import { Link } from 'react-router-dom'

export const Login: React.FC = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const loginMutation = useLogin()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    loginMutation.mutate({ username, password })
  }

  return (
    <div className="min-h-screen bg-surface-1 flex items-center justify-center p-4 grain-overlay">
      {/* Ambient blurs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/3 w-80 h-80 bg-emerald-500/[0.06] rounded-full blur-[100px] animate-glow-pulse" />
        <div className="absolute bottom-1/4 right-1/3 w-64 h-64 bg-sky-500/[0.04] rounded-full blur-[80px] animate-glow-pulse" style={{ animationDelay: '1.5s' }} />
      </div>

      {/* Back link */}
      <Link
        to="/"
        className="absolute top-6 left-6 text-zinc-500 hover:text-zinc-300 transition-colors font-sans text-sm flex items-center gap-2 z-20"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        Back to Floor Plan
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="bg-zinc-900/50 backdrop-blur-2xl p-8 md:p-10 rounded-3xl border border-zinc-800/60 shadow-2xl">
          {/* Logo / Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
            </div>
          </div>

          <div className="text-center mb-8">
            <h1 className="font-display text-3xl text-zinc-100 tracking-wide mb-2">
              Staff Portal
            </h1>
            <p className="text-zinc-500 font-sans text-sm leading-relaxed">
              Sign in to manage tables, lanes, and resource status
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label
                htmlFor="username"
                className="block text-[11px] font-semibold tracking-widest text-zinc-400 uppercase"
              >
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full bg-zinc-950/60 border border-zinc-800 rounded-xl px-4 py-3.5 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all font-sans"
                placeholder="admin"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="password"
                className="block text-[11px] font-semibold tracking-widest text-zinc-400 uppercase"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-zinc-950/60 border border-zinc-800 rounded-xl px-4 py-3.5 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all font-sans"
                placeholder="••••••••"
              />
            </div>

            {loginMutation.isError && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3.5 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm font-sans text-center flex items-center justify-center gap-2"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
                Invalid credentials. Please try again.
              </motion.div>
            )}

            <button
              type="submit"
              disabled={loginMutation.isPending}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-3.5 px-4 rounded-xl transition-all flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/20"
            >
              {loginMutation.isPending ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <span>Sign In</span>
              )}
            </button>
          </form>

          <p className="text-center text-zinc-600 text-xs mt-6 font-sans">
            Protected area — authorized staff only
          </p>
        </div>
      </motion.div>
    </div>
  )
}
