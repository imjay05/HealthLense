import { useEffect, useRef } from 'react'
import { io } from 'socket.io-client'

let socketInstance = null

export const useSocket = () => {
  const socketRef = useRef(null)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) return

    // Reconnect if token changed (e.g. after re-login)
    if (!socketInstance || !socketInstance.connected) {
      socketInstance?.disconnect()
      socketInstance = io(import.meta.env.VITE_SOCKET_URL, {
        auth: { token },
        transports: ['websocket'],
        reconnectionAttempts: 5,
        reconnectionDelay: 2000,
      })
    }

    socketRef.current = socketInstance

    return () => {
      // Don't disconnect on unmount — socket is shared globally Only disconnect on logout (call disconnectSocket())
    }
  }, [])

  return socketRef
}

// Call this on logout
export const disconnectSocket = () => {
  socketInstance?.disconnect()
  socketInstance = null
}

export const getSocket = () => socketInstance