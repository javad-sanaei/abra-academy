import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowRight, Award, TrendingUp, Users, Target,
  BarChart3, Clock, CheckCircle, XCircle, FileText,
  Printer, Eye, ChevronDown, ChevronUp,
  Calendar, BookOpen, GraduationCap, AlertCircle
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line, RadarChart, Radar,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis, Legend, Area, AreaChart
} from 'recharts'
import api from '../../api/axios'

const StudentExamReport = () => {
  const { examId } = useParams()
  const navigate = useNavigate()
  
  const [exam, setExam] = useState(null)
  const [result, setResult] = useState(null)
  const [allResults, setAllResults] = useState([])
  const [previousResults, setPreviousResults] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [chartType, setChartType] = useState('percentage')
  const [expandedEssay, setExpandedEssay] = useState(null)
  const [showAnswerKey, setShowAnswerKey] = useState(false)

  useEffect(() => {
    fetchAllData()
  }, [examId])

  const fetchAllData = async () => {
    setLoading(true)
    try {
      const [examRes, resultsRes, allExamResultsRes] = await Promise.all([
        api.get(`/exam/${examId}/`),
        api.get('/student/exam-results/'),
        api.get(`/exam/${examId}/results/`),
      ])
      
      const examData = examRes.data
      const myResults = resultsRes.data
      const allExamResults = allExamResultsRes.data
      
      setExam(examData)
      setResult(myResults.find(r => r.exam === Number(examId) && r.finished_at) || null)
      setAllResults(allExamResults.filter(r => r.finished_at))
      
      setPreviousResults(
        myResults
          .filter(r => r.exam !== Number(examId) && r.finished_at)
          .sort((a, b) => new Date(b.finished_at) - new Date(a.finished_at))
          .slice(0, 10)
          .reverse()
      )
    } catch (err) {
      setError('خطا در دریافت کارنامه.')
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
    
    const allSectionResults = allResults.map(r => {
      let c = 0, w = 0
      sectionQuestions.forEach(q => {
        const ans = r.test_answers?.find(a => a.question === q.id)
        if (ans?.is_correct) c++
        else if (ans?.choice) w++
      })
      return { id: r.id, percentage: total > 0 ? Math.round(((c * 3 - w) / (total * 3)) * 100) : 0 }
    }).sort((a, b) => b.percentage - a.percentage)
    
    const rank = allSectionResults.findIndex(r => r.id === result?.id) + 1
    
    return { correct, wrong, unanswered, total, percentage, rank, totalParticipants: allSectionResults.length }
  }

  const sortedResults = [...allResults].sort((a, b) => (b.total_score || 0) - (a.total_score || 0))
  const overallRank = sortedResults.findIndex(r => r.id === result?.id) + 1
  const totalParticipants = sortedResults.length
  
  const averageScore = totalParticipants > 0
    ? Math.round(sortedResults.reduce((sum, r) => sum + (r.total_score || 0), 0) / totalParticipants)
    : 0

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

  const radarData = (exam?.sections || []).map(s => {
    const report = getSectionReport(s.id)
    return {
      subject: s.title,
      'درصد شما': report?.percentage || 0,
      'میانگین آکادمی': averageScore,
    }
  })

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
        <div className="w-10 h-10 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (error || !result) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-navy-900 p-4">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">کارنامه یافت نشد</h2>
          <p className="text-gray-500">{error || 'شما هنوز این آزمون را کامل نکرده‌اید.'}</p>
          <button onClick={() => navigate('/dashboard/student/exams')} className="mt-4 px-6 py-3 bg-sky-500 text-white rounded-2xl font-bold">
            بازگشت به آزمون‌ها
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-navy-900 print:bg-white">
      
      {/* Header */}
      <div className="bg-white dark:bg-navy-800 border-b border-gray-200 dark:border-navy-700 print:border-none">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <button onClick={() => navigate('/dashboard/student/exams')} className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-navy-700 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors no-print">
              <ArrowRight className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3 no-print">
              <button onClick={() => window.print()} className="flex items-center gap-2 px-4 py-2 bg-sky-100 dark:bg-sky-900/20 text-sky-600 rounded-xl text-sm font-bold">
                <Printer className="w-4 h-4" /> چاپ
              </button>
            </div>
          </div>
          <h1 className="text-2xl font-black text-gray-800 dark:text-white">📊 کارنامه: {exam?.title}</h1>
          <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 mt-2">
            <span className="flex items-center gap-1"><Calendar className="w-4 h-4" />{result.finished_at ? new Date(result.finished_at).toLocaleDateString('fa-IR') : '—'}</span>
            <span>•</span>
            <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{exam?.duration} دقیقه</span>
            <span>•</span>
            <span className="flex items-center gap-1"><FileText className="w-4 h-4" />{exam?.questions?.length} سوال</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        
        {/* کارت‌های خلاصه */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {[
            { label: 'درصد کل', value: `%${result.total_score || '—'}`, icon: <Award className="w-6 h-6" />, color: '#8B5CF6' },
            { label: 'رتبه', value: `${overallRank}`, sub: `از ${totalParticipants}`, icon: <Trophy className="w-6 h-6" />, color: '#F59E0B' },
            { label: 'میانگین', value: `%${averageScore}`, icon: <Target className="w-6 h-6" />, color: '#3B82F6' },
            { label: 'شرکت‌کننده', value: totalParticipants, icon: <Users className="w-6 h-6" />, color: '#10B981' },
            { label: 'سوالات', value: exam?.questions?.length || '—', icon: <FileText className="w-6 h-6" />, color: '#EC4899' },
            { label: 'خروج', value: result.exit_count || 0, icon: <XCircle className="w-6 h-6" />, color: '#EF4444' },
          ].map((card, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="bg-white dark:bg-navy-800 rounded-2xl p-5 shadow-sm border text-center">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-3" style={{ background: `${card.color}15`, color: card.color }}>{card.icon}</div>
              <p className="text-2xl font-black" style={{ color: card.color }}>{card.value}</p>
              <p className="text-xs text-gray-500 mt-1">{card.label}</p>
              {card.sub && <p className="text-[10px] text-gray-400">{card.sub}</p>}
            </motion.div>
          ))}
        </div>

        {/* انتخاب نمودار */}
        <div className="flex items-center gap-2 mb-6 no-print">
          <span className="text-sm text-gray-500">نوع نمودار:</span>
          {[
            { value: 'percentage', label: 'درصد' },
            { value: 'rank', label: 'رتبه' },
            { value: 'score', label: 'تعداد سوالات' },
          ].map(opt => (
            <button key={opt.value} onClick={() => setChartType(opt.value)} className={`px-4 py-2 rounded-xl text-sm font-bold ${chartType === opt.value ? 'bg-sky-500 text-white' : 'bg-white dark:bg-navy-800 text-gray-500 border'}`}>
              {opt.label}
            </button>
          ))}
        </div>

        {/* نمودار میله‌ای */}
        {sectionChartData.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-navy-800 rounded-2xl p-6 shadow-sm border mb-8">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2"><BarChart3 className="w-5 h-5 text-purple-500" />عملکرد در بخش‌ها</h3>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={sectionChartData} barSize={50}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#94A3B8" />
                <YAxis tick={{ fontSize: 12 }} stroke="#94A3B8" domain={[0, 100]} />
                <Tooltip contentStyle={{ background: 'rgba(255,255,255,0.95)', border: 'none', borderRadius: '16px', fontFamily: 'Vazirmatn' }} />
                <Bar dataKey={chartType === 'percentage' ? 'درصد' : chartType === 'rank' ? 'رتبه' : 'تعداد سوالات'} fill={chartType === 'percentage' ? '#8B5CF6' : chartType === 'rank' ? '#F59E0B' : '#3B82F6'} radius={[8, 8, 0, 0]} />
                {chartType === 'percentage' && <Bar dataKey="میانگین" fill="#94A3B8" radius={[8, 8, 0, 0]} />}
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        )}

        {/* راداری */}
        {radarData.length >= 3 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-navy-800 rounded-2xl p-6 shadow-sm border mb-8">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2"><Target className="w-5 h-5 text-emerald-500" />مقایسه با میانگین</h3>
            <ResponsiveContainer width="100%" height={350}>
              <RadarChart data={radarData}>
                <PolarGrid /><PolarAngleAxis dataKey="subject" tick={{ fontSize: 11 }} /><PolarRadiusAxis angle={30} domain={[0, 100]} />
                <Radar name="درصد شما" dataKey="درصد شما" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.3} />
                <Radar name="میانگین آکادمی" dataKey="میانگین آکادمی" stroke="#94A3B8" fill="#94A3B8" fillOpacity={0.2} />
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          </motion.div>
        )}

        {/* جدول بخش‌ها */}
        {(exam?.sections || []).length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-navy-800 rounded-2xl p-6 shadow-sm border mb-8">
            <h3 className="text-lg font-bold mb-6">جزئیات بخش‌ها</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-navy-700">
                  <tr><th className="p-4 text-right">بخش</th><th className="p-3 text-center">درست</th><th className="p-3 text-center">غلط</th><th className="p-3 text-center">نزده</th><th className="p-3 text-center">درصد</th><th className="p-3 text-center">رتبه</th></tr>
                </thead>
                <tbody>
                  {exam.sections.map(s => {
                    const report = getSectionReport(s.id)
                    return (
                      <tr key={s.id} className="border-t">
                        <td className="p-4 font-bold">{s.title}</td>
                        <td className="p-3 text-center text-emerald-500">{report?.correct || '—'}</td>
                        <td className="p-3 text-center text-red-500">{report?.wrong || '—'}</td>
                        <td className="p-3 text-center text-gray-400">{report?.unanswered || '—'}</td>
                        <td className="p-3 text-center"><span className={`px-3 py-1 rounded-full text-xs font-bold ${(report?.percentage || 0) >= 50 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>%{report?.percentage || 0}</span></td>
                        <td className="p-3 text-center text-sm">{report?.rank || '—'} از {report?.totalParticipants || '—'}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* نمودار پیشرفت */}
        {progressChartData.length >= 2 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-navy-800 rounded-2xl p-6 shadow-sm border mb-8">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2"><TrendingUp className="w-5 h-5 text-emerald-500" />روند پیشرفت</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={progressChartData}>
                <defs><linearGradient id="cp" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3}/><stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/></linearGradient></defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" /><XAxis dataKey="date" tick={{ fontSize: 11 }} /><YAxis tick={{ fontSize: 11 }} domain={[0, 100]} />
                <Tooltip contentStyle={{ background: 'rgba(255,255,255,0.95)', border: 'none', borderRadius: '16px', fontFamily: 'Vazirmatn' }} formatter={(v) => [`%${v}`, 'درصد']} />
                <Area type="monotone" dataKey="درصد" stroke="#8B5CF6" strokeWidth={3} fill="url(#cp)" />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>
        )}

        {/* پاسخ تشریحی */}
        {result?.essay_answers?.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-navy-800 rounded-2xl p-6 shadow-sm border mb-8">
            <h3 className="text-lg font-bold mb-6">پاسخ‌های تشریحی</h3>
            <div className="space-y-4">
              {result.essay_answers.map((ans, i) => (
                <div key={ans.id} className="p-4 bg-gray-50 dark:bg-navy-700 rounded-xl">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-bold">سوال {i + 1}</span>
                    <span className={`text-xs font-bold ${ans.score ? 'text-emerald-500' : 'text-amber-500'}`}>{ans.score ? `نمره: ${ans.score}` : 'در انتظار تصحیح'}</span>
                  </div>
                  <button onClick={() => setExpandedEssay(expandedEssay === ans.id ? null : ans.id)} className="text-sm text-gray-500 flex items-center gap-1">
                    {expandedEssay === ans.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    {expandedEssay === ans.id ? 'بستن' : 'نمایش پاسخ'}
                  </button>
                  {expandedEssay === ans.id && (
                    <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} className="mt-3 p-3 bg-white dark:bg-navy-600 rounded-lg">
                      <p className="text-sm whitespace-pre-wrap">{ans.text_answer || '(پاسخ فایل)'}</p>
                    </motion.div>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* کلید سوالات */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-navy-800 rounded-2xl p-6 shadow-sm border mb-8 no-print">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold flex items-center gap-2"><Eye className="w-5 h-5 text-sky-500" />کلید سوالات</h3>
            <button onClick={() => setShowAnswerKey(!showAnswerKey)} className="px-4 py-2 bg-sky-100 dark:bg-sky-900/20 text-sky-600 rounded-xl text-sm font-bold">{showAnswerKey ? 'مخفی' : 'نمایش'}</button>
          </div>
          {showAnswerKey && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {questionsWithAnswers.map((q, i) => (
                <div key={q.id} className={`p-3 rounded-xl text-center text-sm border-2 ${!q.isAnswered ? 'border-gray-200 bg-gray-50' : q.isCorrect ? 'border-emerald-300 bg-emerald-50' : 'border-red-300 bg-red-50'}`}>
                  <p className="font-bold mb-2">سوال {i + 1}</p>
                  {q.correctChoice && <p className="text-xs text-emerald-600">✓ {q.correctChoice.order}</p>}
                  {q.isAnswered && q.studentChoice && <p className={`text-xs ${q.isCorrect ? 'text-emerald-600' : 'text-red-500'}`}>{q.isCorrect ? '✓' : '✗'} {q.studentChoice.order}</p>}
                </div>
              ))}
            </div>
          )}
        </motion.div>

      </div>
    </div>
  )
}

export default StudentExamReport