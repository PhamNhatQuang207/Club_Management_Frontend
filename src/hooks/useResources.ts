import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { api } from '../lib/api'
import type { Resource, ResourceStatus } from '../types'
import { useSocket } from './useSocket'

export const useResources = () => {
  const queryClient = useQueryClient()
  const socket = useSocket()

  // 1. Fetch resources
  const query = useQuery({
    queryKey: ['resources'],
    queryFn: async () => {
      const response = await api.get<Resource[]>('/resources')
      return response.data
    },
  })

  // 2. Listen for socket events
  useEffect(() => {
    if (!socket.socket) return

    const handleUpdate = (updated: { id: string; status: ResourceStatus }) => {
      queryClient.setQueryData(['resources'], (old: Resource[] | undefined) => {
        if (!old) return old
        return old.map((r) =>
          r.id === updated.id
            ? { ...r, status: updated.status, updatedAt: new Date().toISOString() }
            : r
        )
      })
    }
    
    const handleCreated = (created: Resource) => {
      queryClient.setQueryData(['resources'], (old: Resource[] | undefined) => {
        if (!old) return [created]
        // prevent duplicates
        if (old.some(r => r.id === created.id)) return old
        return [...old, created]
      })
    }

    const handleDeleted = ({ id }: { id: string }) => {
      queryClient.setQueryData(['resources'], (old: Resource[] | undefined) => {
        if (!old) return old
        return old.filter(r => r.id !== id)
      })
    }

    socket.socket.on('resource_status_update', handleUpdate)
    socket.socket.on('resource_created', handleCreated)
    socket.socket.on('resource_deleted', handleDeleted)

    return () => {
      socket.socket?.off('resource_status_update', handleUpdate)
      socket.socket?.off('resource_created', handleCreated)
      socket.socket?.off('resource_deleted', handleDeleted)
    }
  }, [socket.socket, queryClient])

  return query
}

export const useCreateResource = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (data: { name: string; type: 'billiards' | 'bowling' }) => {
      const response = await api.post('/resources', data)
      return response.data
    },
    onSuccess: () => {
      // Invalidate just in case, though socket usually handles this
      queryClient.invalidateQueries({ queryKey: ['resources'] })
    },
  })
}

export const useDeleteResource = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`/resources/${id}`)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resources'] })
    },
  })
}

// 3. Update status manually (Admin mode)
export const useUpdateStatus = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      status,
    }: {
      id: string
      status: ResourceStatus
    }) => {
      const { data } = await api.patch<Resource>(`/resources/${id}/status`, {
        status,
      })
      return data
    },
    onSuccess: (updatedResource) => {
      // The socket event will also fire, but we can optimistically update here too
      queryClient.setQueryData<Resource[]>(['resources'], (old) => {
        if (!old) return old
        return old.map((res) =>
          res.id === updatedResource.id ? updatedResource : res
        )
      })
    },
  })
}
