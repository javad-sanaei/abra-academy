import { useState, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Heart, Plus, X, Send, AlertCircle, CheckCircle, 
  Clock, MessageCircle, Phone, Calendar, Eye,
  Sparkles, Shield, Zap, Flame, Star, Layers, Search, Filter
} from 'lucide-react'
import api from '../../api/axios'
import '../../styles/student-psychology.css'

const StudentPsychology = () => {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')
  const [formSuccess, setFormSuccess] = useState(false)
  const [search, setSearch] = useState('')
  const [activeFilter, setActiveFilter] = useState('all')
  
  const [form, setForm] = useState({
    subject: '',
    description: '',
    urgency: 'medium'
  })

  const fetchRequests = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await api.get('/student/psychology-requests/')
      setRequests(res.data)
    } catch (err) {
      setError('خطا در دریافت درخواست‌ها.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchRequests()
  }, [fetchRequests])

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setFormError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormError('')
    setFormSuccess(false)

    if (!form.subject.trim()) {
      setFormError('لطفاً موضوع درخواست را وارد کنید.')
      return
    }
    if (!form.description.trim()) {
      setFormError('لطفاً توضیحات درخواست را وارد کنید.')
      return
    }

    setSubmitting(true)
    try {
      await api.post('/student/psychology-requests/', {
        subject: form.subject.trim(),
        description: form.description.trim(),
        urgency: form.urgency
      })

      setFormSuccess(true)
      setForm({ subject: '', description: '', urgency: 'medium' })
      
      setTimeout(() => {
        setShowModal(false)
        setFormSuccess(false)
      }, 2000)
      
      fetchRequests()
    } catch (err) {
      setFormError(err.response?.data?.error || 'خطا در ثبت درخواست.')
    } finally {
      setSubmitting(false)
    }
  }

  const statusConfig = {
    pending: { label: 'در انتظار', icon: <Clock className="w-4 h-4" />, gradient: 'linear-gradient(135deg, #F59E0B, #FBBF24)', bg: '#FFF7ED', color: '#F59E0B', emoji: '🟡' },
    reviewing: { label: 'در حال بررسی', icon: <Eye className="w-4 h-4" />, gradient: 'linear-gradient(135deg, #3B82F6, #8B5CF6)', bg: '#EFF6FF', color: '#3B82F6', emoji: '🔵' },
    contacted: { label: 'تماس گرفته شده', icon: <Phone className="w-4 h-4" />, gradient: 'linear-gradient(135deg, #8B5CF6, #EC4899)', bg: '#F5F3FF', color: '#8B5CF6', emoji: '🟣' },
    resolved: { label: 'حل شده', icon: <CheckCircle className="w-4 h-4" />, gradient: 'linear-gradient(135deg, #10B981, #34D399)', bg: '#ECFDF5', color: '#10B981', emoji: '🟢' },
    cancelled: { label: 'لغو شده', icon: <X className="w-4 h-4" />, gradient: 'linear-gradient(135deg, #EF4444, #F87171)', bg: '#FEF2F2', color: '#EF4444', emoji: '🔴' },
  }

  const urgencyConfig = {
    low: { label: 'کم', emoji: '🟢', gradient: 'linear-gradient(135deg, #10B981, #34D399)' },
    medium: { label: 'متوسط', emoji: '🟡', gradient: 'linear-gradient(135deg, #F59E0B, #FBBF24)' },
    high: { label: 'زیاد', emoji: '🟠', gradient: 'linear-gradient(135deg, #F97316, #FB923C)' },
    emergency: { label: 'اورژانسی', emoji: '🔴', gradient: 'linear-gradient(135deg, #EF4444, #F87171)' },
  }

  // ✅ فیلترها
  const filters = [
    { id: 'all', label: 'همه', count: requests.length },
    { id: 'pending', label: 'در انتظار', count: requests.filter(r => r.status === 'pending').length },
    { id: 'reviewing', label: 'در حال بررسی', count: requests.filter(r => r.status === 'reviewing').length },
    { id: 'contacted', label: 'تماس گرفته شده', count: requests.filter(r => r.status === 'contacted').length },
    { id: 'resolved', label: 'حل شده', count: requests.filter(r => r.status === 'resolved').length },
  ]

  // ✅ فیلتر + سرچ
  const filteredRequests = useMemo(() => {
    return requests.filter(req => {
      const matchesFilter = activeFilter === 'all' || req.status === activeFilter
      const matchesSearch = !search || 
        req.subject?.includes(search) ||
        req.description?.includes(search) ||
        req.psychologist_name?.includes(search) ||
        req.psychologist_note?.includes(search)
      return matchesFilter && matchesSearch
    })
  }, [requests, activeFilter, search])

  if (loading) {
    return (
      <div className="student-psychology-container">
        <div className="psychology-skeleton-stack">
          {[1, 2, 3].map((i) => (
            <div key={i} className="psychology-skeleton-card">
              <div className="psychology-skeleton-line psychology-skeleton-line-lg" />
              <div className="psychology-skeleton-line psychology-skeleton-line-sm" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="student-psychology-container">
        <div className="psychology-state">
          <div className="psychology-state-icon psychology-state-icon-error">
            <AlertCircle className="w-9 h-9" strokeWidth={1.8} />
          </div>
          <h3 className="psychology-state-title">خطا!</h3>
          <p className="psychology-state-desc">{error}</p>
          <button onClick={fetchRequests} className="psychology-retry-btn">تلاش دوباره</button>
        </div>
      </div>
    )
  }

  return (
    <div className="student-psychology-container">
      
      {/* Header */}
      <div className="psychology-header">
        <div>
          <h2 className="psychology-heading">
            <span className="psychology-heading-icon">
              <Heart className="w-5 h-5" strokeWidth={1.8} />
            </span>
            روانشناسی
          </h2>
          <p className="psychology-subheading">درخواست‌های مشاوره روانشناسی شما</p>
        </div>
        <button onClick={() => { setShowModal(true); setFormSuccess(false); setFormError('') }} className="psychology-add-btn">
          <Plus className="w-5 h-5" strokeWidth={1.8} />
          ثبت درخواست جدید
        </button>
      </div>

      {/* ✅ فیلترها */}
      {requests.length > 0 && (
        <div className="psychology-filters">
          {filters.map((filter) => (
            <button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id)}
              className={`psychology-filter-btn ${activeFilter === filter.id ? 'psychology-filter-active' : ''}`}
            >
              {filter.label}
              <span className="psychology-filter-count">{filter.count}</span>
            </button>
          ))}
        </div>
      )}

      {/* ✅ سرچ */}
      {requests.length > 0 && (
        <div className="psychology-search-wrap">
          <Search className="psychology-search-icon" strokeWidth={1.8} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="جستجو در درخواست‌ها..."
            className="psychology-search-input"
          />
        </div>
      )}

      {/* Requests */}
      {filteredRequests.length === 0 ? (
        <div className="psychology-state">
          <div className="psychology-state-icon psychology-state-icon-empty">
            {search || activeFilter !== 'all' ? (
              <Search className="w-9 h-9" strokeWidth={1.6} />
            ) : (
              <Heart className="w-9 h-9" strokeWidth={1.6} />
            )}
          </div>
          <h3 className="psychology-state-title">
            {search || activeFilter !== 'all' ? 'موردی یافت نشد!' : 'هنوز درخواستی ندادی!'}
          </h3>
          <p className="psychology-state-desc">
            {search || activeFilter !== 'all' 
              ? 'با عبارت یا فیلتر دیگه‌ای امتحان کن.' 
              : 'هر زمان نیاز به صحبت با روانشناس داشتی، درخواست بده.'}
          </p>
          {!search && activeFilter === 'all' && (
            <button onClick={() => setShowModal(true)} className="psychology-retry-btn">
              ثبت اولین درخواست
            </button>
          )}
        </div>
      ) : (
        <div className="psychology-list">
          {filteredRequests.map((req) => {
            const status = statusConfig[req.status] || statusConfig.pending
            const urgency = urgencyConfig[req.urgency] || urgencyConfig.medium
            
            return (
              <div key={req.id} className="psychology-card">
                <div className="psychology-card-accent" style={{ background: status.gradient }} />

                <div className="psychology-card-header">
                  <div className="psychology-card-badges">
                    <span className="psychology-status-badge" style={{ background: status.bg, color: status.color }}>
                      {status.icon}
                      {status.label}
                    </span>
                    <span className="psychology-urgency-badge" style={{ background: urgency.gradient.includes('#10B981') ? '#ECFDF5' : urgency.gradient.includes('#F59E0B') ? '#FFF7ED' : urgency.gradient.includes('#F97316') ? '#FFF7ED' : '#FEF2F2', color: urgency.gradient.includes('#10B981') ? '#10B981' : urgency.gradient.includes('#F59E0B') ? '#F59E0B' : urgency.gradient.includes('#F97316') ? '#F97316' : '#EF4444' }}>
                      {urgency.emoji} {urgency.label}
                    </span>
                  </div>
                </div>

                <h4 className="psychology-card-title">{req.subject}</h4>
                
                {req.description && (
                  <p className="psychology-card-desc">{req.description}</p>
                )}

                <div className="psychology-card-meta">
                  <span>
                    <Calendar className="w-3.5 h-3.5" strokeWidth={1.8} />
                    {req.created_at ? new Date(req.created_at).toLocaleDateString('fa-IR') : '-'}
                  </span>
                  {req.psychologist_name && (
                    <span>
                      <MessageCircle className="w-3.5 h-3.5" strokeWidth={1.8} />
                      {req.psychologist_name}
                    </span>
                  )}
                </div>

                {req.psychologist_note && (
                  <div className="psychology-note">
                    <p className="psychology-note-label">یادداشت روانشناس:</p>
                    <p className="psychology-note-text">{req.psychologist_note}</p>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="psychology-modal-overlay"
              onClick={() => setShowModal(false)}
            />
            <div className="psychology-modal-centered">
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 30 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                className="psychology-modal-card"
              >
                <div className="psychology-modal-header">
                  <div className="psychology-modal-icon">
                    <Heart className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="psychology-modal-title">ثبت درخواست جدید</h3>
                    <p className="psychology-modal-subtitle">مشاوره روانشناسی</p>
                  </div>
                  <button onClick={() => setShowModal(false)} className="psychology-modal-close">
                    <X className="w-5 h-5" strokeWidth={1.8} />
                  </button>
                </div>

                {formSuccess && (
                  <div className="psychology-success">
                    <CheckCircle className="w-5 h-5" strokeWidth={2} />
                    درخواست با موفقیت ثبت شد! 🎉
                  </div>
                )}

                {formError && (
                  <div className="psychology-form-error">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" strokeWidth={1.8} />
                    {formError}
                  </div>
                )}

                {!formSuccess && (
                  <form onSubmit={handleSubmit} className="psychology-form">
                    <div className="psychology-form-field">
                      <label className="psychology-form-label">
                        <span className="psychology-label-icon psychology-label-icon-rose">
                          <Heart className="w-4 h-4" strokeWidth={1.8} />
                        </span>
                        موضوع درخواست *
                      </label>
                      <input
                        type="text"
                        name="subject"
                        value={form.subject}
                        onChange={handleChange}
                        placeholder="مثلاً: استرس کنکور، مشکلات تمرکز..."
                        className="psychology-form-input"
                      />
                    </div>

                    <div className="psychology-form-field">
                      <label className="psychology-form-label">
                        <span className="psychology-label-icon psychology-label-icon-purple">
                          <MessageCircle className="w-4 h-4" strokeWidth={1.8} />
                        </span>
                        توضیحات *
                      </label>
                      <textarea
                        name="description"
                        value={form.description}
                        onChange={handleChange}
                        rows={4}
                        placeholder="لطفاً شرایط خود را توضیح دهید..."
                        className="psychology-form-textarea"
                      />
                    </div>

                    <div className="psychology-form-field">
                      <label className="psychology-form-label">میزان فوریت</label>
                      <div className="psychology-urgency-grid">
                        {[
                          { value: 'low', label: 'کم', emoji: '🟢' },
                          { value: 'medium', label: 'متوسط', emoji: '🟡' },
                          { value: 'high', label: 'زیاد', emoji: '🟠' },
                          { value: 'emergency', label: 'اورژانسی', emoji: '🔴' },
                        ].map((item) => (
                          <button
                            key={item.value}
                            type="button"
                            onClick={() => setForm({ ...form, urgency: item.value })}
                            className={`psychology-urgency-btn ${form.urgency === item.value ? 'psychology-urgency-btn-active' : ''}`}
                          >
                            <span className="psychology-urgency-emoji">{item.emoji}</span>
                            <span className="psychology-urgency-text">{item.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <button type="submit" disabled={submitting} className="psychology-submit-btn">
                      {submitting ? (
                        <span className="psychology-submit-spinner" />
                      ) : (
                        <Send className="w-5 h-5" strokeWidth={1.8} />
                      )}
                      ارسال درخواست
                    </button>
                  </form>
                )}
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

export default StudentPsychology