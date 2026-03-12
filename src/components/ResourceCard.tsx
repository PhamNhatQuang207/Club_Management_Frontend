import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Resource } from '../types'

interface ResourceCardProps {
  resource: Resource
  onClick?: () => void
  isAdmin?: boolean
}

// Map status to a specific styling theme (Dark Industrial Luxe)
const statusConfig = {
  available: {
    bg: 'bg-emerald-900/30',
    border: 'border-emerald-500/50',
    text: 'text-emerald-400',
    label: 'Available',
    glow: 'shadow-[0_0_15px_rgba(16,185,129,0.15)]',
  },
  occupied: {
    bg: 'bg-red-900/30',
    border: 'border-red-500/50',
    text: 'text-red-400',
    label: 'Occupied',
    glow: 'shadow-[0_0_15px_rgba(239,68,68,0.15)]',
  },
  cleaning: {
    bg: 'bg-amber-900/30',
    border: 'border-amber-500/50',
    text: 'text-amber-400',
    label: 'Cleaning',
    glow: 'shadow-[0_0_15px_rgba(245,158,11,0.15)]',
  },
  maintenance: {
    bg: 'bg-slate-800/50',
    border: 'border-slate-600/50',
    text: 'text-slate-400',
    label: 'Maintenance',
    glow: '',
  },
}

// Helper to format elapsed time based on 'updatedAt' timestamp
const formatElapsedTime = (startStr: string) => {
  const start = new Date(startStr).getTime()
  const now = Date.now()
  const diffInSeconds = Math.floor((now - start) / 1000)

  if (diffInSeconds < 0) return '00:00'

  const hours = Math.floor(diffInSeconds / 3600)
  const minutes = Math.floor((diffInSeconds % 3600) / 60)
  const seconds = diffInSeconds % 60

  return [
    hours > 0 ? hours.toString().padStart(2, '0') : null,
    minutes.toString().padStart(2, '0'),
    seconds.toString().padStart(2, '0'),
  ]
    .filter(Boolean)
    .join(':')
}

export const ResourceCard: React.FC<ResourceCardProps> = ({
  resource,
  onClick,
  isAdmin = false,
}) => {
  const config = statusConfig[resource.status]
  
  // Timer state for occupied resources
  const [elapsed, setElapsed] = useState<string>('')

  useEffect(() => {
    if (resource.status !== 'occupied') {
      setElapsed('')
      return
    }

    // Initial calculation
    setElapsed(formatElapsedTime(resource.updatedAt))

    // Update every second
    const interval = setInterval(() => {
      setElapsed(formatElapsedTime(resource.updatedAt))
    }, 1000)

    return () => clearInterval(interval)
  }, [resource.status, resource.updatedAt])

  return (
    <motion.button
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={isAdmin ? { scale: 1.02 } : {}}
      whileTap={isAdmin ? { scale: 0.98 } : {}}
      onClick={isAdmin ? onClick : undefined}
      className={`relative overflow-hidden rounded-xl border backdrop-blur-sm p-4 flex flex-col items-center justify-center transition-all duration-300 w-full h-full min-h-[120px] ${config.bg} ${config.border} ${config.glow} ${isAdmin ? 'cursor-pointer hover:shadow-lg' : 'cursor-default'}`}
      style={{
        // Add a subtle texture overlay via background image if desired
        backgroundImage: 'radial-gradient(circle at center, rgba(255,255,255,0.03) 0%, transparent 100%)'
      }}
    >
      {/* Background animated pulse for occupied state */}
      {resource.status === 'occupied' && (
        <motion.div
          className="absolute inset-0 bg-red-500/5 mix-blend-overlay"
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}

      <div className="z-10 text-center">
        <h3 className="font-display text-xl md:text-2xl font-semibold tracking-wide text-zinc-100 mb-1">
          {resource.name}
        </h3>
        
        <div className={`font-sans text-xs md:text-sm font-medium tracking-wider uppercase mb-2 ${config.text}`}>
          {config.label}
        </div>

        {resource.status === 'occupied' && elapsed && (
          <div className="font-mono text-sm tracking-widest text-zinc-300 tabular-nums">
            {elapsed}
          </div>
        )}
      </div>
    </motion.button>
  )
}
