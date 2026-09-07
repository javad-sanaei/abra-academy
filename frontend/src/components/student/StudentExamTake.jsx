import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Clock, AlertCircle, ChevronRight, ChevronLeft, Send, 
  CheckCircle, AlertTriangle, Eye, EyeOff
} from 'lucide-react'
import api from '../../api/axios'

const StudentExamTake = () => {
  const { examId } = useParams()
  const navigate = useNavigate()
  
  const [exam, setExam] = useState(null)
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState({})  // { questionId: choiceId }
  const [essayAnswers, setEssayAnswers] = useState({})  // { questionId: text }
  const [submitting, setSubmitting] = useState(false)
  const [timeLeft, setTimeLeft] = useState(null)
  const [showConfirm, setShowConfirm] = useState(false)
  const [showResult, setShowResult] = useState(null)
  const timerRef = useRef(null)

  // ===== جلوگیری از کپی و کلیک راست =====
  useEffect(() => {
    const preventCopy = (e) => {
      e.preventDefault()
      return false
    }
    const preventRightClick = (e) => e.preventDefault()
    
    document.addEventListener('copy', preventCopy)
    document.addEventListener('contextmenu', preventRightClick)
    document.addEventListener('selectstart', preventCopy)
    
    return () => {
      document.removeEventListener('copy', preventCopy)
      document.removeEventListener('contextmenu', preventRightClick)
      document.removeEventListener('selectstart', preventCopy)
    }
  }, [])

  // ===== دریافت آزمون و سوالات =====
  useEffect(() => {
    const fetchExam = async () => {
      try {
        // چک کردن نتیجه قبلی
        const resultsRes = await api.get('/student/exam-results/')
        const existingResult = resultsRes.data.find(r => r.exam === Number(examId))
        
        if (existingResult && existingResult.finished_at) {
          setShowResult(existingResult)
          setLoading(false)
          return
        }
        
        const res = await api.get(`/exam/${examId}/`)
        const examData = res.data
        
        setExam(examData)
        setQuestions(examData.questions || [])
        
        // اگه قبلاً شروع نشده، شروع کن
        await api.post(`/exam/${examId}/start/`)
        
        const totalSeconds = (examData.duration || 30) * 60
        setTimeLeft(totalSeconds)
        
      } catch (err) {
        console.error('Error fetching exam:', err)
        setError(err.response?.data?.error || 'خطا در دریافت آزمون.')
      } finally {
        setLoading(false)
      }
    }
    fetchExam()
    
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [examId])

  // ===== تایمر معکوس =====
  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0) return
    
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current)
          setTimeout(() => handleAutoFinish(), 1000)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [timeLeft])

  const formatTime = (seconds) => {
    if (seconds === null) return '--:--'
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    
    if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  const getTimerColor = () => {
    if (!timeLeft && timeLeft !== 0) return 'text-sky-500'
    const total = (exam?.duration || 30) * 60
    const percent = timeLeft / total
    if (percent > 0.5) return 'text-sky-500'
    if (percent > 0.2) return 'text-amber-500'
    return 'text-red-500 animate-pulse'
  }

  // ===== انتخاب/لغو گزینه =====
  const handleAnswer = async (questionId, choiceId) => {
    // اگه همون گزینه کلیک شد → لغو انتخاب
    if (answers[questionId] === choiceId) {
      const newAnswers = { ...answers }
      delete newAnswers[questionId]
      setAnswers(newAnswers)
      return
    }
    
    setAnswers(prev => ({ ...prev, [questionId]: choiceId }))
    
    // ذخیره خودکار
    try {
      await api.post(`/exam/${examId}/answer-test/`, {
        question: questionId,
        choice: choiceId
      })
    } catch (err) {
      console.error('Error saving answer:', err)
    }
  }

  const handleEssayAnswer = (questionId, text) => {
    setEssayAnswers(prev => ({ ...prev, [questionId]: text }))
  }

  const handleAutoFinish = async () => {
    try {
      await api.post(`/exam/${examId}/finish/`)
      alert('⏰ زمان آزمون به پایان رسید. پاسخ‌های شما ثبت شد.')
      navigate('/dashboard/student/exams')
    } catch (err) {
      console.error('Auto finish error:', err)
    }
  }

  const handleFinish = async () => {
    setSubmitting(true)
    try {
      // ذخیره پاسخ‌های تشریحی
      for (const [questionId, text] of Object.entries(essayAnswers)) {
        if (text.trim()) {
          await api.post(`/exam/${examId}/answer-essay/`, {
            question: Number(questionId),
            text_answer: text
          })
        }
      }
      
      const res = await api.post(`/exam/${examId}/finish/`)
      
      // محاسبه درصد برای نمایش
      if (exam?.exam_type === 'test' && res.data?.total_score !== undefined) {
        alert(`✅ آزمون ثبت شد!\nنمره خام: ${res.data.total_score}`)
      } else {
        alert('✅ آزمون با موفقیت ثبت شد!')
      }
      
      navigate('/dashboard/student/exams')
    } catch (err) {
      console.error('Finish error:', err)
      alert(err.response?.data?.error || '❌ خطا در ثبت آزمون.')
    } finally {
      setSubmitting(false)
      setShowConfirm(false)
    }
  }

  const answeredCount = Object.keys(answers).length
  const allAnswered = questions.length > 0 && answeredCount === questions.length

  // ===== صفحه نتیجه قبلی =====
  if (showResult) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-navy-900 p-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center">
            <CheckCircle className="w-10 h-10 text-emerald-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">قبلاً این آزمون رو دادی!</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            نمره: {showResult.total_score ?? 'در انتظار تصحیح'}
          </p>
          <button onClick={() => navigate('/dashboard/student/exams')} className="px-6 py-3 bg-sky-500 text-white rounded-2xl font-bold">
            بازگشت به آزمون‌ها
          </button>
        </div>
      </div>
    )
  }

  // ===== لودینگ =====
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-navy-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">در حال بارگذاری آزمون...</p>
        </div>
      </div>
    )
  }

  if (error || !exam) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-navy-900 p-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
            <AlertCircle className="w-10 h-10 text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">خطا!</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6">{error || 'آزمون یافت نشد.'}</p>
          <button onClick={() => navigate('/dashboard/student/exams')} className="px-6 py-3 bg-sky-500 text-white rounded-2xl font-bold">
            بازگشت به آزمون‌ها
          </button>
        </div>
      </div>
    )
  }

  const currentQ = questions[currentQuestion]

  return (
    <div 
      className="min-h-screen bg-gray-50 dark:bg-navy-900 select-none"
      onCopy={(e) => e.preventDefault()}
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* ===== HEADER ===== */}
      <div className="sticky top-0 z-30 bg-white/95 dark:bg-navy-800/95 backdrop-blur-xl border-b border-gray-200 dark:border-navy-700">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="text-lg font-black text-gray-800 dark:text-white">{exam.title}</h1>
              <p className="text-sm text-gray-500">
                سوال {currentQuestion + 1} از {questions.length}
              </p>
            </div>
            
            <div className={`flex items-center gap-2 ${getTimerColor()} bg-white dark:bg-navy-700 px-4 py-2 rounded-2xl shadow-sm border border-gray-200 dark:border-navy-600`}>
              <Clock className="w-5 h-5" />
              <span className="font-black text-xl font-mono tracking-wider">{formatTime(timeLeft)}</span>
            </div>
          </div>
          
          <div className="h-2.5 bg-gray-200 dark:bg-navy-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-sky-500 to-sky-600 rounded-full transition-all duration-500"
              style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* ===== CONTENT ===== */}
      <div className="max-w-4xl mx-auto p-4 md:p-6">
        
        <AnimatePresence mode="wait">
          {currentQ && (
            <motion.div
              key={currentQuestion}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
              className="bg-white dark:bg-navy-800 rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100 dark:border-navy-700 mb-6"
            >
              <div className="flex items-center gap-3 mb-6">
                <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-sky-50 dark:bg-sky-900/20 text-sky-500">
                  {currentQ.question_type === 'test' ? '📝 تستی' : '✍️ تشریحی'}
                </span>
                <span className="text-sm text-gray-500">نمره: {currentQ.score}</span>
              </div>

              {/* بخش سوال */}
              {currentQ.section_title && (
                <div className="mb-4 inline-block px-3 py-1.5 rounded-full bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 text-xs font-bold">
                  📂 {currentQ.section_title}
                </div>
              )}

              {currentQ.text && (
                <p className="text-lg text-gray-800 dark:text-white font-bold mb-6 leading-relaxed">
                  {currentQ.text}
                </p>
              )}
              
              {currentQ.image && (
                <img src={currentQ.image} alt="تصویر سوال" className="w-full max-w-lg mx-auto rounded-xl mb-6 shadow-md" />
              )}

              {/* گزینه‌ها (تستی) */}
              {currentQ.question_type === 'test' && currentQ.choices && (
                <div className="space-y-3">
                  {currentQ.choices.map((choice) => {
                    const isSelected = answers[currentQ.id] === choice.id
                    return (
                      <button
                        key={choice.id}
                        onClick={() => handleAnswer(currentQ.id, choice.id)}
                        className={`w-full p-4 rounded-xl border-2 text-right transition-all duration-200 ${
                          isSelected
                            ? 'border-sky-500 bg-sky-50 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400 shadow-md'
                            : 'border-gray-200 dark:border-navy-600 hover:border-sky-300 dark:hover:border-sky-700 text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        <span className="flex items-center gap-3">
                          <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${
                            isSelected ? 'bg-sky-500 text-white' : 'bg-gray-100 dark:bg-navy-600 text-gray-500'
                          }`}>
                            {choice.order}
                          </span>
                          <span className="flex-1">{choice.text}</span>
                          {isSelected && <CheckCircle className="w-5 h-5 text-sky-500" />}
                        </span>
                      </button>
                    )
                  })}
                </div>
              )}

              {/* تشریحی */}
              {currentQ.question_type === 'essay' && (
                <textarea
                  rows={6}
                  value={essayAnswers[currentQ.id] || ''}
                  onChange={(e) => handleEssayAnswer(currentQ.id, e.target.value)}
                  placeholder="پاسخ خود را اینجا بنویسید..."
                  className="w-full p-4 border-2 border-gray-200 dark:border-navy-600 rounded-xl bg-gray-50 dark:bg-navy-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all resize-none font-vazir"
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* وضعیت پاسخ‌ها */}
        <div className="flex items-center gap-4 mb-6 text-sm text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-1.5">
            <CheckCircle className="w-4 h-4 text-emerald-500" />
            <span>{answeredCount} پاسخ داده شده</span>
          </div>
          <div className="flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <span>{questions.length - answeredCount} باقی‌مانده</span>
          </div>
        </div>

        {/* نویگیشن */}
        <div className="flex items-center justify-between gap-4">
          <button
            onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
            disabled={currentQuestion === 0}
            className="flex items-center gap-2 px-5 py-3 bg-gray-200 dark:bg-navy-700 text-gray-700 dark:text-gray-300 rounded-2xl font-bold transition-all hover:bg-gray-300 dark:hover:bg-navy-600 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-5 h-5" /> قبلی
          </button>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-1.5">
              {questions.map((q, i) => (
                <button
                  key={q.id}
                  onClick={() => setCurrentQuestion(i)}
                  className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                    i === currentQuestion
                      ? 'bg-sky-500 text-white shadow-md'
                      : answers[q.id]
                        ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 border border-emerald-300'
                        : 'bg-gray-100 dark:bg-navy-700 text-gray-500'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>

            {currentQuestion < questions.length - 1 ? (
              <button
                onClick={() => setCurrentQuestion(prev => Math.min(questions.length - 1, prev + 1))}
                className="flex items-center gap-2 px-5 py-3 bg-gray-200 dark:bg-navy-700 text-gray-700 dark:text-gray-300 rounded-2xl font-bold transition-all hover:bg-gray-300 dark:hover:bg-navy-600"
              >
                بعدی <ChevronLeft className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={() => setShowConfirm(true)}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-2xl font-bold transition-all hover:shadow-lg hover:shadow-emerald-500/30"
              >
                <Send className="w-5 h-5" /> پایان آزمون
              </button>
            )}
          </div>
        </div>
      </div>

      {/* مودال تأیید */}
      <AnimatePresence>
        {showConfirm && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              className="bg-white dark:bg-navy-800 rounded-2xl p-8 max-w-md w-full shadow-2xl"
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center">
                  <AlertTriangle className="w-8 h-8 text-amber-500" />
                </div>
                <h3 className="text-xl font-black text-gray-800 dark:text-white mb-2">آیا مطمئنی؟</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  {allAnswered ? 'همه سوالات پاسخ داده شده.' : `${questions.length - answeredCount} سوال بدون پاسخ مونده!`}
                  <br />بعد از پایان، دیگه نمی‌تونی برگردی.
                </p>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setShowConfirm(false)} className="flex-1 py-3 bg-gray-200 dark:bg-navy-700 text-gray-700 dark:text-gray-300 rounded-2xl font-bold">
                  ادامه آزمون
                </button>
                <button onClick={handleFinish} disabled={submitting} className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-2xl font-bold hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                  {submitting ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <><CheckCircle className="w-5 h-5" /> بله، پایان بده</>}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default StudentExamTake