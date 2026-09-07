import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowRight, Users, CalendarCheck, FileText, GraduationCap,
  Clock, Target, TrendingUp, BookOpen, CheckCircle, XCircle,
  AlertCircle, Phone, Mail, Award, BarChart3, Plus,
  ChevronDown, ChevronUp, Eye, Wallet, MessageCircle, Search, Filter
} from 'lucide-react'
import api from '../../api/axios'
import '../../styles/counselor-student-detail.css'

const CounselorStudentDetail = () => {
  const { studentId } = useParams()
  const navigate = useNavigate()
  
  const [student, setStudent] = useState(null)
  const [activeTab, setActiveTab] = useState('profile')
  const [plans, setPlans] = useState([])
  const [reports, setReports] = useState([])
  const [examResults, setExamResults] = useState([])
  const [contacts, setContacts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [expandedReport, setExpandedReport] = useState(null)
  const [showContactForm, setShowContactForm] = useState(false)
  const [contactType, setContactType] = useState('call')
  const [contactNote, setContactNote] = useState('')
  
  // ✅ State های فیلتر
  const [searchPlans, setSearchPlans] = useState('')
  const [filterPlanStatus, setFilterPlanStatus] = useState('all')
  const [searchReports, setSearchReports] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [filterContactType, setFilterContactType] = useState('all')

  // ✅ State های فرم برنامه
  const [showPlanForm, setShowPlanForm] = useState(false)
  const [planCourse, setPlanCourse] = useState('')
  const [planDate, setPlanDate] = useState('')
  const [planTime, setPlanTime] = useState('')
  const [planDescription, setPlanDescription] = useState('')
  const [coursesList, setCoursesList] = useState([])

  useEffect(() => {
    fetchData()
    fetchCourses()
  }, [studentId])

  const fetchCourses = async () => {
    try {
      const res = await api.get('/core/courses/')
      setCoursesList(res.data)
    } catch (err) {
      console.error('Error fetching courses:', err)
    }
  }

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      const [studentRes, plansRes, reportsRes] = await Promise.all([
        api.get(`/accounts/users/${studentId}/`),
        api.get(`/counseling/plans/?student=${studentId}`),
        api.get(`/counseling/reports/?student=${studentId}`),
      ])
      setStudent(studentRes.data)
      setPlans(plansRes.data)
      setReports(reportsRes.data)
      
      try {
        const contactsRes = await api.get(`/counseling/contacts/?student=${studentId}`)
        setContacts(contactsRes.data)
      } catch {
        setContacts([])
      }
      
      try {
        const examRes = await api.get(`/counseling/reports/exam-results/?student=${studentId}`)
        setExamResults(examRes.data)
      } catch {
        setExamResults([])
      }
    } catch (err) {
      setError('خطا در دریافت اطلاعات دانش‌آموز.')
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  // ✅ افزودن برنامه جدید
  const addPlan = async () => {
    if (!planCourse || !planDate) {
      alert('درس و تاریخ الزامی است')
      return
    }
    
    try {
      await api.post('/counseling/plans/', {
        student: Number(studentId),
        course: Number(planCourse),
        plan_date: planDate,
        study_time: planTime,
        description: planDescription,
      })
      setShowPlanForm(false)
      setPlanCourse('')
      setPlanDate('')
      setPlanTime('')
      setPlanDescription('')
      fetchData()
    } catch (err) {
      alert(err.response?.data?.error || 'خطا در ثبت برنامه')
    }
  }

  const addContact = async () => {
    const today = new Date().toLocaleDateString('fa-IR-u-nu-latn', {
      year: 'numeric', month: '2-digit', day: '2-digit'
    }).replace(/\//g, '/')
    
    try {
      await api.post('/counseling/contacts/', {
        student: Number(studentId),
        contact_date: today,
        contact_type: contactType,
        note: contactNote || null,
      })
      setShowContactForm(false)
      setContactType('call')
      setContactNote('')
      const res = await api.get(`/counseling/contacts/?student=${studentId}`)
      setContacts(res.data)
    } catch (err) {
      alert('خطا در ثبت تماس.')
    }
  }

  const filteredPlans = plans.filter(p => {
    const matchesSearch = !searchPlans || 
      (p.course_name || '').includes(searchPlans) ||
      (p.description || '').includes(searchPlans)
    const matchesStatus = filterPlanStatus === 'all' || p.status === filterPlanStatus
    return matchesSearch && matchesStatus
  })

  const filteredReports = reports.filter(r => {
    const matchesSearch = !searchReports || 
      (r.course_name || '').includes(searchReports) ||
      (r.topic || '').includes(searchReports) ||
      (r.description || '').includes(searchReports)
    const matchesDateFrom = !dateFrom || (r.report_date || '') >= dateFrom
    const matchesDateTo = !dateTo || (r.report_date || '') <= dateTo
    return matchesSearch && matchesDateFrom && matchesDateTo
  })

  const filteredContacts = contacts.filter(c => {
    return filterContactType === 'all' || c.contact_type === filterContactType
  })

  const stats = {
    activePlans: plans.filter(p => p.status === 'pending').length,
    totalReports: reports.length,
    avgPercentage: reports.length > 0 
      ? Math.round(reports.reduce((sum, r) => sum + (r.percentage || 0), 0) / reports.length)
      : 0,
    totalExams: examResults.length,
    totalContacts: contacts.length,
  }

  const statusConfig = {
    pending: { label: 'در انتظار', icon: <Clock className="w-4 h-4" />, color: '#F59E0B', bg: 'rgba(245,158,11,0.1)' },
    done: { label: 'انجام شده', icon: <CheckCircle className="w-4 h-4" />, color: '#10B981', bg: 'rgba(16,185,129,0.1)' },
    missed: { label: 'انجام نشده', icon: <XCircle className="w-4 h-4" />, color: '#EF4444', bg: 'rgba(239,68,68,0.1)' },
  }

  const contactTypeConfig = {
    call: { label: 'تلفنی', icon: <Phone className="w-3.5 h-3.5" />, color: '#10B981' },
    text: { label: 'پیامک', icon: <MessageCircle className="w-3.5 h-3.5" />, color: '#3B82F6' },
    video: { label: 'ویدیویی', icon: <Eye className="w-3.5 h-3.5" />, color: '#8B5CF6' },
  }

  const tabs = [
    { id: 'profile', label: 'پروفایل', icon: <Users className="w-5 h-5" />, count: null },
    { id: 'plans', label: 'برنامه‌ها', icon: <CalendarCheck className="w-5 h-5" />, count: plans.length },
    { id: 'reports', label: 'گزارش‌ها', icon: <BarChart3 className="w-5 h-5" />, count: reports.length },
    { id: 'exams', label: 'آزمون‌ها', icon: <GraduationCap className="w-5 h-5" />, count: examResults.length },
    { id: 'contacts', label: 'تماس‌ها', icon: <Phone className="w-5 h-5" />, count: contacts.length },
    { id: 'tuition', label: 'شهریه', icon: <Wallet className="w-5 h-5" />, count: null },
  ]

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-navy-900">
        <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (error || !student) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-navy-900 p-4">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">خطا!</h2>
          <p className="text-gray-500">{error || 'دانش‌آموز یافت نشد.'}</p>
          <button onClick={() => navigate('/dashboard/counselor/students')} className="mt-4 px-6 py-3 bg-purple-500 text-white rounded-2xl font-bold">
            بازگشت
          </button>
        </div>
      </div>
    )
  }

  const userInitial = (student.full_name || student.username).charAt(0)
  const tuitionStatus = student.tuition_status || { status: 'unknown' }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-navy-900">
      {/* Header */}
      <div className="bg-white dark:bg-navy-800 border-b border-gray-200 dark:border-navy-700">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => navigate('/dashboard/counselor/students')}
              className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-navy-700 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors"
            >
              <ArrowRight className="w-5 h-5" />
            </button>
            
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white font-bold text-2xl shadow-lg flex-shrink-0">
              {userInitial}
            </div>
            
            <div>
              <h1 className="text-2xl font-black text-gray-800 dark:text-white">
                {student.full_name || student.username}
              </h1>
              <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400 mt-1 flex-wrap">
                <span className="flex items-center gap-1">
                  <GraduationCap className="w-4 h-4" />
                  {student.grade || '—'}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <BookOpen className="w-4 h-4" />
                  {student.field_of_study || '—'}
                </span>
                {student.phone && (
                  <>
                    <span>•</span>
                    <a href={`tel:${student.phone}`} className="flex items-center gap-1 text-emerald-500 hover:text-emerald-600">
                      <Phone className="w-4 h-4" />
                      {student.phone}
                    </a>
                  </>
                )}
              </div>
            </div>

            <a
              href={`tel:${student.phone || ''}`}
              className="mr-auto flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-bold transition-all"
            >
              <Phone className="w-4 h-4" />
              تماس
            </a>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="bg-sky-50 dark:bg-sky-900/10 rounded-2xl p-4 text-center">
              <CalendarCheck className="w-6 h-6 text-sky-500 mx-auto mb-2" />
              <p className="text-2xl font-black text-sky-500">{stats.activePlans}</p>
              <p className="text-xs text-gray-500">برنامه فعال</p>
            </div>
            <div className="bg-emerald-50 dark:bg-emerald-900/10 rounded-2xl p-4 text-center">
              <FileText className="w-6 h-6 text-emerald-500 mx-auto mb-2" />
              <p className="text-2xl font-black text-emerald-500">{stats.totalReports}</p>
              <p className="text-xs text-gray-500">گزارش ثبت شده</p>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/10 rounded-2xl p-4 text-center">
              <TrendingUp className="w-6 h-6 text-purple-500 mx-auto mb-2" />
              <p className="text-2xl font-black text-purple-500">%{stats.avgPercentage}</p>
              <p className="text-xs text-gray-500">میانگین درصد</p>
            </div>
            <div className="bg-amber-50 dark:bg-amber-900/10 rounded-2xl p-4 text-center">
              <GraduationCap className="w-6 h-6 text-amber-500 mx-auto mb-2" />
              <p className="text-2xl font-black text-amber-500">{stats.totalExams}</p>
              <p className="text-xs text-gray-500">آزمون داده شده</p>
            </div>
            <div className="bg-rose-50 dark:bg-rose-900/10 rounded-2xl p-4 text-center">
              <Phone className="w-6 h-6 text-rose-500 mx-auto mb-2" />
              <p className="text-2xl font-black text-rose-500">{stats.totalContacts}</p>
              <p className="text-xs text-gray-500">تماس این هفته</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-2 mb-6 p-1.5 bg-white dark:bg-navy-800 rounded-2xl shadow-sm border border-gray-100 dark:border-navy-700 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold transition-all flex-1 justify-center whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/30'
                  : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              {tab.icon}
              {tab.label}
              {tab.count !== null && (
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  activeTab === tab.id ? 'bg-white/20' : 'bg-gray-100 dark:bg-navy-700'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            {/* PROFILE */}
            {activeTab === 'profile' && (
              <div className="bg-white dark:bg-navy-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-navy-700">
                <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">اطلاعات دانش‌آموز</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-navy-700 rounded-xl">
                    <Users className="w-5 h-5 text-purple-500" />
                    <div>
                      <p className="text-xs text-gray-500">نام کاربری</p>
                      <p className="font-bold text-gray-800 dark:text-white">@{student.username}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-navy-700 rounded-xl">
                    <GraduationCap className="w-5 h-5 text-sky-500" />
                    <div>
                      <p className="text-xs text-gray-500">پایه / رشته</p>
                      <p className="font-bold text-gray-800 dark:text-white">{student.grade} • {student.field_of_study}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-navy-700 rounded-xl">
                    <Phone className="w-5 h-5 text-emerald-500" />
                    <div>
                      <p className="text-xs text-gray-500">شماره تماس</p>
                      <p className="font-bold text-gray-800 dark:text-white">{student.phone || '—'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-navy-700 rounded-xl">
                    <Mail className="w-5 h-5 text-amber-500" />
                    <div>
                      <p className="text-xs text-gray-500">ایمیل</p>
                      <p className="font-bold text-gray-800 dark:text-white">{student.email || '—'}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* PLANS */}
            {activeTab === 'plans' && (
              <div className="space-y-3">
                {/* دکمه افزودن برنامه */}
                <div className="flex justify-end mb-4">
                  <button
                    onClick={() => setShowPlanForm(!showPlanForm)}
                    className="flex items-center gap-2 px-5 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-2xl font-bold text-sm transition-all"
                  >
                    {showPlanForm ? <XCircle className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    {showPlanForm ? 'انصراف' : 'افزودن برنامه جدید'}
                  </button>
                </div>

                {/* فرم افزودن برنامه */}
                {showPlanForm && (
                  <div className="bg-white dark:bg-navy-800 rounded-2xl p-5 border border-purple-100 dark:border-purple-900/30 mb-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-gray-500 mb-1 block">درس *</label>
                        <select value={planCourse} onChange={(e) => setPlanCourse(e.target.value)} className="w-full h-11 px-3 bg-gray-50 dark:bg-navy-700 border rounded-xl text-sm">
                          <option value="">انتخاب درس...</option>
                          {coursesList.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 mb-1 block">تاریخ *</label>
                        <input value={planDate} onChange={(e) => setPlanDate(e.target.value)} placeholder="مثلاً: 1405/06/10" className="w-full h-11 px-3 bg-gray-50 dark:bg-navy-700 border rounded-xl text-sm" />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 mb-1 block">زمان مطالعه</label>
                        <input value={planTime} onChange={(e) => setPlanTime(e.target.value)} placeholder="مثلاً: ۲ ساعت" className="w-full h-11 px-3 bg-gray-50 dark:bg-navy-700 border rounded-xl text-sm" />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 mb-1 block">توضیحات</label>
                        <input value={planDescription} onChange={(e) => setPlanDescription(e.target.value)} placeholder="اختیاری" className="w-full h-11 px-3 bg-gray-50 dark:bg-navy-700 border rounded-xl text-sm" />
                      </div>
                    </div>
                    <button onClick={addPlan} className="mt-3 px-6 py-2.5 bg-purple-500 hover:bg-purple-600 text-white rounded-xl text-sm font-bold">
                      ثبت برنامه
                    </button>
                  </div>
                )}

                {/* فیلترها */}
                <div className="flex flex-wrap gap-2 mb-4 p-3 bg-white dark:bg-navy-800 rounded-2xl border">
                  <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={searchPlans}
                      onChange={(e) => setSearchPlans(e.target.value)}
                      placeholder="جستجوی برنامه..."
                      className="w-full h-11 pr-10 pl-4 bg-gray-50 dark:bg-navy-700 border rounded-xl text-sm"
                    />
                  </div>
                  <select value={filterPlanStatus} onChange={(e) => setFilterPlanStatus(e.target.value)} className="h-11 px-3 bg-gray-50 dark:bg-navy-700 border rounded-xl text-sm">
                    <option value="all">همه وضعیت‌ها</option>
                    <option value="pending">در انتظار</option>
                    <option value="done">انجام شده</option>
                    <option value="missed">انجام نشده</option>
                  </select>
                </div>

                {filteredPlans.length === 0 ? (
                  <div className="text-center py-16 bg-white dark:bg-navy-800 rounded-2xl">
                    <CalendarCheck className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">برنامه‌ای یافت نشد.</p>
                  </div>
                ) : (
                  filteredPlans.map((plan) => {
                    const status = statusConfig[plan.status] || statusConfig.pending
                    return (
                      <div key={plan.id} className="bg-white dark:bg-navy-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-navy-700 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: status.bg, color: status.color }}>
                            {status.icon}
                          </div>
                          <div>
                            <h4 className="font-bold text-gray-800 dark:text-white">{plan.course_name || 'بدون عنوان'}</h4>
                            <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                              <span>{plan.plan_date}</span>
                              {plan.study_time && <span>• {plan.study_time}</span>}
                            </div>
                          </div>
                        </div>
                        <span className="px-3 py-1 rounded-full text-xs font-bold" style={{ background: status.bg, color: status.color }}>
                          {status.label}
                        </span>
                      </div>
                    )
                  })
                )}
              </div>
            )}

            {/* REPORTS */}
            {activeTab === 'reports' && (
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2 mb-4 p-3 bg-white dark:bg-navy-800 rounded-2xl border">
                  <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={searchReports}
                      onChange={(e) => setSearchReports(e.target.value)}
                      placeholder="جستجوی گزارش..."
                      className="w-full h-11 pr-10 pl-4 bg-gray-50 dark:bg-navy-700 border rounded-xl text-sm"
                    />
                  </div>
                  <input type="text" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} placeholder="از تاریخ" className="h-11 px-3 bg-gray-50 dark:bg-navy-700 border rounded-xl text-sm w-28" />
                  <input type="text" value={dateTo} onChange={(e) => setDateTo(e.target.value)} placeholder="تا تاریخ" className="h-11 px-3 bg-gray-50 dark:bg-navy-700 border rounded-xl text-sm w-28" />
                </div>

                {filteredReports.length === 0 ? (
                  <div className="text-center py-16 bg-white dark:bg-navy-800 rounded-2xl">
                    <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">گزارشی یافت نشد.</p>
                  </div>
                ) : (
                  filteredReports.map((report) => (
                    <div key={report.id} className="bg-white dark:bg-navy-800 rounded-2xl shadow-sm border border-gray-100 dark:border-navy-700 overflow-hidden">
                      <button
                        onClick={() => setExpandedReport(expandedReport === report.id ? null : report.id)}
                        className="w-full p-5 flex items-center justify-between text-right hover:bg-gray-50 dark:hover:bg-navy-700 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center text-purple-500">
                            <FileText className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="font-bold text-gray-800 dark:text-white">{report.course_name}</h4>
                            <p className="text-xs text-gray-500">{report.report_date} • {report.topic}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className={`text-lg font-black ${report.percentage >= 50 ? 'text-emerald-500' : 'text-red-500'}`}>
                              %{report.percentage}
                            </p>
                            <p className="text-xs text-gray-500">{report.study_time} ساعت</p>
                          </div>
                          {expandedReport === report.id ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                        </div>
                      </button>
                      
                      <AnimatePresence>
                        {expandedReport === report.id && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="px-5 pb-5 border-t border-gray-100 dark:border-navy-700 pt-4">
                              <div className="grid grid-cols-4 gap-4 text-center">
                                <div>
                                  <p className="text-sm text-gray-500">کل تست‌ها</p>
                                  <p className="text-xl font-black text-gray-800 dark:text-white">{report.total_questions}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-500">درست</p>
                                  <p className="text-xl font-black text-emerald-500">{report.correct_answers}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-500">غلط</p>
                                  <p className="text-xl font-black text-red-500">{report.wrong_answers}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-500">نزده</p>
                                  <p className="text-xl font-black text-gray-400">{report.unanswered}</p>
                                </div>
                              </div>
                              {report.description && (
                                <p className="mt-4 text-sm text-gray-500">{report.description}</p>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* EXAMS */}
            {activeTab === 'exams' && (
              <div className="space-y-3">
                {examResults.length === 0 ? (
                  <div className="text-center py-16 bg-white dark:bg-navy-800 rounded-2xl">
                    <GraduationCap className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">هنوز آزمونی ثبت نشده.</p>
                  </div>
                ) : (
                  examResults.map((result) => (
                    <div key={result.id} className="bg-white dark:bg-navy-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-navy-700 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center text-amber-500">
                          <Award className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-800 dark:text-white">آزمون #{result.exam}</h4>
                          <p className="text-xs text-gray-500">
                            {result.finished_at ? new Date(result.finished_at).toLocaleDateString('fa-IR') : 'در حال انجام'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-black text-purple-500">%{result.total_score || '—'}</p>
                        <p className="text-xs text-gray-500">خروج: {result.exit_count}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* CONTACTS */}
            {activeTab === 'contacts' && (
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2 mb-4 justify-between">
                  <select value={filterContactType} onChange={(e) => setFilterContactType(e.target.value)} className="h-11 px-3 bg-white dark:bg-navy-800 border rounded-xl text-sm">
                    <option value="all">همه تماس‌ها</option>
                    <option value="call">📞 تلفنی</option>
                    <option value="text">💬 پیامک</option>
                    <option value="video">🎥 ویدیویی</option>
                  </select>
                  <button onClick={() => setShowContactForm(!showContactForm)} className="flex items-center gap-2 px-5 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-bold text-sm transition-all">
                    {showContactForm ? <XCircle className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    {showContactForm ? 'انصراف' : 'ثبت تماس جدید'}
                  </button>
                </div>

                {showContactForm && (
                  <div className="bg-white dark:bg-navy-800 rounded-2xl p-5 border border-emerald-100 dark:border-emerald-900/30">
                    <div className="flex gap-3 flex-wrap">
                      <select value={contactType} onChange={(e) => setContactType(e.target.value)} className="h-12 px-4 bg-gray-50 dark:bg-navy-700 border rounded-xl text-sm">
                        <option value="call">📞 تلفنی</option>
                        <option value="text">💬 پیامک</option>
                        <option value="video">🎥 ویدیویی</option>
                      </select>
                      <input value={contactNote} onChange={(e) => setContactNote(e.target.value)} placeholder="یادداشت (اختیاری)" className="flex-1 h-12 px-4 bg-gray-50 dark:bg-navy-700 border rounded-xl text-sm" />
                      <button onClick={addContact} className="h-12 px-6 bg-emerald-500 text-white rounded-xl font-bold text-sm">
                        ثبت
                      </button>
                    </div>
                  </div>
                )}

                {filteredContacts.length === 0 && !showContactForm ? (
                  <div className="text-center py-16 bg-white dark:bg-navy-800 rounded-2xl">
                    <Phone className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">تماسی یافت نشد.</p>
                  </div>
                ) : (
                  filteredContacts.map((contact) => {
                    const typeConfig = contactTypeConfig[contact.contact_type] || contactTypeConfig.call
                    return (
                      <div key={contact.id} className="bg-white dark:bg-navy-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-navy-700 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ color: typeConfig.color, background: `${typeConfig.color}10` }}>
                            {typeConfig.icon}
                          </div>
                          <div>
                            <h4 className="font-bold text-gray-800 dark:text-white">{typeConfig.label}</h4>
                            <p className="text-xs text-gray-500">{contact.contact_date}</p>
                          </div>
                        </div>
                        {contact.note && <p className="text-xs text-gray-400">{contact.note}</p>}
                      </div>
                    )
                  })
                )}
              </div>
            )}

            {/* TUITION */}
            {activeTab === 'tuition' && (
              <div className="bg-white dark:bg-navy-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-navy-700">
                <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">وضعیت شهریه</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-amber-50 dark:bg-amber-900/10 rounded-xl text-center">
                    <Wallet className="w-6 h-6 text-amber-500 mx-auto mb-2" />
                    <p className="text-2xl font-black text-amber-500">
                      {student.tuition_amount ? `${Number(student.tuition_amount).toLocaleString('fa-IR')} تومان` : '—'}
                    </p>
                    <p className="text-xs text-gray-500">مبلغ شهریه</p>
                  </div>
                  <div className="p-4 bg-sky-50 dark:bg-sky-900/10 rounded-xl text-center">
                    <CalendarCheck className="w-6 h-6 text-sky-500 mx-auto mb-2" />
                    <p className="text-2xl font-black text-sky-500">
                      {student.tuition_day ? `روز ${student.tuition_day} هر ماه` : '—'}
                    </p>
                    <p className="text-xs text-gray-500">روز پرداخت</p>
                  </div>
                  <div className={`p-4 rounded-xl text-center ${
                    tuitionStatus.status === 'overdue' ? 'bg-red-50 dark:bg-red-900/10' : 
                    tuitionStatus.status === 'due_today' ? 'bg-amber-50 dark:bg-amber-900/10' : 
                    tuitionStatus.status === 'due_tomorrow' ? 'bg-yellow-50 dark:bg-yellow-900/10' : 
                    'bg-emerald-50 dark:bg-emerald-900/10'
                  }`}>
                    <AlertCircle className={`w-6 h-6 mx-auto mb-2 ${
                      tuitionStatus.status === 'overdue' ? 'text-red-500' : 
                      tuitionStatus.status === 'due_today' ? 'text-amber-500' : 
                      tuitionStatus.status === 'due_tomorrow' ? 'text-yellow-500' : 
                      'text-emerald-500'
                    }`} />
                    <p className={`text-xl font-black ${
                      tuitionStatus.status === 'overdue' ? 'text-red-500' : 
                      tuitionStatus.status === 'due_today' ? 'text-amber-500' : 
                      tuitionStatus.status === 'due_tomorrow' ? 'text-yellow-500' : 
                      'text-emerald-500'
                    }`}>
                      {tuitionStatus.status === 'overdue' ? `${tuitionStatus.days_overdue} روز عقب‌افتاده ❌` : 
                       tuitionStatus.status === 'due_today' ? 'امروز موعده ⏰' : 
                       tuitionStatus.status === 'due_tomorrow' ? 'فردا موعده ⏳' : 
                       tuitionStatus.status === 'ok' ? `${tuitionStatus.days_remaining} روز مونده ✅` : 
                       'نامشخص'}
                    </p>
                    <p className="text-xs text-gray-500">وضعیت</p>
                  </div>
                </div>

                <div className="mt-4 flex justify-end">
                  <button
                    onClick={async () => {
                      const date = prompt('تاریخ پرداخت (مثلاً 1405/05/10):')
                      if (date) {
                        await api.put(`/accounts/users/${studentId}/`, { last_payment_date: date })
                        fetchData()
                      }
                    }}
                    className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-bold"
                  >
                    ثبت پرداخت
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

export default CounselorStudentDetail