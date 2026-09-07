import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import StudentDashboard from './pages/dashboard/StudentDashboard'
import CounselorDashboard from './pages/dashboard/CounselorDashboard'
import AdminDashboard from './pages/dashboard/AdminDashboard'
import PsychologistDashboard from './pages/dashboard/PsychologistDashboard'
import StudentExamTake from './components/student/StudentExamTake'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard/student/*" element={<StudentDashboard />} />  {/* ← /* اضافه کن */}
        <Route path="/dashboard/counselor/*" element={<CounselorDashboard />} />
        <Route path="/dashboard/admin/*" element={<AdminDashboard />} />
        <Route path="/dashboard/psychologist/*" element={<PsychologistDashboard />} />
        <Route path="/dashboard/student/exams/:examId" element={<StudentExamTake />} />
      </Routes>
    </Router>
  )
}

export default App