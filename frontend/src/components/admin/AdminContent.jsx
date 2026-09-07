import { useState, useEffect } from 'react'
import { Video, Headphones, FileText, BookOpen } from 'lucide-react'
import api from '../../api/axios'

const AdminContent = () => {
  const [stats, setStats] = useState(null)
  useEffect(() => {
    api.get('/admin/stats/').then(res => setStats(res.data)).catch(console.error)
  }, [])

  return (
    <div>
      <h2 className="text-xl font-black text-gray-800 dark:text-white mb-8">مدیریت محتوا</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'ویدیوها', value: stats?.total_videos, icon: <Video className="w-6 h-6" />, color: '#06B6D4' },
          { label: 'پادکست‌ها', value: stats?.total_podcasts, icon: <Headphones className="w-6 h-6" />, color: '#EC4899' },
          { label: 'جزوه‌ها', value: stats?.total_notes, icon: <FileText className="w-6 h-6" />, color: '#14B8A6' },
          { label: 'نمونه سوالات', value: stats?.total_exam_samples, icon: <BookOpen className="w-6 h-6" />, color: '#F97316' },
        ].map((c, i) => (
          <div key={i} className="bg-white dark:bg-navy-800 rounded-2xl p-5 border text-center">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-3" style={{ background: `${c.color}15`, color: c.color }}>{c.icon}</div>
            <p className="text-2xl font-black" style={{ color: c.color }}>{c.value ?? '-'}</p>
            <p className="text-sm text-gray-500">{c.label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default AdminContent