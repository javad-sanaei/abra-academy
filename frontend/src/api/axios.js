import axios from 'axios'

const api = axios.create({
  baseURL: 'https://abra-backend.onrender.com/api',
})

// اضافه کردن Token به همه درخواست‌ها
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// تمدید خودکار Token در صورت منقضی شدن
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      
      const refresh = localStorage.getItem('refresh')
      if (refresh) {
        try {
          const res = await axios.post(
            'https://abra-backend.onrender.com/api/accounts/token/refresh/',
            { refresh }
          )
          
          if (res.data && res.data.access) {
            localStorage.setItem('access', res.data.access)
            originalRequest.headers.Authorization = `Bearer ${res.data.access}`
            return api(originalRequest)
          }
        } catch (err) {
          console.error('Refresh token failed:', err)
        }
      }
      
      localStorage.clear()
      window.location.href = '/login'
    }
    
    return Promise.reject(error)
  }
)

export default api