import { useState, useCallback } from 'react'
import { movieApi } from '../services/movieApi'

export function usePrediction() {
  const [prediction, setPrediction] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const predict = useCallback(async (movieId) => {
    setLoading(true)
    setError(null)
    try {
      const data = await movieApi.predictPreference(movieId)
      setPrediction(data)
      return data
    } catch (err) {
      const detail = err.response?.data?.detail
      const message = Array.isArray(detail)
        ? detail.map((item) => {
            const field = Array.isArray(item.loc) ? item.loc.at(-1) : null
            return field ? `${field}: ${item.msg}` : item.msg
          }).join('; ')
        : typeof detail === 'string'
          ? detail
          : 'Prediction failed. Check the selected movie and try again.'
      setError(message)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const clearPrediction = useCallback(() => {
    setPrediction(null)
    setError(null)
  }, [])

  return { prediction, loading, predicting: loading, error, predict, clearPrediction }
}
