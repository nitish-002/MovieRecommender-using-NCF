import axios from 'axios'

const rawBaseURL = import.meta.env.VITE_API_BASE_URL
const baseURL = rawBaseURL ? rawBaseURL.trim().replace(/\/+$/, '') : 'http://localhost:8000'

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      delete api.defaults.headers.common['Authorization']
    }
    return Promise.reject(error)
  }
)

export default api
