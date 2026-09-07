import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowRight, Award, TrendingUp, Users, Target,
  BarChart3, Clock, CheckCircle, XCircle, FileText,
  Printer, Download, Eye, ChevronDown, ChevronUp,
  Calendar, BookOpen, GraduationCap, AlertCircle,Trophy
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line, RadarChart, Radar,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis, Legend, Area, AreaChart
} from 'recharts'
import api from '../../api/axios'

const CounselorExamReport = () => {
  const { examId, studentId } = useParams()
  const navigate = useNavigate()
  
  const [exam, setExam] = useState(null)
  const [student, setStudent] = useState(null)
  const [result, setResult] = useState(null)
  const [allResults, setAllResults] = useState([])
  const [previousResults, setPreviousResults] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [chartType, setChartType] = useState('percentage') // percentage | rank | score
  const [expandedEssay, setExpandedEssay] = useState(null)
  const [showAnswerKey, setShowAnswerKey] = useState(false)

  useEffect(() => {
    fetchAllData()
  }, [examId, studentId])

  const fetchAllData = async () => {
    setLoading(true)
    setError(null)
    try {
        const [examRes, studentRes, resultsRes] = await Promise.all([
        api.get(`/exam/${examId}/`),
        api.get(`/accounts/users/${studentId}/`),
        api.get(`/exam/${examId}/results/`),
        ])
        
        const examData = examRes.data
        const studentData = studentRes.data
        const allExamResults = resultsRes.data
        
        setExam(examData)
        setStudent(studentData)
        setResult(allExamResults.find(r => r.student === Number(studentId)) || null)
        setAllResults(allExamResults)
        
        // نتایج قبلی — از API خود مشاور
        try {
        const prevRes = await api.get(`/counseling/reports/?student=${studentId}`)
        const reports = prevRes.data
            .filter(r => r.percentage !== undefined)
            .sort((a, b) => new Date(a.report_date) - new Date(b.report_date))
            .slice(-10)
            .map(r => ({
            date: r.report_date,
            درصد: r.percentage || 0,
            }))
        setPreviousResults(reports)
        } catch {
        // اگه API کار نکرد، خالی بذار
        setPreviousResults([])
        }
        
    } catch (err) {
        console.error('Error:', err)
        setError('خطا در دریافت اطلاعات کارنامه.')
    } finally {
        setLoading(false)
    }
    }

  // ===== محاسبات =====
  const getSectionReport = (sectionId) => {
    const sectionQuestions = exam?.questions?.filter(q => q.section === sectionId) || []
    if (sectionQuestions.length === 0) return null
    
    let correct = 0, wrong = 0, unanswered = 0
    sectionQuestions.forEach(q => {
      const answer = result?.test_answers?.find(a => a.question === q.id)
      if (!answer || !answer.choice) unanswered++
      else if (answer.is_correct) correct++
      else wrong++
    })
    
    const total = sectionQuestions.length
    const percentage = total > 0 ? Math.round(((correct * 3 - wrong) / (total * 3)) * 100) : 0
    
    // رتبه در این بخش
    const allSectionResults = allResults
      .filter(r => r.finished_at)
      .map(r => {
        let c = 0, w = 0, u = 0
        sectionQuestions.forEach(q => {
          const ans = r.test_answers?.find(a => a.question === q.id)
          if (!ans || !ans.choice) u++
          else if (ans.is_correct) c++
          else w++
        })
        return { id: r.id, student: r.student, percentage: total > 0 ? Math.round(((c * 3 - w) / (total * 3)) * 100) : 0 }
      })
      .sort((a, b) => b.percentage - a.percentage)
    
    const rank = allSectionResults.findIndex(r => r.id === result?.id) + 1
    
    return { correct, wrong, unanswered, total, percentage, rank, totalParticipants: allSectionResults.length }
  }

  // رتبه کل
  const sortedResults = [...allResults]
    .filter(r => r.finished_at)
    .sort((a, b) => (b.total_score || 0) - (a.total_score || 0))
  
  const overallRank = sortedResults.findIndex(r => r.id === result?.id) + 1
  const totalParticipants = sortedResults.length
  
  // میانگین
  const averageScore = totalParticipants > 0
    ? Math.round(sortedResults.reduce((sum, r) => sum + (r.total_score || 0), 0) / totalParticipants)
    : 0

  // داده‌های نمودار بخش‌ها
  const sectionChartData = (exam?.sections || []).map(s => {
    const report = getSectionReport(s.id)
    return {
      name: s.title,
      درصد: report?.percentage || 0,
      میانگین: averageScore,
      رتبه: report?.rank || 0,
      'تعداد سوالات': report?.total || 0,
    }
  })

  // داده‌های نمودار پیشرفت
  const progressChartData = [
    ...previousResults.map(r => ({
      date: r.finished_at ? new Date(r.finished_at).toLocaleDateString('fa-IR') : 'نامشخص',
      درصد: r.total_score || 0,
    })),
    {
      date: exam?.entry_start?.substring(0, 10) || 'این آزمون',
      درصد: result?.total_score || 0,
    },
  ]

  // داده‌های نمودار راداری
  const radarData = (exam?.sections || []).map(s => {
    const report = getSectionReport(s.id)
    return {
      subject: s.title,
      'درصد شما': report?.percentage || 0,
      'میانگین آکادمی': averageScore,
    }
  })

  // ===== کلید سوالات =====
  const questionsWithAnswers = (exam?.questions || []).map(q => {
    const studentAnswer = result?.test_answers?.find(a => a.question === q.id)
    const correctChoice = q.choices?.find(c => c.is_correct)
    const studentChoice = q.choices?.find(c => c.id === studentAnswer?.choice)
    
    return {
      ...q,
      correctChoice,
      studentChoice,
      isCorrect: correctChoice?.id === studentChoice?.id,
      isAnswered: !!studentAnswer?.choice,
    }
  })

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-navy-900">
        <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (error || !result) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-navy-900 p-4">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">خطا!</h2>
          <p className="text-gray-500">{error || 'کارنامه یافت نشد.'}</p>
          <button onClick={() => navigate(-1)} className="mt-4 px-6 py-3 bg-purple-500 text-white rounded-2xl font-bold">
            بازگشت
          </button>
        </div>
      </div>
    )
  }

  const userInitial = (student?.full_name || student?.username || '؟').charAt(0)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-navy-900 print:bg-white">
      
      {/* ===== HEADER ===== */}
      <div className="bg-white dark:bg-navy-800 border-b border-gray-200 dark:border-navy-700 print:border-none">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => navigate(-1)}
              className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-navy-700 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors no-print"
            >
              <ArrowRight className="w-5 h-5" />
            </button>
            
            <div className="flex items-center gap-3 no-print">
              <button
                onClick={() => window.print()}
                className="flex items-center gap-2 px-4 py-2 bg-sky-100 dark:bg-sky-900/20 text-sky-600 rounded-xl text-sm font-bold"
              >
                <Printer className="w-4 h-4" />
                چاپ
              </button>
            </div>
          </div>

          {/* Student Info */}
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white font-bold text-3xl shadow-xl flex-shrink-0">
              {userInitial}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-black text-gray-800 dark:text-white">
                کارنامه: {student?.full_name || student?.username}
              </h1>
              <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 mt-2">
                <span className="flex items-center gap-1">
                  <BookOpen className="w-4 h-4" />
                  {exam?.title || 'آزمون'}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {result.finished_at ? new Date(result.finished_at).toLocaleDateString('fa-IR') : '—'}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {exam?.duration} دقیقه
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

