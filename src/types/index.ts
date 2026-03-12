export type ResourceStatus = 'available' | 'occupied' | 'cleaning' | 'maintenance'

export type ResourceType = 'billiards' | 'bowling'

export interface Resource {
  id: string
  name: string
  type: ResourceType
  status: ResourceStatus
  createdAt: string
  updatedAt: string
}

export interface LoginResponse {
  access_token: string
}
