import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useResources, useUpdateStatus } from '../hooks/useResources'
import { Resource, ResourceStatus } from '../types'
import { useAuth } from '../hooks/useAuth'
import { useSocket } from '../hooks/useSocket'

export const Admin: React.FC = () => {
  const { data: resources, isLoading, error } = useResources()
  const updateStatusMutation = useUpdateStatus()
  const { logout } = useAuth()
  const { isConnected } = useSocket()
  
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null)

  const handleStatusChange = (status: ResourceStatus) => {
    if (!selectedResource) return
    
    updateStatusMutation.mutate({ id: selectedResource.id, status })
    setSelectedResource(null) // close the modal after action
  }

  const billiards = resources?.filter((r) => r.type === 'billiards') || []
  const bowling = resources?.filter((r) => r.type === 'bowling') || []

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center p-4">
        <div className="bg-red-900/20 border border-red-500/50 text-red-400 p-6 rounded-2xl text-center">
          Failed to load resources. Refresh to try again.
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-zinc-100 pb-24">
      <header className="sticky top-0 z-40 bg-[#0a0a0b]/80 backdrop-blur-md border-b border-zinc-800/50 p-4 flex items-center justify-between">
        <div>
          <h1 className="font-display text-xl font-medium tracking-wide">
            Control Panel
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500' : 'bg-red-500'}`} />
            <span className="text-xs text-zinc-500 font-sans tracking-widest uppercase">
              {isConnected ? 'Online' : 'Offline'}
            </span>
          </div>
        </div>
        
        <button 
          onClick={logout}
          className="px-3 py-1.5 rounded-md border border-zinc-800 text-zinc-400 text-sm hover:bg-zinc-900 transition-colors"
        >
          Sign Out
        </button>
      </header>

      <main className="p-4 space-y-8 max-w-3xl mx-auto mt-4">
        {/* Billiards Category */}
        <section>
          <h2 className="text-zinc-500 font-sans text-xs tracking-widest uppercase mb-4 px-1">
            Billiards
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {billiards.map((resource) => (
              <AdminResourceCard 
                key={resource.id} 
                resource={resource} 
                onClick={() => setSelectedResource(resource)} 
              />
            ))}
          </div>
        </section>

        {/* Bowling Category */}
        <section>
          <h2 className="text-zinc-500 font-sans text-xs tracking-widest uppercase mb-4 px-1 mt-8">
            Bowling Lanes
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {bowling.map((resource) => (
              <AdminResourceCard 
                key={resource.id} 
                resource={resource} 
                onClick={() => setSelectedResource(resource)} 
              />
            ))}
          </div>
        </section>
      </main>

      {/* Mobile-optimized Action Modal (Bottom Sheet style) */}
      <AnimatePresence>
        {selectedResource && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedResource(null)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />
            
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 bg-zinc-900 border-t border-zinc-800 rounded-t-3xl p-6 z-50 max-w-3xl mx-auto pb-safe"
            >
              <div className="w-12 h-1.5 bg-zinc-800 rounded-full mx-auto mb-6" />
              
              <div className="text-center mb-8">
                <h3 className="text-2xl font-display font-medium text-white mb-1">
                  {selectedResource.name}
                </h3>
                <p className="text-zinc-400 text-sm capitalize">
                  Current: {selectedResource.status}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <StatusButton 
                  status="available" 
                  current={selectedResource.status} 
                  onClick={() => handleStatusChange('available')} 
                />
                <StatusButton 
                  status="occupied" 
                  current={selectedResource.status} 
                  onClick={() => handleStatusChange('occupied')} 
                />
                <StatusButton 
                  status="cleaning" 
                  current={selectedResource.status} 
                  onClick={() => handleStatusChange('cleaning')} 
                />
                <StatusButton 
                  status="maintenance" 
                  current={selectedResource.status} 
                  onClick={() => handleStatusChange('maintenance')} 
                />
              </div>
              
              <button 
                onClick={() => setSelectedResource(null)}
                className="w-full mt-4 py-4 text-zinc-500 font-medium tracking-wide"
              >
                Cancel
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

// Mini card optimized for admin list view
const AdminResourceCard: React.FC<{ resource: Resource, onClick: () => void }> = ({ resource, onClick }) => {
  const getStatusColor = (status: ResourceStatus) => {
    switch (status) {
      case 'available': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
      case 'occupied': return 'bg-red-500/20 text-red-400 border-red-500/30'
      case 'cleaning': return 'bg-amber-500/20 text-amber-400 border-amber-500/30'
      case 'maintenance': return 'bg-slate-500/20 text-slate-400 border-slate-500/30'
    }
  }

  return (
    <button
      onClick={onClick}
      className={`p-4 rounded-xl border text-left transition-all active:scale-95 ${getStatusColor(resource.status)}`}
    >
      <div className="font-display font-medium text-lg mb-1">{resource.name}</div>
      <div className="text-xs tracking-wider uppercase opacity-80">{resource.status}</div>
    </button>
  )
}

// Large touch-target buttons for the action sheet
const StatusButton: React.FC<{ 
  status: ResourceStatus, 
  current: ResourceStatus, 
  onClick: () => void 
}> = ({ status, current, onClick }) => {
  const isCurrent = status === current
  
  const getStyles = () => {
    switch (status) {
      case 'available': return isCurrent ? 'bg-emerald-500 text-white' : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
      case 'occupied': return isCurrent ? 'bg-red-500 text-white' : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
      case 'cleaning': return isCurrent ? 'bg-amber-500 text-white' : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
      case 'maintenance': return isCurrent ? 'bg-slate-600 text-white' : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
    }
  }

  return (
    <button
      onClick={onClick}
      disabled={isCurrent}
      className={`py-4 px-2 rounded-xl font-medium tracking-wide transition-colors ${getStyles()} ${isCurrent ? 'opacity-50 cursor-not-allowed' : 'active:scale-95'}`}
    >
      {status}
    </button>
  )
}
