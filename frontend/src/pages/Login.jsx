import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Eye, EyeOff, LogIn, User, Lock, 
  AlertCircle, Moon, Sun
} from 'lucide-react'
import axios from 'axios'
import '../styles/login.css'

const LoginPage = () => {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [isDark, setIsDark] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    
    if (!username.trim() || !password.trim()) {
      setError('لطفاً نام کاربری و رمز عبور را وارد کنید.')
      return
    }
    
    setLoading(true)

    try {
      const response = await axios.post('/api/accounts/login/', {
        username: username.trim(),
        password
      })

      localStorage.setItem('access', response.data.access)
      localStorage.setItem('refresh', response.data.refresh)
      localStorage.setItem('user', JSON.stringify(response.data.user))

      const role = response.data.user.role
      await new Promise(resolve => setTimeout(resolve, 500))
      
      switch(role) {
        case 'admin': navigate('/dashboard/admin'); break
        case 'counselor': navigate('/dashboard/counselor'); break
        case 'student': navigate('/dashboard/student'); break
        case 'psychologist': navigate('/dashboard/psychologist'); break
        default: navigate('/')
      }
    } catch (err) {
      if (err.response?.status === 401) {
        setError('نام کاربری یا رمز عبور اشتباه است.')
      } else if (err.code === 'ERR_NETWORK') {
        setError('خطا در ارتباط با سرور. لطفاً دوباره تلاش کنید.')
      } else {
        setError(err.response?.data?.error || 'خطایی رخ داده است.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleForgotPassword = (e) => {
    e.preventDefault()
    alert('برای تغییر رمز عبور خود، لطفاً با مدیریت آکادمی تماس بگیرید. 📞')
  }

  const handleRegister = (e) => {
    e.preventDefault()
    alert('ثبت‌نام در آکادمی ابراا از طریق مدیریت انجام می‌شود. برای ثبت‌نام و بهره‌مندی از خدمات ما، لطفاً فرم مشاوره رایگان را در صفحه اصلی تکمیل کنید. 🌟')
  }

  return (
    <div className={`login-premium ${isDark ? 'dark' : ''}`}>
      {/* پس‌زمینه */}
      <div className="login-premium-bg" />
      <div className="login-premium-grid" />

      {/* Theme Toggle */}
      <motion.button
        className="login-premium-theme"
        onClick={() => setIsDark(!isDark)}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        aria-label="تغییر تم"
      >
        {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
      </motion.button>

      {/* کانتینر اصلی */}
      <motion.div
        className="login-premium-container"
        initial={{ opacity: 0, y: 40, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, type: 'spring', stiffness: 50, damping: 14 }}
      >
        
        {/* ===== تصویر ابرا (سمت چپ - LTR) ===== */}
        <div className="login-premium-brand">
          <motion.img
            src="/images/abra-illustration.png"
            alt="آکادمی ابراا"
            className="login-premium-illustration"
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
            onError={(e) => {
              e.target.style.display = 'none'
              // اگه تصویر نبود، متن رو نشون بده
              document.querySelector('.login-premium-fallback')?.classList.remove('hidden')
            }}
          />
          
          {/* متن جایگزین اگه تصویر لود نشد */}
          <div className="login-premium-fallback hidden">
            <h2 className="login-premium-headline">
              مسیر موفقیت
              <br />
              <span className="login-premium-headline-gradient">از اینجا</span> شروع می‌شود
            </h2>
          </div>

          <motion.h2
            className="login-premium-headline"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            مسیر موفقیت
            <br />
            <span className="login-premium-headline-gradient">از اینجا</span> شروع می‌شود
          </motion.h2>

          <motion.p
            className="login-premium-desc"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            با ورود به پنل آکادمی ابرا، مسیر یادگیری خود را
            <br />
            <span className="login-premium-highlight">هوشمند</span>،
            <span className="login-premium-highlight">هدفمند</span> و
            <span className="login-premium-highlight">لذت‌بخش</span> کنید.
          </motion.p>
        </div>

        {/* ===== فرم لاگین (سمت راست - RTL) ===== */}
        <div className="login-premium-form-side">
          <motion.div
            className="login-premium-card"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.7 }}
          >
            {/* لوگو */}
            <div className="login-premium-logo-wrap">
              <motion.div
                className="login-premium-logo"
                animate={{ 
                  boxShadow: [
                    '0 0 20px rgba(59, 130, 246, 0.25)',
                    '0 0 40px rgba(59, 130, 246, 0.45)',
                    '0 0 20px rgba(59, 130, 246, 0.25)'
                  ]
                }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              >
                <img src="/logo.png" alt="آکادمی ابراا" />
              </motion.div>
              <h1 className="login-premium-title">
                ورود به آکادمی <span className="login-premium-title-blue">ابرا</span>
              </h1>
              <p className="login-premium-subtitle">به پنل کاربری خود خوش آمدید</p>
            </div>

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.div
                  className="login-premium-error"
                  initial={{ opacity: 0, x: -30, height: 0 }}
                  animate={{ opacity: 1, x: 0, height: 'auto' }}
                  exit={{ opacity: 0, x: 30, height: 0 }}
                >
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <span>{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* فرم */}
            <form onSubmit={handleLogin} className="login-premium-form">
              
              {/* نام کاربری */}
              <div className="login-premium-field">
                <label className="login-premium-label">نام کاربری</label>
                <div className="login-premium-input-wrap">
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => { setUsername(e.target.value); setError('') }}
                    className="login-premium-input login-premium-input-rtl"
                    placeholder="نام کاربری خود را وارد کنید"
                    disabled={loading}
                  />
                  <User className="login-premium-input-icon login-premium-input-icon-right" />
                </div>
              </div>

              {/* رمز عبور */}
              <div className="login-premium-field">
                <label className="login-premium-label">رمز عبور</label>
                <div className="login-premium-input-wrap">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError('') }}
                    className="login-premium-input login-premium-input-rtl login-premium-input-password"
                    placeholder="رمز عبور خود را وارد کنید"
                    disabled={loading}
                  />
                  <Lock className="login-premium-input-icon login-premium-input-icon-right" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="login-premium-eye login-premium-eye-left"
                    tabIndex={-1}
                    aria-label="نمایش رمز عبور"
                  >
                    <AnimatePresence mode="wait">
                      {showPassword ? (
                        <motion.div key="off" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
                          <EyeOff className="w-4 h-4" />
                        </motion.div>
                      ) : (
                        <motion.div key="on" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
                          <Eye className="w-4 h-4" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </button>
                </div>
              </div>

              {/* فراموشی رمز */}
              <div className="login-premium-options">
                <a 
                  href="#" 
                  onClick={handleForgotPassword}
                  className="login-premium-forgot"
                >
                  رمز عبور را فراموش کرده‌اید؟
                </a>
              </div>

              {/* دکمه ورود */}
              <motion.button
                type="submit"
                disabled={loading}
                className="login-premium-submit"
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.97 }}
              >
                {loading ? (
                  <motion.div
                    className="login-premium-spinner"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  />
                ) : (
                  <>
                    <LogIn className="w-5 h-5" />
                    ورود به پنل
                  </>
                )}
              </motion.button>

              {/* ثبت‌نام */}
              <p className="login-premium-register">
                حساب کاربری ندارید؟
                <a 
                  href="#" 
                  onClick={handleRegister}
                  className="login-premium-register-link"
                >
                  ثبت‌نام کنید
                </a>
              </p>
            </form>
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}

export default LoginPage