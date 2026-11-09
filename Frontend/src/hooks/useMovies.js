import { useState, useEffect, useCallback } from 'react'
import { movieApi } from '../services/movieApi'
import { useAuth } from '../context/AuthContext'

export function useRecommendations(topN = 10) {
  const { isAuthenticated, loading: authLoading } = useAuth()
  const [recommendations, setRecommendations] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchRecommendations = useCallback(async () => {
    if (!isAuthenticated) {
      setRecommendations([])
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)
    try {
      const data = await movieApi.getRecommendations(topN)
      setRecommendations(data.recommendations || [])
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to fetch recommendations')
      setRecommendations([])
    } finally {
      setLoading(false)
    }
  }, [topN, isAuthenticated])

  useEffect(() => {
    if (!authLoading) {
      fetchRecommendations()
    }
  }, [fetchRecommendations, authLoading])

  return { recommendations, loading, error, refetch: fetchRecommendations }
}

export function useMovieSearch(initialQuery = '', limit = 20) {
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const search = useCallback(async (searchQuery) => {
    const q = searchQuery?.trim()
    if (!q) {
      setResults([])
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)
    try {
      const data = await movieApi.searchMovies(q, limit)
      setResults(data || [])
    } catch (err) {
      setError(err.response?.data?.detail || 'Search failed')
      setResults([])
    } finally {
      setLoading(false)
    }
  }, [limit])

  useEffect(() => {
    if (initialQuery && initialQuery.trim().length >= 2) {
      const timer = setTimeout(() => {
        search(initialQuery)
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [initialQuery, search])

  return { results, loading, error, search, setResults }
}

export function useMovieDetails(movieId) {
  const [movie, setMovie] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!movieId) {
      setMovie(null)
      return
    }

    setLoading(true)
    setError(null)
    movieApi.getMovie(movieId)
      .then((data) => setMovie(data))
      .catch((err) => setError(err.response?.data?.detail || 'Failed to fetch movie details'))
      .finally(() => setLoading(false))
  }, [movieId])

  return { movie, loading, error }
}

export function useMetrics() {
  const [metrics, setMetrics] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchMetrics = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await movieApi.getMetrics()
      setMetrics(data)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load model metrics')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchMetrics()
  }, [fetchMetrics])

  return { metrics, loading, error, refetch: fetchMetrics }
}

export function useHealthCheck() {
  const [health, setHealth] = useState(null)
  const [loading, setLoading] = useState(false)

  const checkHealth = useCallback(async () => {
    setLoading(true)
    try {
      const data = await movieApi.healthCheck()
      setHealth(data)
    } catch {
      setHealth({ status: 'offline', model_loaded: false })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    checkHealth()
  }, [checkHealth])

  return { health, loading, refetch: checkHealth }
}
