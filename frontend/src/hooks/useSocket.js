import { useEffect, useRef } from 'react'
import { io } from 'socket.io-client'

let socketInstance = null

export const useSocket = () => {
  const socketRef = useRef(null)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) return

    if (!socketInstance) {
      socketInstance = io(import.meta.env.VITE_SOCKET_URL || '', {
        auth: { token },
        transports: ['websocket'],
      })
    }

    socketRef.current = socketInstance
    return () => {}
  }, [])

  return socketRef
}

export const getSocket = () => socketInstance