{/* ادامه در بخش ۲... */}

      {/* ===== CONTENT ===== */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        
        {/* ===== کارت‌های خلاصه ===== */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {[
            { label: 'درصد کل', value: `%${result.total_score || '—'}`, icon: <Award className="w-6 h-6" />, color: '#8B5CF6', bg: 'rgba(139,92,246,0.1)' },
            { label: 'رتبه', value: `${overallRank || '—'}`, sub: `از ${totalParticipants}`, icon: <Trophy className="w-6 h-6" />, color: '#F59E0B', bg: 'rgba(245,158,11,0.1)' },
            { label: 'میانگین', value: `%${averageScore}`, icon: <Target className="w-6 h-6" />, color: '#3B82F6', bg: 'rgba(59,130,246,0.1)' },
            { label: 'شرکت‌کننده', value: totalParticipants, icon: <Users className="w-6 h-6" />, color: '#10B981', bg: 'rgba(16,185,129,0.1)' },
            { label: 'سوالات', value: exam?.questions?.length || '—', icon: <FileText className="w-6 h-6" />, color: '#EC4899', bg: 'rgba(236,72,153,0.1)' },
            { label: 'خروج', value: result.exit_count || 0, icon: <XCircle className="w-6 h-6" />, color: '#EF4444', bg: 'rgba(239,68,68,0.1)' },
          ].map((card, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white dark:bg-navy-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-navy-700 text-center"
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-3" style={{ background: card.bg, color: card.color }}>
                {card.icon}
              </div>
              <p className="text-2xl font-black" style={{ color: card.color }}>{card.value}</p>
              <p className="text-xs text-gray-500 mt-1">{card.label}</p>
              {card.sub && <p className="text-[10px] text-gray-400">{card.sub}</p>}
            </motion.div>
          ))}
        </div>

        {/* ===== انتخاب نوع نمودار ===== */}
        <div className="flex items-center gap-2 mb-6 no-print">
          <span className="text-sm text-gray-500">نوع نمودار:</span>
          {[
            { value: 'percentage', label: 'درصد' },
            { value: 'rank', label: 'رتبه' },
            { value: 'score', label: 'تعداد سوالات' },
          ].map(opt => (
            <button
              key={opt.value}
              onClick={() => setChartType(opt.value)}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                chartType === opt.value
                  ? 'bg-purple-500 text-white'
                  : 'bg-white dark:bg-navy-800 text-gray-500 border'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* ===== نمودار میله‌ای بخش‌ها ===== */}
        {sectionChartData.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-navy-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-navy-700 mb-8"
          >
            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-purple-500" />
              عملکرد در بخش‌ها
            </h3>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={sectionChartData} barSize={50}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#94A3B8" />
                <YAxis tick={{ fontSize: 12 }} stroke="#94A3B8" domain={[0, 100]} />
                <Tooltip
                  contentStyle={{
                    background: 'rgba(255,255,255,0.95)',
                    border: 'none',
                    borderRadius: '16px',
                    boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                    fontFamily: 'Vazirmatn'
                  }}
                />
                <Bar
                  dataKey={chartType === 'percentage' ? 'درصد' : chartType === 'rank' ? 'رتبه' : 'تعداد سوالات'}
                  fill={chartType === 'percentage' ? '#8B5CF6' : chartType === 'rank' ? '#F59E0B' : '#3B82F6'}
                  radius={[8, 8, 0, 0]}
                />
                {chartType === 'percentage' && (
                  <Bar dataKey="میانگین" fill="#94A3B8" radius={[8, 8, 0, 0]} />
                )}
              </BarChart>
            </ResponsiveContainer>
            {chartType === 'percentage' && (
              <div className="flex items-center justify-center gap-6 mt-4 text-sm">
                <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-sm bg-purple-500"></span> درصد شما</span>
                <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-sm bg-gray-400"></span> میانگین آکادمی</span>
              </div>
            )}
          </motion.div>
        )}

        {/* ===== نمودار راداری ===== */}
        {radarData.length >= 3 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-navy-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-navy-700 mb-8"
          >
            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
              <Target className="w-5 h-5 text-emerald-500" />
              مقایسه با میانگین
            </h3>
            <ResponsiveContainer width="100%" height={350}>
              <RadarChart data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} />
                <Radar name="درصد شما" dataKey="درصد شما" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.3} />
                <Radar name="میانگین آکادمی" dataKey="میانگین آکادمی" stroke="#94A3B8" fill="#94A3B8" fillOpacity={0.2} />
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          </motion.div>
        )}

        {/* ===== جدول بخش‌ها ===== */}
        {(exam?.sections || []).length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-navy-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-navy-700 mb-8"
          >
            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
              <FileText className="w-5 h-5 text-purple-500" />
              جزئیات بخش‌ها
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-navy-700 rounded-xl">
                  <tr>
                    <th className="p-4 text-right font-bold">بخش</th>
                    <th className="p-4 text-center font-bold">تعداد سوال</th>
                    <th className="p-4 text-center font-bold">درست</th>
                    <th className="p-4 text-center font-bold">غلط</th>
                    <th className="p-4 text-center font-bold">نزده</th>
                    <th className="p-4 text-center font-bold">درصد</th>
                    <th className="p-4 text-center font-bold">رتبه</th>
                  </tr>
                </thead>
                <tbody>
                  {exam.sections.map((s, i) => {
                    const report = getSectionReport(s.id)
                    return (
                      <tr key={s.id} className="border-t border-gray-100 dark:border-navy-700">
                        <td className="p-4 font-bold text-gray-800 dark:text-white">{s.title}</td>
                        <td className="p-4 text-center">{report?.total || '—'}</td>
                        <td className="p-4 text-center text-emerald-500 font-bold">{report?.correct || '—'}</td>
                        <td className="p-4 text-center text-red-500 font-bold">{report?.wrong || '—'}</td>
                        <td className="p-4 text-center text-gray-400">{report?.unanswered || '—'}</td>
                        <td className="p-4 text-center">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                            (report?.percentage || 0) >= 50 
                              ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600' 
                              : 'bg-red-50 dark:bg-red-900/20 text-red-600'
                          }`}>
                            %{report?.percentage || 0}
                          </span>
                        </td>
                        <td className="p-4 text-center text-sm">
                          {report?.rank || '—'} از {report?.totalParticipants || '—'}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

{/* ادامه در بخش ۳... */}

        {/* ===== نمودار پیشرفت (خطی) ===== */}
        {progressChartData.length >= 2 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-navy-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-navy-700 mb-8"
          >
            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-500" />
              روند پیشرفت
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={progressChartData}>
                <defs>
                  <linearGradient id="colorProgress" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#94A3B8" />
                <YAxis tick={{ fontSize: 11 }} stroke="#94A3B8" domain={[0, 100]} />
                <Tooltip
                  contentStyle={{
                    background: 'rgba(255,255,255,0.95)',
                    border: 'none',
                    borderRadius: '16px',
                    boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                    fontFamily: 'Vazirmatn'
                  }}
                  formatter={(value) => [`%${value}`, 'درصد']}
                />
                <Area type="monotone" dataKey="درصد" stroke="#8B5CF6" strokeWidth={3} fill="url(#colorProgress)" />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>
        )}

        {/* ===== پاسخ‌های تشریحی ===== */}
        {result?.essay_answers?.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-navy-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-navy-700 mb-8"
          >
            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
              <FileText className="w-5 h-5 text-amber-500" />
              پاسخ‌های تشریحی
            </h3>
            <div className="space-y-4">
              {result.essay_answers.map((ans, i) => (
                <div key={ans.id} className="p-4 bg-gray-50 dark:bg-navy-700 rounded-xl">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center text-amber-600 text-xs font-bold">
                        {i + 1}
                      </span>
                      <span className="font-bold text-gray-700 dark:text-gray-300">
                        سوال تشریحی
                      </span>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      ans.score 
                        ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600' 
                        : 'bg-amber-50 dark:bg-amber-900/20 text-amber-600'
                    }`}>
                      {ans.score ? `نمره: ${ans.score}` : 'در انتظار تصحیح'}
                    </span>
                  </div>
                  <button
                    onClick={() => setExpandedEssay(expandedEssay === ans.id ? null : ans.id)}
                    className="w-full text-right text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      {expandedEssay === ans.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      {expandedEssay === ans.id ? 'بستن' : 'نمایش پاسخ'}
                    </div>
                  </button>
                  {expandedEssay === ans.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      className="mt-3 p-3 bg-white dark:bg-navy-600 rounded-lg"
                    >
                      <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                        {ans.text_answer || '(پاسخ فایل ارسال شده)'}
                      </p>
                      {ans.file_answer && (
                        <a href={ans.file_answer} target="_blank" className="inline-flex items-center gap-1 mt-2 text-xs text-sky-500 hover:text-sky-600">
                          <Download className="w-3.5 h-3.5" />
                          دانلود فایل پاسخ
                        </a>
                      )}
                    </motion.div>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ===== کلید سوالات ===== */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-navy-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-navy-700 mb-8 no-print"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
              <Eye className="w-5 h-5 text-sky-500" />
              کلید سوالات
            </h3>
            <button
              onClick={() => setShowAnswerKey(!showAnswerKey)}
              className="px-4 py-2 bg-sky-100 dark:bg-sky-900/20 text-sky-600 rounded-xl text-sm font-bold"
            >
              {showAnswerKey ? 'مخفی کردن' : 'نمایش کلید'}
            </button>
          </div>

          <AnimatePresence>
            {showAnswerKey && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {questionsWithAnswers.map((q, i) => (
                    <div
                      key={q.id}
                      className={`p-3 rounded-xl text-center text-sm border-2 transition-all ${
                        !q.isAnswered
                          ? 'border-gray-200 dark:border-navy-600 bg-gray-50 dark:bg-navy-700'
                          : q.isCorrect
                            ? 'border-emerald-300 dark:border-emerald-600 bg-emerald-50 dark:bg-emerald-900/20'
                            : 'border-red-300 dark:border-red-600 bg-red-50 dark:bg-red-900/20'
                      }`}
                    >
                      <p className="font-bold text-gray-800 dark:text-white mb-2">سوال {i + 1}</p>
                      
                      {q.section_title && (
                        <p className="text-[10px] text-purple-500 mb-1">{q.section_title}</p>
                      )}
                      
                      <div className="space-y-1 text-xs">
                        {q.correctChoice && (
                          <p className="text-emerald-600 dark:text-emerald-400">
                            ✓ {q.correctChoice.order}: {q.correctChoice.text?.substring(0, 15)}
                          </p>
                        )}
                        {q.isAnswered ? (
                          q.studentChoice ? (
                            <p className={q.isCorrect ? 'text-emerald-600' : 'text-red-500'}>
                              {q.isCorrect ? '✓' : '✗'} {q.studentChoice.order}: {q.studentChoice.text?.substring(0, 15)}
                            </p>
                          ) : (
                            <p className="text-gray-400">نزده</p>
                          )
                        ) : (
                          <p className="text-gray-400">نزده</p>
                        )}
                      </div>
                      
                      {q.question_type === 'essay' && (
                        <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-900/20 text-amber-600 text-[10px]">
                          تشریحی
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* ===== دکمه بازگشت (پایین صفحه) ===== */}
        <div className="text-center mt-8 no-print">
          <button
            onClick={() => navigate(-1)}
            className="px-8 py-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-2xl font-bold text-lg hover:shadow-xl hover:shadow-purple-500/30 transition-all"
          >
            بازگشت
          </button>
        </div>

      </div>
    </div>
  )
}

export default CounselorExamReport