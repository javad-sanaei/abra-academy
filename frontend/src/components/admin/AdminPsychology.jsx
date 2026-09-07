import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Heart, AlertCircle, CheckCircle, Trash2, 
  UserPlus, Phone, Clock, Sparkles, X
} from 'lucide-react'
import api from '../../api/axios'
import '../../styles/admin-psychology.css'

const urgencyConfig = {
  low: { label: 'کم', color: '#10B981', emoji: '🟢' },
  medium: { label: 'متوسط', color: '#F59E0B', emoji: '🟡' },
  high: { label: 'زیاد', color: '#F97316', emoji: '🟠' },
  emergency: { label: 'اورژانسی', color: '#EF4444', emoji: '🔴' },
}

const AdminPsychology = () => {
  const [requests, setRequests] = useState([])
  const [psychologists, setPsychologists] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [selectedPsychologist, setSelectedPsychologist] = useState('')
  const [updatingId, setUpdatingId] = useState(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [reqRes, psychRes] = await Promise.all([
        api.get('/admin/recent-psychology-requests/'),
        api.get('/admin/psychologists/'),
      ])
      setRequests(reqRes.data)
      setPsychologists(psychRes.data)
    } catch (err) {
      console.error('Error fetching data:', err)
    } finally {
      setLoading(false)
    }
  }

  // تأیید و assign روانشناس
  const handleApprove = async (requestId, psychologistId) => {
    setUpdatingId(requestId)
    try {
      await api.patch(`/admin/psychology-requests/${requestId}/update/`, {
        status: 'reviewing',
        psychologist_id: psychologistId || null,
      })
      fetchData()
      setShowModal(false)
      setSelectedRequest(null)
      setSelectedPsychologist('')
    } catch (err) {
      console.error('Error approving request:', err)
      alert('خطا در تأیید درخواست.')
    } finally {
      setUpdatingId(null)
    }
  }

  // حذف درخواست
  const handleDelete = async (requestId) => {
    if (!confirm('آیا از حذف این درخواست مطمئنی؟')) return
    try {
      await api.delete(`/admin/psychology-requests/${requestId}/delete/`)
      setRequests(prev => prev.filter(r => r.id !== requestId))
    } catch (err) {
      console.error('Error deleting request:', err)
      alert('خطا در حذف درخواست.')
    }
  }

  if (loading) {
    return (
      <div className="admin-psychology-container">
        <div className="loading-skeleton">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="skeleton-card animate-pulse">
              <div className="skeleton-line w-3/4"></div>
              <div className="skeleton-line w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="admin-psychology-container">
      {/* Header */}
      <div className="psychology-header">
        <div className="psychology-header-right">
          <div className="psychology-header-icon">
            <Heart className="w-7 h-7 text-pink-500" />
          </div>
          <div>
            <h2 className="psychology-header-title">درخواست‌های روانشناسی</h2>
            <p className="psychology-header-subtitle">
              {requests.length} درخواست در انتظار تأیید
            </p>
          </div>
        </div>
        <span className="psychology-header-badge">
          <Sparkles className="w-4 h-4" />
          مدیریت هوشمند
        </span>
      </div>

      {/* Requests Grid */}
      {requests.length === 0 ? (
        <div className="psychology-empty">
          <div className="psychology-empty-icon">
            <Heart className="w-16 h-16 text-gray-300" />
          </div>
          <h3 className="psychology-empty-title">درخواستی نیست!</h3>
          <p className="psychology-empty-text">
            همه درخواست‌ها رسیدگی شدن. عالیه! 👏
          </p>
        </div>
      ) : (
        <div className="psychology-grid">
          {requests.map(r => {
            const urgency = urgencyConfig[r.urgency] || urgencyConfig.medium
            
            return (
              <motion.div
                key={r.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="psychology-card"
              >
                {/* Card Top */}
                <div className="psychology-card-top">
                  <span className="psychology-urgency" style={{ background: urgency.color + '15', color: urgency.color }}>
                    {urgency.emoji} {urgency.label}
                  </span>
                  <span className="psychology-date">
                    {r.created_at?.slice(0, 10) || ''}
                  </span>
                </div>

                {/* Subject */}
                <h3 className="psychology-subject">{r.subject}</h3>

                {/* Description */}
                {r.description && (
                  <p className="psychology-description line-clamp-2">
                    {r.description}
                  </p>
                )}

                {/* Student Info */}
                <div className="psychology-student">
                  <div className="psychology-student-avatar">
                    {r.student_name?.charAt(0) || '؟'}
                  </div>
                  <div>
                    <p className="psychology-student-name">{r.student_name}</p>
                    <p className="psychology-student-role">دانش‌آموز</p>
                  </div>
                </div>

                {/* Assigned Psychologist */}
                {r.psychologist_name && (
                  <div className="psychology-assigned">
                    <UserPlus className="w-4 h-4 text-purple-500" />
                    <span>روانشناس: {r.psychologist_name}</span>
                  </div>
                )}

                {/* Actions */}
                <div className="psychology-actions">
                  <button
                    onClick={() => {
                      setSelectedRequest(r)
                      setSelectedPsychologist(r.psychologist || '')
                      setShowModal(true)
                    }}
                    className="psychology-btn-approve"
                  >
                    <CheckCircle className="w-4 h-4" />
                    تأیید و ارجاع
                  </button>
                  <button
                    onClick={() => handleDelete(r.id)}
                    className="psychology-btn-delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {showModal && selectedRequest && (
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
                initial={{ opacity: 0, scale: 0.85, y: 40 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.85, y: 40 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                className="psychology-modal"
              >
                {/* Header با آیکون */}
                <div className="psychology-modal-header">
                  <div className="psychology-modal-header-right">
                    <div className="psychology-modal-icon">
                      <UserPlus className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="psychology-modal-title">تأیید و ارجاع</h3>
                      <p className="psychology-modal-subtitle">روانشناس مناسب رو انتخاب کن</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowModal(false)}
                    className="psychology-modal-close"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* اطلاعات درخواست */}
                <div className="psychology-modal-request-info">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="psychology-modal-urgency-badge" style={{ background: urgencyConfig[selectedRequest.urgency]?.color + '15', color: urgencyConfig[selectedRequest.urgency]?.color }}>
                      {urgencyConfig[selectedRequest.urgency]?.emoji} {urgencyConfig[selectedRequest.urgency]?.label}
                    </span>
                  </div>
                  <p className="psychology-modal-request-subject">{selectedRequest.subject}</p>
                  <p className="psychology-modal-request-student">
                    {selectedRequest.student_name}
                  </p>
                </div>

                {/* انتخاب روانشناس */}
                <div className="psychology-modal-field">
                  <label className="psychology-modal-label">
                    <UserPlus className="w-4 h-4 text-purple-500" />
                    انتخاب روانشناس *
                  </label>
                  <select
                    value={selectedPsychologist}
                    onChange={(e) => setSelectedPsychologist(e.target.value)}
                    className="psychology-modal-select"
                    autoFocus
                  >
                    <option value="">— انتخاب کن —</option>
                    {psychologists.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.full_name} {p.phone && `• ${p.phone}`}
                      </option>
                    ))}
                  </select>
                </div>

                {/* راهنما */}
                <div className="psychology-modal-note">
                  <AlertCircle className="w-4 h-4 text-sky-500 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-gray-500 leading-relaxed">
                    بعد از تأیید، وضعیت به «در حال بررسی» تغییر می‌کنه و روانشناس می‌تونه ادامه مسیر رو مدیریت کنه.
                  </p>
                </div>

                {/* دکمه‌ها */}
                <div className="psychology-modal-actions">
                  <button
                    onClick={() => setShowModal(false)}
                    className="psychology-modal-cancel"
                  >
                    انصراف
                  </button>
                  <button
                    onClick={() => handleApprove(selectedRequest.id, selectedPsychologist)}
                    disabled={!selectedPsychologist || updatingId === selectedRequest.id}
                    className="psychology-modal-submit"
                  >
                    {updatingId === selectedRequest.id ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <CheckCircle className="w-4 h-4" />
                    )}
                    تأیید و ارجاع
                  </button>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

export default AdminPsychology