import { useState, useEffect, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CalendarCheck, Plus, X, Send, AlertCircle,
  CheckCircle, Clock, XCircle, Search,
  Trash2, Users, BookOpen, ChevronDown,
  Sparkles, FileText, Inbox, BarChart3, TrendingUp
} from 'lucide-react'
import api from '../../api/axios'
import '../../styles/counselor-plans.css'

// ===== تابع تاریخ شمسی امروز =====
const getTodayJalali = () => {
  const now = new Date()
  const jalali = new Intl.DateTimeFormat('fa-IR-u-nu-latn', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(now)
  return jalali.replace(/\//g, '/')
}

const CounselorPlans = () => {
  const [plans, setPlans] = useState([])
  const [students, setStudents] = useState([])
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')
  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState('all')
  const [filterStudent, setFilterStudent] = useState('')
  const [filterDate, setFilterDate] = useState('')

  const [form, setForm] = useState({
    student: '',
    plan_date: getTodayJalali(),
    course: '',
    study_time: '',
    description: ''
  })

  const selectedCourse = useMemo(() => {
    return courses.find(c => c.id === Number(form.course))
  }, [courses, form.course])

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [plansRes, studentsRes] = await Promise.all([
        api.get('/counseling/plans/'),
        api.get('/counseling/plans/my-students/'),
      ])
      setPlans(plansRes.data)
      setStudents(studentsRes.data)
    } catch (err) {
      setError('خطا در دریافت اطلاعات.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleStudentChange = async (e) => {
    const studentId = e.target.value
    setForm({ ...form, student: studentId, course: '' })
    setFormError('')

    if (studentId) {
      try {
        const res = await api.get(`/counseling/plans/student-courses/?student_id=${studentId}`)
        setCourses(res.data)
      } catch (err) {
        console.error('Error fetching courses:', err)
        setCourses([])
      }
    } else {
      setCourses([])
    }
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setFormError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormError('')

    if (!form.student || !form.plan_date || !form.course) {
      setFormError('لطفاً دانش‌آموز، تاریخ و درس را انتخاب کنید.')
      return
    }

    setSubmitting(true)
    try {
      await api.post('/counseling/plans/', {
        student: Number(form.student),
        plan_date: form.plan_date,
        course: Number(form.course),
        study_time: form.study_time,
        description: form.description
      })

      setForm({
        student: '',
        plan_date: getTodayJalali(),
        course: '',
        study_time: '',
        description: ''
      })
      setCourses([])
      setShowModal(false)
      fetchData()
    } catch (err) {
      setFormError(err.response?.data?.error || 'خطا در ثبت برنامه.')
    } finally {
      setSubmitting(false)
    }
  }

  const updateStatus = async (planId, status) => {
    try {
      await api.patch(`/counseling/plans/${planId}/`, { status })
      setPlans(prev => prev.map(p => p.id === planId ? { ...p, status } : p))
    } catch (err) {
      console.error('Error updating plan:', err)
    }
  }

  const deletePlan = async (planId) => {
    if (!confirm('آیا از حذف این برنامه مطمئنی؟')) return
    try {
      await api.delete(`/counseling/plans/${planId}/`)
      setPlans(prev => prev.filter(p => p.id !== planId))
    } catch (err) {
      alert('خطا در حذف برنامه.')
    }
  }

  const filteredPlans = plans.filter(p => {
    const matchesSearch = !search ||
      p.course_name?.includes(search) ||
      p.student_name?.includes(search) ||
      p.description?.includes(search)
    const matchesStudent = !filterStudent || p.student === Number(filterStudent)
    const matchesDate = !filterDate || p.plan_date === filterDate
    const matchesTab = activeTab === 'all' || p.status === activeTab
    return matchesSearch && matchesStudent && matchesDate && matchesTab
  })

  const groupedPlans = filteredPlans.reduce((groups, plan) => {
    const date = plan.plan_date
    if (!groups[date]) groups[date] = []
    groups[date].push(plan)
    return groups
  }, {})

  // ===== آمار برای نمودار =====
  const stats = useMemo(() => {
    const total = plans.length
    const done = plans.filter(p => p.status === 'done').length
    const pending = plans.filter(p => p.status === 'pending').length
    const missed = plans.filter(p => p.status === 'missed').length
    const donePercent = total > 0 ? Math.round((done / total) * 100) : 0
    return { total, done, pending, missed, donePercent }
  }, [plans])

  const statusConfig = {
    pending: { label: 'در انتظار', icon: <Clock className="w-4 h-4" strokeWidth={1.8} />, color: '#F59E0B', bg: '#FFF7ED' },
    done: { label: 'انجام شده', icon: <CheckCircle className="w-4 h-4" strokeWidth={1.8} />, color: '#10B981', bg: '#ECFDF5' },
    missed: { label: 'انجام نشده', icon: <XCircle className="w-4 h-4" strokeWidth={1.8} />, color: '#EF4444', bg: '#FEF2F2' },
  }

  const tabs = [
    { id: 'all', label: 'همه', count: plans.length, gradient: 'linear-gradient(135deg, #3B82F6, #8B5CF6)' },
    { id: 'pending', label: 'در انتظار', count: stats.pending, gradient: 'linear-gradient(135deg, #F59E0B, #FBBF24)' },
    { id: 'done', label: 'انجام شده', count: stats.done, gradient: 'linear-gradient(135deg, #10B981, #34D399)' },
    { id: 'missed', label: 'انجام نشده', count: stats.missed, gradient: 'linear-gradient(135deg, #EF4444, #F87171)' },
  ]

  if (loading) {
    return (
      <div className="counselor-plans-container">
        <div className="plans-skeleton-stack">
          {[1, 2, 3].map((i) => (
            <div key={i} className="plans-skeleton-card">
              <div className="plans-skeleton-line plans-skeleton-line-lg" />
              <div className="plans-skeleton-line plans-skeleton-line-sm" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="counselor-plans-container">
        <div className="plans-state plans-state-error">
          <div className="plans-state-icon plans-state-icon-error">
            <AlertCircle className="w-9 h-9" strokeWidth={1.8} />
          </div>
          <h3 className="plans-state-title">خطا!</h3>
          <p className="plans-state-desc">{error}</p>
          <button onClick={fetchData} className="plans-retry-btn">تلاش دوباره</button>
        </div>
      </div>
    )
  }

  return (
    <div className="counselor-plans-container">
      
      {/* ===== Header ===== */}
      <div className="plans-header">
        <div>
          <h2 className="plans-heading">
            <span className="plans-heading-icon">
              <Sparkles className="w-5 h-5" strokeWidth={1.8} />
            </span>
            برنامه‌دهی
          </h2>
          <p className="plans-subheading">{plans.length} برنامه ثبت شده</p>
        </div>
        <button onClick={() => setShowModal(true)} className="plans-add-btn">
          <Plus className="w-5 h-5" strokeWidth={1.8} />
          افزودن برنامه جدید
        </button>
      </div>

      {/* ===== نمودار کوچیک ===== */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="plans-stats-panel"
      >
        <div className="plans-stats-item">
          <div className="plans-stats-icon plans-stats-icon-total">
            <BarChart3 className="w-4 h-4" strokeWidth={1.8} />
          </div>
          <div>
            <p className="plans-stats-value">{stats.total}</p>
            <p className="plans-stats-label">کل برنامه‌ها</p>
          </div>
        </div>
        <div className="plans-stats-divider" />
        <div className="plans-stats-item">
          <div className="plans-stats-icon plans-stats-icon-done">
            <CheckCircle className="w-4 h-4" strokeWidth={1.8} />
          </div>
          <div>
            <p className="plans-stats-value">{stats.done}</p>
            <p className="plans-stats-label">انجام شده</p>
          </div>
        </div>
        <div className="plans-stats-divider" />
        <div className="plans-stats-item">
          <div className="plans-stats-icon plans-stats-icon-pending">
            <Clock className="w-4 h-4" strokeWidth={1.8} />
          </div>
          <div>
            <p className="plans-stats-value">{stats.pending}</p>
            <p className="plans-stats-label">در انتظار</p>
          </div>
        </div>
        <div className="plans-stats-divider" />
        <div className="plans-stats-item">
          <div className="plans-stats-icon plans-stats-icon-missed">
            <XCircle className="w-4 h-4" strokeWidth={1.8} />
          </div>
          <div>
            <p className="plans-stats-value">{stats.missed}</p>
            <p className="plans-stats-label">انجام نشده</p>
          </div>
        </div>
        
        {/* درصد پیشرفت */}
        <div className="plans-stats-progress">
          <div className="plans-stats-progress-header">
            <span className="plans-stats-progress-label">پیشرفت کلی</span>
            <span className="plans-stats-progress-value">{stats.donePercent}%</span>
          </div>
          <div className="plans-stats-progress-bar">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${stats.donePercent}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="plans-stats-progress-fill"
            />
          </div>
        </div>
      </motion.div>

      {/* ===== Tab های رنگی ===== */}
      <div className="plans-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`plans-tab ${activeTab === tab.id ? 'plans-tab-active' : ''}`}
            style={activeTab === tab.id ? { background: tab.gradient } : {}}
          >
            <span>{tab.label}</span>
            <span className="plans-tab-count">{tab.count}</span>
          </button>
        ))}
      </div>

      {/* ===== Toolbar ===== */}
      <div className="plans-toolbar">
        <div className="toolbar-search">
          <Search className="toolbar-search-icon" strokeWidth={1.8} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="جستجو در برنامه‌ها..."
            className="toolbar-input toolbar-input-search"
          />
        </div>
        <input
          type="text"
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
          placeholder="فیلتر تاریخ..."
          className="toolbar-input"
        />
        <div className="form-select-wrapper toolbar-select-wrapper">
          <select
            value={filterStudent}
            onChange={(e) => setFilterStudent(e.target.value)}
            className="toolbar-input toolbar-select"
          >
            <option value="">همه دانش‌آموزان</option>
            {students.map(s => (
              <option key={s.id} value={s.id}>{s.full_name}</option>
            ))}
          </select>
          <ChevronDown className="form-select-chevron form-select-chevron-sm" strokeWidth={1.8} />
        </div>
      </div>

      {/* ===== Plans List ===== */}
      {filteredPlans.length === 0 ? (
        <div className="plans-state">
          <div className="plans-state-icon plans-state-icon-empty">
            <Inbox className="w-9 h-9" strokeWidth={1.6} />
          </div>
          <p className="plans-state-desc">برنامه‌ای یافت نشد.</p>
        </div>
      ) : (
        <div className="plans-groups">
          {Object.entries(groupedPlans).map(([date, datePlans]) => (
            <div key={date} className="plans-group">
              <div className="plans-group-header">
                <span className="plans-group-date">
                  <CalendarCheck className="w-4 h-4" strokeWidth={1.8} />
                  {date}
                </span>
                <span className="plans-group-count">{datePlans.length} برنامه</span>
                <span className="plans-group-line" />
              </div>

              <div className="plans-list">
                <AnimatePresence>
                  {datePlans.map((plan) => {
                    const status = statusConfig[plan.status] || statusConfig.pending
                    return (
                      <motion.div
                        key={plan.id}
                        initial={{ opacity: 0, y: 10, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.98 }}
                        transition={{ duration: 0.25 }}
                        className="plans-list-card"
                      >
                        <div className="plans-list-card-main">
                          <div className="plans-list-card-info">
                            {plan.course_image ? (
                              <img
                                src={plan.course_image}
                                alt={plan.course_name}
                                className="course-thumb"
                                onError={(e) => { e.target.style.display = 'none' }}
                              />
                            ) : (
                              <div className="course-thumb course-thumb-fallback">
                                <BookOpen className="w-5 h-5" strokeWidth={1.8} />
                              </div>
                            )}

                            <motion.div
                              className="plans-list-status-icon"
                              style={{ background: status.bg, color: status.color }}
                              animate={plan.status === 'pending' ? { rotate: [0, 5, -5, 0] } : {}}
                              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                            >
                              {status.icon}
                            </motion.div>

                            <div className="plans-list-text">
                              <h4 className="plans-list-title">{plan.course_name || 'بدون عنوان'}</h4>
                              <p className="plans-list-meta">
                                {plan.student_name} {plan.study_time && `• ${plan.study_time}`}
                              </p>
                            </div>
                          </div>

                          <div className="plans-list-actions">
                            {plan.status === 'pending' && (
                              <>
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => updateStatus(plan.id, 'done')}
                                  className="plans-action-chip plans-action-chip-done"
                                >
                                  <CheckCircle className="w-3 h-3" strokeWidth={2} />
                                  انجام شد
                                </motion.button>
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => updateStatus(plan.id, 'missed')}
                                  className="plans-action-chip plans-action-chip-missed"
                                >
                                  <XCircle className="w-3 h-3" strokeWidth={2} />
                                  نشد
                                </motion.button>
                              </>
                            )}
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => deletePlan(plan.id)}
                              className="plans-delete-btn"
                            >
                              <Trash2 className="w-4 h-4" strokeWidth={1.8} />
                            </motion.button>
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}
                </AnimatePresence>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ===== Modal ===== */}
      <AnimatePresence>
        {showModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="plans-modal-overlay"
              onClick={() => setShowModal(false)}
            />
            <div className="plans-modal-centered">
              <motion.div
                initial={{ opacity: 0, scale: 0.85, y: 40 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.85, y: 40 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                className="plans-modal-card"
              >
                <div className="plans-modal-header">
                  <div className="plans-modal-header-right">
                    <div className="plans-modal-icon">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="plans-modal-title">افزودن برنامه جدید</h3>
                      <p className="plans-modal-subtitle">برنامه درسی برای دانش‌آموز ثبت کن</p>
                    </div>
                  </div>
                  <button onClick={() => setShowModal(false)} className="plans-modal-close">
                    <X className="w-5 h-5" strokeWidth={1.8} />
                  </button>
                </div>

                {formError && (
                  <div className="plans-form-error">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" strokeWidth={1.8} />
                    {formError}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="plans-form">
                  <div className="form-field">
                    <label className="form-label">
                      <span className="form-label-icon form-label-icon-blue">
                        <Users className="w-4 h-4" strokeWidth={1.8} />
                      </span>
                      دانش‌آموز *
                    </label>
                    <div className="form-select-wrapper">
                      <select name="student" value={form.student} onChange={handleStudentChange} className="form-select">
                        <option value="">انتخاب دانش‌آموز...</option>
                        {students.map(s => (
                          <option key={s.id} value={s.id}>
                            {s.full_name} {s.field_of_study && `(${s.field_of_study})`}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="form-select-chevron" strokeWidth={1.8} />
                    </div>
                  </div>

                  <div className="form-field">
                    <label className="form-label">
                      <span className="form-label-icon form-label-icon-purple">
                        <BookOpen className="w-4 h-4" strokeWidth={1.8} />
                      </span>
                      درس *
                    </label>
                    <div className="form-select-wrapper">
                      <select
                        name="course"
                        value={form.course}
                        onChange={handleChange}
                        disabled={!form.student}
                        className="form-select"
                      >
                        <option value="">
                          {form.student ? 'انتخاب درس...' : 'اول دانش‌آموز رو انتخاب کن'}
                        </option>
                        {courses.map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                      <ChevronDown className="form-select-chevron" strokeWidth={1.8} />
                    </div>
                    {!form.student && (
                      <p className="form-hint">برای نمایش درس‌ها، اول دانش‌آموز رو انتخاب کن.</p>
                    )}
                  </div>

                  <AnimatePresence>
                    {selectedCourse && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, height: 0 }}
                        animate={{ opacity: 1, scale: 1, height: 'auto' }}
                        exit={{ opacity: 0, scale: 0.95, height: 0 }}
                        className="course-preview"
                      >
                        {selectedCourse.image ? (
                          <img
                            src={selectedCourse.image}
                            alt={selectedCourse.name}
                            onError={(e) => { e.target.style.display = 'none' }}
                          />
                        ) : (
                          <div className="course-preview-fallback">
                            <BookOpen className="w-6 h-6" strokeWidth={1.8} />
                          </div>
                        )}
                        <div>
                          <p className="course-preview-name">{selectedCourse.name}</p>
                          <p className="course-preview-tag">
                            <CheckCircle className="w-3.5 h-3.5" strokeWidth={2} />
                            درس انتخاب شده
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="form-row">
                    <div className="form-field">
                      <label className="form-label">
                        <span className="form-label-icon form-label-icon-green">
                          <CalendarCheck className="w-4 h-4" strokeWidth={1.8} />
                        </span>
                        تاریخ *
                      </label>
                      <input type="text" name="plan_date" value={form.plan_date} onChange={handleChange} className="form-input" />
                    </div>
                    <div className="form-field">
                      <label className="form-label">
                        <span className="form-label-icon form-label-icon-orange">
                          <Clock className="w-4 h-4" strokeWidth={1.8} />
                        </span>
                        زمان مطالعه
                      </label>
                      <input
                        type="text"
                        name="study_time"
                        value={form.study_time}
                        onChange={handleChange}
                        placeholder="مثلاً: ۲ ساعت"
                        className="form-input"
                      />
                    </div>
                  </div>

                  <div className="form-field">
                    <label className="form-label">
                      <span className="form-label-icon form-label-icon-slate">
                        <FileText className="w-4 h-4" strokeWidth={1.8} />
                      </span>
                      توضیحات
                    </label>
                    <textarea
                      name="description"
                      value={form.description}
                      onChange={handleChange}
                      rows={3}
                      placeholder="توضیحات اختیاری..."
                      className="form-textarea"
                    />
                  </div>

                  <div className="plans-form-actions">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="plans-modal-cancel"
                    >
                      انصراف
                    </button>
                    <button type="submit" disabled={submitting} className="plans-submit-btn">
                      {submitting ? (
                        <span className="plans-submit-spinner" />
                      ) : (
                        <Send className="w-5 h-5" strokeWidth={1.8} />
                      )}
                      ثبت برنامه
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

export default CounselorPlans