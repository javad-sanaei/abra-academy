import { useState, useEffect, useCallback } from 'react'
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CalendarCheck,
  FileText,
  GraduationCap,
  BookOpen,
  TrendingUp,
  Clock,
  CheckCircle2,
  ChevronRight,
  Headphones,
  Star,
  Flame,
  Plus,
  Target,
  Trash2,
  Edit3,
  X,
  Sparkles,
  Quote,
  ArrowUpRight,
  AlertCircle,
} from 'lucide-react'

// کامپوننت‌های اصلی خودت
import Sidebar from '../../components/ui/Sidebar'
import Topbar from '../../components/ui/Topbar'

// کامپوننت‌های بخش‌های مختلف
import StudentPlans from '../../components/student/StudentPlans'
import StudentReports from '../../components/student/StudentReports'
import StudentExams from '../../components/student/StudentExams'
import StudentExamTake from '../../components/student/StudentExamTake'
import StudentEducation from '../../components/student/StudentEducation'
import StudentPsychology from '../../components/student/StudentPsychology'
import StudentExamReport from '../../components/student/StudentExamReport'

import api from '../../api/axios'
import '../../styles/dashboard.css'
import '../../styles/student-premium.css'
import '../../styles/student-dashboard-premium.css'

// ==================== GlassCard ====================
const GlassCard = ({ children, className = '', accent = 'blue', ...props }) => {
  const accents = {
    blue: 'from-blue-500/5 to-blue-600/5 border-blue-200/30 dark:border-blue-500/20',
    purple: 'from-purple-500/5 to-purple-600/5 border-purple-200/30 dark:border-purple-500/20',
    green: 'from-emerald-500/5 to-emerald-600/5 border-emerald-200/30 dark:border-emerald-500/20',
    orange: 'from-amber-500/5 to-amber-600/5 border-amber-200/30 dark:border-amber-500/20',
  }

  return (
    <motion.div
      whileHover={{ y: -2, scale: 1.01 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className={`relative overflow-hidden rounded-[28px] bg-gradient-to-br ${accents[accent]} border backdrop-blur-xl shadow-[0_8px_32px_-8px_rgba(59,130,246,0.08)] dark:shadow-[0_8px_32px_-8px_rgba(59,130,246,0.15)] p-6 ${className}`}
      {...props}
    >
      <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-gradient-to-br from-blue-400/5 to-purple-400/5 blur-3xl pointer-events-none" />
      {children}
    </motion.div>
  )
}

// ==================== StatCard Premium ====================
const StatCard = ({ label, value, sub, icon: Icon, color, onClick, progress, details }) => {
  const colorMap = {
    blue: { gradient: 'linear-gradient(135deg, #3B82F6, #6366F1)' },
    purple: { gradient: 'linear-gradient(135deg, #8B5CF6, #A78BFA)' },
    green: { gradient: 'linear-gradient(135deg, #10B981, #34D399)' },
    orange: { gradient: 'linear-gradient(135deg, #F59E0B, #FBBF24)' },
  }

  return (
    <motion.div
      whileHover={{ y: -5, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`stat-card-premium stat-card-premium--${color}`}
    >
      {/* هدر */}
      <div className="stat-card-premium-header">
        <span className="stat-card-premium-label">{label}</span>
        <div className="stat-card-premium-icon">
          <Icon className="w-6 h-6" strokeWidth={1.8} />
        </div>
      </div>

      {/* عدد */}
      <p className="stat-card-premium-value">{value}</p>
      <p className="stat-card-premium-sub">{sub}</p>

      {/* نوار پیشرفت */}
      {progress !== undefined && (
        <div className="stat-card-premium-progress-wrap">
          <div className="stat-card-premium-progress-header">
            <span className="stat-card-premium-progress-label">پیشرفت</span>
            <span className="stat-card-premium-progress-value">{progress}٪</span>
          </div>
          <div className="stat-card-premium-progress-bar">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
              className="stat-card-premium-progress-fill"
            />
          </div>
        </div>
      )}

      {/* جزئیات */}
      {details && details.length > 0 && (
        <div className="stat-card-premium-details">
          {details.map((d, i) => (
            <span key={i} className="stat-card-premium-detail-item">
              {d.icon}
              {d.label}: <strong>{d.value}</strong>
            </span>
          ))}
        </div>
      )}

      {/* CTA */}
      <div className="stat-card-premium-cta">
        <ArrowUpRight className="w-5 h-5" />
      </div>
    </motion.div>
  )
}

// ==================== WelcomeHeader ====================
const WelcomeHeader = ({ user, stats }) => {
  const today = new Date().toLocaleDateString('fa-IR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const doneCount = stats?.today_schedule?.filter(t => t.status === 'done').length || 0
  const totalCount = stats?.today_schedule?.length || 0
  
  let statusEmoji = '🌤️'
  let statusText = 'امروز رو شروع کن!'
  if (totalCount > 0 && doneCount === totalCount) {
    statusEmoji = '🌟'
    statusText = 'عالی بودی! همه کارهات انجام شد!'
  } else if (doneCount > 0) {
    statusEmoji = '💪'
    statusText = 'ادامه بده! داری عالی پیش میری!'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-[34px] bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-navy-800 dark:to-purple-950/50 border border-blue-100/50 dark:border-gray-700/50 p-8 mb-8"
    >
      {/* ابر تزئینی */}
      <motion.div
        animate={{ y: [0, -8, 0], x: [0, 5, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute left-8 top-4 opacity-40 dark:opacity-20 pointer-events-none"
      >
        <div className="relative">
          <div className="w-24 h-16 bg-white dark:bg-gray-700/30 rounded-full blur-sm" />
          <div className="absolute -top-4 left-4 w-12 h-12 bg-white dark:bg-gray-700/30 rounded-full blur-sm" />
          <div className="absolute -top-2 right-2 w-10 h-10 bg-white dark:bg-gray-700/30 rounded-full blur-sm" />
          <div className="absolute top-3 left-7 flex gap-2">
            <div className="w-1.5 h-1.5 bg-navy-800 dark:bg-gray-300 rounded-full" />
            <div className="w-1.5 h-1.5 bg-navy-800 dark:bg-gray-300 rounded-full" />
          </div>
          <div className="absolute top-5 left-8 w-3 h-1.5 border-b-2 border-navy-800 dark:border-gray-300 rounded-b-full" />
        </div>
      </motion.div>

      {/* هاله پس‌زمینه */}
      <div className="absolute top-[-30%] right-[-10%] w-64 h-64 bg-blue-100/30 dark:bg-blue-500/5 rounded-full blur-[80px] pointer-events-none" />
      <div className="absolute bottom-[-40%] left-[-10%] w-72 h-72 bg-purple-100/30 dark:bg-purple-500/5 rounded-full blur-[90px] pointer-events-none" />

      <div className="relative z-10">
        <h2 className="text-2xl font-black text-gray-800 dark:text-white mb-2">
          سلام {user?.first_name || user?.full_name || 'دوست من'} جان! {statusEmoji}
        </h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          امروز {today} | {totalCount} برنامه داری | {doneCount} تا انجام شده
        </p>
        <div className="flex items-center gap-2 mt-3 flex-wrap">
          <span className="px-3 py-1 bg-blue-100 dark:bg-blue-500/15 text-blue-600 dark:text-blue-400 text-xs font-bold rounded-full">
            {statusText}
          </span>
          {stats?.streak > 0 && (
            <span className="px-3 py-1 bg-amber-100 dark:bg-amber-500/15 text-amber-600 dark:text-amber-400 text-xs font-bold rounded-full flex items-center gap-1">
              <Flame className="w-3 h-3" />
              {stats.streak} روز پیاپی
            </span>
          )}
        </div>
      </div>
    </motion.div>
  )
}

// ==================== TodaySchedule ====================
const TodaySchedule = ({ schedule, onToggle }) => {
  if (!schedule || schedule.length === 0) {
    return (
      <GlassCard accent="blue">
        <h3 className="text-lg font-black text-gray-800 dark:text-white flex items-center gap-2 mb-4">
          📋 برنامه امروز
        </h3>
        <div className="text-center py-8 text-gray-400">
          <CalendarCheck className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">امروز برنامه‌ای نداری!</p>
        </div>
      </GlassCard>
    )
  }

  return (
    <GlassCard accent="blue">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-black text-gray-800 dark:text-white flex items-center gap-2">
          📋 برنامه امروز
        </h3>
        <span className="text-xs text-gray-400 bg-gray-100 dark:bg-navy-700 px-2 py-1 rounded-full">
          {schedule.length} برنامه
        </span>
      </div>
      
      <div className="space-y-1">
        {schedule.slice(0, 5).map((item) => (
          <motion.div
            key={item.id}
            whileHover={{ x: 4 }}
            onClick={() => onToggle(item.id, item.status === 'done')}
            className="flex items-center gap-3 p-3 rounded-2xl hover:bg-gray-50/50 dark:hover:bg-navy-700/50 transition-colors cursor-pointer"
          >
            <motion.div
              whileTap={{ scale: 0.8 }}
              className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center flex-shrink-0 ${
                item.status === 'done'
                  ? 'bg-emerald-500 border-emerald-500'
                  : 'border-gray-300 dark:border-gray-600'
              }`}
            >
              {item.status === 'done' && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
            </motion.div>
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-medium truncate ${item.status === 'done' ? 'text-gray-400 line-through' : 'text-gray-700 dark:text-gray-200'}`}>
                {item.title}
              </p>
            </div>
            {item.time && (
              <span className="text-xs text-gray-400 flex items-center gap-1 flex-shrink-0">
                <Clock className="w-3 h-3" />{item.time}
              </span>
            )}
          </motion.div>
        ))}
      </div>
    </GlassCard>
  )
}

// ==================== TodoList ====================
const TodoList = ({ todos, onToggle, onDelete, onAdd }) => {
  const [newTodo, setNewTodo] = useState('')

  const handleAdd = (e) => {
    e.preventDefault()
    if (newTodo.trim()) {
      const today = new Date().toLocaleDateString('fa-IR-u-nu-latn', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }).replace(/\//g, '/')
      
      onAdd(newTodo.trim(), today)
      setNewTodo('')
    }
  }

  return (
    <GlassCard accent="purple">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-black text-gray-800 dark:text-white flex items-center gap-2">
          ✅ کارهای امروز
        </h3>
        <span className="text-xs text-gray-400 bg-gray-100 dark:bg-navy-700 px-2 py-1 rounded-full">
          {todos?.filter(t => t.is_done).length || 0}/{todos?.length || 0}
        </span>
      </div>

      {todos && todos.length > 0 && (
        <div className="space-y-0.5 mb-3">
          {todos.map((todo) => (
            <motion.div
              key={todo.id}
              whileHover={{ x: 4 }}
              className="flex items-center gap-3 p-3 rounded-2xl hover:bg-gray-50/50 dark:hover:bg-navy-700/50 transition-colors group"
            >
              <motion.div
                whileTap={{ scale: 0.8 }}
                onClick={() => onToggle(todo.id, todo.is_done)}
                className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center flex-shrink-0 cursor-pointer ${
                  todo.is_done
                    ? 'bg-purple-500 border-purple-500'
                    : 'border-gray-300 dark:border-gray-600'
                }`}
              >
                {todo.is_done && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
              </motion.div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium truncate ${todo.is_done ? 'text-gray-400 line-through' : 'text-gray-700 dark:text-gray-200'}`}>
                  {todo.title}
                </p>
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => onDelete(todo.id)}
                className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-red-500"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </motion.button>
            </motion.div>
          ))}
        </div>
      )}

      <form onSubmit={handleAdd} className="flex gap-2">
        <input
          type="text"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          placeholder="تسک جدید..."
          className="flex-1 px-4 py-2.5 rounded-2xl bg-gray-50 dark:bg-navy-700 border border-gray-200 dark:border-navy-600 text-gray-700 dark:text-gray-200 text-sm outline-none focus:border-purple-500 transition-colors"
        />
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          type="submit"
          className="px-4 py-2.5 bg-gradient-to-r from-purple-500 to-purple-600 text-white font-bold rounded-2xl text-sm flex items-center gap-1"
        >
          <Plus className="w-4 h-4" />
        </motion.button>
      </form>
    </GlassCard>
  )
}

// ==================== GoalWidget ====================
const GoalWidget = ({ goal, onEdit, onDelete }) => {
  if (!goal) {
    return (
      <GlassCard accent="green" className="text-center">
        <Target className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
        <p className="text-sm font-bold text-gray-700 dark:text-gray-200 mb-2">هنوز هدفی تعیین نکردی!</p>
        <p className="text-xs text-gray-400 mb-4">یه هدف بذار و پیشرفتت رو ببین</p>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onEdit}
          className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold rounded-2xl text-sm shadow-lg shadow-emerald-500/20 flex items-center gap-2 mx-auto"
        >
          <Plus className="w-4 h-4" />
          تعیین هدف جدید
        </motion.button>
      </GlassCard>
    )
  }

  return (
    <GlassCard accent="green">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-black text-gray-800 dark:text-white flex items-center gap-2">
            <Target className="w-5 h-5 text-emerald-500" />
            هدف من
          </h3>
          <p className="text-sm font-bold text-gray-600 dark:text-gray-300 mt-1">{goal.title}</p>
          <span className="text-xs text-gray-400 mt-0.5 block">{goal.goal_type_display}</span>
        </div>
        <div className="flex gap-1">
          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={onEdit}
            className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-navy-700 flex items-center justify-center">
            <Edit3 className="w-3.5 h-3.5 text-gray-500" />
          </motion.button>
          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={onDelete}
            className="w-8 h-8 rounded-xl bg-red-50 dark:bg-red-500/10 flex items-center justify-center">
            <Trash2 className="w-3.5 h-3.5 text-red-400" />
          </motion.button>
        </div>
      </div>

      <div className="mb-3">
        <div className="flex justify-between text-xs mb-1">
          <span className="text-gray-500">{goal.current_value} از {goal.target_value}</span>
          <span className="font-bold text-emerald-500">{goal.progress_percentage}%</span>
        </div>
        <div className="h-3 bg-gray-100 dark:bg-navy-700 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${goal.progress_percentage}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full"
          />
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-gray-400">
        <span>⏳ {goal.days_remaining} روز باقی‌مونده</span>
        <span>{goal.start_date} تا {goal.end_date}</span>
      </div>
    </GlassCard>
  )
}

// ==================== GoalModal ====================
const GoalModal = ({ isOpen, onClose, onSave, initialData }) => {
  const [title, setTitle] = useState(initialData?.title || '')
  const [goalType, setGoalType] = useState(initialData?.goal_type || 'study_hours')
  const [targetValue, setTargetValue] = useState(initialData?.target_value || 20)
  const [startDate, setStartDate] = useState(initialData?.start_date || '')
  const [endDate, setEndDate] = useState(initialData?.end_date || '')

  const goalTypes = [
    { value: 'study_hours', label: '📚 ساعت مطالعه' },
    { value: 'tests', label: '📝 تعداد تست' },
    { value: 'lessons', label: '📖 تعداد درس' },
    { value: 'exercise', label: '🏃 ورزش' },
    { value: 'meditation', label: '🧘 مدیتیشن' },
    { value: 'reading', label: '📕 کتاب‌خوانی' },
    { value: 'custom', label: '✨ شخصی‌سازی' },
  ]

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave({ title, goal_type: goalType, target_value: targetValue, start_date: startDate, end_date: endDate })
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md p-4"
          >
            <div className="bg-white dark:bg-navy-800 rounded-[32px] p-8 shadow-2xl border border-gray-100 dark:border-navy-700">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-black text-gray-800 dark:text-white">
                  {initialData ? 'ویرایش هدف' : 'هدف جدید'}
                </h3>
                <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={onClose}
                  className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-navy-700 flex items-center justify-center">
                  <X className="w-4 h-4 text-gray-500" />
                </motion.button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-bold text-gray-600 dark:text-gray-300 mb-1 block">عنوان هدف</label>
                  <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required
                    placeholder="مثلاً: کنکور رو بترکونم!"
                    className="w-full px-4 py-3 rounded-2xl bg-gray-50 dark:bg-navy-700 border border-gray-200 dark:border-navy-600 text-gray-800 dark:text-white text-sm outline-none focus:border-emerald-500 transition-colors" />
                </div>

                <div>
                  <label className="text-sm font-bold text-gray-600 dark:text-gray-300 mb-1 block">نوع هدف</label>
                  <select value={goalType} onChange={(e) => setGoalType(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl bg-gray-50 dark:bg-navy-700 border border-gray-200 dark:border-navy-600 text-gray-800 dark:text-white text-sm outline-none focus:border-emerald-500 transition-colors">
                    {goalTypes.map((type) => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-bold text-gray-600 dark:text-gray-300 mb-1 block">مقدار هدف</label>
                  <input type="number" value={targetValue} onChange={(e) => setTargetValue(Number(e.target.value))} required min="1"
                    className="w-full px-4 py-3 rounded-2xl bg-gray-50 dark:bg-navy-700 border border-gray-200 dark:border-navy-600 text-gray-800 dark:text-white text-sm outline-none focus:border-emerald-500 transition-colors" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-bold text-gray-600 dark:text-gray-300 mb-1 block">تاریخ شروع</label>
                    <input type="text" value={startDate} onChange={(e) => setStartDate(e.target.value)} required
                      placeholder="1405/06/01"
                      className="w-full px-4 py-3 rounded-2xl bg-gray-50 dark:bg-navy-700 border border-gray-200 dark:border-navy-600 text-gray-800 dark:text-white text-sm outline-none focus:border-emerald-500 transition-colors" />
                  </div>
                  <div>
                    <label className="text-sm font-bold text-gray-600 dark:text-gray-300 mb-1 block">تاریخ پایان</label>
                    <input type="text" value={endDate} onChange={(e) => setEndDate(e.target.value)} required
                      placeholder="1405/06/07"
                      className="w-full px-4 py-3 rounded-2xl bg-gray-50 dark:bg-navy-700 border border-gray-200 dark:border-navy-600 text-gray-800 dark:text-white text-sm outline-none focus:border-emerald-500 transition-colors" />
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold rounded-2xl text-sm shadow-lg shadow-emerald-500/20 mt-4"
                >
                  {initialData ? 'بروزرسانی هدف' : 'ایجاد هدف'}
                </motion.button>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

// ==================== DailyQuote ====================
const DailyQuote = ({ quote }) => {
  if (!quote) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-8"
    >
      <GlassCard accent="orange">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-500/10 flex items-center justify-center flex-shrink-0">
            <Quote className="w-6 h-6 text-amber-500" />
          </div>
          <div>
            <p className="text-sm text-gray-700 dark:text-gray-200 leading-relaxed italic">
              "{quote.quote}"
            </p>
            {quote.author && (
              <p className="text-xs text-gray-400 mt-2">— {quote.author}</p>
            )}
          </div>
        </div>
      </GlassCard>
    </motion.div>
  )
}

// ==================== DASHBOARD MAIN ====================

const StudentDashboard = () => {
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [stats, setStats] = useState(null)
  const [todos, setTodos] = useState([])
  const [loading, setLoading] = useState(true)
  const [goalModalOpen, setGoalModalOpen] = useState(false)
  const [editingGoal, setEditingGoal] = useState(null)
  const location = useLocation()

  const user = JSON.parse(localStorage.getItem('user') || '{}')

  const fetchStats = useCallback(async () => {
    try {
      const res = await api.get('/student/stats/')
      setStats(res.data)
    } catch (err) {
      console.error('خطا در دریافت آمار:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchTodos = useCallback(async () => {
    try {
      const res = await api.get('/student/todos/')
      setTodos(res.data)
    } catch (err) {
      console.error('خطا در دریافت تسک‌ها:', err)
    }
  }, [])

  useEffect(() => {
    fetchStats()
    fetchTodos()
  }, [fetchStats, fetchTodos])

  const handleTogglePlan = async (planId, currentDone) => {
    try {
      await api.patch(`/student/plans/${planId}/toggle/`)
      fetchStats()
    } catch (err) {
      console.error('خطا در تغییر وضعیت:', err)
    }
  }

  const handleAddTodo = async (title, date) => {
    try {
      await api.post('/student/todos/', { title, date })
      fetchTodos()
    } catch (err) {
      console.error('خطا در افزودن تسک:', err)
    }
  }

  const handleToggleTodo = async (todoId, currentDone) => {
    try {
      await api.patch(`/student/todos/${todoId}/`, { is_done: !currentDone })
      fetchTodos()
    } catch (err) {
      console.error('خطا در تغییر وضعیت تسک:', err)
    }
  }

  const handleDeleteTodo = async (todoId) => {
    try {
      await api.delete(`/student/todos/${todoId}/`)
      fetchTodos()
    } catch (err) {
      console.error('خطا در حذف تسک:', err)
    }
  }

  const handleSaveGoal = async (data) => {
    try {
      if (editingGoal?.id) {
        await api.patch(`/student/goals/${editingGoal.id}/`, data)
      } else {
        await api.post('/student/goals/', data)
      }
      fetchStats()
      setEditingGoal(null)
    } catch (err) {
      console.error('خطا در ذخیره هدف:', err)
    }
  }

  const handleDeleteGoal = async () => {
    if (!stats?.active_goal?.id) return
    if (!confirm('هدف حذف بشه؟')) return
    try {
      await api.delete(`/student/goals/${stats.active_goal.id}/`)
      fetchStats()
    } catch (err) {
      console.error('خطا در حذف هدف:', err)
    }
  }

  if (loading) {
    return (
      <div className="dashboard-container">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="dashboard-main">
          <Topbar onMenuClick={() => setSidebarOpen(true)} currentPath={location.pathname} />
          <div className="flex items-center justify-center h-96">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
              className="w-16 h-16 rounded-full border-4 border-blue-100 dark:border-blue-500/20 border-t-blue-500"
            />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="dashboard-container">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="dashboard-main">
        <Topbar onMenuClick={() => setSidebarOpen(true)} currentPath={location.pathname} />
        
        <div className="dashboard-content">
          <Routes>
            <Route path="/" element={
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <WelcomeHeader user={user} stats={stats} />

                {/* ===== ۴ کارت آماری Premium ===== */}
                <div className="stat-cards-grid">
                  <StatCard
                    label="کل برنامه‌ها"
                    value={stats?.total_plans ?? 0}
                    sub="برنامه‌های درسی"
                    icon={CalendarCheck}
                    color="blue"
                    progress={stats?.total_plans > 0 ? Math.round((stats?.done_plans / stats?.total_plans) * 100) : 0}
                    details={[
                      { icon: <CheckCircle2 className="w-3 h-3 text-emerald-500" />, label: 'انجام', value: stats?.done_plans ?? 0 },
                      { icon: <Clock className="w-3 h-3 text-amber-500" />, label: 'در انتظار', value: stats?.pending_plans ?? 0 },
                    ]}
                    onClick={() => navigate('/dashboard/student/plans')}
                  />
                  <StatCard
                    label="گزارش‌های ثبت شده"
                    value={stats?.total_reports ?? 0}
                    sub="گزارش کار روزانه"
                    icon={FileText}
                    color="purple"
                    progress={stats?.streak ? Math.min(stats.streak * 10, 100) : 0}
                    details={[
                      { icon: <Flame className="w-3 h-3 text-amber-500" />, label: 'استریک', value: `${stats?.streak ?? 0} روز` },
                    ]}
                    onClick={() => navigate('/dashboard/student/reports')}
                  />
                  <StatCard
                    label="آزمون‌های فعال"
                    value={stats?.total_exams ?? 0}
                    sub="آزمون‌های درسی"
                    icon={GraduationCap}
                    color="green"
                    progress={stats?.total_exams > 0 ? Math.round((stats?.completed_exams / stats?.total_exams) * 100) : 0}
                    details={[
                      { icon: <CheckCircle2 className="w-3 h-3 text-emerald-500" />, label: 'تکمیل', value: stats?.completed_exams ?? 0 },
                    ]}
                    onClick={() => navigate('/dashboard/student/exams')}
                  />
                  <StatCard
                    label="دروس مطالعه شده"
                    value={stats?.lessons ?? 0}
                    sub="دروس مطالعه شده"
                    icon={BookOpen}
                    color="orange"
                    progress={stats?.lessons > 0 ? 100 : 0}
                    details={[
                      { icon: <TrendingUp className="w-3 h-3 text-blue-500" />, label: 'پیشرفت', value: `${stats?.weekly_progress ?? 0}٪` },
                    ]}
                    onClick={() => navigate('/dashboard/student/education')}
                  />
                </div>

                {/* ===== سه ستون اصلی ===== */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                  <TodaySchedule
                    schedule={stats?.today_schedule}
                    onToggle={handleTogglePlan}
                  />
                  <TodoList
                    todos={todos}
                    onToggle={handleToggleTodo}
                    onDelete={handleDeleteTodo}
                    onAdd={handleAddTodo}
                  />
                  <GoalWidget
                    goal={stats?.active_goal}
                    onEdit={() => {
                      setEditingGoal(stats?.active_goal || {})
                      setGoalModalOpen(true)
                    }}
                    onDelete={handleDeleteGoal}
                  />
                </div>

                <DailyQuote quote={stats?.daily_quote} />

                <motion.div
                  whileHover={{ scale: 1.01 }}
                  className="support-widget mt-8"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center flex-shrink-0">
                      <Headphones className="w-7 h-7 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-base font-bold text-gray-700 dark:text-gray-200">نیاز به کمک داری؟</p>
                      <p className="text-sm text-gray-400">پشتیبانی ۲۴/۷ در کنارته — هر سوالی داری بپرس!</p>
                    </div>
                    <ChevronRight className="w-6 h-6 text-gray-400" />
                  </div>
                </motion.div>
              </motion.div>
            } />
            
            <Route path="/plans" element={<StudentPlans />} />
            <Route path="/reports" element={<StudentReports />} />
            <Route path="/exams" element={<StudentExams />} />
            <Route path="/exams/:examId" element={<StudentExamTake />} />
            <Route path="/education" element={<StudentEducation />} />
            <Route path="/psychology" element={<StudentPsychology />} />
            <Route path="/exams/:examId/result" element={<StudentExamReport />} />
            <Route path="*" element={<Navigate to="/dashboard/student" replace />} />
          </Routes>
        </div>
      </div>

      <GoalModal
        isOpen={goalModalOpen}
        onClose={() => {
          setGoalModalOpen(false)
          setEditingGoal(null)
        }}
        onSave={handleSaveGoal}
        initialData={editingGoal}
      />
    </div>
  )
}

export default StudentDashboard