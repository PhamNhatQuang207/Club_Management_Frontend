import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Resource } from '../types'

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

  const renderBilliardsSVG = () => (
    <svg viewBox="0 0 160 100" className="w-full h-full drop-shadow-xl p-2" xmlns="http://www.w3.org/2000/svg">
      {/* Wooden Frame */}
      <rect x="5" y="5" width="150" height="90" rx="6" fill="#452B18" stroke="#2D1A0D" strokeWidth="2" />
      {/* Felt */}
      <motion.rect 
        x="13" y="13" width="134" height="74" rx="2" 
        className={resource.status === 'available' ? 'fill-emerald-800' : resource.status === 'occupied' ? 'fill-red-800' : resource.status === 'cleaning' ? 'fill-amber-800' : 'fill-slate-800'}
        animate={{ fillOpacity: resource.status === 'occupied' ? [0.8, 1, 0.8] : 1 }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* Table markings / lines */}
      <line x1="80" y1="13" x2="80" y2="87" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
      <circle cx="45" cy="50" r="1.5" fill="rgba(255,255,255,0.2)" />
      
      {/* 6 Pockets */}
      <circle cx="15" cy="15" r="4.5" fill="#1A1A1A" />
      <circle cx="80" cy="15" r="4.5" fill="#1A1A1A" />
      <circle cx="145" cy="15" r="4.5" fill="#1A1A1A" />
      <circle cx="15" cy="85" r="4.5" fill="#1A1A1A" />
      <circle cx="80" cy="85" r="4.5" fill="#1A1A1A" />
      <circle cx="145" cy="85" r="4.5" fill="#1A1A1A" />
      
      {/* Balls (only visible if occupied) */}
      <AnimatePresence>
        {resource.status === 'occupied' && (
          <motion.g
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Cue ball */}
            <circle cx="35" cy="50" r="2.5" fill="#ffffff" />
            {/* Pyramid */}
            <circle cx="110" cy="50" r="2.5" fill="#eab308" />
            
            <circle cx="115" cy="47" r="2.5" fill="#ef4444" />
            <circle cx="115" cy="53" r="2.5" fill="#14b8a6" />
            
            <circle cx="120" cy="44" r="2.5" fill="#a855f7" />
            <circle cx="120" cy="50" r="2.5" fill="#222222" />
            <circle cx="120" cy="56" r="2.5" fill="#f97316" />
          </motion.g>
        )}
      </AnimatePresence>
    </svg>
  );

  const renderBowlingSVG = () => (
    <svg viewBox="0 0 60 200" className="w-full h-full drop-shadow-xl px-[10%]" xmlns="http://www.w3.org/2000/svg">
      {/* Gutters */}
      <rect x="0" y="0" width="10" height="200" fill="#202020" />
      <rect x="50" y="0" width="10" height="200" fill="#202020" />
      
      {/* Lane */}
      <motion.rect 
        x="10" y="0" width="40" height="200" 
        className={resource.status === 'available' ? 'fill-[#C19A6B]' : resource.status === 'occupied' ? 'fill-red-900/80' : resource.status === 'cleaning' ? 'fill-amber-900/80' : 'fill-slate-800'}
        animate={{ fillOpacity: resource.status === 'occupied' ? [0.8, 1, 0.8] : 1 }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      />
      
      {/* Lane markings / arrows */}
      <path d="M 30 160 L 25 170 L 35 170 Z" fill="rgba(0,0,0,0.2)" />
      
      {/* Pins Area */}
      <rect x="10" y="5" width="40" height="30" fill="rgba(0,0,0,0.1)" />
      
      {/* 10 Pins */}
      <circle cx="30" cy="28" r="1.5" fill="#fff" />
      
      <circle cx="26" cy="22" r="1.5" fill="#fff" />
      <circle cx="34" cy="22" r="1.5" fill="#fff" />
      
      <circle cx="22" cy="16" r="1.5" fill="#fff" />
      <circle cx="30" cy="16" r="1.5" fill="#fff" />
      <circle cx="38" cy="16" r="1.5" fill="#fff" />
      
      <circle cx="18" cy="10" r="1.5" fill="#fff" />
      <circle cx="26" cy="10" r="1.5" fill="#fff" />
      <circle cx="34" cy="10" r="1.5" fill="#fff" />
      <circle cx="42" cy="10" r="1.5" fill="#fff" />

      {/* Bowling Ball (only if occupied) */}
      <AnimatePresence>
        {resource.status === 'occupied' && (
          <motion.circle 
            r="4" 
            fill="#38bdf8"
            initial={{ cy: 190, cx: 30, opacity: 0 }}
            animate={{ cy: [190, 40], cx: [30, 25], opacity: 1 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeIn" }}
          />
        )}
      </AnimatePresence>
    </svg>
  );

  return (
    <motion.button
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={isAdmin ? { scale: 1.02, y: -4 } : {}}
      whileTap={isAdmin ? { scale: 0.98 } : {}}
      onClick={isAdmin ? onClick : undefined}
      className={`relative overflow-hidden rounded-2xl border backdrop-blur-sm transition-all duration-300 w-full h-full flex items-center justify-center p-0 ${config.bg} ${config.border} ${config.glow} ${isAdmin ? 'cursor-pointer hover:shadow-[0_8px_30px_rgb(0,0,0,0.3)]' : 'cursor-default'}`}
    >
      {/* SVG Container */}
      <div className="absolute inset-0 z-0 flex items-center justify-center p-2">
        {resource.type === 'billiards' ? renderBilliardsSVG() : renderBowlingSVG()}
      </div>

      {/* Hover/Info Overlay */}
      <div className={`absolute bottom-0 left-0 right-0 p-3 bg-zinc-950/70 backdrop-blur-md border-t ${config.border} flex justify-between items-center z-10`}>
        <div>
          <h3 className="font-display text-sm md:text-base font-semibold tracking-wide text-zinc-100 flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${config.bg.replace('/30', '')} shadow-lg shadow-current`} />
            {resource.name}
          </h3>
          <div className={`font-sans text-[10px] md:text-xs font-semibold tracking-wider uppercase mt-0.5 ${config.text}`}>
            {config.label}
          </div>
        </div>

        {resource.status === 'occupied' && elapsed && (
          <div className="font-mono text-xs md:text-sm tracking-widest text-zinc-300 tabular-nums bg-zinc-900/80 px-2 py-1 rounded border border-zinc-800">
            {elapsed}
          </div>
        )}
      </div>
    </motion.button>
  )
}
