import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Heart, Search, AlertCircle, CheckCircle, Clock,
  Phone, Calendar, MessageCircle, Eye, X, Send,
  ChevronDown, ChevronUp, FileText, History
} from 'lucide-react'
import api from '../../api/axios'

const PsychologistRequests = ({ filterType = 'active' }) => {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const [expandedId, setExpandedId] = useState(null)
  const [noteText, setNoteText] = useState('')
  const [updatingId, setUpdatingId] = useState(null)

  // فیلتر بر اساس type
  const isClosedMode = filterType === 'closed'
  
  const statusFilter = isClosedMode 
  ? ['resolved', 'cancelled'] 
  : ['pending', 'reviewing', 'contacted']

  useEffect(() => {
    fetchRequests()
  }, [])

  const fetchRequests = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await api.get('/psychology/requests/')
      setRequests(res.data)
    } catch (err) {
      setError('خطا در دریافت درخواست‌ها.')
    } finally {
      setLoading(false)
    }
  }

  // قبول درخواست
  const acceptRequest = async (id) => {
    try {
      await api.post(`/psychology/requests/${id}/accept/`)
      setRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'reviewing' } : r))
    } catch (err) {
      alert('خطا در قبول درخواست.')
    }
  }

  // تغییر وضعیت + یادداشت
  const updateStatus = async (id, status) => {
    setUpdatingId(id)
    try {
      await api.patch(`/psychology/requests/${id}/update_status/`, {
        status,
        psychologist_note: noteText || undefined
      })
      setRequests(prev => prev.map(r => r.id === id ? { ...r, status, psychologist_note: noteText } : r))
      setExpandedId(null)
      setNoteText('')
    } catch (err) {
      alert('خطا در بروزرسانی.')
    } finally {
      setUpdatingId(null)
    }
  }

  const statusConfig = {
    pending: { label: 'در انتظار', icon: <Clock className="w-4 h-4" />, color: '#F59E0B', bg: 'rgba(245,158,11,0.1)' },
    reviewing: { label: 'در حال بررسی', icon: <Eye className="w-4 h-4" />, color: '#3B82F6', bg: 'rgba(59,130,246,0.1)' },
    contacted: { label: 'تماس گرفته شده', icon: <Phone className="w-4 h-4" />, color: '#8B5CF6', bg: 'rgba(139,92,246,0.1)' },
    resolved: { label: 'حل شده', icon: <CheckCircle className="w-4 h-4" />, color: '#10B981', bg: 'rgba(16,185,129,0.1)' },
    cancelled: { label: 'لغو شده', icon: <X className="w-4 h-4" />, color: '#EF4444', bg: 'rgba(239,68,68,0.1)' },
  }

  const urgencyConfig = {
    low: { label: 'کم', color: '#10B981' },
    medium: { label: 'متوسط', color: '#F59E0B' },
    high: { label: 'زیاد', color: '#F97316' },
    emergency: { label: 'اورژانسی', color: '#EF4444', pulse: true },
  }

  // فیلتر بر اساس حالت
  const filteredRequests = requests.filter(r => {
    const matchesStatus = statusFilter.includes(r.status)
    const matchesSearch = !search || 
      r.subject?.includes(search) ||
      r.student_name?.includes(search) ||
      r.description?.includes(search)
    return matchesStatus && matchesSearch
  })

  if (loading) {
    return (
      <div className="space-y-4">
        {[1,2,3].map(i => (
          <div key={i} className="bg-white dark:bg-navy-800 rounded-2xl p-6 animate-pulse">
            <div className="h-4 bg-gray-200 dark:bg-navy-700 rounded w-3/4 mb-3"></div>
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <p className="text-gray-500">{error}</p>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isClosedMode ? 'bg-gray-100' : 'bg-emerald-50'}`}>
            {isClosedMode ? (
              <History className="w-6 h-6 text-gray-500" />
            ) : (
              <Heart className="w-6 h-6 text-emerald-500" />
            )}
          </div>
          <div>
            <h2 className="text-xl font-black text-gray-800 dark:text-white">
              {isClosedMode ? 'تاریخچه درخواست‌ها' : 'درخواست‌های فعال'}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {filteredRequests.length} {isClosedMode ? 'پرونده بسته شده' : 'درخواست فعال'}
            </p>
          </div>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
            placeholder="جستجو..." 
            className="w-full h-12 pr-12 pl-4 bg-white dark:bg-navy-800 border rounded-2xl text-sm" 
          />
        </div>
      </div>

      {/* List */}
      {filteredRequests.length === 0 ? (
        <div className="text-center py-16">
          {isClosedMode ? (
            <History className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          ) : (
            <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          )}
          <p className="text-gray-500">
            {isClosedMode ? 'هنوز پرونده بسته شده‌ای نداری.' : 'درخواست فعالی یافت نشد. عالیه! 👏'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredRequests.map(req => {
            const status = statusConfig[req.status] || statusConfig.pending
            const urgency = urgencyConfig[req.urgency] || urgencyConfig.medium
            return (
              <div key={req.id} className="bg-white dark:bg-navy-800 rounded-2xl border border-gray-100 dark:border-navy-700 overflow-hidden">
                <button 
                  onClick={() => setExpandedId(expandedId === req.id ? null : req.id)} 
                  className="w-full p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-navy-700 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: status.bg, color: status.color }}>
                      {status.icon}
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-bold text-gray-800 dark:text-white">{req.subject}</h4>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${urgency.pulse ? 'animate-pulse' : ''}`} style={{ background: status.bg, color: urgency.color }}>
                          {urgency.pulse && '🔴 '}{urgency.label}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">
                        {req.student_name} • {req.created_at ? new Date(req.created_at).toLocaleDateString('fa-IR') : ''}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 rounded-full text-xs font-bold" style={{ background: status.bg, color: status.color }}>
                      {status.label}
                    </span>
                    {expandedId === req.id ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                  </div>
                </button>
                
                <AnimatePresence>
                  {expandedId === req.id && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }} 
                      animate={{ height: 'auto', opacity: 1 }} 
                      exit={{ height: 0, opacity: 0 }} 
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-4 border-t border-gray-100 dark:border-navy-700 pt-4">
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">{req.description}</p>
                        
                        {/* Actions فقط برای حالت فعال */}
                        {!isClosedMode && (
                          <>
                            <div className="flex flex-wrap gap-2 mb-4">
                              {req.status === 'pending' && (
                                <button 
                                  onClick={() => acceptRequest(req.id)} 
                                  className="px-4 py-2 bg-emerald-500 text-white rounded-xl text-sm font-bold hover:bg-emerald-600"
                                >
                                  قبول درخواست
                                </button>
                              )}
                              {req.status === 'reviewing' && (
                                <>
                                  <button 
                                    onClick={() => updateStatus(req.id, 'contacted')} 
                                    className="px-4 py-2 bg-purple-500 text-white rounded-xl text-sm font-bold"
                                  >
                                    تماس گرفته شد
                                  </button>
                                  <button 
                                    onClick={() => updateStatus(req.id, 'resolved')} 
                                    className="px-4 py-2 bg-emerald-500 text-white rounded-xl text-sm font-bold"
                                  >
                                    حل شد
                                  </button>
                                </>
                              )}
                            </div>

                            {(req.status === 'reviewing' || req.status === 'contacted') && (
                              <div className="flex gap-2">
                                <input 
                                  value={noteText} 
                                  onChange={e => setNoteText(e.target.value)} 
                                  placeholder="یادداشت برای دانش‌آموز..." 
                                  className="flex-1 h-12 px-4 bg-gray-50 dark:bg-navy-700 border rounded-xl text-sm" 
                                />
                                <button 
                                  onClick={() => updateStatus(req.id, req.status)} 
                                  disabled={updatingId === req.id} 
                                  className="px-4 py-2 bg-sky-500 text-white rounded-xl text-sm font-bold"
                                >
                                  {updatingId === req.id ? (
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                  ) : (
                                    <Send className="w-4 h-4" />
                                  )}
                                </button>
                              </div>
                            )}
                          </>
                        )}
                        
                        {/* نمایش یادداشت */}
                        {req.psychologist_note && (
                          <div className="mt-3 p-3 bg-sky-50 dark:bg-sky-900/10 rounded-xl text-sm text-sky-700 dark:text-sky-300">
                            <span className="font-bold">یادداشت: </span>{req.psychologist_note}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default PsychologistRequests