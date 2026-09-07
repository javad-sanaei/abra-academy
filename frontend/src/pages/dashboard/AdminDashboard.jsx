import { useState } from 'react'
import { useLocation, Routes, Route, Navigate } from 'react-router-dom'
import Sidebar from '../../components/ui/Sidebar'
import Topbar from '../../components/ui/Topbar'
import AdminStats from '../../components/admin/AdminStats'
import AdminUsers from '../../components/admin/AdminUsers'
import AdminComments from '../../components/admin/AdminComments'
import AdminPsychology from '../../components/admin/AdminPsychology'
import AdminContent from '../../components/admin/AdminContent'
import '../../styles/dashboard.css'

const AdminDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()

  return (
    <div className="dashboard-container">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="dashboard-main">
        <Topbar onMenuClick={() => setSidebarOpen(true)} currentPath={location.pathname} />
        <div className="dashboard-content">
          
          <Routes>
            <Route path="/" element={<AdminStats />} />
            <Route path="/users" element={<AdminUsers />} />
            <Route path="/counselors" element={<AdminUsers roleFilter="counselor" />} />
            <Route path="/students" element={<AdminUsers roleFilter="student" />} />
            <Route path="/comments" element={<AdminComments />} />
            <Route path="/psychology" element={<AdminPsychology />} />
            <Route path="/content" element={<AdminContent />} />
            <Route path="*" element={<Navigate to="/dashboard/admin" replace />} />
          </Routes>

        </div>
      </div>
    </div>
  )
}

export default AdminDashboard