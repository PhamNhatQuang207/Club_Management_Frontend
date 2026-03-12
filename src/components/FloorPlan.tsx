import React from 'react'
import type { Resource } from '../types'
import { ResourceCard } from './ResourceCard'

interface FloorPlanProps {
  resources: Resource[]
  onResourceClick?: (resource: Resource) => void
  isAdmin?: boolean
}

export const FloorPlan: React.FC<FloorPlanProps> = ({
  resources,
  onResourceClick,
  isAdmin = false,
}) => {
  // Separate resources by type
  const billiards = resources.filter((r) => r.type === 'billiards')
  const bowling = resources.filter((r) => r.type === 'bowling')

  return (
    <div className="w-full max-w-6xl mx-auto p-4 md:p-8 relative">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] opacity-20 pointer-events-none rounded-3xl" />
      
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Billiards Section (Left/Top) */}
        <div className="lg:col-span-8 bg-zinc-900/40 p-6 md:p-8 rounded-3xl border border-zinc-800/50 shadow-2xl backdrop-blur-md">
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-zinc-800/80">
            <h2 className="font-display text-2xl md:text-3xl text-zinc-100 tracking-wider">
              Billiards Hall
            </h2>
            <div className="flex space-x-2">
              <div className="w-3 h-3 rounded-full bg-emerald-500/50" />
              <div className="w-3 h-3 rounded-full bg-red-500/50" />
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            {billiards.map((resource) => (
              <div key={resource.id} className="aspect-[4/3]">
                <ResourceCard
                  resource={resource}
                  onClick={() => onResourceClick?.(resource)}
                  isAdmin={isAdmin}
                />
              </div>
            ))}
            {billiards.length === 0 && (
              <div className="col-span-full h-32 flex items-center justify-center text-zinc-500 font-sans italic">
                No billiard tables configured.
              </div>
            )}
          </div>
        </div>

        {/* Bowling Section (Right/Bottom) */}
        <div className="lg:col-span-4 bg-zinc-900/40 p-6 md:p-8 rounded-3xl border border-zinc-800/50 shadow-2xl backdrop-blur-md">
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-zinc-800/80">
            <h2 className="font-display text-2xl md:text-3xl text-zinc-100 tracking-wider">
              Bowling Lanes
            </h2>
          </div>

          <div className="flex flex-col space-y-4">
            {bowling.map((resource) => (
              <div key={resource.id} className="h-24">
                <ResourceCard
                  resource={resource}
                  onClick={() => onResourceClick?.(resource)}
                  isAdmin={isAdmin}
                />
              </div>
            ))}
            {bowling.length === 0 && (
              <div className="h-32 flex items-center justify-center text-zinc-500 font-sans italic">
                No bowling lanes configured.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
