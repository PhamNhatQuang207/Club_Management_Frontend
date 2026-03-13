import React, { useMemo } from 'react'
import { motion } from 'framer-motion'
import { useResources } from '../hooks/useResources'
import { FloorPlan } from '../components/FloorPlan'
import { useSocket } from '../hooks/useSocket'
import { useClubName } from '../hooks/useClubName'
import type { Resource } from '../types'

const StatusLegend: React.FC = () => (
  <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
    {[
      { color: 'bg-emerald-500', label: 'Available' },
      { color: 'bg-red-500', label: 'Occupied' },
      { color: 'bg-amber-500', label: 'Cleaning' },
      { color: 'bg-slate-500', label: 'Maintenance' },
    ].map(({ color, label }) => (
      <div key={label} className="flex items-center gap-2">
        <div className={`w-2.5 h-2.5 rounded-full ${color}`} />
        <span className="text-xs text-zinc-400 font-sans tracking-wide">{label}</span>
      </div>
    ))}
  </div>
)

const StatsBar: React.FC<{ resources: Resource[] }> = ({ resources }) => {
  const stats = useMemo(() => {
    const total = resources.length
    const available = resources.filter(r => r.status === 'available').length
    const occupied = resources.filter(r => r.status === 'occupied').length
    const cleaning = resources.filter(r => r.status === 'cleaning').length
    const maintenance = resources.filter(r => r.status === 'maintenance').length
    const occupancy = total > 0 ? Math.round((occupied / total) * 100) : 0

    return { total, available, occupied, cleaning, maintenance, occupancy }
  }, [resources])

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full max-w-4xl mx-auto">
      <StatCard value={stats.available} label="Available" accent="text-emerald-400" bar="bg-emerald-500" ratio={stats.total > 0 ? stats.available / stats.total : 0} />
      <StatCard value={stats.occupied} label="Occupied" accent="text-red-400" bar="bg-red-500" ratio={stats.total > 0 ? stats.occupied / stats.total : 0} />
      <StatCard value={stats.cleaning} label="Cleaning" accent="text-amber-400" bar="bg-amber-500" ratio={stats.total > 0 ? stats.cleaning / stats.total : 0} />
      <StatCard value={stats.occupancy} label="Occupancy %" accent="text-sky-400" bar="bg-sky-500" ratio={stats.occupancy / 100} isPercent />
    </div>
  )
}

const StatCard: React.FC<{
  value: number; label: string; accent: string; bar: string; ratio: number; isPercent?: boolean
}> = ({ value, label, accent, bar, ratio, isPercent }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-surface-2/50 backdrop-blur-md border border-zinc-800/60 rounded-2xl p-4 relative overflow-hidden"
  >
    <div className={`font-mono text-2xl md:text-3xl font-bold ${accent} mb-0.5`}>
      {value}{isPercent && '%'}
    </div>
    <div className="text-[11px] text-zinc-500 tracking-widest uppercase font-sans">{label}</div>
    {/* Progress Bar */}
    <div className="mt-3 h-1 bg-zinc-800 rounded-full overflow-hidden">
      <motion.div
        className={`h-full ${bar} rounded-full`}
        initial={{ width: 0 }}
        animate={{ width: `${Math.max(ratio * 100, 2)}%` }}
        transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
      />
    </div>
  </motion.div>
)

export const Home: React.FC = () => {
  const { data: resources, isLoading, error } = useResources()
  const { isConnected } = useSocket()
  const { clubName } = useClubName()

  const currentHour = new Date().getHours()
  const greeting = currentHour < 12 ? 'Good Morning' : currentHour < 17 ? 'Good Afternoon' : 'Good Evening'

  return (
    <div className="min-h-screen bg-surface-1 text-zinc-100 grain-overlay">
      {/* ═══ Ambient Background ═══ */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-emerald-500/[0.04] rounded-full blur-[120px] animate-glow-pulse" />
        <div className="absolute -bottom-20 -right-20 w-[400px] h-[400px] bg-sky-500/[0.03] rounded-full blur-[100px] animate-glow-pulse" style={{ animationDelay: '1.5s' }} />
      </div>

      {/* ═══ Header ═══ */}
      <header className="relative z-10 px-6 md:px-10 pt-8 md:pt-12 pb-6 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-zinc-500 font-sans text-sm mb-1 tracking-wide">{greeting}</p>
          <h1 className="font-display text-4xl md:text-6xl font-bold tracking-tight text-white mb-3">
            {clubName}
          </h1>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <span className="relative flex h-2.5 w-2.5">
                {isConnected && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                )}
                <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isConnected ? 'bg-emerald-500' : 'bg-red-500'}`} />
              </span>
              <span className="font-mono text-xs tracking-widest text-zinc-500 uppercase">
                {isConnected ? 'Live View' : 'Reconnecting...'}
              </span>
            </div>
            <StatusLegend />
          </div>
        </motion.div>
      </header>

      {/* ═══ Stats ═══ */}
      {!isLoading && !error && resources && (
        <section className="relative z-10 px-6 md:px-10 pb-6 max-w-7xl mx-auto">
          <StatsBar resources={resources} />
        </section>
      )}

      {/* ═══ Main Floor Plan ═══ */}
      <main className="relative z-10 pb-12">
        {isLoading ? (
          <div className="flex h-[50vh] items-center justify-center flex-col gap-4">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-10 h-10 border-2 border-emerald-500/20 border-t-emerald-500 rounded-full"
            />
            <p className="text-zinc-600 font-sans text-sm animate-pulse">Loading club layout…</p>
          </div>
        ) : error ? (
          <div className="flex h-[50vh] items-center justify-center">
            <div className="bg-red-900/10 border border-red-500/20 text-red-400 p-8 rounded-2xl text-center max-w-md">
              <div className="text-4xl mb-3">⚠</div>
              <p className="font-display text-xl mb-2">Connection Lost</p>
              <p className="text-sm text-red-400/70">Failed to load club layout. Please check connection to the server.</p>
            </div>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            <FloorPlan resources={resources || []} />
          </motion.div>
        )}
      </main>

      {/* ═══ Footer ═══ */}
      <footer className="relative z-10 border-t border-zinc-800/50 py-8 px-6 md:px-10 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-zinc-600 text-xs font-sans tracking-wide">
          <span>© {new Date().getFullYear()} The Continental Club — All rights reserved</span>
          <span className="font-mono text-[10px] text-zinc-700">
            Real-time powered by Socket.io
          </span>
        </div>
      </footer>
    </div>
  )
}
