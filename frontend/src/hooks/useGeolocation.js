import { useState, useCallback } from 'react'

export const useGeolocation = () => {
  const [coords, setCoords] = useState(null)
  const [error, setError]   = useState(null)
  const [loading, setLoading] = useState(false)

  const request = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser')
      return
    }
    setLoading(true)
    setError(null)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude })
        setLoading(false)
      },
      (err) => {
        const messages = {
          1: 'Location permission denied. Please allow access.',
          2: 'Location unavailable. Try again.',
          3: 'Location request timed out. Try again.',
        }
        setError(messages[err.code] || err.message)
        setLoading(false)
      },
      { timeout: 10000, maximumAge: 60000 }  // cache position for 60s
    )
  }, [])

  return { coords, error, loading, request }
}