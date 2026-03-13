import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Resource } from '../types'

interface ResourceCardProps {
  resource: Resource
  onClick?: () => void
  isAdmin?: boolean
}

const statusConfig = {
  available: {
    bg: 'bg-emerald-900/30',
    border: 'border-emerald-500/40',
    text: 'text-emerald-400',
    label: 'Available',
    glow: 'shadow-[0_0_20px_rgba(16,185,129,0.12)]',
    dot: 'bg-emerald-500',
  },
  occupied: {
    bg: 'bg-red-900/30',
    border: 'border-red-500/40',
    text: 'text-red-400',
    label: 'Occupied',
    glow: 'shadow-[0_0_20px_rgba(239,68,68,0.12)]',
    dot: 'bg-red-500',
  },
  cleaning: {
    bg: 'bg-amber-900/30',
    border: 'border-amber-500/40',
    text: 'text-amber-400',
    label: 'Cleaning',
    glow: 'shadow-[0_0_20px_rgba(245,158,11,0.12)]',
    dot: 'bg-amber-500',
  },
  maintenance: {
    bg: 'bg-slate-800/50',
    border: 'border-slate-600/40',
    text: 'text-slate-400',
    label: 'Maintenance',
    glow: '',
    dot: 'bg-slate-500',
  },
}

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
  const [elapsed, setElapsed] = useState<string>('')

  useEffect(() => {
    if (resource.status !== 'occupied') {
      setElapsed('')
      return
    }
    setElapsed(formatElapsedTime(resource.updatedAt))
    const interval = setInterval(() => {
      setElapsed(formatElapsedTime(resource.updatedAt))
    }, 1000)
    return () => clearInterval(interval)
  }, [resource.status, resource.updatedAt])

  // ─── Billiard Table SVG ───
  const renderBilliardsSVG = () => {
    const feltColor = resource.status === 'available' ? '#155e3b'
      : resource.status === 'occupied' ? '#7f1d1d'
      : resource.status === 'cleaning' ? '#78350f'
      : '#1e293b'

    return (
      <svg viewBox="0 0 180 110" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          {/* Wood grain pattern */}
          <pattern id={`wood-${resource.id}`} patternUnits="userSpaceOnUse" width="8" height="8">
            <rect width="8" height="8" fill="#3D2512" />
            <line x1="0" y1="2" x2="8" y2="2" stroke="#4a2e18" strokeWidth="0.5" opacity="0.5" />
            <line x1="0" y1="5" x2="8" y2="5" stroke="#4a2e18" strokeWidth="0.3" opacity="0.3" />
          </pattern>
          {/* Felt texture */}
          <filter id={`felt-${resource.id}`}>
            <feTurbulence baseFrequency="0.9" numOctaves="4" result="noise" />
            <feColorMatrix type="saturate" values="0" in="noise" result="mono" />
            <feBlend in="SourceGraphic" in2="mono" mode="multiply" result="blend" />
          </filter>
          {/* Soft inner shadow */}
          <filter id={`inner-shadow-${resource.id}`}>
            <feGaussianBlur in="SourceAlpha" stdDeviation="3" result="blur" />
            <feOffset dx="0" dy="1" result="offsetBlur" />
            <feComposite in="SourceGraphic" in2="offsetBlur" operator="over" />
          </filter>
        </defs>

        {/* Drop shadow */}
        <rect x="6" y="6" width="168" height="98" rx="7" fill="rgba(0,0,0,0.4)" />

        {/* Outer wooden rail */}
        <rect x="3" y="3" width="174" height="104" rx="8" fill={`url(#wood-${resource.id})`} stroke="#2D1A0D" strokeWidth="1.5" />

        {/* Inner cushion rail */}
        <rect x="10" y="10" width="160" height="90" rx="4" fill="#2a1509" stroke="#1a0e06" strokeWidth="1" />

        {/* Felt surface */}
        <motion.rect
          x="14" y="14" width="152" height="82" rx="2"
          fill={feltColor}
          animate={{ fillOpacity: resource.status === 'occupied' ? [0.85, 1, 0.85] : 1 }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Felt micro texture overlay */}
        <rect x="14" y="14" width="152" height="82" rx="2" fill="rgba(255,255,255,0.015)" />

        {/* Center line */}
        <line x1="90" y1="14" x2="90" y2="96" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />

        {/* Head string */}
        <line x1="50" y1="14" x2="50" y2="96" stroke="rgba(255,255,255,0.04)" strokeWidth="0.5" strokeDasharray="3 3" />

        {/* Foot spot */}
        <circle cx="130" cy="55" r="1.2" fill="rgba(255,255,255,0.15)" />

        {/* Head spot */}
        <circle cx="50" cy="55" r="1.2" fill="rgba(255,255,255,0.15)" />

        {/* 6 Pockets */}
        {[[16, 16], [90, 13], [164, 16], [16, 94], [90, 97], [164, 94]].map(([cx, cy], i) => (
          <g key={i}>
            <circle cx={cx} cy={cy} r="5.5" fill="#0d0d0d" />
            <circle cx={cx} cy={cy} r="4" fill="#111" />
            <circle cx={cx} cy={cy} r="2.5" fill="#000" />
          </g>
        ))}

        {/* Diamond sights on rails */}
        {[32, 50, 68, 112, 130, 148].map((x, i) => (
          <g key={`top-${i}`}>
            <circle cx={x} cy="11.5" r="0.8" fill="#C4A35A" />
            <circle cx={x} cy="98.5" r="0.8" fill="#C4A35A" />
          </g>
        ))}
        {[30, 55, 80].map((y, i) => (
          <g key={`side-${i}`}>
            <circle cx="11.5" cy={y} r="0.8" fill="#C4A35A" />
            <circle cx="168.5" cy={y} r="0.8" fill="#C4A35A" />
          </g>
        ))}

        {/* Balls on table (occupied) */}
        <AnimatePresence>
          {resource.status === 'occupied' && (
            <motion.g
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              {/* Cue ball */}
              <circle cx="45" cy="55" r="3" fill="#f5f5f5" stroke="#ddd" strokeWidth="0.3" />
              <circle cx="44" cy="54" r="0.6" fill="rgba(255,255,255,0.5)" />

              {/* Rack formation */}
              <circle cx="125" cy="55" r="3" fill="#eab308" stroke="#ca8a04" strokeWidth="0.3" />
              <circle cx="131" cy="51.5" r="3" fill="#ef4444" stroke="#dc2626" strokeWidth="0.3" />
              <circle cx="131" cy="58.5" r="3" fill="#3b82f6" stroke="#2563eb" strokeWidth="0.3" />
              <circle cx="137" cy="48" r="3" fill="#a855f7" stroke="#9333ea" strokeWidth="0.3" />
              <circle cx="137" cy="55" r="3" fill="#111" stroke="#333" strokeWidth="0.3" />
              <circle cx="137" cy="62" r="3" fill="#f97316" stroke="#ea580c" strokeWidth="0.3" />

              {/* Cue stick */}
              <motion.line
                x1="20" y1="72" x2="43" y2="56"
                stroke="#C19A6B" strokeWidth="1.5" strokeLinecap="round"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0.5, 0.8, 0.5] }}
                transition={{ duration: 3, repeat: Infinity }}
              />
            </motion.g>
          )}
        </AnimatePresence>

        {/* Cleaning sparkle (cleaning state) */}
        <AnimatePresence>
          {resource.status === 'cleaning' && (
            <motion.g
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.text x="80" y="60" textAnchor="middle" fontSize="20" fill="rgba(255,255,255,0.3)"
                animate={{ opacity: [0.2, 0.5, 0.2], scale: [0.9, 1.1, 0.9] }}
                transition={{ duration: 2, repeat: Infinity }}
              >✦</motion.text>
            </motion.g>
          )}
        </AnimatePresence>

        {/* Maintenance X (maintenance state) */}
        {resource.status === 'maintenance' && (
          <g opacity="0.2">
            <line x1="40" y1="35" x2="140" y2="75" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
            <line x1="140" y1="35" x2="40" y2="75" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
          </g>
        )}
      </svg>
    )
  }

  // ─── Bowling Lane SVG ───
  const renderBowlingSVG = () => {
    const laneColor = resource.status === 'available' ? '#B8956A'
      : resource.status === 'occupied' ? '#6b2121'
      : resource.status === 'cleaning' ? '#6b4f21'
      : '#334155'

    return (
      <svg viewBox="0 0 70 220" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id={`lane-grad-${resource.id}`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="rgba(0,0,0,0.15)" />
            <stop offset="50%" stopColor="rgba(255,255,255,0.02)" />
            <stop offset="100%" stopColor="rgba(0,0,0,0.15)" />
          </linearGradient>
        </defs>

        {/* Gutters */}
        <rect x="0" y="0" width="11" height="220" rx="2" fill="#181818" />
        <rect x="59" y="0" width="11" height="220" rx="2" fill="#181818" />

        {/* Gutter depth */}
        <rect x="9" y="0" width="2" height="220" fill="rgba(0,0,0,0.3)" />
        <rect x="59" y="0" width="2" height="220" fill="rgba(0,0,0,0.3)" />

        {/* Lane surface */}
        <motion.rect
          x="11" y="0" width="48" height="220" rx="1"
          fill={laneColor}
          animate={{ fillOpacity: resource.status === 'occupied' ? [0.85, 1, 0.85] : 1 }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Lane boards (wood grain) */}
        {[19, 27, 35, 43, 51].map((x, i) => (
          <line key={i} x1={x} y1="0" x2={x} y2="220" stroke="rgba(0,0,0,0.08)" strokeWidth="0.5" />
        ))}

        {/* Gradient overlay for depth */}
        <rect x="11" y="0" width="48" height="220" fill={`url(#lane-grad-${resource.id})`} />

        {/* Approach dots */}
        {[25, 30, 35, 40, 45].map((x, i) => (
          <circle key={`dot-${i}`} cx={x} cy="200" r="1" fill="rgba(0,0,0,0.15)" />
        ))}

        {/* Arrows */}
        {[22, 28, 35, 42, 48].map((x, i) => (
          <path key={`arrow-${i}`} d={`M ${x} 165 L ${x-2} 172 L ${x+2} 172 Z`} fill="rgba(0,0,0,0.12)" />
        ))}

        {/* Foul line */}
        <line x1="11" y1="185" x2="59" y2="185" stroke="rgba(0,0,0,0.2)" strokeWidth="1" />

        {/* Pin deck */}
        <rect x="11" y="0" width="48" height="35" fill="rgba(0,0,0,0.08)" rx="1" />

        {/* 10 Pins (realistic shape) */}
        {[
          [35, 30],
          [30, 24], [40, 24],
          [25, 18], [35, 18], [45, 18],
          [20, 12], [30, 12], [40, 12], [50, 12],
        ].map(([cx, cy], i) => (
          <g key={`pin-${i}`}>
            <rect x={cx! - 1.5} y={cy! - 3} width="3" height="6" rx="1.2" fill="#f5f5f5" stroke="#ccc" strokeWidth="0.3" />
            <rect x={cx! - 1} y={cy! + 0} width="2" height="1.5" fill="#dc2626" rx="0.5" />
          </g>
        ))}

        {/* Bowling Ball (occupied) */}
        <AnimatePresence>
          {resource.status === 'occupied' && (
            <motion.g>
              <motion.circle
                r="5"
                fill="#1e40af"
                stroke="#1e3a8a"
                strokeWidth="0.5"
                initial={{ cy: 210, cx: 35, opacity: 0 }}
                animate={{ cy: [210, 45], cx: [35, 33], opacity: 1 }}
                transition={{ duration: 1.8, repeat: Infinity, ease: "easeIn", repeatDelay: 0.5 }}
              />
              {/* Finger holes */}
              <motion.circle r="1" fill="#111"
                initial={{ cy: 208, cx: 34 }}
                animate={{ cy: [208, 43], cx: [34, 32] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: "easeIn", repeatDelay: 0.5 }}
              />
              <motion.circle r="1" fill="#111"
                initial={{ cy: 208, cx: 37 }}
                animate={{ cy: [208, 43], cx: [37, 35] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: "easeIn", repeatDelay: 0.5 }}
              />
            </motion.g>
          )}
        </AnimatePresence>

        {/* Cleaning sparkle */}
        <AnimatePresence>
          {resource.status === 'cleaning' && (
            <motion.text x="35" y="120" textAnchor="middle" fontSize="18" fill="rgba(255,255,255,0.3)"
              animate={{ opacity: [0.2, 0.5, 0.2] }}
              transition={{ duration: 2, repeat: Infinity }}
            >✦</motion.text>
          )}
        </AnimatePresence>

        {/* Maintenance X */}
        {resource.status === 'maintenance' && (
          <g opacity="0.15">
            <line x1="18" y1="60" x2="52" y2="160" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
            <line x1="52" y1="60" x2="18" y2="160" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
          </g>
        )}
      </svg>
    )
  }

  return (
    <motion.button
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={isAdmin ? { scale: 1.03, y: -4 } : { scale: 1.01 }}
      whileTap={isAdmin ? { scale: 0.97 } : {}}
      onClick={isAdmin ? onClick : undefined}
      className={`group relative overflow-hidden rounded-2xl border backdrop-blur-sm transition-all duration-300 w-full h-full flex items-center justify-center p-0 ${config.bg} ${config.border} ${config.glow} ${isAdmin ? 'cursor-pointer' : 'cursor-default'}`}
    >
      {/* SVG Container */}
      <div className="absolute inset-0 z-0 flex items-center justify-center p-2 md:p-3">
        {resource.type === 'billiards' ? renderBilliardsSVG() : renderBowlingSVG()}
      </div>

      {/* Info overlay */}
      <div className={`absolute bottom-0 left-0 right-0 p-2.5 md:p-3 bg-zinc-950/75 backdrop-blur-lg border-t ${config.border} flex justify-between items-center z-10 transition-all`}>
        <div className="min-w-0">
          <h3 className="font-display text-xs md:text-sm font-semibold tracking-wide text-zinc-100 flex items-center gap-1.5 truncate">
            <span className={`w-1.5 h-1.5 rounded-full ${config.dot} flex-shrink-0`} />
            {resource.name}
          </h3>
          <div className={`font-sans text-[9px] md:text-[10px] font-semibold tracking-widest uppercase mt-0.5 ${config.text}`}>
            {config.label}
          </div>
        </div>

        {resource.status === 'occupied' && elapsed && (
          <div className="font-mono text-[10px] md:text-xs tracking-wider text-zinc-300 tabular-nums bg-zinc-900/90 px-1.5 py-0.5 rounded border border-zinc-800 flex-shrink-0 ml-2">
            {elapsed}
          </div>
        )}
      </div>
    </motion.button>
  )
}
