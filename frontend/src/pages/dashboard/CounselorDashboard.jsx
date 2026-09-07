import { useState, useEffect } from 'react'
import { useLocation, Routes, Route, Navigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import Sidebar from '../../components/ui/Sidebar'
import Topbar from '../../components/ui/Topbar'
import CounselorStudents from '../../components/counselor/CounselorStudents'
import CounselorStudentDetail from '../../components/counselor/CounselorStudentDetail'
import CounselorContent from '../../components/counselor/CounselorContent'
import CounselorExams from '../../components/counselor/CounselorExams'
import CounselorExamReport from '../../components/counselor/CounselorExamReport'
import api from '../../api/axios'
import '../../styles/dashboard.css'
import '../../styles/counselor-dashboard.css'
import { 
  Users, CalendarCheck, FileText, GraduationCap, TrendingUp,
  AlertTriangle, Wallet, Phone, Clock, ArrowLeft, Sparkles,
  BarChart3, PieChart
} from 'lucide-react'
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, PieChart as RePieChart, Pie, Cell, Legend
} from 'recharts'

const CounselorDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [stats, setStats] = useState(null)
  const [charts, setCharts] = useState(null)
  const [loading, setLoading] = useState(true)
  const location = useLocation()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [statsRes, chartsRes] = await Promise.all([
        api.get('/counseling/plans/dashboard-stats/'),
        api.get('/counseling/plans/dashboard-charts/'),
      ])
      setStats(statsRes.data)
      setCharts(chartsRes.data)
    } catch (err) {
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="dashboard-container">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="dashboard-main">
          <Topbar onMenuClick={() => setSidebarOpen(true)} currentPath={location.pathname} />
          <div className="flex items-center justify-center h-96">
            <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="dashboard-container">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="dashboard-main">
        <Topbar onMenuClick={() => setSidebarOpen(true)} currentPath={location.pathname} />
        <div className="dashboard-content">
          
          <Routes>
            <Route path="/" element={
              <div className="counselor-dash">
                {/* خوش‌آمد */}
                <div className="counselor-dash-welcome">
                  <h2>سلام! به پنل مشاور خوش اومدی 👋</h2>
                  <p>امروز {stats?.total_students || 0} دانش‌آموز داری — ببین چه خبره!</p>
                </div>

                {/* هشدارها */}
                {(stats?.tuition_alerts?.length > 0 || stats?.students_without_plans?.length > 0) && (
                  <div className="counselor-dash-alerts">
                    {stats?.tuition_alerts?.length > 0 && (
                      <div className="alert-card alert-card-red">
                        <div className="alert-card-header">
                          <Wallet className="w-5 h-5" />
                          <p>شهریه‌های عقب‌افتاده ({stats.tuition_alerts.length})</p>
                        </div>
                        {stats.tuition_alerts.slice(0, 3).map(alert => (
                          <div key={alert.id} className="alert-item">
                            <span>{alert.full_name}</span>
                            <strong>{alert.tuition_status === 'overdue' ? `${alert.days_overdue} روز` : alert.tuition_status === 'due_today' ? 'امروز' : 'فردا'}</strong>
                          </div>
                        ))}
                      </div>
                    )}

                    {stats?.students_without_plans?.length > 0 && (
                      <div className="alert-card alert-card-amber">
                        <div className="alert-card-header">
                          <CalendarCheck className="w-5 h-5" />
                          <p>بدون برنامه امروز ({stats.students_without_plans.length})</p>
                        </div>
                        {stats.students_without_plans.slice(0, 3).map(student => (
                          <div key={student.id} className="alert-item">
                            <span>{student.full_name}</span>
                            <strong>{student.grade}</strong>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* کارت‌های آماری */}
                <div className="counselor-dash-stats">
                  <motion.div whileHover={{ y: -4 }} className="stat-card stat-card-purple">
                    <div className="stat-card-icon">
                      <Users className="w-6 h-6" />
                    </div>
                    <p className="stat-card-value">{stats?.total_students || 0}</p>
                    <p className="stat-card-label">دانش‌آموزان</p>
                  </motion.div>

                  <motion.div whileHover={{ y: -4 }} className="stat-card stat-card-blue">
                    <div className="stat-card-icon">
                      <CalendarCheck className="w-6 h-6" />
                    </div>
                    <p className="stat-card-value">{stats?.pending_plans || 0}</p>
                    <p className="stat-card-label">برنامه‌های فعال</p>
                  </motion.div>

                  <motion.div whileHover={{ y: -4 }} className="stat-card stat-card-green">
                    <div className="stat-card-icon">
                      <FileText className="w-6 h-6" />
                    </div>
                    <p className="stat-card-value">{stats?.total_reports || 0}</p>
                    <p className="stat-card-label">کل گزارش‌ها</p>
                  </motion.div>

                  <motion.div whileHover={{ y: -4 }} className="stat-card stat-card-red">
                    <div className="stat-card-icon">
                      <AlertTriangle className="w-6 h-6" />
                    </div>
                    <p className="stat-card-value">{stats?.overdue_plans || 0}</p>
                    <p className="stat-card-label">عقب‌افتاده</p>
                  </motion.div>
                </div>

                {/* نمودارها */}
                <div className="counselor-dash-charts">
                  {/* عملکرد دانش‌آموزان */}
                  <div className="chart-card">
                    <div className="chart-card-header">
                      <BarChart3 className="w-5 h-5" />
                      <h3>عملکرد دانش‌آموزان</h3>
                    </div>
                    {charts?.performance?.length > 0 ? (
                      <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={charts.performance}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                          <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                          <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                          <Tooltip />
                          <Bar dataKey="percent" name="درصد" radius={[6, 6, 0, 0]}>
                            {charts.performance.map((entry, index) => (
                              <Cell key={index} fill={['#8B5CF6', '#3B82F6', '#10B981', '#F59E0B', '#EC4899', '#06B6D4', '#EF4444', '#84CC16'][index % 8]} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <p className="chart-empty">داده‌ای نیست</p>
                    )}
                  </div>

                  {/* وضعیت برنامه‌های امروز */}
                  <div className="chart-card">
                    <div className="chart-card-header">
                      <PieChart className="w-5 h-5" />
                      <h3>برنامه‌های امروز</h3>
                    </div>
                    {charts?.today_plan_status?.some(s => s.value > 0) ? (
                      <ResponsiveContainer width="100%" height={250}>
                        <RePieChart>
                          <Pie
                            data={charts.today_plan_status}
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                            nameKey="name"
                          >
                            {charts.today_plan_status.map((entry, index) => (
                              <Cell key={index} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </RePieChart>
                      </ResponsiveContainer>
                    ) : (
                      <p className="chart-empty">امروز برنامه‌ای نیست</p>
                    )}
                  </div>
                </div>
              </div>
            } />
            
            <Route path="/students" element={<CounselorStudents />} />
            <Route path="/students/:studentId" element={<CounselorStudentDetail />} />
            <Route path="/content" element={<CounselorContent />} />
            <Route path="/exams" element={<CounselorExams />} />
            <Route path="/exams/:examId/report/:studentId" element={<CounselorExamReport />} />
            <Route path="*" element={<Navigate to="/dashboard/counselor" replace />} />
          </Routes>

        </div>
      </div>
    </div>
  )
}

export default CounselorDashboard