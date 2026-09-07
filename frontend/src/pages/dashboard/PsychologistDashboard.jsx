import { useState, useEffect } from 'react'
import { useLocation, Routes, Route, Navigate } from 'react-router-dom'
import Sidebar from '../../components/ui/Sidebar'
import Topbar from '../../components/ui/Topbar'
import PsychologistRequests from '../../components/psychologist/PsychologistRequests'
import '../../styles/dashboard.css'
import { Heart, Clock, CheckCircle, Users, FileText } from 'lucide-react'
import api from '../../api/axios'

const PsychologistDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const location = useLocation()

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/psychology/requests/')
        const requests = res.data
        // توی fetchStats:
        setStats({
          total: requests.length,
          pending: requests.filter(r => r.status === 'pending').length,
          reviewing: requests.filter(r => r.status === 'reviewing').length,
          contacted: requests.filter(r => r.status === 'contacted').length,
          resolved: requests.filter(r => r.status === 'resolved').length,
        })
      } catch (err) {
        console.error('Error fetching stats:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  const statCards = [
    { label: 'درخواست‌های جدید', value: stats?.pending ?? '-', icon: <Clock className="w-6 h-6" />, color: '#F59E0B', bg: 'rgba(245,158,11,0.1)' },
    { label: 'در حال بررسی', value: stats?.reviewing ?? '-', icon: <Heart className="w-6 h-6" />, color: '#3B82F6', bg: 'rgba(59,130,246,0.1)' },
    { label: 'تماس گرفته شده', value: stats?.contacted ?? '-', icon: <Phone className="w-6 h-6" />, color: '#8B5CF6', bg: 'rgba(139,92,246,0.1)' },
    { label: 'حل شده', value: stats?.resolved ?? '-', icon: <CheckCircle className="w-6 h-6" />, color: '#10B981', bg: 'rgba(16,185,129,0.1)' },
  ]

  return (
    <div className="dashboard-container">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="dashboard-main">
        <Topbar onMenuClick={() => setSidebarOpen(true)} currentPath={location.pathname} />
        <div className="dashboard-content">
          
          <Routes>
            {/* ===== داشبورد ===== */}
            <Route path="/" element={
              <>
                <div className="mb-8">
                  <h2 className="text-2xl font-black text-gray-800 dark:text-white">
                    👋 سلام! به پنل روانشناس خوش اومدی
                  </h2>
                  <p className="text-gray-500 dark:text-gray-400 mt-1">
                    امروز روز خوبی برای کمک به دانش‌آموزاست! 💙
                  </p>
                </div>

                {loading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="bg-white dark:bg-navy-800 rounded-2xl p-6 animate-pulse">
                        <div className="h-4 bg-gray-200 dark:bg-navy-700 rounded w-1/2 mb-4"></div>
                        <div className="h-8 bg-gray-200 dark:bg-navy-700 rounded w-1/3"></div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {statCards.map((stat, i) => (
                      <div key={i} className="bg-white dark:bg-navy-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-navy-700">
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-gray-400 text-sm">{stat.label}</span>
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: stat.bg, color: stat.color }}>{stat.icon}</div>
                        </div>
                        <p className="text-3xl font-black" style={{ color: stat.color }}>{stat.value}</p>
                      </div>
                    ))}
                  </div>
                )}
              </>
            } />
            
            {/* ===== درخواست‌های فعال ===== */}
            <Route 
              path="/requests" 
              element={<PsychologistRequests filterType="active" />} 
            />
            
            {/* ===== تاریخچه (بسته شده) ===== */}
            <Route 
              path="/history" 
              element={<PsychologistRequests filterType="closed" />} 
            />
            
            {/* مسیر نامعتبر */}
            <Route path="*" element={<Navigate to="/dashboard/psychologist" replace />} />
          </Routes>

        </div>
      </div>
    </div>
  )
}

export default PsychologistDashboard