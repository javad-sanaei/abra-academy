import { useState, useEffect, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  FileText, Search, AlertCircle, TrendingUp, Target,
  Clock, CheckCircle, XCircle, ChevronDown, ChevronUp,
  BarChart3, Users, Filter, Calendar, BookOpen, Layers
} from 'lucide-react'
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, Area, AreaChart, BarChart, Bar, Legend, PieChart, Pie, Cell
} from 'recharts'
import api from '../../api/axios'
import '../../styles/counselor-reports.css'

const CounselorReports = () => {
  const [reports, setReports] = useState([])
  const [students, setStudents] = useState([])
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const [filterStudent, setFilterStudent] = useState('')
  const [filterCourse, setFilterCourse] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [expandedReport, setExpandedReport] = useState(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [reportsRes, studentsRes, coursesRes] = await Promise.all([
        api.get('/counseling/reports/'),
        api.get('/accounts/users/?role=student'),
        api.get('/core/courses/'),
      ])
      setReports(reportsRes.data)
      setStudents(studentsRes.data)
      setCourses(coursesRes.data)
    } catch (err) {
      setError('خطا در دریافت گزارش‌ها.')
    } finally {
      setLoading(false)
    }
  }, [])

  // ===== داده‌های نمودار =====
  const chartData = useMemo(() => {
    if (!selectedStudent) return []
    
    return reports
      .filter(r => r.student === Number(selectedStudent))
      .sort((a, b) => (a.report_date || '').localeCompare(b.report_date || ''))
      .map(r => ({
        date: r.report_date || 'بدون تاریخ',
        درصد: Number(r.percentage) || 0,
        'ساعت مطالعه': Number(r.study_time) || 0,
        'تست درست': Number(r.correct_answers) || 0,
        'تست غلط': Number(r.wrong_answers) || 0,
        درس: r.course_name || 'نامشخص',
      }))
  }, [selectedStudent, reports])

  // ===== عملکرد درسی =====
  const coursePerformance = useMemo(() => {
    if (!selectedStudent) return []
    
    const studentReports = reports.filter(r => r.student === Number(selectedStudent))
    const grouped = {}
    
    studentReports.forEach(r => {
      const courseName = r.course_name || 'نامشخص'
      if (!grouped[courseName]) {
        grouped[courseName] = { course: courseName, total: 0, count: 0 }
      }
      grouped[courseName].total += Number(r.percentage) || 0
      grouped[courseName].count += 1
    })
    
    return Object.values(grouped).map(g => ({
      course: g.course,
      درصد: Math.round(g.total / g.count),
    }))
  }, [selectedStudent, reports])

  // ===== فیلتر =====
  const filteredReports = useMemo(() => {
    return reports.filter(r => {
      const matchesSearch = !search || 
        r.course_name?.includes(search) ||
        r.student_name?.includes(search) ||
        r.topic?.includes(search)
      const matchesStudent = !filterStudent || r.student === Number(filterStudent)
      const matchesCourse = !filterCourse || r.course === Number(filterCourse) || r.course_name === filterCourse
      const matchesStatus = filterStatus === 'all' || 
        (filterStatus === 'good' && r.percentage >= 60) ||
        (filterStatus === 'medium' && r.percentage >= 40 && r.percentage < 60) ||
        (filterStatus === 'weak' && r.percentage < 40)
      const matchesDateFrom = !dateFrom || (r.report_date || '') >= dateFrom
      const matchesDateTo = !dateTo || (r.report_date || '') <= dateTo
      
      return matchesSearch && matchesStudent && matchesCourse && matchesStatus && matchesDateFrom && matchesDateTo
    })
  }, [reports, search, filterStudent, filterCourse, filterStatus, dateFrom, dateTo])

  const groupedReports = useMemo(() => {
    return filteredReports.reduce((groups, report) => {
      const date = report.report_date
      if (!groups[date]) groups[date] = []
      groups[date].push(report)
      return groups
    }, {})
  }, [filteredReports])

  const stats = useMemo(() => {
    const total = reports.length
    const avgPercentage = total > 0
      ? Math.round(reports.reduce((sum, r) => sum + (r.percentage || 0), 0) / total)
      : 0
    const totalStudyHours = reports.reduce((sum, r) => sum + (Number(r.study_time) || 0), 0)
    return { total, avgPercentage, totalStudyHours }
  }, [reports])

  const statusFilters = [
    { id: 'all', label: 'همه' },
    { id: 'good', label: '👌 خوب (۶۰٪+)' },
    { id: 'medium', label: '🙂 متوسط (۴۰-۶۰٪)' },
    { id: 'weak', label: '😰 ضعیف (<۴۰٪)' },
  ]

  if (loading) {
    return (
      <div className="counselor-reports-container">
        <div className="reports-skeleton-stack">
          {[1, 2, 3].map((i) => (
            <div key={i} className="reports-skeleton-card">
              <div className="reports-skeleton-line reports-skeleton-line-lg" />
              <div className="reports-skeleton-line reports-skeleton-line-sm" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="counselor-reports-container">
        <div className="reports-state">
          <div className="reports-state-icon reports-state-icon-error">
            <AlertCircle className="w-9 h-9" />
          </div>
          <h3 className="reports-state-title">خطا!</h3>
          <p className="reports-state-desc">{error}</p>
          <button onClick={fetchData} className="reports-retry-btn">تلاش دوباره</button>
        </div>
      </div>
    )
  }

  return (
    <div className="counselor-reports-container">
      
      {/* Header + Stats */}
      <div className="reports-header">
        <div>
          <h2 className="reports-heading">
            <span className="reports-heading-icon">
              <BarChart3 className="w-5 h-5" />
            </span>
            گزارش‌های دانش‌آموزان
          </h2>
          <p className="reports-subheading">تحلیل و بررسی عملکرد</p>
        </div>
      </div>

      {/* Stats */}
      <div className="reports-stats">
        <div className="reports-stat-card">
          <FileText className="reports-stat-icon reports-stat-icon-purple" />
          <div>
            <p className="reports-stat-value">{stats.total}</p>
            <p className="reports-stat-label">کل گزارش‌ها</p>
          </div>
        </div>
        <div className="reports-stat-card">
          <TrendingUp className="reports-stat-icon reports-stat-icon-green" />
          <div>
            <p className="reports-stat-value">%{stats.avgPercentage}</p>
            <p className="reports-stat-label">میانگین درصد</p>
          </div>
        </div>
        <div className="reports-stat-card">
          <Clock className="reports-stat-icon reports-stat-icon-orange" />
          <div>
            <p className="reports-stat-value">{stats.totalStudyHours}</p>
            <p className="reports-stat-label">ساعت مطالعه</p>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="reports-charts-grid">
        {/* نمودار روند درصد */}
        <div className="reports-chart-card">
          <div className="reports-chart-header">
            <h3>📈 روند درصد</h3>
            <select value={selectedStudent || ''} onChange={(e) => setSelectedStudent(e.target.value || null)}>
              <option value="">انتخاب دانش‌آموز...</option>
              {students.map(s => <option key={s.id} value={s.id}>{s.full_name || s.username}</option>)}
            </select>
          </div>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="percentGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
                <Tooltip />
                <Area type="monotone" dataKey="درصد" stroke="#8B5CF6" strokeWidth={2} fill="url(#percentGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <p className="reports-chart-empty">دانش‌آموز انتخاب کن</p>
          )}
        </div>

        {/* نمودار ساعت مطالعه */}
        <div className="reports-chart-card">
          <h3 className="reports-chart-title">⏱ ساعت مطالعه</h3>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="ساعت مطالعه" fill="#3B82F6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="reports-chart-empty">دانش‌آموز انتخاب کن</p>
          )}
        </div>

        {/* عملکرد درسی */}
        <div className="reports-chart-card reports-chart-full">
          <h3 className="reports-chart-title">📚 عملکرد هر درس</h3>
          {coursePerformance.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={coursePerformance} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10 }} />
                <YAxis dataKey="course" type="category" tick={{ fontSize: 12 }} width={100} />
                <Tooltip />
                <Bar dataKey="درصد" radius={[0, 8, 8, 0]}>
                  {coursePerformance.map((entry, index) => (
                    <Cell key={index} fill={['#8B5CF6', '#3B82F6', '#10B981', '#F59E0B', '#EC4899'][index % 5]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="reports-chart-empty">دانش‌آموز انتخاب کن</p>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="reports-filters">
        <div className="reports-filter-group">
          <Search className="reports-filter-icon" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="جستجو..."
            className="reports-filter-input"
          />
        </div>
        
        <select value={filterStudent} onChange={(e) => setFilterStudent(e.target.value)} className="reports-filter-select">
          <option value="">همه دانش‌آموزان</option>
          {students.map(s => <option key={s.id} value={s.id}>{s.full_name || s.username}</option>)}
        </select>

        <select value={filterCourse} onChange={(e) => setFilterCourse(e.target.value)} className="reports-filter-select">
          <option value="">همه درس‌ها</option>
          {courses.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
        </select>

        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="reports-filter-select">
          {statusFilters.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
        </select>

        <input type="text" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} placeholder="از تاریخ" className="reports-filter-input reports-filter-date" />
        <input type="text" value={dateTo} onChange={(e) => setDateTo(e.target.value)} placeholder="تا تاریخ" className="reports-filter-input reports-filter-date" />
      </div>

      {/* Reports List */}
      {filteredReports.length === 0 ? (
        <div className="reports-state">
          <div className="reports-state-icon reports-state-icon-empty">
            <FileText className="w-9 h-9" />
          </div>
          <h3 className="reports-state-title">گزارشی یافت نشد!</h3>
          <p className="reports-state-desc">با فیلتر دیگه‌ای امتحان کن.</p>
        </div>
      ) : (
        <div className="reports-groups">
          {Object.entries(groupedReports).map(([date, dateReports]) => (
            <div key={date} className="reports-group">
              <h3 className="reports-group-date">
                <Calendar className="w-4 h-4" />
                {date} • {dateReports.length} گزارش
              </h3>
              
              <div className="reports-list">
                {dateReports.map((report) => (
                  <div key={report.id} className="reports-list-card">
                    <button
                      onClick={() => setExpandedReport(expandedReport === report.id ? null : report.id)}
                      className="reports-list-btn"
                    >
                      <div className="reports-list-info">
                        <FileText className="reports-list-icon" />
                        <div>
                          <h4>{report.course_name}</h4>
                          <p>{report.student_name} • {report.topic}</p>
                        </div>
                      </div>
                      <div className="reports-list-score">
                        <p className={report.percentage >= 50 ? 'score-good' : 'score-bad'}>%{report.percentage}</p>
                        {expandedReport === report.id ? <ChevronUp /> : <ChevronDown />}
                      </div>
                    </button>
                    
                    <AnimatePresence>
                      {expandedReport === report.id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="reports-list-detail"
                        >
                          <div className="reports-detail-grid">
                            <div><p>کل تست‌ها</p><strong>{report.total_questions}</strong></div>
                            <div><p>درست</p><strong className="text-green">{report.correct_answers}</strong></div>
                            <div><p>غلط</p><strong className="text-red">{report.wrong_answers}</strong></div>
                            <div><p>نزده</p><strong>{report.unanswered}</strong></div>
                            <div><p>مطالعه</p><strong>{report.study_time}h</strong></div>
                            <div><p>تست</p><strong>{report.test_time}m</strong></div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default CounselorReports