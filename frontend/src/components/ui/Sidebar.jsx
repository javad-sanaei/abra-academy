import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, CalendarCheck, FileText,
  BookOpen, GraduationCap, Heart,
  LogOut, Menu, X, ChevronRight, Cloud,
  Users, Video, Headphones, FileDown, BarChart3,
  Settings, MessageCircle, Bell
} from 'lucide-react'
import useAuthStore from '../../store/authStore'

// منوهای هر نقش
const menuConfigs = {
  student: [
    { id: 'dashboard', label: 'داشبورد', icon: <LayoutDashboard className="w-5 h-5" />, path: '/dashboard/student' },
    { id: 'plans', label: 'برنامه‌های من', icon: <CalendarCheck className="w-5 h-5" />, path: '/dashboard/student/plans' },
    { id: 'reports', label: 'گزارش‌های من', icon: <FileText className="w-5 h-5" />, path: '/dashboard/student/reports' },
    { id: 'exams', label: 'آزمون‌های من', icon: <GraduationCap className="w-5 h-5" />, path: '/dashboard/student/exams' },
    { id: 'education', label: 'آموزش‌های من', icon: <BookOpen className="w-5 h-5" />, path: '/dashboard/student/education' },
    { id: 'psychology', label: 'روانشناسی', icon: <Heart className="w-5 h-5" />, path: '/dashboard/student/psychology' },
  ],
  counselor: [
      { id: 'dashboard', label: 'داشبورد', icon: <LayoutDashboard className="w-5 h-5" />, path: '/dashboard/counselor' },
      { id: 'students', label: 'دانش‌آموزان من', icon: <Users className="w-5 h-5" />, path: '/dashboard/counselor/students' },
      { id: 'content', label: 'محتوا', icon: <Video className="w-5 h-5" />, path: '/dashboard/counselor/content' },
      { id: 'exams', label: 'آزمون‌ها', icon: <GraduationCap className="w-5 h-5" />, path: '/dashboard/counselor/exams' },
    ],
  admin: [
    { id: 'dashboard', label: 'داشبورد', icon: <LayoutDashboard className="w-5 h-5" />, path: '/dashboard/admin' },
    { id: 'users', label: 'کاربران', icon: <Users className="w-5 h-5" />, path: '/dashboard/admin/users' },
    { id: 'counselors', label: 'مشاوران', icon: <GraduationCap className="w-5 h-5" />, path: '/dashboard/admin/counselors' },
    { id: 'students', label: 'دانش‌آموزان', icon: <BookOpen className="w-5 h-5" />, path: '/dashboard/admin/students' },
    { id: 'content', label: 'محتوا', icon: <Video className="w-5 h-5" />, path: '/dashboard/admin/content' },
    { id: 'comments', label: 'کامنت‌ها', icon: <MessageCircle className="w-5 h-5" />, path: '/dashboard/admin/comments' },
    { id: 'psychology', label: 'روانشناسی', icon: <Heart className="w-5 h-5" />, path: '/dashboard/admin/psychology' },
  ],
  psychologist: [
    { id: 'dashboard', label: 'داشبورد', icon: <LayoutDashboard className="w-5 h-5" />, path: '/dashboard/psychologist' },
    { id: 'requests', label: 'درخواست‌ها', icon: <Heart className="w-5 h-5" />, path: '/dashboard/psychologist/requests' },
    { id: 'history', label: 'تاریخچه', icon: <FileText className="w-5 h-5" />, path: '/dashboard/psychologist/history' },
  ],
}

// رنگ‌های هر نقش
const roleColors = {
  student: { primary: 'from-sky-400 to-sky-600', accent: '#3B82F6', bg: 'rgba(59,130,246,0.06)' },
  counselor: { primary: 'from-purple-400 to-purple-600', accent: '#8B5CF6', bg: 'rgba(139,92,246,0.06)' },
  admin: { primary: 'from-amber-400 to-amber-600', accent: '#F59E0B', bg: 'rgba(245,158,11,0.06)' },
  psychologist: { primary: 'from-emerald-400 to-emerald-600', accent: '#10B981', bg: 'rgba(16,185,129,0.06)' },
}

// عنوان پنل
const roleTitles = {
  student: 'پنل دانش‌آموز',
  counselor: 'پنل مشاور',
  admin: 'پنل ادمین',
  psychologist: 'پنل روانشناس',
}

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation()
  const { user, logout } = useAuthStore()
  
  const role = user?.role || 'student'
  const menuItems = menuConfigs[role] || menuConfigs.student
  const colors = roleColors[role] || roleColors.student
  const panelTitle = roleTitles[role] || roleTitles.student

  const isActive = (path) => {
    if (path === `/dashboard/${role}`) {
      return location.pathname === `/dashboard/${role}`
    }
    return location.pathname.startsWith(path)
  }

  const userInitial = user?.full_name?.charAt(0) || user?.username?.charAt(0) || '؟'

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="sidebar-overlay open"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        className={`sidebar ${isOpen ? 'open' : ''}`}
        initial={false}
      >
        {/* Close Button (Mobile) */}
        <button className="sidebar-close-btn" onClick={onClose}>
          <X className="w-5 h-5" />
        </button>

        {/* Logo */}
        <div className="sidebar-logo">
          <div className={`sidebar-logo-icon bg-gradient-to-br ${colors.primary}`}>
            <Cloud className="w-7 h-7 text-white" />
          </div>
          <div>
            <h2 className="sidebar-logo-text">ابرا</h2>
            <span className="sidebar-logo-sub">{panelTitle}</span>
          </div>
        </div>

        {/* User Info */}
        <div className="sidebar-user" style={{ background: colors.bg }}>
          <div className={`sidebar-user-avatar bg-gradient-to-br ${colors.primary}`}>
            {userInitial}
          </div>
          <div className="sidebar-user-info">
            <h4>{user?.full_name || user?.username}</h4>
            <span>{user?.grade || user?.role_display || role}</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <Link
              key={item.id}
              to={item.path}
              className={`sidebar-nav-item ${isActive(item.path) ? 'active' : ''}`}
              onClick={onClose}
              style={isActive(item.path) ? { background: `linear-gradient(135deg, ${colors.accent}, ${colors.accent}dd)` } : {}}
            >
              {item.icon}
              <span>{item.label}</span>
              {isActive(item.path) && <ChevronRight className="w-4 h-4 mr-auto" />}
            </Link>
          ))}
        </nav>

        {/* Logout */}
        <div className="sidebar-footer">
          <button onClick={logout} className="sidebar-logout">
            <LogOut className="w-5 h-5" />
            <span>خروج از حساب</span>
          </button>
        </div>
      </motion.aside>
    </>
  )
}

export default Sidebar