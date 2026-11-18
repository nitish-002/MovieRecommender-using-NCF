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

  async completeOnboarding(likedMovieIds) {
    const response = await api.post('/api/user/onboarding', {
      liked_movie_ids: likedMovieIds,
    })
    return response.data
  },

  async recordInteraction(movieId, interactionType = 'liked') {
    const response = await api.post('/api/user/interactions', {
      movie_id: movieId,
      interaction_type: interactionType,
    })
    return response.data
  },

  async removeInteraction(movieId) {
    const response = await api.delete(`/api/user/interactions/${movieId}`)
    return response.data
  },

  async getUserInteractions() {
    const response = await api.get('/api/user/interactions')
    return response.data
  },

  async surrogateRecommend(likedMovieIds, excludedMovieIds = [], topN = 10) {
    const response = await api.post('/api/surrogate/recommend', {
      liked_movie_ids: likedMovieIds,
      excluded_movie_ids: excludedMovieIds,
      top_n: topN,
    })
    return response.data
  },

  async resetUserInteractions() {
    const response = await api.delete('/api/user/interactions/reset')
    return response.data
  },

  async setAdminBenchmarkId(movieLensUserId) {
    const response = await api.post('/api/admin/set-benchmark-id', {
      movie_lens_user_id: movieLensUserId,
    })
    return response.data
  },

  async toggleAdminRole(password = null) {
    const response = await api.post('/api/admin/toggle-admin-role', {
      password,
    })
    return response.data
  },

  async verifyAdminPassword(password) {
    const response = await api.post('/api/admin/verify-password', {
      password,
    })
    return response.data
  },

  async exitAdminMode() {
    const response = await api.post('/api/admin/exit-admin-mode')
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