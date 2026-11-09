import api from './api'

export const movieApi = {
  async getRecommendations(topN = 10) {
    const response = await api.get(`/api/recommend`, {
      params: { top_n: topN },
    })
    return response.data
  },

  async searchMovies(query, limit = 20) {
    const response = await api.get('/api/movies/search', {
      params: { query, limit },
    })
    return response.data
  },

  async getMovie(movieId) {
    const response = await api.get(`/api/movies/${movieId}`)
    return response.data
  },

  async predictPreference(movieId) {
    const response = await api.post('/api/predict', { movie_id: movieId })
    return response.data
  },

  async getMetrics() {
    const response = await api.get('/api/metrics')
    return response.data
  },

  async healthCheck() {
    const response = await api.get('/api/health')
    return response.data
  },
}

export const authApi = {
  async login(email, password) {
    const response = await api.post('/auth/login', { email, password })
    return response.data
  },

  async register(email, password) {
    const response = await api.post('/auth/register', { email, password })
    return response.data
  },

  async getProfile() {
    const response = await api.get('/auth/me')
    return response.data
  },
}