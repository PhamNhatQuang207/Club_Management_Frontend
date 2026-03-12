import React from 'react'
import { motion } from 'framer-motion'
import { useResources } from '../hooks/useResources'
import { FloorPlan } from '../components/FloorPlan'
import { useSocket } from '../hooks/useSocket'

export const Home: React.FC = () => {
  const { data: resources, isLoading, error } = useResources()
  const { isConnected } = useSocket()

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-zinc-100 selection:bg-emerald-500/30">
      {/* Dynamic grain overlay for texture */}
      <div 
        className="fixed inset-0 opacity-[0.03] pointer-events-none mix-blend-screen"
        style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }}
      />

      <header className="relative z-10 p-6 md:p-10 flex items-center justify-between max-w-7xl mx-auto">
        <div>
          <h1 className="font-display text-3xl md:text-5xl font-bold tracking-tight text-white mb-2">
            The Continental Club
          </h1>
          <p className="font-sans text-zinc-400 text-sm md:text-base tracking-wide flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              {isConnected && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              )}
              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isConnected ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
            </span>
            {isConnected ? 'LIVE VIEW' : 'CONNECTING...'}
          </p>
        </div>
        
        {/* We will add a Link to /login here later via standard React Router setup */}
      </header>

      <main className="relative z-10 pb-20">
        {isLoading ? (
          <div className="flex h-[60vh] items-center justify-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-8 h-8 border-2 border-emerald-500/20 border-t-emerald-500 rounded-full"
            />
          </div>
        ) : error ? (
          <div className="flex h-[60vh] items-center justify-center text-red-500 font-sans p-4 text-center">
            Failed to load club layout. Please check connection to the server.
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
    </div>
  )
}
