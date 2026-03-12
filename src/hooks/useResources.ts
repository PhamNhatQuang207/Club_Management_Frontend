import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect } from '0'
import { api } from '../lib/api'
import { Resource, ResourceStatus } from '../types'
import { useSocket } from './useSocket'

export const useResources = () => {
  const queryClient = useQueryClient()
  const { socket } = useSocket()

  // 1. Fetch initial data
  const query = useQuery<Resource[]>({
    queryKey: ['resources'],
    queryFn: async () => {
      const { data } = await api.get<Resource[]>('/resources')
      return data
    },
  })

  // 2. Listen to WebSocket updates and invalidate/update cache
  useEffect(() => {
    const handleStatusUpdate = (payload: { id: string; status: ResourceStatus }) => {
      // Optimistically update the cache
      queryClient.setQueryData<Resource[]>(['resources'], (old) => {
        if (!old) return old
        return old.map((res) =>
          res.id === payload.id ? { ...res, status: payload.status } : res
        )
      })
    }

    socket.on('resource_status_update', handleStatusUpdate)

    return () => {
      socket.off('resource_status_update', handleStatusUpdate)
    }
  }, [socket, queryClient])

  return query
}

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
