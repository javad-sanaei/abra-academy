import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Menu, Bell, Sun, Moon } from 'lucide-react'

// عناوین صفحات برای همه نقش‌ها
const pageTitles = {
  // دانش‌آموز
  '/dashboard/student': 'داشبورد',
  '/dashboard/student/plans': 'برنامه‌های من',
  '/dashboard/student/reports': 'گزارش‌های من',
  '/dashboard/student/exams': 'آزمون‌های من',
  '/dashboard/student/education': 'آموزش‌های من',
  '/dashboard/student/psychology': 'روانشناسی',
  // مشاور
  '/dashboard/counselor': 'داشبورد',
  '/dashboard/counselor/students': 'دانش‌آموزان من',
  '/dashboard/counselor/plans': 'برنامه‌دهی',
  '/dashboard/counselor/reports': 'گزارش‌ها',
  '/dashboard/counselor/content': 'محتوا',
  '/dashboard/counselor/exams': 'آزمون‌ها',
  '/dashboard/counselor/psychology': 'درخواست‌های روانشناسی',
  // ادمین
  '/dashboard/admin': 'داشبورد',
  '/dashboard/admin/users': 'مدیریت کاربران',
  '/dashboard/admin/comments': 'کامنت‌ها',
  '/dashboard/admin/settings': 'تنظیمات',
  // روانشناس
  '/dashboard/psychologist': 'داشبورد',
  '/dashboard/psychologist/requests': 'درخواست‌ها',
}

const Topbar = ({ onMenuClick, currentPath }) => {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('theme')
    if (saved) return saved === 'dark'
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  useEffect(() => {
    localStorage.setItem('theme', isDark ? 'dark' : 'light')
    if (isDark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [isDark])

  const toggleTheme = () => setIsDark(!isDark)

  const title = pageTitles[currentPath] || 'داشبورد'

  return (
    <header className="topbar">
      <div className="flex items-center gap-4">
        {/* Mobile Menu Button */}
        <button className="topbar-menu-btn" onClick={onMenuClick}>
          <Menu className="w-6 h-6" />
        </button>

        {/* Page Title */}
        <motion.h1
          className="topbar-title"
          key={currentPath}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {title}
        </motion.h1>
      </div>

      <div className="topbar-actions">
        {/* Theme Toggle */}
        <motion.button
          className="topbar-theme-btn"
          onClick={toggleTheme}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <motion.div
            animate={{ rotate: isDark ? 360 : 0 }}
            transition={{ duration: 0.5, type: "spring" }}
          >
            {isDark ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-gray-600" />}
          </motion.div>
        </motion.button>

        {/* Notification */}
        <motion.button
          className="topbar-notif"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Bell className="w-5 h-5" />
          <span className="topbar-notif-dot" />
        </motion.button>
      </div>
    </header>
  )
}

export default Topbar