import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  GraduationCap, Plus, X, Send, AlertCircle, CheckCircle,
  Trash2, Clock, Calendar, Target, Eye, 
  ChevronDown, ChevronUp, Users, Award, BarChart3,
  Layers
} from 'lucide-react'
import api from '../../api/axios'
import { useNavigate } from 'react-router-dom'

const CounselorExams = () => {
  const [activeView, setActiveView] = useState('list')
  const [exams, setExams] = useState([])
  const [selectedExam, setSelectedExam] = useState(null)
  const [questions, setQuestions] = useState([])
  const [sections, setSections] = useState([])
  const [results, setResults] = useState([])
  const [selectedResult, setSelectedResult] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')
  const [formSuccess, setFormSuccess] = useState('')
  
  // فرم‌ها
  const [examForm, setExamForm] = useState({
    title: '', exam_type: 'test', score_type: 'percentage',
    duration: 30, entry_start: '', entry_end: '', description: ''
  })
  
  const [questionForm, setQuestionForm] = useState({
    question_type: 'test', text: '', image: null, score: 1,
    section: '', order: ''
  })
  
  const [sectionForm, setSectionForm] = useState({ title: '', order: '' })
  const [showSectionForm, setShowSectionForm] = useState(false)
  const [sectionError, setSectionError] = useState('')
  const [sectionSubmitting, setSectionSubmitting] = useState(false)
  
  const [choices, setChoices] = useState([
    { text: '', is_correct: false, order: 1 },
    { text: '', is_correct: false, order: 2 },
    { text: '', is_correct: false, order: 3 },
    { text: '', is_correct: false, order: 4 },
  ])
  
  const [correctionScore, setCorrectionScore] = useState('')
  const [expandedResult, setExpandedResult] = useState(null)
  const navigate = useNavigate()

  useEffect(() => { fetchExams() }, [])

  const fetchExams = async () => {
    setLoading(true)
    try {
      const res = await api.get('/exam/')
      setExams(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const fetchExamDetail = async (examId) => {
    try {
      const res = await api.get(`/exam/${examId}/`)
      setSelectedExam(res.data)
      setQuestions(res.data.questions || [])
      setSections(res.data.sections || [])
      return res.data
    } catch (err) {
      alert('خطا در دریافت اطلاعات آزمون.')
    }
  }

  const fetchResults = async (examId) => {
    try {
      const res = await api.get(`/exam/${examId}/results/`)
      setResults(res.data)
    } catch (err) {
      setResults([])
    }
  }

  // ===== ساخت آزمون =====
  const handleCreateExam = async (e) => {
    e.preventDefault()
    if (!examForm.title || !examForm.entry_start || !examForm.entry_end) {
      setFormError('عنوان و تاریخ‌ها الزامی است.')
      return
    }
    setSubmitting(true)
    try {
      const res = await api.post('/exam/', examForm)
      setExams(prev => [res.data, ...prev])
      setExamForm({ title: '', exam_type: 'test', score_type: 'percentage', duration: 30, entry_start: '', entry_end: '', description: '' })
      setActiveView('list')
    } catch (err) {
      setFormError(err.response?.data?.error || 'خطا در ساخت آزمون.')
    } finally {
      setSubmitting(false)
    }
  }

  // ===== ساخت بخش =====
  const handleCreateSection = async (e) => {
    e.preventDefault()
    if (!sectionForm.title.trim()) {
      setSectionError('عنوان بخش الزامی است.')
      return
    }
    setSectionSubmitting(true)
    setSectionError('')
    try {
      await api.post(`/exam/${selectedExam.id}/sections/`, {
        title: sectionForm.title,
        order: Number(sectionForm.order) || sections.length + 1
      })
      setSectionForm({ title: '', order: '' })
      setShowSectionForm(false)
      fetchExamDetail(selectedExam.id)
    } catch (err) {
      setSectionError(err.response?.data?.error || 'خطا در ساخت بخش.')
    } finally {
      setSectionSubmitting(false)
    }
  }

  // ===== ساخت سوال =====
  const handleCreateQuestion = async (e) => {
    e.preventDefault()
    if (!questionForm.text && !questionForm.image) {
      setFormError('متن یا تصویر سوال الزامی است.')
      return
    }
    
    setSubmitting(true)
    setFormError('')
    
    try {
      const data = {
        question_type: questionForm.question_type,
        text: questionForm.text,
        score: Number(questionForm.score),
        order: Number(questionForm.order) || questions.length + 1,
        section: questionForm.section || null,
      }
      
      if (questionForm.question_type === 'test') {
        const validChoices = choices
          .filter(c => c.text.trim())
          .map((c, i) => ({ text: c.text, is_correct: c.is_correct, order: i + 1 }))
        
        if (validChoices.length < 2) {
          setFormError('حداقل ۲ گزینه الزامی است.')
          setSubmitting(false)
          return
        }
        data.choices = validChoices
      }
      
      if (questionForm.image) {
        const formData = new FormData()
        Object.entries(data).forEach(([k, v]) => {
          if (k === 'choices') formData.append(k, JSON.stringify(v))
          else if (v !== null) formData.append(k, v)
        })
        formData.append('image', questionForm.image)
        
        await api.post(`/exam/${selectedExam.id}/questions/`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
      } else {
        await api.post(`/exam/${selectedExam.id}/questions/`, data)
      }
      
      fetchExamDetail(selectedExam.id)
      setQuestionForm({ question_type: 'test', text: '', image: null, score: 1, section: '', order: '' })
      // ریست input file
      const fileInput = document.querySelector('input[type="file"]')
      if (fileInput) fileInput.value = ''
      setChoices([
        { text: '', is_correct: false, order: 1 },
        { text: '', is_correct: false, order: 2 },
        { text: '', is_correct: false, order: 3 },
        { text: '', is_correct: false, order: 4 },
      ])
      setFormError('')
    } catch (err) {
      const errMsg = err.response?.data?.error 
        || Object.values(err.response?.data || {}).flat().join(', ') 
        || 'خطا در ساخت سوال.'
      setFormError(errMsg)
    } finally {
      setSubmitting(false)
    }
  }

  // ===== حذف سوال =====
  const deleteQuestion = async (questionId) => {
    if (!confirm('حذف شود؟')) return
    try {
      await api.delete(`/exam/${selectedExam.id}/questions/${questionId}/`)
      fetchExamDetail(selectedExam.id)
    } catch { alert('خطا!') }
  }

  // ===== تصحیح تشریحی =====
  const submitCorrection = async (responseId, questionId) => {
    if (!correctionScore) return
    try {
      await api.patch(`/exam/${selectedExam.id}/essay/${responseId}/`, {
        question: questionId,
        score: Number(correctionScore)
      })
      setCorrectionScore('')
      alert('نمره ثبت شد!')
    } catch { alert('خطا!') }
  }

  const handleUpdateExam = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setFormError('')
    try {
      await api.put(`/exam/${selectedExam.id}/`, examForm)
      setFormSuccess('آزمون با موفقیت ویرایش شد!')
      setTimeout(() => {
        setActiveView('list')
        fetchExams()
      }, 1000)
    } catch (err) {
      setFormError(err.response?.data?.error || 'خطا در ویرایش آزمون.')
    } finally {
      setSubmitting(false)
    }
  }

  // ===== گروه‌بندی سوالات =====
  const questionsBySection = sections.map(section => ({
    ...section,
    questions: questions.filter(q => q.section === section.id)
  }))
  const unassignedQuestions = questions.filter(q => !q.section)

  // ===== کارنامه =====
  const getSectionReport = (result, sectionId) => {
    const sectionQuestions = questions.filter(q => q.section === sectionId)
    if (sectionQuestions.length === 0) return null
    
    let correct = 0, wrong = 0, unanswered = 0
    sectionQuestions.forEach(q => {
      const answer = result.test_answers?.find(a => a.question === q.id)
      if (!answer || !answer.choice) unanswered++
      else if (answer.is_correct) correct++
      else wrong++
    })
    
    const total = sectionQuestions.length
    const percentage = total > 0 ? Math.round(((correct * 3 - wrong) / (total * 3)) * 100) : 0
    return { correct, wrong, unanswered, total, percentage }
  }

  // ===== LOADING =====
  if (loading && activeView === 'list') {
    return (
      <div className="space-y-4">
        {[1,2,3].map(i => (
          <div key={i} className="bg-white dark:bg-navy-800 rounded-2xl p-6 animate-pulse h-24"></div>
        ))}
      </div>
    )
  }

  // ===== VIEW: لیست آزمون‌ها =====
  if (activeView === 'list') {
    return (
      <div>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-xl font-black text-gray-800 dark:text-white">آزمون‌ها</h2>
            <p className="text-sm text-gray-500">{exams.length} آزمون</p>
          </div>
          <button onClick={() => setActiveView('create')} className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-2xl font-bold text-sm">
            <Plus className="w-5 h-5" /> ساخت آزمون جدید
          </button>
        </div>

        <div className="space-y-4">
          {exams.map(exam => (
            <div key={exam.id} className="bg-white dark:bg-navy-800 rounded-2xl p-5 border hover:shadow-lg transition-all">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center text-purple-500">
                    <GraduationCap className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800 dark:text-white">{exam.title}</h3>
                    <div className="flex gap-3 text-xs text-gray-500 mt-1">
                      <span>{exam.exam_type === 'test' ? 'تستی' : 'ترکیبی'}</span>
                      <span>• {exam.duration} دقیقه</span>
                      <span>• {exam.questions_count} سوال</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={async () => { await fetchExamDetail(exam.id); setActiveView('questions') }} className="px-3 py-2 bg-sky-100 dark:bg-sky-900/20 text-sky-600 rounded-xl text-xs font-bold">سوالات</button>
                  <button onClick={async () => { setSelectedExam(exam); await fetchResults(exam.id); setActiveView('results') }} className="px-3 py-2 bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600 rounded-xl text-xs font-bold">نتایج</button>
                  <button onClick={async () => { setSelectedExam(exam); await fetchExamDetail(exam.id); await fetchResults(exam.id); setActiveView('report') }} className="px-3 py-2 bg-purple-100 dark:bg-purple-900/20 text-purple-600 rounded-xl text-xs font-bold">کارنامه</button>
                  <button 
                    onClick={() => { 
                      setExamForm({
                        title: exam.title,
                        exam_type: exam.exam_type,
                        score_type: exam.score_type,
                        duration: exam.duration,
                        entry_start: exam.entry_start?.replace('T', ' ').split('+')[0] || '',
                        entry_end: exam.entry_end?.replace('T', ' ').split('+')[0] || '',
                        description: exam.description || ''
                      })
                      setSelectedExam(exam)
                      setActiveView('edit') 
                    }} 
                    className="px-3 py-2 bg-amber-100 dark:bg-amber-900/20 text-amber-600 rounded-xl text-xs font-bold"
                  >
                    ویرایش
                  </button>
                </div>
              </div>
            </div>
          ))}
          {exams.length === 0 && <div className="text-center py-16 text-gray-400">آزمونی نیست.</div>}
        </div>
      </div>
    )
  }

  // ===== VIEW: ساخت آزمون =====
  if (activeView === 'create') {
    return (
      <div>
        <button onClick={() => setActiveView('list')} className="text-purple-500 font-bold mb-6 flex items-center gap-1">← بازگشت</button>
        <h2 className="text-xl font-black text-gray-800 dark:text-white mb-6">ساخت آزمون جدید</h2>
        {formError && <div className="mb-4 p-3 bg-red-50 rounded-xl text-red-600 text-sm"><AlertCircle className="w-4 h-4 inline ml-1" />{formError}</div>}
        <form onSubmit={handleCreateExam} className="bg-white dark:bg-navy-800 rounded-2xl p-6 border grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2"><input name="title" value={examForm.title} onChange={e => setExamForm({...examForm, title: e.target.value})} placeholder="عنوان آزمون *" className="w-full h-12 px-4 bg-gray-50 dark:bg-navy-700 border rounded-xl text-sm" /></div>
          <div>
            <select value={examForm.exam_type} onChange={e => setExamForm({...examForm, exam_type: e.target.value})} className="w-full h-12 px-4 bg-gray-50 dark:bg-navy-700 border rounded-xl text-sm">
              <option value="test">فقط تستی</option>
              <option value="mixed">تستی و تشریحی</option>
            </select>
          </div>
          <div>
            <select value={examForm.score_type} onChange={e => setExamForm({...examForm, score_type: e.target.value})} className="w-full h-12 px-4 bg-gray-50 dark:bg-navy-700 border rounded-xl text-sm">
              <option value="percentage">درصد</option>
              <option value="score">نمره</option>
            </select>
          </div>
          <div><input type="number" value={examForm.duration} onChange={e => setExamForm({...examForm, duration: e.target.value})} placeholder="مدت (دقیقه)" className="w-full h-12 px-4 bg-gray-50 dark:bg-navy-700 border rounded-xl text-sm" /></div>
          <div><input value={examForm.entry_start} onChange={e => setExamForm({...examForm, entry_start: e.target.value})} placeholder="شروع: 1405-05-10 09:00" className="w-full h-12 px-4 bg-gray-50 dark:bg-navy-700 border rounded-xl text-sm" /></div>
          <div><input value={examForm.entry_end} onChange={e => setExamForm({...examForm, entry_end: e.target.value})} placeholder="پایان: 1405-05-10 12:00" className="w-full h-12 px-4 bg-gray-50 dark:bg-navy-700 border rounded-xl text-sm" /></div>
          <div className="md:col-span-2"><textarea value={examForm.description} onChange={e => setExamForm({...examForm, description: e.target.value})} placeholder="توضیحات" rows={2} className="w-full px-4 py-3 bg-gray-50 dark:bg-navy-700 border rounded-xl text-sm resize-none" /></div>
          <div className="md:col-span-2 flex justify-end">
            <button type="submit" disabled={submitting} className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-2xl font-bold disabled:opacity-50">
              {submitting ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <Send className="w-5 h-5" />} ساخت آزمون
            </button>
          </div>
        </form>
      </div>
    )
  }

  // ===== VIEW: ویرایش آزمون =====
  if (activeView === 'edit' && selectedExam) {
    return (
      <div>
        <button onClick={() => setActiveView('list')} className="text-purple-500 font-bold mb-6 flex items-center gap-1">← بازگشت</button>
        <h2 className="text-xl font-black text-gray-800 dark:text-white mb-6">ویرایش آزمون: {selectedExam.title}</h2>
        {formError && <div className="mb-4 p-3 bg-red-50 rounded-xl text-red-600 text-sm"><AlertCircle className="w-4 h-4 inline ml-1" />{formError}</div>}
        {formSuccess && <div className="mb-4 p-3 bg-emerald-50 rounded-xl text-emerald-600 text-sm"><CheckCircle className="w-4 h-4 inline ml-1" />{formSuccess}</div>}
        <form onSubmit={handleUpdateExam} className="bg-white dark:bg-navy-800 rounded-2xl p-6 border grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2"><input name="title" value={examForm.title} onChange={e => setExamForm({...examForm, title: e.target.value})} placeholder="عنوان آزمون *" className="w-full h-12 px-4 bg-gray-50 dark:bg-navy-700 border rounded-xl text-sm" /></div>
          <div>
            <select value={examForm.exam_type} onChange={e => setExamForm({...examForm, exam_type: e.target.value})} className="w-full h-12 px-4 bg-gray-50 dark:bg-navy-700 border rounded-xl text-sm">
              <option value="test">فقط تستی</option>
              <option value="mixed">تستی و تشریحی</option>
            </select>
          </div>
          <div>
            <select value={examForm.score_type} onChange={e => setExamForm({...examForm, score_type: e.target.value})} className="w-full h-12 px-4 bg-gray-50 dark:bg-navy-700 border rounded-xl text-sm">
              <option value="percentage">درصد</option>
              <option value="score">نمره</option>
            </select>
          </div>
          <div><input type="number" value={examForm.duration} onChange={e => setExamForm({...examForm, duration: e.target.value})} placeholder="مدت (دقیقه)" className="w-full h-12 px-4 bg-gray-50 dark:bg-navy-700 border rounded-xl text-sm" /></div>
          <div><input value={examForm.entry_start} onChange={e => setExamForm({...examForm, entry_start: e.target.value})} placeholder="شروع" className="w-full h-12 px-4 bg-gray-50 dark:bg-navy-700 border rounded-xl text-sm" /></div>
          <div><input value={examForm.entry_end} onChange={e => setExamForm({...examForm, entry_end: e.target.value})} placeholder="پایان" className="w-full h-12 px-4 bg-gray-50 dark:bg-navy-700 border rounded-xl text-sm" /></div>
          <div className="md:col-span-2"><textarea value={examForm.description} onChange={e => setExamForm({...examForm, description: e.target.value})} placeholder="توضیحات" rows={2} className="w-full px-4 py-3 bg-gray-50 dark:bg-navy-700 border rounded-xl text-sm resize-none" /></div>
          <div className="md:col-span-2 flex justify-end gap-3">
            <button type="button" onClick={() => setActiveView('list')} className="px-6 py-3 bg-gray-200 dark:bg-navy-700 text-gray-700 dark:text-gray-300 rounded-2xl font-bold">انصراف</button>
            <button type="submit" disabled={submitting} className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-2xl font-bold disabled:opacity-50">
              {submitting ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <CheckCircle className="w-5 h-5" />} ذخیره تغییرات
            </button>
          </div>
        </form>
      </div>
    )
  }

  // ===== VIEW: مدیریت سوالات =====
  if (activeView === 'questions' && selectedExam) {
    return (
      <div>
        <button onClick={() => setActiveView('list')} className="text-purple-500 font-bold mb-6 flex items-center gap-1">← بازگشت</button>
        <h2 className="text-xl font-black text-gray-800 dark:text-white mb-2">سوالات: {selectedExam.title}</h2>
        <p className="text-sm text-gray-500 mb-6">{sections.length} بخش • {questions.length} سوال</p>

        {/* بخش‌ها + دکمه افزودن */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-sm text-gray-500">بخش‌ها:</span>
            {sections.map(s => (
              <span key={s.id} className="px-3 py-1 rounded-full bg-purple-50 dark:bg-purple-900/20 text-purple-600 text-xs font-bold">
                {s.title} ({s.questions_count} سوال)
              </span>
            ))}
            {sections.length === 0 && <span className="text-xs text-gray-400">بدون بخش</span>}
          </div>
          <button onClick={() => setShowSectionForm(!showSectionForm)} className="flex items-center gap-1 px-3 py-2 bg-purple-50 dark:bg-purple-900/20 text-purple-600 rounded-xl text-xs font-bold">
            {showSectionForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {showSectionForm ? 'انصراف' : 'افزودن بخش'}
          </button>
        </div>

        {/* فرم ساخت بخش */}
        <AnimatePresence>
          {showSectionForm && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden mb-4">
              <div className="bg-purple-50 dark:bg-purple-900/10 rounded-xl p-4 border border-purple-200 dark:border-purple-700">
                {sectionError && <div className="mb-3 p-2 bg-red-100 dark:bg-red-900/20 rounded-lg text-red-600 text-xs flex items-center gap-1"><AlertCircle className="w-3 h-3" />{sectionError}</div>}
                <form onSubmit={handleCreateSection} className="flex flex-wrap items-end gap-3">
                  <div className="flex-1 min-w-[150px]">
                    <label className="block text-xs text-gray-500 mb-1">عنوان بخش *</label>
                    <input value={sectionForm.title} onChange={e => setSectionForm({...sectionForm, title: e.target.value})} placeholder="مثلاً: حسابان ۱" className="w-full h-10 px-3 bg-white dark:bg-navy-700 border rounded-lg text-sm" />
                  </div>
                  <div className="w-24">
                    <label className="block text-xs text-gray-500 mb-1">ترتیب</label>
                    <input type="number" value={sectionForm.order} onChange={e => setSectionForm({...sectionForm, order: e.target.value})} placeholder="۱" className="w-full h-10 px-3 bg-white dark:bg-navy-700 border rounded-lg text-sm" />
                  </div>
                  <button type="submit" disabled={sectionSubmitting} className="h-10 px-4 bg-purple-500 text-white rounded-lg text-sm font-bold hover:bg-purple-600 disabled:opacity-50 flex items-center gap-1">
                    {sectionSubmitting ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <CheckCircle className="w-4 h-4" />}
                    ثبت
                  </button>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* لیست سوالات */}
        <div className="space-y-3 mb-8">
          {questionsBySection.map(section => (
            <div key={section.id}>
              <h3 className="font-bold text-purple-600 mb-2">{section.title}</h3>
              {section.questions.map(q => (
                <div key={q.id} className="bg-white dark:bg-navy-800 rounded-xl p-4 border flex items-center justify-between mb-2">
                  <div>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-sky-50 text-sky-600">{q.question_type === 'test' ? 'تستی' : 'تشریحی'}</span>
                    <span className="text-sm mr-2">{q.text?.substring(0, 60) || '(تصویر)'}</span>
                  </div>
                  <button onClick={() => deleteQuestion(q.id)} className="text-red-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                </div>
              ))}
            </div>
          ))}
          {unassignedQuestions.length > 0 && (
            <div>
              <h3 className="font-bold text-gray-400 mb-2">بدون بخش</h3>
              {unassignedQuestions.map(q => (
                <div key={q.id} className="bg-white dark:bg-navy-800 rounded-xl p-4 border flex items-center justify-between mb-2">
                  <span className="text-sm">{q.text?.substring(0, 60) || '(تصویر)'}</span>
                  <button onClick={() => deleteQuestion(q.id)} className="text-red-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                </div>
              ))}
            </div>
          )}
          {questions.length === 0 && <div className="text-center py-8 text-gray-400">سوالی نیست.</div>}
        </div>

        {/* فرم افزودن سوال */}
        <div className="bg-white dark:bg-navy-800 rounded-2xl p-6 border">
          <h3 className="font-bold mb-4">افزودن سوال جدید</h3>
          {formError && <div className="mb-4 p-3 bg-red-50 rounded-xl text-red-600 text-sm">{formError}</div>}
          <form onSubmit={handleCreateQuestion} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <select value={questionForm.question_type} onChange={e => setQuestionForm({...questionForm, question_type: e.target.value})} className="h-12 px-4 bg-gray-50 dark:bg-navy-700 border rounded-xl text-sm">
                <option value="test">تستی</option>
                <option value="essay">تشریحی</option>
              </select>
              <select value={questionForm.section} onChange={e => setQuestionForm({...questionForm, section: e.target.value})} className="h-12 px-4 bg-gray-50 dark:bg-navy-700 border rounded-xl text-sm">
                <option value="">بدون بخش</option>
                {sections.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
              </select>
              <input type="number" value={questionForm.score} onChange={e => setQuestionForm({...questionForm, score: e.target.value})} placeholder="نمره" className="h-12 px-4 bg-gray-50 dark:bg-navy-700 border rounded-xl text-sm" />
            </div>
            <textarea value={questionForm.text} onChange={e => setQuestionForm({...questionForm, text: e.target.value})} placeholder="متن سوال" rows={2} className="w-full px-4 py-3 bg-gray-50 dark:bg-navy-700 border rounded-xl text-sm resize-none" />
            <input type="file" onChange={e => setQuestionForm({...questionForm, image: e.target.files[0]})} className="text-sm" />
            
            {questionForm.question_type === 'test' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {choices.map((c, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input value={c.text} onChange={e => { const newChoices = [...choices]; newChoices[i].text = e.target.value; setChoices(newChoices) }} placeholder={`گزینه ${i+1}`} className="flex-1 h-10 px-3 bg-gray-50 dark:bg-navy-700 border rounded-lg text-sm" />
                    <button type="button" onClick={() => { const newChoices = choices.map((ch, j) => ({...ch, is_correct: j === i})); setChoices(newChoices) }} className={`w-8 h-8 rounded-lg text-xs font-bold ${c.is_correct ? 'bg-emerald-500 text-white' : 'bg-gray-200 text-gray-500'}`}>✓</button>
                  </div>
                ))}
              </div>
            )}
            
            <button type="submit" disabled={submitting} className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-2xl font-bold disabled:opacity-50">
              {submitting ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <Plus className="w-5 h-5" />} افزودن سوال
            </button>
          </form>
        </div>
      </div>
    )
  }

  // ===== VIEW: نتایج =====
  if (activeView === 'results' && selectedExam) {
    return (
      <div>
        <button onClick={() => setActiveView('list')} className="text-purple-500 font-bold mb-6">← بازگشت</button>
        <h2 className="text-xl font-black text-gray-800 dark:text-white mb-6">نتایج: {selectedExam.title}</h2>
        {results.length === 0 ? (
          <div className="text-center py-16 text-gray-400">نتیجه‌ای ثبت نشده.</div>
        ) : (
          <div className="space-y-3">
            {results.map(r => (
              <div key={r.id} className="bg-white dark:bg-navy-800 rounded-2xl p-5 border">
                <div className="flex items-center justify-between">
                  <div><h4 className="font-bold">{r.student_name}</h4><p className="text-xs text-gray-500">{r.finished_at ? new Date(r.finished_at).toLocaleDateString('fa-IR') : 'در حال انجام'}</p></div>
                  <div className="flex items-center gap-4">
                    <p className="text-xl font-black text-purple-500">%{r.total_score || '—'}</p>
                    <button onClick={() => { setSelectedResult(r); setExpandedResult(expandedResult === r.id ? null : r.id) }} className="text-sky-500">
                      {expandedResult === r.id ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
                <AnimatePresence>
                  {expandedResult === r.id && (
                    <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden mt-4 pt-4 border-t">
                      {r.essay_answers?.map(ans => (
                        <div key={ans.id} className="mb-3 p-3 bg-gray-50 dark:bg-navy-700 rounded-xl">
                          <p className="text-sm mb-2">{ans.text_answer?.substring(0, 100) || 'پاسخ فایل'}</p>
                          <div className="flex items-center gap-2">
                            <input type="number" placeholder="نمره" onChange={e => setCorrectionScore(e.target.value)} className="w-20 h-10 px-3 bg-white dark:bg-navy-600 border rounded-lg text-sm" />
                            <button onClick={() => submitCorrection(r.id, ans.question)} className="px-3 py-2 bg-emerald-500 text-white rounded-lg text-xs">ثبت</button>
                            {ans.score && <span className="text-xs text-emerald-600">نمره: {ans.score}</span>}
                          </div>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  // ===== VIEW: کارنامه =====
  if (activeView === 'report' && selectedExam) {
    return (
      <div>
        <button onClick={() => setActiveView('list')} className="text-purple-500 font-bold mb-6">← بازگشت</button>
        <h2 className="text-xl font-black text-gray-800 dark:text-white mb-6">کارنامه: {selectedExam.title}</h2>
        
        <select 
          onChange={e => setSelectedResult(results.find(r => r.id === Number(e.target.value)))} 
          className="h-12 px-4 bg-white dark:bg-navy-800 border rounded-xl text-sm mb-6 w-full max-w-xs"
        >
          <option value="">انتخاب دانش‌آموز...</option>
          {results.filter(r => r.finished_at).map(r => (
            <option key={r.id} value={r.id}>{r.student_name} — %{r.total_score}</option>
          ))}
        </select>

        {selectedResult && (
          <div className="space-y-4">
            <div className="bg-white dark:bg-navy-800 rounded-2xl p-6 border">
              <h3 className="font-bold text-lg mb-4">خلاصه</h3>
              <div className="grid grid-cols-4 gap-4 text-center">
                <div><p className="text-sm text-gray-500">درصد کل</p><p className="text-2xl font-black text-purple-500">%{selectedResult.total_score}</p></div>
                <div><p className="text-sm text-gray-500">خروج</p><p className="text-2xl font-black">{selectedResult.exit_count}</p></div>
                <div><p className="text-sm text-gray-500">وضعیت</p><p className="text-lg font-bold text-emerald-500">تکمیل شده</p></div>
                <div><p className="text-sm text-gray-500">تاریخ</p><p className="text-lg">{new Date(selectedResult.finished_at).toLocaleDateString('fa-IR')}</p></div>
              </div>
            </div>

            {sections.length > 0 && (
              <div className="bg-white dark:bg-navy-800 rounded-2xl p-6 border">
                <h3 className="font-bold text-lg mb-4">عملکرد در بخش‌ها</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 dark:bg-navy-700">
                      <tr>
                        <th className="p-3 text-right">بخش</th>
                        <th className="p-3 text-center">درست</th>
                        <th className="p-3 text-center">غلط</th>
                        <th className="p-3 text-center">نزده</th>
                        <th className="p-3 text-center">کل</th>
                        <th className="p-3 text-center">درصد</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sections.map(s => {
                        const report = getSectionReport(selectedResult, s.id)
                        return (
                          <tr key={s.id} className="border-t">
                            <td className="p-3 font-bold">{s.title}</td>
                            <td className="p-3 text-center text-emerald-500">{report?.correct ?? '—'}</td>
                            <td className="p-3 text-center text-red-500">{report?.wrong ?? '—'}</td>
                            <td className="p-3 text-center text-gray-400">{report?.unanswered ?? '—'}</td>
                            <td className="p-3 text-center">{report?.total ?? '—'}</td>
                            <td className="p-3 text-center font-bold">{report ? `%${report.percentage}` : '—'}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* دکمه کارنامه کامل — فقط اینو اضافه کن 👇 */}
            <div className="text-center">
              <button
                onClick={() => navigate(`/dashboard/counselor/exams/${selectedExam.id}/report/${selectedResult.student}`)}
                className="px-6 py-3 bg-purple-500 text-white rounded-2xl font-bold text-sm hover:bg-purple-600 transition-colors flex items-center gap-2 mx-auto"
              >
                <Eye className="w-4 h-4" />
                مشاهده کارنامه کامل
              </button>
            </div>
          </div>
        )}
      </div>
    )
  }

  return null
}

export default CounselorExams