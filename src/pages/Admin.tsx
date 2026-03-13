import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useResources, useUpdateStatus, useCreateResource, useDeleteResource } from '../hooks/useResources'
import type { Resource, ResourceStatus } from '../types'
import { useAuth } from '../hooks/useAuth'
import { useSocket } from '../hooks/useSocket'
import { useClubName } from '../hooks/useClubName'
import { Link } from 'react-router-dom'

const statusMeta: Record<ResourceStatus, { color: string; bg: string; border: string; label: string; dot: string }> = {
  available: { color: 'text-emerald-400', bg: 'bg-emerald-500/15', border: 'border-emerald-500/30', label: 'Available', dot: 'bg-emerald-500' },
  occupied: { color: 'text-red-400', bg: 'bg-red-500/15', border: 'border-red-500/30', label: 'Occupied', dot: 'bg-red-500' },
  cleaning: { color: 'text-amber-400', bg: 'bg-amber-500/15', border: 'border-amber-500/30', label: 'Cleaning', dot: 'bg-amber-500' },
  maintenance: { color: 'text-slate-400', bg: 'bg-slate-500/15', border: 'border-slate-500/30', label: 'Maintenance', dot: 'bg-slate-500' },
}

export const Admin: React.FC = () => {
  const { data: resources, isLoading, error } = useResources()
  const updateStatusMutation = useUpdateStatus()
  const createResourceMutation = useCreateResource()
  const deleteResourceMutation = useDeleteResource()
  const { logout } = useAuth()
  const { isConnected } = useSocket()
  const { clubName, setClubName } = useClubName()

  const [selectedResource, setSelectedResource] = useState<Resource | null>(null)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [newName, setNewName] = useState('')
  const [newType, setNewType] = useState<'billiards' | 'bowling'>('billiards')
  const [editingClubName, setEditingClubName] = useState(clubName)

  // Stats
  const stats = useMemo(() => {
    if (!resources) return { total: 0, available: 0, occupied: 0, billiards: 0, bowling: 0 }
    return {
      total: resources.length,
      available: resources.filter(r => r.status === 'available').length,
      occupied: resources.filter(r => r.status === 'occupied').length,
      billiards: resources.filter(r => r.type === 'billiards').length,
      bowling: resources.filter(r => r.type === 'bowling').length,
    }
  }, [resources])

  const billiards = resources?.filter((r) => r.type === 'billiards') || []
  const bowling = resources?.filter((r) => r.type === 'bowling') || []

  const handleStatusChange = (status: ResourceStatus) => {
    if (!selectedResource) return
    updateStatusMutation.mutate({ id: selectedResource.id, status })
    setSelectedResource(null)
  }

  const handleDelete = () => {
    if (!selectedResource) return
    if (window.confirm(`Delete "${selectedResource.name}"? This cannot be undone.`)) {
      deleteResourceMutation.mutate(selectedResource.id)
      setSelectedResource(null)
    }
  }

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newName.trim()) return
    createResourceMutation.mutate({ name: newName, type: newType }, {
      onSuccess: () => {
        setIsAddModalOpen(false)
        setNewName('')
      }
    })
  }

  const handleSaveClubName = () => {
    setClubName(editingClubName)
    setIsSettingsOpen(false)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
          <p className="text-zinc-600 text-sm font-sans">Loading resources…</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-surface-1 flex items-center justify-center p-4">
        <div className="bg-red-900/10 border border-red-500/20 text-red-400 p-8 rounded-2xl text-center max-w-md">
          <div className="text-3xl mb-3">⚠</div>
          <p className="font-display text-xl mb-2">Connection Error</p>
          <p className="text-sm text-red-400/70">Failed to load resources. Check your connection and refresh.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface-1 text-zinc-100 grain-overlay">
      {/* ═══ Header ═══ */}
      <header className="sticky top-0 z-40 bg-surface-1/80 backdrop-blur-xl border-b border-zinc-800/40">
        <div className="max-w-5xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="w-9 h-9 rounded-xl bg-zinc-800/60 border border-zinc-700/30 flex items-center justify-center text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700/60 transition-colors">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            </Link>
            <div>
              <h1 className="font-display text-lg md:text-xl font-medium tracking-wide flex items-center gap-2">
                Control Panel
              </h1>
              <div className="flex items-center gap-2 mt-0.5">
                <div className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-emerald-500' : 'bg-red-500'}`} />
                <span className="font-mono text-[10px] text-zinc-500 tracking-widest uppercase">
                  {isConnected ? 'Connected' : 'Offline'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => { setEditingClubName(clubName); setIsSettingsOpen(true) }}
              className="p-2 rounded-xl border border-zinc-800/60 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60 transition-colors"
              title="Club Settings"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
            </button>
            <button
              onClick={logout}
              className="px-3 py-2 rounded-xl border border-zinc-800/60 text-zinc-400 hover:text-red-400 hover:border-red-500/30 text-sm font-sans transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 md:px-6 py-6 space-y-6">
        {/* ═══ Quick Stats ═══ */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Total', value: stats.total, accent: 'text-zinc-100' },
            { label: 'Available', value: stats.available, accent: 'text-emerald-400' },
            { label: 'Occupied', value: stats.occupied, accent: 'text-red-400' },
            { label: 'Resources', value: `${stats.billiards}B / ${stats.bowling}L`, accent: 'text-sky-400' },
          ].map(({ label, value, accent }) => (
            <div key={label} className="bg-surface-2/40 border border-zinc-800/40 rounded-2xl p-4 backdrop-blur-sm">
              <div className={`font-mono text-xl md:text-2xl font-bold ${accent}`}>{value}</div>
              <div className="text-[10px] text-zinc-500 tracking-widest uppercase font-sans mt-0.5">{label}</div>
            </div>
          ))}
        </div>

        {/* ═══ Action Bar ═══ */}
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg text-zinc-200 tracking-wide">Resources</h2>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2.5 rounded-xl font-sans font-semibold text-sm tracking-wide transition-all shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/20"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Add Resource
          </button>
        </div>

        {/* ═══ Billiards ═══ */}
        <section>
          <div className="flex items-center gap-2 mb-3 px-1">
            <span className="text-base">🎱</span>
            <h3 className="text-zinc-500 font-sans text-[11px] tracking-widest uppercase font-semibold">
              Billiards — {billiards.length} table{billiards.length !== 1 ? 's' : ''}
            </h3>
          </div>
          {billiards.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {billiards.map((resource) => (
                <AdminResourceCard key={resource.id} resource={resource} onClick={() => setSelectedResource(resource)} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-zinc-600 text-sm font-sans bg-surface-2/30 rounded-2xl border border-zinc-800/30">No billiard tables yet</div>
          )}
        </section>

        {/* ═══ Bowling ═══ */}
        <section>
          <div className="flex items-center gap-2 mb-3 px-1">
            <span className="text-base">🎳</span>
            <h3 className="text-zinc-500 font-sans text-[11px] tracking-widest uppercase font-semibold">
              Bowling — {bowling.length} lane{bowling.length !== 1 ? 's' : ''}
            </h3>
          </div>
          {bowling.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {bowling.map((resource) => (
                <AdminResourceCard key={resource.id} resource={resource} onClick={() => setSelectedResource(resource)} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-zinc-600 text-sm font-sans bg-surface-2/30 rounded-2xl border border-zinc-800/30">No bowling lanes yet</div>
          )}
        </section>
      </main>

      {/* ═══ Club Settings Modal ═══ */}
      <AnimatePresence>
        {isSettingsOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsSettingsOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-zinc-900/95 border border-zinc-800/60 rounded-3xl p-6 md:p-8 z-50 shadow-2xl backdrop-blur-xl"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
                </div>
                <div>
                  <h3 className="text-xl font-display font-medium text-white">Club Settings</h3>
                  <p className="text-xs text-zinc-500 font-sans">Customize your club's public appearance</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-[11px] font-semibold tracking-widest text-zinc-400 uppercase mb-2">Club Name</label>
                  <input
                    type="text"
                    value={editingClubName}
                    onChange={e => setEditingClubName(e.target.value)}
                    placeholder="The Continental Club"
                    className="w-full bg-zinc-950/60 border border-zinc-800 rounded-xl px-4 py-3.5 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-sky-500/50 focus:ring-2 focus:ring-sky-500/20 transition-all font-sans text-lg"
                  />
                  <p className="text-[10px] text-zinc-600 mt-1.5 font-sans">This name appears on the public floor plan page.</p>
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                <button
                  type="button"
                  onClick={() => setIsSettingsOpen(false)}
                  className="flex-1 py-3 text-zinc-400 font-medium tracking-wide hover:bg-zinc-800 rounded-xl transition-colors font-sans"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveClubName}
                  className="flex-1 bg-sky-600 hover:bg-sky-500 text-white py-3 rounded-xl font-semibold tracking-wide transition-all shadow-lg shadow-sky-500/10 font-sans"
                >
                  Save
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ═══ Add Resource Modal ═══ */}
      <AnimatePresence>
        {isAddModalOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsAddModalOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm bg-zinc-900/95 border border-zinc-800/60 rounded-3xl p-6 md:p-8 z-50 shadow-2xl backdrop-blur-xl"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-lg">
                  +
                </div>
                <div>
                  <h3 className="text-xl font-display font-medium text-white">New Resource</h3>
                  <p className="text-xs text-zinc-500 font-sans">Add a table or lane to the floor plan</p>
                </div>
              </div>

              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-semibold tracking-widest text-zinc-400 uppercase mb-2">Name</label>
                  <input
                    type="text"
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    required
                    placeholder="e.g. Pool Table 5"
                    className="w-full bg-zinc-950/60 border border-zinc-800 rounded-xl px-4 py-3.5 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all font-sans"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold tracking-widest text-zinc-400 uppercase mb-2">Type</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setNewType('billiards')}
                      className={`py-3 rounded-xl font-sans font-medium text-sm transition-all flex items-center justify-center gap-2 ${newType === 'billiards' ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400' : 'bg-zinc-800/50 border border-zinc-700/30 text-zinc-400 hover:bg-zinc-700/50'}`}
                    >
                      🎱 Billiards
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewType('bowling')}
                      className={`py-3 rounded-xl font-sans font-medium text-sm transition-all flex items-center justify-center gap-2 ${newType === 'bowling' ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400' : 'bg-zinc-800/50 border border-zinc-700/30 text-zinc-400 hover:bg-zinc-700/50'}`}
                    >
                      🎳 Bowling
                    </button>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="flex-1 py-3 text-zinc-400 font-medium tracking-wide hover:bg-zinc-800 rounded-xl transition-colors font-sans"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createResourceMutation.isPending || !newName.trim()}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-3 rounded-xl font-semibold tracking-wide transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center shadow-lg shadow-emerald-500/10 font-sans"
                  >
                    {createResourceMutation.isPending ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : 'Create'}
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ═══ Status Action Sheet ═══ */}
      <AnimatePresence>
        {selectedResource && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSelectedResource(null)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" />

            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              className="fixed bottom-0 left-0 right-0 bg-zinc-900/95 border-t border-zinc-800/60 rounded-t-3xl p-6 z-50 max-w-lg mx-auto backdrop-blur-xl"
            >
              <div className="w-10 h-1 bg-zinc-800 rounded-full mx-auto mb-5" />

              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl ${statusMeta[selectedResource.status].bg} border ${statusMeta[selectedResource.status].border} flex items-center justify-center text-base`}>
                    {selectedResource.type === 'billiards' ? '🎱' : '🎳'}
                  </div>
                  <div>
                    <h3 className="text-xl font-display font-medium text-white">
                      {selectedResource.name}
                    </h3>
                    <p className={`text-xs font-sans font-semibold tracking-wider uppercase mt-0.5 ${statusMeta[selectedResource.status].color}`}>
                      {statusMeta[selectedResource.status].label}
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleDelete}
                  disabled={deleteResourceMutation.isPending}
                  className="bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300 px-3 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 border border-red-500/10 hover:border-red-500/20"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                  {deleteResourceMutation.isPending ? 'Deleting…' : 'Delete'}
                </button>
              </div>

              <p className="text-[11px] text-zinc-500 tracking-widest uppercase font-semibold mb-3 font-sans">Change Status</p>
              <div className="grid grid-cols-2 gap-2.5">
                {(['available', 'occupied', 'cleaning', 'maintenance'] as ResourceStatus[]).map(status => {
                  const meta = statusMeta[status]
                  const isCurrent = status === selectedResource.status
                  return (
                    <button
                      key={status}
                      onClick={() => handleStatusChange(status)}
                      disabled={isCurrent}
                      className={`py-3.5 px-3 rounded-xl font-sans font-semibold text-sm tracking-wide transition-all flex items-center justify-center gap-2 ${
                        isCurrent
                          ? `${meta.bg} ${meta.color} border ${meta.border} opacity-60 cursor-not-allowed`
                          : 'bg-zinc-800/60 text-zinc-300 border border-zinc-700/30 hover:bg-zinc-700/60 active:scale-[0.97]'
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full ${meta.dot}`} />
                      {meta.label}
                    </button>
                  )
                })}
              </div>

              <button
                onClick={() => setSelectedResource(null)}
                className="w-full mt-4 py-3 text-zinc-500 font-sans font-medium tracking-wide hover:text-zinc-300 transition-colors"
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

// ─── Admin Resource Card ───
const AdminResourceCard: React.FC<{ resource: Resource, onClick: () => void }> = ({ resource, onClick }) => {
  const meta = statusMeta[resource.status]

  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.01, y: -2 }}
      whileTap={{ scale: 0.98 }}
      className={`p-4 rounded-2xl border text-left transition-all ${meta.bg} ${meta.border} group w-full`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <div className={`w-8 h-8 rounded-lg ${meta.bg} border ${meta.border} flex items-center justify-center text-sm flex-shrink-0`}>
            {resource.type === 'billiards' ? '🎱' : '🎳'}
          </div>
          <div className="min-w-0">
            <div className="font-display font-medium text-base text-zinc-100 truncate">{resource.name}</div>
            <div className={`text-[10px] tracking-widest uppercase font-semibold font-sans ${meta.color} mt-0.5`}>
              {meta.label}
            </div>
          </div>
        </div>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-600 group-hover:text-zinc-300 transition-colors flex-shrink-0"><path d="m9 18 6-6-6-6"/></svg>
      </div>
    </motion.button>
  )
}
