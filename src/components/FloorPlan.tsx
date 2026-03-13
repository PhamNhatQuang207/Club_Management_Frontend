import React from 'react'
import { motion } from 'framer-motion'
import type { Resource } from '../types'
import { ResourceCard } from './ResourceCard'

interface FloorPlanProps {
  resources: Resource[]
  onResourceClick?: (resource: Resource) => void
  isAdmin?: boolean
}

const SectionHeader: React.FC<{
  icon: React.ReactNode
  title: string
  count: number
  available: number
}> = ({ icon, title, count, available }) => (
  <div className="flex items-center justify-between mb-6 pb-4 border-b border-zinc-800/60">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl bg-zinc-800/80 flex items-center justify-center text-lg">
        {icon}
      </div>
      <div>
        <h2 className="font-display text-xl md:text-2xl text-zinc-100 tracking-wide">
          {title}
        </h2>
        <p className="text-[11px] text-zinc-500 font-sans tracking-widest uppercase mt-0.5">
          {available} of {count} available
        </p>
      </div>
    </div>
    <div className="flex items-center gap-2">
      <div className="px-2.5 py-1 rounded-lg bg-zinc-800/60 border border-zinc-700/30 font-mono text-xs text-zinc-400">
        {count}
      </div>
    </div>
  </div>
)

export const FloorPlan: React.FC<FloorPlanProps> = ({
  resources,
  onResourceClick,
  isAdmin = false,
}) => {
  const billiards = resources.filter((r) => r.type === 'billiards')
  const bowling = resources.filter((r) => r.type === 'bowling')

  const billiardsAvailable = billiards.filter(r => r.status === 'available').length
  const bowlingAvailable = bowling.filter(r => r.status === 'available').length

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08 }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } }
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 md:px-8 relative">
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">

        {/* ═══ Billiards Section ═══ */}
        <motion.div
          className="lg:col-span-8 bg-zinc-900/30 p-5 md:p-8 rounded-3xl border border-zinc-800/40 shadow-2xl backdrop-blur-md"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <SectionHeader icon="🎱" title="Billiards Hall" count={billiards.length} available={billiardsAvailable} />

          {billiards.length > 0 ? (
            <motion.div
              className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-5"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {billiards.map((resource) => (
                <motion.div key={resource.id} className="aspect-[4/3]" variants={itemVariants}>
                  <ResourceCard
                    resource={resource}
                    onClick={() => onResourceClick?.(resource)}
                    isAdmin={isAdmin}
                  />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <EmptyState type="billiards" />
          )}
        </motion.div>

        {/* ═══ Bowling Section ═══ */}
        <motion.div
          className="lg:col-span-4 bg-zinc-900/30 p-5 md:p-8 rounded-3xl border border-zinc-800/40 shadow-2xl backdrop-blur-md"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
        >
          <SectionHeader icon="🎳" title="Bowling Lanes" count={bowling.length} available={bowlingAvailable} />

          {bowling.length > 0 ? (
            <motion.div
              className="flex flex-row flex-wrap justify-center gap-4"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {bowling.map((resource) => (
                <motion.div key={resource.id} className="w-24 h-64 md:w-28 md:h-72" variants={itemVariants}>
                  <ResourceCard
                    resource={resource}
                    onClick={() => onResourceClick?.(resource)}
                    isAdmin={isAdmin}
                  />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <EmptyState type="bowling" />
          )}
        </motion.div>
      </div>
    </div>
  )
}

const EmptyState: React.FC<{ type: 'billiards' | 'bowling' }> = ({ type }) => (
  <div className="flex flex-col items-center justify-center py-12 text-center">
    <div className="text-4xl mb-3 opacity-30">
      {type === 'billiards' ? '🎱' : '🎳'}
    </div>
    <p className="text-zinc-500 font-sans text-sm">
      No {type === 'billiards' ? 'billiard tables' : 'bowling lanes'} configured yet.
    </p>
    <p className="text-zinc-600 font-sans text-xs mt-1">
      An admin can add them from the Control Panel.
    </p>
  </div>
)
