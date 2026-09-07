import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Video, Headphones, FileText, BookOpen,
  Plus, X, Send, AlertCircle, CheckCircle,
  Trash2, ExternalLink, Download, Search, Image as ImageIcon,
  ChevronDown
} from 'lucide-react'
import api from '../../api/axios'

const CounselorContent = () => {
  const [activeTab, setActiveTab] = useState('videos')
  const [videos, setVideos] = useState([])
  const [podcasts, setPodcasts] = useState([])
  const [notes, setNotes] = useState([])
  const [samples, setSamples] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')
  const [formSuccess, setFormSuccess] = useState(false)
  const [search, setSearch] = useState('')
  
  // ✅ گزینه‌های dropdown
  const [grades, setGrades] = useState([])
  const [fields, setFields] = useState([])
  const [courses, setCourses] = useState([])
  
  // ✅ رشته‌های انتخاب شده (چندتایی)
  const [selectedFields, setSelectedFields] = useState([])
  
  const [form, setForm] = useState({
    title: '', description: '',
    video_file: null, aparat_link: '', thumbnail: null,
    audio_file: null, cover_image: null,
    pdf_file: null, course: '', grade: '',
  })

  useEffect(() => {
    fetchAll()
    fetchOptions()
  }, [])

  const fetchAll = async () => {
    setLoading(true)
    try {
      const [v, p, n, s] = await Promise.all([
        api.get('/education/videos/'),
        api.get('/education/podcasts/'),
        api.get('/education/notes/'),
        api.get('/education/exam-samples/'),
      ])
      setVideos(v.data)
      setPodcasts(p.data)
      setNotes(n.data)
      setSamples(s.data)
    } catch (err) {
      setError('خطا در دریافت محتوا.')
    } finally {
      setLoading(false)
    }
  }

  const fetchOptions = async () => {
    try {
      const [g, f, c] = await Promise.all([
        api.get('/core/grades/'),
        api.get('/core/fields/'),
        api.get('/core/courses/'),
      ])
      setGrades(g.data)
      setFields(f.data)
      setCourses(c.data)
    } catch (err) {
      console.error('Error fetching options:', err)
    }
  }

  const handleChange = (e) => {
    const { name, value, files } = e.target
    setForm(prev => ({ ...prev, [name]: files ? files[0] : value }))
  }

  // ✅ toggle رشته
  const toggleField = (fieldId) => {
    setSelectedFields(prev => 
      prev.includes(fieldId) 
        ? prev.filter(f => f !== fieldId) 
        : [...prev, fieldId]
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormError('')
    
    if (!form.title) { setFormError('عنوان الزامی است.'); return }
    
    // ✅ برای جزوه و نمونه سوال
    if (activeTab === 'notes' || activeTab === 'samples') {
      if (!form.grade || !form.course || selectedFields.length === 0) {
        setFormError('لطفاً پایه، رشته و درس را انتخاب کنید.')
        return
      }
    }
    
    setSubmitting(true)
    try {
      const formData = new FormData()
      formData.append('title', form.title)
      if (form.description) formData.append('description', form.description)
      
      let endpoint = ''
      
      switch (activeTab) {
        case 'videos':
          endpoint = '/education/videos/'
          if (form.video_file) formData.append('video_file', form.video_file)
          if (form.aparat_link) formData.append('aparat_link', form.aparat_link)
          if (form.thumbnail) formData.append('thumbnail', form.thumbnail)
          break
        case 'podcasts':
          endpoint = '/education/podcasts/'
          if (form.audio_file) formData.append('audio_file', form.audio_file)
          if (form.cover_image) formData.append('cover_image', form.cover_image)
          break
        case 'notes':
          endpoint = '/education/notes/'
          if (form.pdf_file) formData.append('pdf_file', form.pdf_file)
          if (form.cover_image) formData.append('cover_image', form.cover_image)
          formData.append('course', Number(form.course))
          formData.append('grade', Number(form.grade))
          selectedFields.forEach(f => formData.append('field_of_study', Number(f)))
          break
        case 'samples':
          endpoint = '/education/exam-samples/'
          if (form.pdf_file) formData.append('pdf_file', form.pdf_file)
          if (form.cover_image) formData.append('cover_image', form.cover_image)
          formData.append('course', Number(form.course))
          formData.append('grade', Number(form.grade))
          selectedFields.forEach(f => formData.append('field_of_study', Number(f)))
          break
      }
      
      await api.post(endpoint, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      
      setFormSuccess(true)
      setForm({ title: '', description: '', video_file: null, aparat_link: '', thumbnail: null, audio_file: null, cover_image: null, pdf_file: null, course: '', grade: '' })
      setSelectedFields([])
      setTimeout(() => { setShowForm(false); setFormSuccess(false) }, 1500)
      fetchAll()
    } catch (err) {
      console.error('Error:', err.response?.data || err)
      setFormError(err.response?.data?.error || 'خطا در ثبت.')
    } finally {
      setSubmitting(false)
    }
  }

  const deleteItem = async (id) => {
    if (!confirm('آیا مطمئنی؟')) return
    try {
      const endpoints = { videos: `/education/videos/${id}/`, podcasts: `/education/podcasts/${id}/`, notes: `/education/notes/${id}/`, samples: `/education/exam-samples/${id}/` }
      await api.delete(endpoints[activeTab])
      fetchAll()
    } catch { alert('خطا در حذف.') }
  }

  const tabs = [
    { id: 'videos', label: 'ویدیوها', icon: <Video className="w-5 h-5" />, count: videos.length, color: 'from-sky-400 to-sky-600' },
    { id: 'podcasts', label: 'پادکست‌ها', icon: <Headphones className="w-5 h-5" />, count: podcasts.length, color: 'from-purple-400 to-purple-600' },
    { id: 'notes', label: 'جزوه‌ها', icon: <FileText className="w-5 h-5" />, count: notes.length, color: 'from-emerald-400 to-emerald-600' },
    { id: 'samples', label: 'نمونه سوالات', icon: <BookOpen className="w-5 h-5" />, count: samples.length, color: 'from-amber-400 to-amber-600' },
  ]

  const getCurrentData = () => {
    const data = { videos, podcasts, notes, samples }[activeTab]
    return search ? data.filter(d => d.title?.includes(search)) : data
  }

  if (loading) {
    return <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="bg-white dark:bg-navy-800 rounded-2xl p-6 animate-pulse"><div className="h-4 bg-gray-200 dark:bg-navy-700 rounded w-3/4 mb-3"></div></div>)}</div>
  }

  if (error) {
    return <div className="text-center py-16"><AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" /><p className="text-gray-500">{error}</p></div>
  }

  const currentData = getCurrentData()

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <h2 className="text-xl font-black text-gray-800 dark:text-white">محتوا</h2>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-2xl font-bold text-sm hover:shadow-lg active:scale-95">
          {showForm ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
          {showForm ? 'انصراف' : 'افزودن محتوا'}
        </button>
      </div>

      <div className="flex gap-2 mb-6 p-1.5 bg-white dark:bg-navy-800 rounded-2xl overflow-x-auto">
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${activeTab === tab.id ? `bg-gradient-to-r ${tab.color} text-white` : 'text-gray-500'}`}>
            {tab.icon} {tab.label} <span className="text-xs px-2 py-0.5 rounded-full bg-white/20">{tab.count}</span>
          </button>
        ))}
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden mb-8">
            <div className="bg-white dark:bg-navy-800 rounded-2xl p-6 border shadow-lg">
              {formSuccess && <div className="mb-4 p-3 bg-emerald-50 rounded-xl text-emerald-600 flex items-center gap-2"><CheckCircle className="w-5 h-5" /> با موفقیت ثبت شد!</div>}
              {formError && <div className="mb-4 p-3 bg-red-50 rounded-xl text-red-600 flex items-center gap-2"><AlertCircle className="w-5 h-5" /> {formError}</div>}
              
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <input name="title" value={form.title} onChange={handleChange} placeholder="عنوان *" className="w-full h-12 px-4 bg-gray-50 dark:bg-navy-700 border rounded-xl text-sm" />
                </div>
                
                <div className="md:col-span-2">
                  <textarea name="description" value={form.description} onChange={handleChange} placeholder="توضیحات" rows={2} className="w-full px-4 py-3 bg-gray-50 dark:bg-navy-700 border rounded-xl text-sm resize-none" />
                </div>
                
                {activeTab === 'videos' && (
                  <>
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">فایل ویدیو</label>
                      <input type="file" name="video_file" onChange={handleChange} accept="video/*" className="w-full text-sm" />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">لینک آپارات</label>
                      <input name="aparat_link" value={form.aparat_link} onChange={handleChange} placeholder="https://..." className="w-full h-12 px-4 bg-gray-50 dark:bg-navy-700 border rounded-xl text-sm" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-xs text-gray-500 mb-1 block flex items-center gap-1">
                        <ImageIcon className="w-3.5 h-3.5" /> تصویر پیش‌نمایش ویدیو
                      </label>
                      <input type="file" name="thumbnail" onChange={handleChange} accept="image/*" className="w-full text-sm" />
                    </div>
                  </>
                )}
                
                {activeTab === 'podcasts' && (
                  <>
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">فایل صوتی</label>
                      <input type="file" name="audio_file" onChange={handleChange} accept="audio/*" className="w-full text-sm" />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block flex items-center gap-1">
                        <ImageIcon className="w-3.5 h-3.5" /> تصویر جلد پادکست
                      </label>
                      <input type="file" name="cover_image" onChange={handleChange} accept="image/*" className="w-full text-sm" />
                    </div>
                  </>
                )}
                
                {(activeTab === 'notes' || activeTab === 'samples') && (
                  <>
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">فایل PDF</label>
                      <input type="file" name="pdf_file" onChange={handleChange} accept=".pdf" className="w-full text-sm" />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block flex items-center gap-1">
                        <ImageIcon className="w-3.5 h-3.5" /> تصویر جلد
                      </label>
                      <input type="file" name="cover_image" onChange={handleChange} accept="image/*" className="w-full text-sm" />
                    </div>
                    
                    {/* ✅ Dropdown پایه */}
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">پایه تحصیلی *</label>
                      <select name="grade" value={form.grade} onChange={handleChange} className="w-full h-12 px-4 bg-gray-50 dark:bg-navy-700 border rounded-xl text-sm" required>
                        <option value="">انتخاب پایه...</option>
                        {grades.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                      </select>
                    </div>
                    
                    {/* ✅ Dropdown درس */}
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">درس *</label>
                      <select name="course" value={form.course} onChange={handleChange} className="w-full h-12 px-4 bg-gray-50 dark:bg-navy-700 border rounded-xl text-sm" required>
                        <option value="">انتخاب درس...</option>
                        {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    </div>
                    
                    {/* ✅ چیپ‌های رشته */}
                    <div className="md:col-span-2">
                      <label className="text-xs text-gray-500 mb-1 block">رشته تحصیلی * (چندتایی)</label>
                      <div className="flex flex-wrap gap-2">
                        {fields.map(f => (
                          <button
                            type="button"
                            key={f.id}
                            onClick={() => toggleField(f.id)}
                            className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
                              selectedFields.includes(f.id) 
                                ? 'bg-purple-500 text-white border-purple-500' 
                                : 'bg-gray-50 dark:bg-navy-700 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-navy-600'
                            }`}
                          >
                            {f.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}
                
                <div className="md:col-span-2 flex justify-end">
                  <button type="submit" disabled={submitting} className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-2xl font-bold disabled:opacity-50">
                    {submitting ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <Send className="w-5 h-5" />} ثبت
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative w-full sm:w-64 mb-6">
        <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="جستجو..." className="w-full h-12 pr-12 pl-4 bg-white dark:bg-navy-800 border rounded-2xl text-sm" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {currentData.length === 0 ? (
          <div className="col-span-full text-center py-16"><p className="text-gray-500">محتوایی یافت نشد.</p></div>
        ) : currentData.map(item => (
          <div key={item.id} className="bg-white dark:bg-navy-800 rounded-2xl p-5 border hover:shadow-lg transition-all">
            <h3 className="font-bold text-gray-800 dark:text-white mb-2 line-clamp-1">{item.title}</h3>
            {item.description && <p className="text-sm text-gray-500 mb-4 line-clamp-2">{item.description}</p>}
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                {item.aparat_link && <a href={item.aparat_link} target="_blank" className="text-xs text-sky-500 flex items-center gap-1"><ExternalLink className="w-3 h-3" /> آپارات</a>}
                {(item.video_file || item.audio_file || item.pdf_file) && <a href={item.video_file || item.audio_file || item.pdf_file} className="text-xs text-emerald-500 flex items-center gap-1"><Download className="w-3 h-3" /> دانلود</a>}
              </div>
              <button onClick={() => deleteItem(item.id)} className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-navy-700 flex items-center justify-center text-gray-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default CounselorContent