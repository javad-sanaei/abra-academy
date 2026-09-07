import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  GraduationCap, Clock, Calendar, Target, 
  CheckCircle, XCircle, AlertCircle, TrendingUp,
  Play, Eye, Award, BarChart3, Sparkles, BookOpen,
  ChevronDown, Quote, MessageCircle, Zap, Star,
  Flame, Trophy, Timer, ArrowLeft, Layers
} from 'lucide-react'
import api from '../../api/axios'
import { useNavigate } from 'react-router-dom'
import '../../styles/student-exams.css'

const StudentExams = () => {
  const [activeTab, setActiveTab] = useState('active')
  const [exams, setExams] = useState([])
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showMotivation, setShowMotivation] = useState(false)
  const [selectedExam, setSelectedExam] = useState(null)

  const navigate = useNavigate()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [examsRes, resultsRes] = await Promise.all([
        api.get('/student/exams/'),
        api.get('/student/exam-results/')
      ])
      setExams(examsRes.data)
      setResults(resultsRes.data)
    } catch (err) {
      setError('خطا در دریافت اطلاعات آزمون‌ها.')
      console.error('Error fetching exams:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  const startExam = async (examId) => {
    try {
      await api.post(`/exam/${examId}/start/`)
      window.location.href = `/dashboard/student/exams/${examId}`
    } catch (err) {
      alert(err.response?.data?.error || 'خطا در شروع آزمون.')
    }
  }

  const openMotivation = (exam) => {
    setSelectedExam(exam)
    setShowMotivation(true)
  }

  const handleStartFromMotivation = async () => {
    setShowMotivation(false)
    if (selectedExam) {
      await startExam(selectedExam.id)
    }
  }

  const toEnglishDigits = (str) => {
    const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹']
    return str.replace(/[۰-۹]/g, (d) => persianDigits.indexOf(d).toString())
  }

  const getNowShamsi = () => {
    const now = new Date()
    const year = toEnglishDigits(now.toLocaleDateString('fa-IR-u-ca-persian', { year: 'numeric' }))
    const month = toEnglishDigits(now.toLocaleDateString('fa-IR-u-ca-persian', { month: '2-digit' }))
    const day = toEnglishDigits(now.toLocaleDateString('fa-IR-u-ca-persian', { day: '2-digit' }))
    const hour = now.getHours().toString().padStart(2, '0')
    const minute = now.getMinutes().toString().padStart(2, '0')
    const second = now.getSeconds().toString().padStart(2, '0')
    return `${year}-${month}-${day} ${hour}:${minute}:${second}`
  }

  const formatExamDate = (dateStr) => {
    if (!dateStr) return ''
    return dateStr.replace('T', ' ').split('+')[0].split('.')[0]
  }

  const getExamStatus = (exam) => {
    const now = getNowShamsi()
    const start = formatExamDate(exam.entry_start)
    const end = formatExamDate(exam.entry_end)
    if (now > end) return 'ended'
    if (now < start) return 'upcoming'
    return 'active'
  }

  const statusConfig = {
    active: { 
      label: 'فعال', 
      color: '#10B981', 
      bg: '#ECFDF5', 
      gradient: 'linear-gradient(135deg, #10B981, #34D399)',
      cardGradient: 'linear-gradient(135deg, #FFFFFF 0%, #ECFDF5 50%, #D1FAE5 100%)',
      emoji: '🟢',
    },
    upcoming: { 
      label: 'پیش رو', 
      color: '#F59E0B', 
      bg: '#FFF7ED', 
      gradient: 'linear-gradient(135deg, #F59E0B, #FBBF24)',
      cardGradient: 'linear-gradient(135deg, #FFFFFF 0%, #FFF7ED 50%, #FEF3C7 100%)',
      emoji: '🟡',
    },
    ended: { 
      label: 'پایان یافته', 
      color: '#EF4444', 
      bg: '#FEF2F2', 
      gradient: 'linear-gradient(135deg, #EF4444, #F87171)',
      cardGradient: 'linear-gradient(135deg, #FFFFFF 0%, #FEF2F2 50%, #FEE2E2 100%)',
      emoji: '🔴',
    },
  }

  const getPercentConfig = (percent) => {
    if (percent >= 80) return { color: '#10B981', bg: '#ECFDF5', gradient: 'linear-gradient(135deg, #10B981, #34D399)', label: 'عالی', emoji: '🏆' }
    if (percent >= 60) return { color: '#3B82F6', bg: '#EFF6FF', gradient: 'linear-gradient(135deg, #3B82F6, #60A5FA)', label: 'خوب', emoji: '💪' }
    if (percent >= 40) return { color: '#F59E0B', bg: '#FFF7ED', gradient: 'linear-gradient(135deg, #F59E0B, #FBBF24)', label: 'متوسط', emoji: '🙂' }
    return { color: '#EF4444', bg: '#FEF2F2', gradient: 'linear-gradient(135deg, #EF4444, #F87171)', label: 'ضعیف', emoji: '😰' }
  }

  const formatTime = (dateStr) => {
    if (!dateStr) return '-'
    const formatted = formatExamDate(dateStr)
    return formatted.substring(5, 16)
  }

  const tabs = [
    { id: 'active', label: 'آزمون‌های فعال', icon: <Play className="w-4 h-4" />, count: exams.length },
    { id: 'results', label: 'نتایج', icon: <Trophy className="w-4 h-4" />, count: results.length },
  ]

  if (loading) {
    return (
      <div className="student-exams-container">
        <div className="exams-skeleton-stack">
          {[1, 2, 3].map((i) => (
            <div key={i} className="exams-skeleton-card">
              <div className="exams-skeleton-line exams-skeleton-line-lg" />
              <div className="exams-skeleton-line exams-skeleton-line-sm" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="student-exams-container">
        <div className="exams-state">
          <div className="exams-state-icon exams-state-icon-error">
            <AlertCircle className="w-9 h-9" strokeWidth={1.8} />
          </div>
          <h3 className="exams-state-title">خطا!</h3>
          <p className="exams-state-desc">{error}</p>
          <button onClick={fetchData} className="exams-retry-btn">تلاش دوباره</button>
        </div>
      </div>
    )
  }

  return (
    <div className="student-exams-container">
      
      {/* ===== Header ===== */}
      <div className="exams-header">
        <div>
          <h2 className="exams-heading">
            <span className="exams-heading-icon">
              <Sparkles className="w-5 h-5" strokeWidth={1.8} />
            </span>
            آزمون‌های من
          </h2>
          <p className="exams-subheading">{exams.length} آزمون فعال • {results.length} نتیجه</p>
        </div>
      </div>

      {/* ===== Tabs ===== */}
      <div className="exams-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`exams-tab ${activeTab === tab.id ? 'exams-tab-active' : ''}`}
          >
            {tab.icon}
            <span>{tab.label}</span>
            <span className="exams-tab-count">{tab.count}</span>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* ===== ACTIVE EXAMS ===== */}
        {activeTab === 'active' && (
          <motion.div
            key="active"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {exams.length === 0 ? (
              <div className="exams-state">
                <div className="exams-state-icon exams-state-icon-empty">
                  <GraduationCap className="w-9 h-9" strokeWidth={1.6} />
                </div>
                <h3 className="exams-state-title">هنوز آزمونی نداری!</h3>
                <p className="exams-state-desc">مشاورت به زودی برات آزمون می‌ذاره.</p>
              </div>
            ) : (
              <div className="exams-grid">
                {exams.map((exam) => {
                  const status = getExamStatus(exam)
                  const config = statusConfig[status]
                  const hasResult = results.some(r => r.exam === exam.id && r.finished_at)
                  const startTime = formatTime(exam.entry_start)
                  const endTime = formatTime(exam.entry_end)
                  
                  return (
                    <motion.div
                      key={exam.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="exams-card"
                    >
                      {/* نوار گرادیان */}
                      <div className="exams-card-accent" style={{ background: config.gradient }} />

                      {/* هدر کارت */}
                      <div className="exams-card-header">
                        <span className="exams-card-status" style={{ background: config.bg, color: config.color }}>
                          {config.emoji} {config.label}
                        </span>
                        <span className="exams-card-type">
                          {exam.exam_type === 'test' ? '📝 تستی' : '📋 تستی و تشریحی'}
                        </span>
                      </div>

                      {/* عنوان */}
                      <h3 className="exams-card-title">{exam.title}</h3>

                      {/* اطلاعات */}
                      <div className="exams-card-info">
                        <div className="exams-info-row">
                          <div className="exams-info-icon exams-info-icon-blue">
                            <Clock className="w-4 h-4" strokeWidth={1.8} />
                          </div>
                          <span>{exam.duration} دقیقه</span>
                        </div>
                        <div className="exams-info-row">
                          <div className="exams-info-icon exams-info-icon-purple">
                            <Target className="w-4 h-4" strokeWidth={1.8} />
                          </div>
                          <span>{exam.questions_count} سوال</span>
                        </div>
                        
                        {/* بازه مجاز */}
                        <div className="exams-time-range">
                          <div className="exams-time-item">
                            <Calendar className="w-3.5 h-3.5 text-emerald-500" strokeWidth={1.8} />
                            <span>شروع: {startTime}</span>
                          </div>
                          <div className="exams-time-item">
                            <Timer className="w-3.5 h-3.5 text-amber-500" strokeWidth={1.8} />
                            <span>پایان: {endTime}</span>
                          </div>
                        </div>
                      </div>

                      {/* دکمه */}
                      {status === 'active' && !hasResult ? (
                        <button onClick={() => openMotivation(exam)} className="exams-btn-start">
                          <Play className="w-4 h-4" strokeWidth={2} />
                          شروع آزمون
                        </button>
                      ) : hasResult ? (
                        <button
                          onClick={() => navigate(`/dashboard/student/exams/${exam.id}/result`)}
                          className="exams-btn-result"
                        >
                          <Eye className="w-4 h-4" strokeWidth={2} />
                          مشاهده کارنامه
                        </button>
                      ) : status === 'upcoming' ? (
                        <div className="exams-btn-wait">
                          <Timer className="w-4 h-4" strokeWidth={1.8} />
                          هنوز شروع نشده
                        </div>
                      ) : (
                        <div className="exams-btn-ended">
                          <XCircle className="w-4 h-4" strokeWidth={1.8} />
                          مهلت تمام شده
                        </div>
                      )}
                    </motion.div>
                  )
                })}
              </div>
            )}
          </motion.div>
        )}

        {/* ===== RESULTS ===== */}
        {activeTab === 'results' && (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {results.length === 0 ? (
              <div className="exams-state">
                <div className="exams-state-icon exams-state-icon-empty">
                  <Trophy className="w-9 h-9" strokeWidth={1.6} />
                </div>
                <h3 className="exams-state-title">هنوز نتیجه‌ای نداری!</h3>
                <p className="exams-state-desc">یه آزمون بده تا نتیجه‌ات رو ببینی.</p>
              </div>
            ) : (
              <div className="exams-grid">
                {results.map((result) => {
                  const percent = result.total_score ? Number(result.total_score) : 0
                  const percentConfig = getPercentConfig(percent)
                  
                  return (
                    <motion.div
                      key={result.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="exams-result-card"
                    >
                      {/* نوار گرادیان */}
                      <div className="exams-card-accent" style={{ background: percentConfig.gradient }} />

                      {/* درصد دایره‌ای */}
                      <div className="exams-result-percent">
                        <div 
                          className="exams-percent-circle"
                          style={{
                            background: `conic-gradient(${percentConfig.color} ${percent}%, #E2E8F0 ${percent}% 100%)`,
                            boxShadow: `0 10px 30px ${percentConfig.color}30`,
                          }}
                        >
                          <div className="exams-percent-inner">
                            <span className="exams-percent-emoji">{percentConfig.emoji}</span>
                            <span className="exams-percent-value" style={{ color: percentConfig.color }}>
                              {percent}٪
                            </span>
                            <span className="exams-percent-label" style={{ color: percentConfig.color }}>
                              {percentConfig.label}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* بدنه */}
                      <div className="exams-result-body">
                        <h3 className="exams-result-title">
                          {result.exam_title || `آزمون #${result.exam}`}
                        </h3>
                        
                        <div className="exams-result-meta">
                          <span className="exams-result-date">
                            <Calendar className="w-3.5 h-3.5" strokeWidth={1.8} />
                            {result.started_at ? new Date(result.started_at).toLocaleDateString('fa-IR') : '-'}
                          </span>
                          {result.finished_at && (
                            <span className="exams-result-done">
                              <CheckCircle className="w-3.5 h-3.5" strokeWidth={2} />
                              تکمیل شده
                            </span>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== Modal انگیزشی ===== */}
      <AnimatePresence>
        {showMotivation && selectedExam && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="exams-modal-overlay"
              onClick={() => setShowMotivation(false)}
            />
            <div className="exams-modal-centered">
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 30 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                className="exams-modal-card"
              >
                {/* هدر */}
                <div className="exams-modal-header">
                  <div className="exams-modal-icon">
                    <Zap className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="exams-modal-title">قبل از شروع!</h3>
                    <p className="exams-modal-subtitle">{selectedExam.title}</p>
                  </div>
                  <button onClick={() => setShowMotivation(false)} className="exams-modal-close">
                    <ArrowLeft className="w-5 h-5" strokeWidth={1.8} />
                  </button>
                </div>

                {/* جمله انگیزشی */}
                {selectedExam.motivation_text && (
                  <div className="exams-motivation-box">
                    <Quote className="exams-motivation-quote" />
                    <p className="exams-motivation-text">"{selectedExam.motivation_text}"</p>
                  </div>
                )}

                {/* نصیحت */}
                {selectedExam.advice_text && (
                  <div className="exams-advice-box">
                    <MessageCircle className="exams-advice-icon" />
                    <div>
                      <p className="exams-advice-label">نصیحت مشاور:</p>
                      <p className="exams-advice-text">{selectedExam.advice_text}</p>
                    </div>
                  </div>
                )}

                {/* اطلاعات آزمون */}
                <div className="exams-modal-info">
                  <span>
                    <Clock className="w-4 h-4" />
                    {selectedExam.duration} دقیقه
                  </span>
                  <span>
                    <Target className="w-4 h-4" />
                    {selectedExam.questions_count} سوال
                  </span>
                </div>

                {/* دکمه */}
                <button onClick={handleStartFromMotivation} className="exams-modal-start">
                  <Flame className="w-5 h-5" strokeWidth={2} />
                  بزن بریم! 🚀
                </button>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

export default StudentExams