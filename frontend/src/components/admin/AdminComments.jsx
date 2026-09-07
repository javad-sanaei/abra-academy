import { useState, useEffect } from 'react'
import { MessageCircle, CheckCircle, XCircle, Star, AlertCircle } from 'lucide-react'
import api from '../../api/axios'

const AdminComments = () => {
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchComments() }, [])

  const fetchComments = async () => {
    try {
      const res = await api.get('/admin/pending-comments/')
      setComments(res.data)
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  const approveComment = async (id) => {
    try {
      await api.post(`/admin/comments/${id}/approve/`)
      setComments(prev => prev.filter(c => c.id !== id))
    } catch { alert('خطا!') }
  }

  const deleteComment = async (id) => {
    if (!confirm('حذف شود؟')) return
    try {
      await api.delete(`/admin/comments/${id}/delete/`)
      setComments(prev => prev.filter(c => c.id !== id))
    } catch { alert('خطا!') }
  }

  if (loading) return <div className="text-center py-16 text-gray-400">در حال بارگذاری...</div>

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-xl font-black text-gray-800 dark:text-white">مدیریت کامنت‌ها</h2>
        <p className="text-sm text-gray-500">{comments.length} کامنت در انتظار تأیید</p>
      </div>
      {comments.length === 0 ? (
        <div className="text-center py-16"><MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" /><p className="text-gray-500">کامنتی در انتظار نیست.</p></div>
      ) : (
        <div className="space-y-3">
          {comments.map(c => (
            <div key={c.id} className="bg-white dark:bg-navy-800 rounded-2xl p-5 border">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-bold text-gray-800 dark:text-white">{c.user_name}</p>
                  <p className="text-xs text-gray-500">{new Date(c.created_at).toLocaleDateString('fa-IR')}</p>
                </div>
                <div className="flex gap-1">{[...Array(c.rating || 5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />)}</div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{c.content}</p>
              <div className="flex gap-2">
                <button onClick={() => approveComment(c.id)} className="px-4 py-2 bg-emerald-500 text-white rounded-xl text-sm font-bold">تأیید</button>
                <button onClick={() => deleteComment(c.id)} className="px-4 py-2 bg-red-500 text-white rounded-xl text-sm font-bold">حذف</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default AdminComments