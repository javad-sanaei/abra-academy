import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Search,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  TrendingUp,
  Flame,
  BookOpen,
  MoreHorizontal,
  Play,
  Target,
} from 'lucide-react'
import api from '../../api/axios'
import SubjectIcon from '../ui/SubjectIcon'
import '../../styles/student-plans.css'

const StudentPlans = () => {
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [selectedDate, setSelectedDate] = useState(null)
  const [updatingId, setUpdatingId] = useState(null)

  // دریافت برنامه‌ها
  useEffect(() => {
    const fetchPlans = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await api.get('/student/plans/')
        setPlans(res.data)
      } catch (err) {
        setError('خطا در دریافت برنامه‌ها. لطفاً دوباره تلاش کنید.')
        console.error('Error fetching plans:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchPlans()
  }, [])

  // تغییر وضعیت
  const updateStatus = async (planId, newStatus) => {
    setUpdatingId(planId)
    try {
      await api.patch(`/student/plans/${planId}/update-status/`, { status: newStatus })
      setPlans(prev => prev.map(plan => 
        plan.id === planId ? { ...plan, status: newStatus } : plan
      ))
    } catch (err) {
      console.error('Error updating plan:', err)
    } finally {
      setUpdatingId(null)
    }
  }

  // تاریخ‌های موجود
  const availableDates = useMemo(() => {
    const dates = [...new Set(plans.map(p => p.plan_date))].sort()
    return dates
  }, [plans])

  // فیلتر و جستجو
  const filteredPlans = plans.filter(plan => {
    const matchesFilter = filter === 'all' || plan.status === filter
    const matchesSearch = !search || 
      plan.course_name?.includes(search) || 
      plan.title?.includes(search) ||
      plan.description?.includes(search)
    const matchesDate = !selectedDate || plan.plan_date === selectedDate
    return matchesFilter && matchesSearch && matchesDate
  })

  // آمار
  const stats = useMemo(() => {
      const total = plans.length
      const completed = plans.filter(p => p.status === 'done').length
      const pending = plans.filter(p => p.status === 'pending').length
      const missed = plans.filter(p => p.status === 'missed').length
      
      // درصد واقعی: تعداد انجام شده / کل × 100
      const progress = total > 0 ? Math.round((completed / total) * 100) : 0
      
      const totalStudyTime = plans.reduce((sum, p) => {
        const time = parseFloat(p.study_time) || 0
        return sum + time
      }, 0)
      
      return { total, completed, pending, missed, progress, totalStudyTime }
    }, [plans])

  const statusConfig = {
    pending: { label: 'در انتظار', icon: <AlertCircle className="w-4 h-4" />, color: '#F59E0B', type: 'upcoming' },
    done: { label: 'انجام شده', icon: <CheckCircle className="w-4 h-4" />, color: '#10B981', type: 'completed' },
    missed: { label: 'انجام نشده', icon: <XCircle className="w-4 h-4" />, color: '#EF4444', type: 'missed' },
  }

  if (loading) {
    return (
      <div className="student-plans-container">
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white dark:bg-navy-800 rounded-2xl p-6 animate-pulse">
              <div className="h-4 bg-gray-200 dark:bg-navy-700 rounded w-3/4 mb-3"></div>
              <div className="h-3 bg-gray-200 dark:bg-navy-700 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="student-plans-container">
        <div className="text-center py-16">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
            <AlertCircle className="w-10 h-10 text-red-500" />
          </div>
          <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">خطا!</h3>
          <p className="text-gray-500 dark:text-gray-400">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-6 px-6 py-3 bg-sky-500 text-white rounded-2xl font-bold hover:bg-sky-600 transition-colors"
          >
            تلاش دوباره
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="student-plans-container">
      {/* ===== Toolbar: Search + Filters ===== */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="جستجو در برنامه‌ها..."
            className="w-full h-12 pr-12 pl-4 bg-white/70 dark:bg-navy-800/70 backdrop-blur-lg border border-gray-200/50 dark:border-navy-700/50 rounded-2xl text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-vazir"
          />
        </div>

        {/* Filters */}
        <div className="filter-pills-container">
          {[
            { value: 'all', label: 'همه' },
            { value: 'pending', label: 'در انتظار' },
            { value: 'done', label: 'انجام شده' },
            { value: 'missed', label: 'انجام نشده' },
          ].map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`filter-pill ${filter === f.value ? 'active' : ''}`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* ===== Date Navigation ===== */}
      {availableDates.length > 0 && (
        <div className="date-nav mb-6">
          <button 
            onClick={() => setSelectedDate(null)}
            className={`date-pill ${!selectedDate ? 'active' : ''}`}
          >
            <span className="date-pill-day">همه</span>
            <span className="date-pill-date">📅</span>
          </button>
          {availableDates.map((date) => (
            <button
              key={date}
              onClick={() => setSelectedDate(date === selectedDate ? null : date)}
              className={`date-pill ${selectedDate === date ? 'active' : ''}`}
            >
              <span className="date-pill-day">
                {date.split('/')[2]}
              </span>
              <span className="date-pill-date">
                {date.split('/')[2]}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* ===== Motivation Hero ===== */}
      <div className="motivation-hero">
        <div className="motivation-hero-content">
          <div className="motivation-hero-text">
            <h2 className="motivation-hero-title">
              <Sparkles className="inline-block w-6 h-6 ml-2" />
              امروز بهترین فرصت برای ساختن فردای بهتره!
            </h2>
            <p className="motivation-hero-subtitle">
              پیشرفت هفتگی شما
            </p>
            <div className="motivation-progress">
              <span className="motivation-progress-value">{stats.progress}%</span>
              <div className="motivation-progress-bar">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${stats.progress}%` }}
                  transition={{ duration: 1.5, ease: 'easeOut' }}
                  className="motivation-progress-fill"
                />
              </div>
            </div>
            <p className="motivation-hero-subtitle mt-2">
              {stats.completed > 0 
                ? `${stats.completed} از ${stats.total} برنامه انجام شده — ${stats.total - stats.completed} مونده! 💪`
                : 'شروع کن! اولین قدم مهم‌ترین قدمه! 🚀'}
            </p>
          </div>
          <div className="flex-shrink-0 hidden md:block">
            <div className="w-32 h-32 rounded-full bg-white/10 backdrop-blur-lg flex items-center justify-center">
              <Target className="w-16 h-16 text-white/80" />
            </div>
          </div>
        </div>
      </div>

      {/* ===== Stats Panel ===== */}
      <div className="stats-panel">
        <div className="stat-item">
          <div className="stat-icon" style={{ color: '#2563EB' }}>
            <TrendingUp className="w-5 h-5" />
          </div>
          <div className="stat-value">{stats.progress}%</div>
          <div className="stat-label">میانگین پیشرفت</div>
        </div>
        <div className="stat-item">
          <div className="stat-icon" style={{ color: '#F59E0B' }}>
            <Flame className="w-5 h-5" />
          </div>
          <div className="stat-value">{stats.total}</div>
          <div className="stat-label">کل برنامه‌ها</div>
        </div>
        <div className="stat-item">
          <div className="stat-icon" style={{ color: '#10B981' }}>
            <Clock className="w-5 h-5" />
          </div>
          <div className="stat-value">{stats.totalStudyTime}h</div>
          <div className="stat-label">ساعت مطالعه</div>
        </div>
        <div className="stat-item">
          <div className="stat-icon" style={{ color: '#8B5CF6' }}>
            <BookOpen className="w-5 h-5" />
          </div>
          <div className="stat-value">{stats.completed}</div>
          <div className="stat-label">انجام شده</div>
        </div>
      </div>

      {/* ===== Timeline ===== */}
      {filteredPlans.length === 0 ? (
        <div className="empty-state-plans">
          <div className="empty-state-illustration">
            <Calendar className="w-16 h-16 text-blue-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
            {search ? 'موردی یافت نشد!' : 'فعلاً برنامه‌ای برای این روز نداری'}
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            {search ? 'با عبارت دیگه‌ای جستجو کن.' : 'از فرصت امروز برای استراحت یا مرور هدف‌هات استفاده کن.'}
          </p>
          <button
            onClick={() => { setFilter('all'); setSearch(''); setSelectedDate(null); }}
            className="px-6 py-3 bg-blue-500 text-white rounded-2xl font-bold hover:bg-blue-600 transition-colors"
          >
            مشاهده همه برنامه‌ها
          </button>
        </div>
      ) : (
        <div className="timeline-container">
          <AnimatePresence>
            {filteredPlans.map((plan) => {
              const status = statusConfig[plan.status] || statusConfig.pending
              const accentColor = plan.course_color || status.color
              
              return (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="timeline-item"
                >
                  {/* Node */}
                  <div className={`timeline-node ${status.type}`} />
                  
                  {/* Card */}
                  <div 
                  className={`plan-card-premium ${plan.status === 'done' ? 'completed' : plan.status === 'pending' ? 'active' : ''}`}
                  style={{ '--accent-color': accentColor }}
                >
                  <div className="plan-card-horizontal">
                    {/* ===== تصویر بزرگ سمت چپ (LTR) ===== */}
                    <div className="plan-card-image-side">
                      {plan.course_image ? (
                        <img 
                          src={plan.course_image} 
                          alt={plan.course_name}
                          className="plan-card-image"
                          onError={(e) => { e.target.style.display = 'none' }}
                        />
                      ) : (
                        <div className="plan-card-image-placeholder">
                          <BookOpen className="w-12 h-12 text-gray-400" />
                        </div>
                      )}
                    </div>

                    {/* ===== توضیحات سمت راست (RTL) ===== */}
                    <div className="plan-card-content-side">
                      {/* عنوان و وضعیت */}
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <h4 className="plan-card-title">
                          {plan.course_name || plan.title}
                        </h4>
                        <span className={`status-pill ${status.type}`}>
                          {status.icon}
                          {status.label}
                        </span>
                      </div>

                      {/* توضیحات */}
                      {plan.description && (
                        <p className="plan-card-description line-clamp-2 mb-3">
                          {plan.description}
                        </p>
                      )}

                      {/* متا دیتا */}
                      <div className="flex items-center gap-3 flex-wrap mb-3">
                        {plan.study_time && (
                          <span className="plan-meta-badge">
                            <Clock className="w-3.5 h-3.5" />
                            {plan.study_time} ساعت
                          </span>
                        )}
                        <span className="plan-meta-badge">
                          <Calendar className="w-3.5 h-3.5" />
                          {plan.plan_date}
                        </span>
                      </div>

                      {/* دکمه انجام شد */}
                      {plan.status === 'pending' && (
                        <button
                          onClick={() => updateStatus(plan.id, 'done')}
                          disabled={updatingId === plan.id}
                          className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-bold transition-all flex items-center gap-1.5 disabled:opacity-50"
                        >
                          <CheckCircle className="w-4 h-4" />
                          انجام شد
                        </button>
                      )}

                      {/* Progress */}
                      <div className="plan-progress-wrapper mt-3">
                        <div className="plan-progress-header">
                          <span className="plan-progress-label">
                            {plan.status === 'done' 
                              ? 'تکمیل شده ✅' 
                              : plan.status === 'pending' 
                                ? 'در انتظار ⏳' 
                                : 'انجام نشده ❌'}
                          </span>
                          <span className="plan-progress-percentage" style={{ color: accentColor }}>
                            {plan.status === 'done' ? '100%' : '0%'}
                          </span>
                        </div>
                        <div className="plan-progress-bar">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ 
                              width: plan.status === 'done' ? '100%' : '0%',
                            }}
                            transition={{ duration: 0.8, ease: 'easeOut' }}
                            className={`plan-progress-fill ${status.type}`}
                            style={{
                              background: plan.status === 'done' 
                                ? 'linear-gradient(90deg, #10B981, #34D399)' 
                                : plan.status === 'missed'
                                  ? 'linear-gradient(90deg, #EF4444, #F87171)'
                                  : 'linear-gradient(90deg, #E2E8F0, #F1F5F9)',
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}

export default StudentPlans