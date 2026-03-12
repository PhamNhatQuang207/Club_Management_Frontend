import { io, Socket } from 'socket.io-client'

const SOCKET_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000'

// We will use a singleton socket instance to prevent multiple connections
export const socket: Socket = io(SOCKET_URL, {
  autoConnect: false, // We'll connect manually in the SocketProvider
})
