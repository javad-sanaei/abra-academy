import { useState, useEffect, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Plus, X, Calendar, Clock, FileText, Target, 
  CheckCircle, AlertCircle, TrendingUp, BookOpen,
  ChevronDown, Search, Send, Sparkles, BarChart3,
  Award, Flame, Layers
} from 'lucide-react'
import api from '../../api/axios'
import '../../styles/student-reports.css'

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

const StudentReports = () => {
  const [reports, setReports] = useState([])
  const [coursesList, setCoursesList] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')
  const [formSuccess, setFormSuccess] = useState(false)
  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState('all')

  // فرم
  const [form, setForm] = useState({
    report_date: getTodayJalali(),
    course: '',
    study_time: '',
    correct_answers: '',
    wrong_answers: '',
    unanswered: '',
    test_time: '',
    topic: '',
    description: ''
  })

  // درس انتخاب شده
  const selectedCourse = useMemo(() => {
    return coursesList.find(c => c.id === Number(form.course))
  }, [coursesList, form.course])

  const fetchReports = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await api.get('/student/reports/')
      setReports(res.data)
    } catch (err) {
      setError('خطا در دریافت گزارش‌ها.')
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchCourses = useCallback(async () => {
    try {
      const res = await api.get('/student/courses-list/')
      setCoursesList(res.data)
    } catch (err) {
      console.error('Error fetching courses:', err)
    }
  }, [])

  useEffect(() => {
    fetchReports()
    fetchCourses()
  }, [fetchReports, fetchCourses])

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setFormError('')
  }

  // محاسبات
  const totalQuestions = 
    (Number(form.correct_answers) || 0) + 
    (Number(form.wrong_answers) || 0) + 
    (Number(form.unanswered) || 0)

  const percentage = totalQuestions > 0 
    ? (((Number(form.correct_answers) || 0) * 3 - (Number(form.wrong_answers) || 0)) / (totalQuestions * 3) * 100).toFixed(1)
    : 0

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormError('')
    setFormSuccess(false)

    if (!form.report_date || !form.course || !form.study_time) {
      setFormError('لطفاً تاریخ، درس و زمان مطالعه را انتخاب کنید.')
      return
    }

    setSubmitting(true)
    try {
      await api.post('/student/reports/create/', {
        report_date: form.report_date.replace(/\//g, '-').replace(/\s+/g, ''),
        course: Number(form.course),
        study_time: Number(form.study_time),
        correct_answers: Number(form.correct_answers) || 0,
        wrong_answers: Number(form.wrong_answers) || 0,
        unanswered: Number(form.unanswered) || 0,
        test_time: Number(form.test_time) || 0,
        topic: form.topic,
        description: form.description
      })

      setFormSuccess(true)
      setForm({
        report_date: getTodayJalali(),
        course: '',
        study_time: '',
        correct_answers: '',
        wrong_answers: '',
        unanswered: '',
        test_time: '',
        topic: '',
        description: ''
      })
      
      setTimeout(() => {
        setShowModal(false)
        setFormSuccess(false)
      }, 1200)
      
      fetchReports()
    } catch (err) {
      setFormError(err.response?.data?.error || 'خطا در ثبت گزارش.')
    } finally {
      setSubmitting(false)
    }
  }

  // ===== آمار کلی =====
  const stats = useMemo(() => {
    const total = reports.length
    const totalStudyHours = reports.reduce((sum, r) => sum + (Number(r.study_time) || 0), 0)
    const totalTests = reports.reduce((sum, r) => sum + (r.total_questions || 0), 0)
    const avgPercentage = total > 0 
      ? Math.round(reports.reduce((sum, r) => sum + (r.percentage || 0), 0) / total) 
      : 0
    return { total, totalStudyHours, totalTests, avgPercentage }
  }, [reports])

  // ===== فیلتر =====
  const filteredReports = reports.filter(r => {
    const matchesSearch = !search || 
      r.course_name?.includes(search) ||
      r.topic?.includes(search) ||
      r.description?.includes(search)
    const matchesTab = activeTab === 'all' || 
      (activeTab === 'good' && r.percentage >= 60) ||
      (activeTab === 'medium' && r.percentage >= 40 && r.percentage < 60) ||
      (activeTab === 'weak' && r.percentage < 40)
    return matchesSearch && matchesTab
  })

  const groupedReports = filteredReports.reduce((groups, report) => {
    const date = report.report_date
    if (!groups[date]) groups[date] = []
    groups[date].push(report)
    return groups
  }, {})

  // ===== رنگ درصد =====
  const getPercentageColor = (percent) => {
    if (percent >= 60) return { color: '#10B981', bg: '#ECFDF5', gradient: 'linear-gradient(135deg, #10B981, #34D399)' }
    if (percent >= 40) return { color: '#F59E0B', bg: '#FFF7ED', gradient: 'linear-gradient(135deg, #F59E0B, #FBBF24)' }
    return { color: '#EF4444', bg: '#FEF2F2', gradient: 'linear-gradient(135deg, #EF4444, #F87171)' }
  }

  const tabs = [
    { id: 'all', label: 'همه', count: reports.length },
    { id: 'good', label: '👌 خوب', count: reports.filter(r => r.percentage >= 60).length },
    { id: 'medium', label: '🙂 متوسط', count: reports.filter(r => r.percentage >= 40 && r.percentage < 60).length },
    { id: 'weak', label: '😰 ضعیف', count: reports.filter(r => r.percentage < 40).length },
  ]

  if (loading) {
    return (
      <div className="student-reports-container">
        <div className="reports-skeleton-stack">
          {[1, 2, 3].map((i) => (
            <div key={i} className="reports-skeleton-card">
              <div className="reports-skeleton-line reports-skeleton-line-lg" />
              <div className="reports-skeleton-line reports-skeleton-line-sm" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="student-reports-container">
        <div className="reports-state">
          <div className="reports-state-icon reports-state-icon-error">
            <AlertCircle className="w-9 h-9" strokeWidth={1.8} />
          </div>
          <h3 className="reports-state-title">خطا!</h3>
          <p className="reports-state-desc">{error}</p>
          <button onClick={fetchReports} className="reports-retry-btn">تلاش دوباره</button>
        </div>
      </div>
    )
  }

  return (
    <div className="student-reports-container">
      
      {/* ===== Header ===== */}
      <div className="reports-header">
        <div>
          <h2 className="reports-heading">
            <span className="reports-heading-icon">
              <Sparkles className="w-5 h-5" strokeWidth={1.8} />
            </span>
            گزارش‌های من
          </h2>
          <p className="reports-subheading">{reports.length} گزارش ثبت شده</p>
        </div>
        <button onClick={() => setShowModal(true)} className="reports-add-btn">
          <Plus className="w-5 h-5" strokeWidth={1.8} />
          ثبت گزارش جدید
        </button>
      </div>

      {/* ===== آمار کلی ===== */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="reports-stats-panel"
      >
        <div className="reports-stats-item">
          <div className="reports-stats-icon reports-stats-icon-blue">
            <FileText className="w-4 h-4" strokeWidth={1.8} />
          </div>
          <div>
            <p className="reports-stats-value">{stats.total}</p>
            <p className="reports-stats-label">کل گزارش‌ها</p>
          </div>
        </div>
        <div className="reports-stats-divider" />
        <div className="reports-stats-item">
          <div className="reports-stats-icon reports-stats-icon-purple">
            <Clock className="w-4 h-4" strokeWidth={1.8} />
          </div>
          <div>
            <p className="reports-stats-value">{stats.totalStudyHours}</p>
            <p className="reports-stats-label">ساعت مطالعه</p>
          </div>
        </div>
        <div className="reports-stats-divider" />
        <div className="reports-stats-item">
          <div className="reports-stats-icon reports-stats-icon-orange">
            <Target className="w-4 h-4" strokeWidth={1.8} />
          </div>
          <div>
            <p className="reports-stats-value">{stats.totalTests}</p>
            <p className="reports-stats-label">کل تست‌ها</p>
          </div>
        </div>
        <div className="reports-stats-divider" />
        <div className="reports-stats-item">
          <div className="reports-stats-icon reports-stats-icon-green">
            <TrendingUp className="w-4 h-4" strokeWidth={1.8} />
          </div>
          <div>
            <p className="reports-stats-value">{stats.avgPercentage}٪</p>
            <p className="reports-stats-label">میانگین درصد</p>
          </div>
        </div>
      </motion.div>

      {/* ===== Tab ها ===== */}
      <div className="reports-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`reports-tab ${activeTab === tab.id ? 'reports-tab-active' : ''}`}
          >
            <span>{tab.label}</span>
            <span className="reports-tab-count">{tab.count}</span>
          </button>
        ))}
      </div>

      {/* ===== Search ===== */}
      <div className="reports-search-wrap">
        <Search className="reports-search-icon" strokeWidth={1.8} />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="جستجو در گزارش‌ها..."
          className="reports-search-input"
        />
      </div>

      {/* ===== Reports List ===== */}
      {filteredReports.length === 0 ? (
        <div className="reports-state">
          <div className="reports-state-icon reports-state-icon-empty">
            <FileText className="w-9 h-9" strokeWidth={1.6} />
          </div>
          <h3 className="reports-state-title">گزارشی یافت نشد!</h3>
          <p className="reports-state-desc">
            {reports.length === 0 ? 'اولین گزارش خودت رو ثبت کن!' : 'با فیلتر دیگه‌ای امتحان کن.'}
          </p>
          {reports.length === 0 && (
            <button onClick={() => setShowModal(true)} className="reports-retry-btn">
              ثبت گزارش جدید
            </button>
          )}
        </div>
      ) : (
        <div className="reports-groups">
          {Object.entries(groupedReports).map(([date, dateReports]) => (
            <div key={date} className="reports-group">
              <div className="reports-group-header">
                <span className="reports-group-date">
                  <Calendar className="w-4 h-4" strokeWidth={1.8} />
                  {date}
                </span>
                <span className="reports-group-count">{dateReports.length} گزارش</span>
                <span className="reports-group-line" />
              </div>

              <div className="reports-list">
                <AnimatePresence>
                  {dateReports.map((report) => {
                    const percentColor = getPercentageColor(report.percentage || 0)
                    return (
                      <motion.div
                        key={report.id}
                        initial={{ opacity: 0, y: 10, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.98 }}
                        transition={{ duration: 0.25 }}
                        className="reports-card"
                      >
                        <div 
                          className="reports-card-accent"
                          style={{ background: percentColor.gradient }}
                        />

                        <div className="reports-card-horizontal">
                          
                          <div className="reports-card-image-side">
                            {report.course_image ? (
                              <img 
                                src={report.course_image} 
                                alt={report.course_name}
                                className="reports-card-image"
                                onError={(e) => { e.target.style.display = 'none' }}
                              />
                            ) : (
                              <div 
                                className="reports-card-image-placeholder" 
                                style={{ background: percentColor.bg, color: percentColor.color }}
                              >
                                <BookOpen className="w-10 h-10" strokeWidth={1.8} />
                              </div>
                            )}
                          </div>

                          <div className="reports-card-content-side">
                            
                            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                              <h4 className="reports-card-title">{report.course_name}</h4>
                              {report.topic && (
                                <span className="reports-card-topic-badge">{report.topic}</span>
                              )}
                            </div>

                            <div className="flex items-center gap-2 flex-wrap mb-3">
                              <span className="reports-meta-badge">
                                <Clock className="w-3.5 h-3.5" strokeWidth={1.8} />
                                {report.study_time} ساعت
                              </span>
                              <span className="reports-meta-badge">
                                <Target className="w-3.5 h-3.5" strokeWidth={1.8} />
                                {report.total_questions} تست
                              </span>
                              {report.test_time > 0 && (
                                <span className="reports-meta-badge">
                                  <Clock className="w-3.5 h-3.5" strokeWidth={1.8} />
                                  {report.test_time} دقیقه
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-4 flex-wrap">
                              <div className="reports-percent-wrap">
                                <div 
                                  className="reports-percent-circle"
                                  style={{
                                    background: `conic-gradient(${percentColor.color} ${report.percentage || 0}%, #E2E8F0 ${report.percentage || 0}% 100%)`,
                                  }}
                                >
                                  <div className="reports-percent-inner">
                                    <span 
                                      className="reports-percent-value"
                                      style={{ color: percentColor.color }}
                                    >
                                      {report.percentage || 0}٪
                                    </span>
                                  </div>
                                </div>
                              </div>

                              <div className="reports-tests-detail">
                                <span className="reports-test-correct">✅ {report.correct_answers} درست</span>
                                <span className="reports-test-wrong">❌ {report.wrong_answers} غلط</span>
                                <span className="reports-test-unanswered">⬜ {report.unanswered} نزده</span>
                              </div>
                            </div>
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
              className="reports-modal-overlay"
              onClick={() => setShowModal(false)}
            />
            <div className="reports-modal-centered">
              <motion.div
                initial={{ opacity: 0, scale: 0.85, y: 40 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.85, y: 40 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                className="reports-modal-card"
              >
                <div className="reports-modal-header">
                  <div className="reports-modal-header-right">
                    <div className="reports-modal-icon">
                      <Sparkles className="w-5 h-5" strokeWidth={1.8} />
                    </div>
                    <div>
                      <h3 className="reports-modal-title">ثبت گزارش جدید</h3>
                      <p className="reports-modal-subtitle">گزارش کار امروزت رو ثبت کن</p>
                    </div>
                  </div>
                  <button onClick={() => setShowModal(false)} className="reports-modal-close">
                    <X className="w-5 h-5" strokeWidth={1.8} />
                  </button>
                </div>

                {formSuccess && (
                  <div className="reports-success">
                    <CheckCircle className="w-5 h-5" strokeWidth={2} />
                    گزارش با موفقیت ثبت شد! 🎉
                  </div>
                )}

                {formError && (
                  <div className="reports-form-error">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" strokeWidth={1.8} />
                    {formError}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="reports-form">
                  <div className="reports-form-grid">
                    <div className="reports-form-field">
                      <label className="reports-form-label">
                        <span className="reports-label-icon reports-label-icon-blue">
                          <Calendar className="w-4 h-4" strokeWidth={1.8} />
                        </span>
                        تاریخ *
                      </label>
                      <input
                        type="text"
                        name="report_date"
                        value={form.report_date}
                        onChange={handleChange}
                        className="reports-form-input"
                      />
                    </div>

                    {/* ===== Dropdown درس ===== */}
                    <div className="reports-form-field">
                      <label className="reports-form-label">
                        <span className="reports-label-icon reports-label-icon-purple">
                          <BookOpen className="w-4 h-4" strokeWidth={1.8} />
                        </span>
                        درس *
                      </label>
                      <div className="reports-select-wrapper">
                        <select
                          name="course"
                          value={form.course}
                          onChange={handleChange}
                          className="reports-form-input reports-form-select"
                        >
                          <option value="">انتخاب درس...</option>
                          {coursesList.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                          ))}
                        </select>
                        <ChevronDown className="reports-select-chevron" strokeWidth={1.8} />
                      </div>
                    </div>

                    {/* پیش‌نمایش درس */}
                    <AnimatePresence>
                      {selectedCourse && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95, height: 0 }}
                          animate={{ opacity: 1, scale: 1, height: 'auto' }}
                          exit={{ opacity: 0, scale: 0.95, height: 0 }}
                          className="reports-course-preview"
                        >
                          {selectedCourse.image ? (
                            <img src={selectedCourse.image} alt={selectedCourse.name} />
                          ) : (
                            <div className="reports-course-preview-fallback">
                              <BookOpen className="w-5 h-5" strokeWidth={1.8} />
                            </div>
                          )}
                          <div>
                            <p className="reports-course-preview-name">{selectedCourse.name}</p>
                            <p className="reports-course-preview-tag">
                              <CheckCircle className="w-3.5 h-3.5" strokeWidth={2} />
                              درس انتخاب شده
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div className="reports-form-field">
                      <label className="reports-form-label">
                        <span className="reports-label-icon reports-label-icon-green">
                          <Clock className="w-4 h-4" strokeWidth={1.8} />
                        </span>
                        زمان مطالعه (ساعت) *
                      </label>
                      <input
                        type="number"
                        step="0.5"
                        name="study_time"
                        value={form.study_time}
                        onChange={handleChange}
                        placeholder="مثلاً: ۲.۵"
                        className="reports-form-input"
                      />
                    </div>

                    <div className="reports-form-field">
                      <label className="reports-form-label">
                        <span className="reports-label-icon reports-label-icon-emerald">
                          <CheckCircle className="w-4 h-4" strokeWidth={1.8} />
                        </span>
                        تعداد تست درست
                      </label>
                      <input
                        type="number"
                        name="correct_answers"
                        value={form.correct_answers}
                        onChange={handleChange}
                        placeholder="۰"
                        className="reports-form-input reports-form-input-emerald"
                      />
                    </div>

                    <div className="reports-form-field">
                      <label className="reports-form-label">
                        <span className="reports-label-icon reports-label-icon-red">
                          <X className="w-4 h-4" strokeWidth={1.8} />
                        </span>
                        تعداد تست غلط
                      </label>
                      <input
                        type="number"
                        name="wrong_answers"
                        value={form.wrong_answers}
                        onChange={handleChange}
                        placeholder="۰"
                        className="reports-form-input reports-form-input-red"
                      />
                    </div>

                    <div className="reports-form-field">
                      <label className="reports-form-label">
                        <span className="reports-label-icon reports-label-icon-slate">
                          <Layers className="w-4 h-4" strokeWidth={1.8} />
                        </span>
                        تعداد تست نزده
                      </label>
                      <input
                        type="number"
                        name="unanswered"
                        value={form.unanswered}
                        onChange={handleChange}
                        placeholder="۰"
                        className="reports-form-input"
                      />
                    </div>

                    <div className="reports-form-field">
                      <label className="reports-form-label">
                        <span className="reports-label-icon reports-label-icon-orange">
                          <Clock className="w-4 h-4" strokeWidth={1.8} />
                        </span>
                        زمان تست (دقیقه)
                      </label>
                      <input
                        type="number"
                        name="test_time"
                        value={form.test_time}
                        onChange={handleChange}
                        placeholder="مثلاً: ۴۵"
                        className="reports-form-input"
                      />
                    </div>

                    <div className="reports-form-field">
                      <label className="reports-form-label">
                        <span className="reports-label-icon reports-label-icon-pink">
                          <Target className="w-4 h-4" strokeWidth={1.8} />
                        </span>
                        مبحث مورد مطالعه
                      </label>
                      <input
                        type="text"
                        name="topic"
                        value={form.topic}
                        onChange={handleChange}
                        placeholder="مثلاً: فصل ۴ - گردش مواد"
                        className="reports-form-input"
                      />
                    </div>

                    <div className="reports-form-field reports-form-field-full">
                      <label className="reports-form-label">
                        <span className="reports-label-icon reports-label-icon-slate">
                          <FileText className="w-4 h-4" strokeWidth={1.8} />
                        </span>
                        توضیحات (اختیاری)
                      </label>
                      <textarea
                        name="description"
                        value={form.description}
                        onChange={handleChange}
                        rows={3}
                        placeholder="هر توضیح اضافی..."
                        className="reports-form-textarea"
                      />
                    </div>
                  </div>

                  {totalQuestions > 0 && (
                    <div className="reports-preview">
                      <div className="reports-preview-item">
                        <Target className="w-4 h-4" strokeWidth={1.8} />
                        کل تست‌ها: <strong>{totalQuestions}</strong>
                      </div>
                      <div className="reports-preview-item">
                        <TrendingUp className="w-4 h-4" strokeWidth={1.8} />
                        درصد: <strong style={{ color: getPercentageColor(Number(percentage)).color }}>%{percentage}</strong>
                      </div>
                    </div>
                  )}

                  <div className="reports-form-actions">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="reports-modal-cancel"
                    >
                      انصراف
                    </button>
                    <button type="submit" disabled={submitting} className="reports-submit-btn">
                      {submitting ? (
                        <span className="reports-submit-spinner" />
                      ) : (
                        <Send className="w-5 h-5" strokeWidth={1.8} />
                      )}
                      ثبت گزارش
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

export default StudentReports