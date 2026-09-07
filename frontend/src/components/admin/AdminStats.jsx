import { useState, useEffect } from 'react'
import { Users, GraduationCap, FileText, Video, MessageCircle, Heart, TrendingUp, BookOpen } from 'lucide-react'
import api from '../../api/axios'

const AdminStats = () => {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/admin/stats/')
        setStats(res.data)
      } catch (err) {
        console.error('Error:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  const cards = [
    { label: 'کل کاربران', value: stats?.total_users, icon: <Users className="w-6 h-6" />, color: '#3B82F6', sub: `${stats?.total_admins} ادمین` },
    { label: 'مشاوران', value: stats?.total_counselors, icon: <GraduationCap className="w-6 h-6" />, color: '#8B5CF6' },
    { label: 'دانش‌آموزان', value: stats?.total_students, icon: <Users className="w-6 h-6" />, color: '#10B981' },
    { label: 'روانشناسان', value: stats?.total_psychologists, icon: <Heart className="w-6 h-6" />, color: '#F59E0B' },
    { label: 'آزمون‌ها', value: stats?.total_exams, icon: <FileText className="w-6 h-6" />, color: '#EF4444' },
    { label: 'ویدیوها', value: stats?.total_videos, icon: <Video className="w-6 h-6" />, color: '#06B6D4' },
    { label: 'پادکست‌ها', value: stats?.total_podcasts, icon: <BookOpen className="w-6 h-6" />, color: '#EC4899' },
    { label: 'جزوه‌ها', value: stats?.total_notes, icon: <FileText className="w-6 h-6" />, color: '#14B8A6' },
    { label: 'کامنت‌های در انتظار', value: stats?.pending_comments, icon: <MessageCircle className="w-6 h-6" />, color: '#F97316' },
    { label: 'درخواست‌های روانشناسی', value: stats?.pending_psychology_requests, icon: <Heart className="w-6 h-6" />, color: '#6366F1' },
  ]

  if (loading) {
    return <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">{[...Array(10)].map((_, i) => <div key={i} className="bg-white dark:bg-navy-800 rounded-2xl p-5 animate-pulse h-28"></div>)}</div>
  }

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-black text-gray-800 dark:text-white">👑 پنل مدیریت ابرا</h2>
        <p className="text-gray-500 dark:text-gray-400 mt-1">مدیریت کامل آکادمی</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {cards.map((card, i) => (
          <div key={i} className="bg-white dark:bg-navy-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-navy-700 hover:shadow-lg hover:-translate-y-1 transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-gray-400">{card.label}</span>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${card.color}15`, color: card.color }}>{card.icon}</div>
            </div>
            <p className="text-3xl font-black" style={{ color: card.color }}>{card.value ?? '-'}</p>
            {card.sub && <p className="text-xs text-gray-400 mt-1">{card.sub}</p>}
          </div>
        ))}
      </div>
    </div>
  )
}

export default AdminStats