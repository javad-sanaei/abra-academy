import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Video, Headphones, FileText, BookOpen,
  Search, AlertCircle, Play, Download, ExternalLink,
  Filter, ChevronDown, Clock, Cloud, Sparkles,
  Layers, Music, FileDown, Eye, Star, Zap,
  Pause, SkipBack, SkipForward, Volume2, Maximize2
} from 'lucide-react'
import api from '../../api/axios'
import '../../styles/student-education.css'

// ==================== Player سفارشی پادکست ====================
const PodcastPlayer = ({ src, coverImage, title }) => {
  const audioRef = useRef(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [currentTime, setCurrentTime] = useState('0:00')
  const [duration, setDuration] = useState('0:00')
  const [volume, setVolume] = useState(1)

  const togglePlay = () => {
    if (audioRef.current.paused) {
      audioRef.current.play()
      setIsPlaying(true)
    } else {
      audioRef.current.pause()
      setIsPlaying(false)
    }
  }

  const handleTimeUpdate = () => {
    const audio = audioRef.current
    const percent = (audio.currentTime / audio.duration) * 100
    setProgress(percent)
    setCurrentTime(formatTime(audio.currentTime))
  }

  const handleLoadedMetadata = () => {
    setDuration(formatTime(audioRef.current.duration))
  }

  const handleSeek = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const percent = x / rect.width
    audioRef.current.currentTime = percent * audioRef.current.duration
  }

  const skipForward = () => {
    audioRef.current.currentTime += 10
  }

  const skipBackward = () => {
    audioRef.current.currentTime -= 10
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`
  }

  return (
    <div className="podcast-player">
      <audio
        ref={audioRef}
        src={src}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
      />
      
      {/* Progress Bar */}
      <div className="podcast-progress" onClick={handleSeek}>
        <div className="podcast-progress-fill" style={{ width: `${progress}%` }} />
        <div className="podcast-progress-dot" style={{ right: `${100 - progress}%` }} />
      </div>

      {/* Controls */}
      <div className="podcast-controls">
        <button className="podcast-btn" onClick={skipBackward}>
          <SkipBack className="w-4 h-4" />
        </button>
        
        <button className="podcast-btn podcast-btn-play" onClick={togglePlay}>
          {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
        </button>
        
        <button className="podcast-btn" onClick={skipForward}>
          <SkipForward className="w-4 h-4" />
        </button>

        <span className="podcast-time">{currentTime}</span>
        <span className="podcast-time podcast-time-total">{duration}</span>
      </div>

      {/* Waveform */}
      <div className="podcast-waveform">
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="podcast-waveform-bar"
            animate={isPlaying ? { height: [8, 20, 10, 24, 6, 18] } : { height: 8 }}
            transition={{ duration: 0.8, repeat: isPlaying ? Infinity : 0, delay: i * 0.05 }}
          />
        ))}
      </div>
    </div>
  )
}

// ==================== Main Component ====================
const StudentEducation = () => {
  const [activeTab, setActiveTab] = useState('videos')
  const [videos, setVideos] = useState([])
  const [podcasts, setPodcasts] = useState([])
  const [notes, setNotes] = useState([])
  const [samples, setSamples] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState({ grade: '', field: '', course: '' })
  const [grades, setGrades] = useState([])
  const [fields, setFields] = useState([])
  const [courses, setCourses] = useState([])

  const fetchAllData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [videosRes, podcastsRes, notesRes, samplesRes] = await Promise.all([
        api.get('/student/videos/'),
        api.get('/student/podcasts/'),
        api.get('/student/notes/'),
        api.get('/student/exam-samples/')
      ])
      setVideos(videosRes.data)
      setPodcasts(podcastsRes.data)
      setNotes(notesRes.data)
      setSamples(samplesRes.data)
    } catch (err) {
      setError('خطا در دریافت اطلاعات آموزشی.')
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchFilterOptions = useCallback(async () => {
    try {
      const [gradesRes, fieldsRes, coursesRes] = await Promise.all([
        api.get('/core/grades/'),
        api.get('/core/fields/'),
        api.get('/core/courses/')
      ])
      setGrades(gradesRes.data)
      setFields(fieldsRes.data)
      setCourses(coursesRes.data)
    } catch (err) {
      console.error(err)
    }
  }, [])

  useEffect(() => {
    fetchAllData()
    fetchFilterOptions()
  }, [fetchAllData, fetchFilterOptions])

  const fetchFilteredNotes = useCallback(async () => {
    try {
      const params = {}
      if (filters.grade) params.grade = filters.grade
      if (filters.field) params.field = filters.field
      if (filters.course) params.course = filters.course
      const res = await api.get('/student/notes/', { params })
      setNotes(res.data)
    } catch (err) {
      console.error(err)
    }
  }, [filters])

  const fetchFilteredSamples = useCallback(async () => {
    try {
      const params = {}
      if (filters.grade) params.grade = filters.grade
      if (filters.field) params.field = filters.field
      if (filters.course) params.course = filters.course
      const res = await api.get('/student/exam-samples/', { params })
      setSamples(res.data)
    } catch (err) {
      console.error(err)
    }
  }, [filters])

  useEffect(() => {
    if (activeTab === 'notes') fetchFilteredNotes()
    if (activeTab === 'samples') fetchFilteredSamples()
  }, [filters, activeTab, fetchFilteredNotes, fetchFilteredSamples])

  const tabs = [
    { id: 'videos', label: 'ویدیوها', icon: <Video className="w-5 h-5" />, count: videos.length, gradient: 'linear-gradient(135deg, #3B82F6, #06B6D4)', emoji: '🎬' },
    { id: 'podcasts', label: 'پادکست‌ها', icon: <Headphones className="w-5 h-5" />, count: podcasts.length, gradient: 'linear-gradient(135deg, #8B5CF6, #EC4899)', emoji: '🎧' },
    { id: 'notes', label: 'جزوه‌ها', icon: <FileText className="w-5 h-5" />, count: notes.length, gradient: 'linear-gradient(135deg, #10B981, #34D399)', emoji: '📄' },
    { id: 'samples', label: 'نمونه سوالات', icon: <BookOpen className="w-5 h-5" />, count: samples.length, gradient: 'linear-gradient(135deg, #F59E0B, #F97316)', emoji: '📝' },
  ]

  const getFilteredData = () => {
    let data = []
    switch (activeTab) {
      case 'videos': data = videos; break
      case 'podcasts': data = podcasts; break
      case 'notes': data = notes; break
      case 'samples': data = samples; break
    }
    if (!search) return data
    return data.filter(item => 
      item.title?.includes(search) || 
      item.description?.includes(search) ||
      item.course_name?.includes(search)
    )
  }

  const filteredData = getFilteredData()
  const activeTabConfig = tabs.find(t => t.id === activeTab)

  if (loading) {
    return (
      <div className="student-education-container">
        <div className="education-skeleton-stack">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="education-skeleton-card">
              <div className="education-skeleton-line education-skeleton-line-lg" />
              <div className="education-skeleton-line education-skeleton-line-sm" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="student-education-container">
        <div className="education-state">
          <div className="education-state-icon education-state-icon-error">
            <AlertCircle className="w-9 h-9" strokeWidth={1.8} />
          </div>
          <h3 className="education-state-title">خطا!</h3>
          <p className="education-state-desc">{error}</p>
          <button onClick={fetchAllData} className="education-retry-btn">تلاش دوباره</button>
        </div>
      </div>
    )
  }

  return (
    <div className="student-education-container">
      
      {/* Header */}
      <div className="education-header">
        <div>
          <h2 className="education-heading">
            <span className="education-heading-icon">
              <Sparkles className="w-5 h-5" strokeWidth={1.8} />
            </span>
            آموزش‌های من
          </h2>
          <p className="education-subheading">محتوای آموزشی اختصاصی مشاور شما</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="education-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`education-tab ${activeTab === tab.id ? 'education-tab-active' : ''}`}
            style={activeTab === tab.id ? { background: tab.gradient } : {}}
          >
            {tab.icon}
            <span>{tab.label}</span>
            <span className="education-tab-count">{tab.count}</span>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="education-search-wrap">
        <Search className="education-search-icon" strokeWidth={1.8} />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="جستجو در محتوا..."
          className="education-search-input"
        />
      </div>

      {/* Filters */}
      {(activeTab === 'notes' || activeTab === 'samples') && (
        <div className="education-filters">
          <Filter className="education-filter-icon" strokeWidth={1.8} />
          <select value={filters.grade} onChange={(e) => setFilters({ ...filters, grade: e.target.value })} className="education-filter-select">
            <option value="">همه پایه‌ها</option>
            {grades.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
          </select>
          <select value={filters.field} onChange={(e) => setFilters({ ...filters, field: e.target.value })} className="education-filter-select">
            <option value="">همه رشته‌ها</option>
            {fields.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
          </select>
          <select value={filters.course} onChange={(e) => setFilters({ ...filters, course: e.target.value })} className="education-filter-select">
            <option value="">همه درس‌ها</option>
            {courses.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
      )}

      {/* Content */}
      {filteredData.length === 0 ? (
        <div className="education-state">
          <div className="education-state-icon education-state-icon-empty">
            {activeTabConfig?.icon}
          </div>
          <h3 className="education-state-title">
            {search ? 'موردی یافت نشد!' : 'هنوز محتوایی نیست!'}
          </h3>
          <p className="education-state-desc">
            {search ? 'با عبارت دیگه‌ای جستجو کن.' : 'مشاورت به زودی محتوا اضافه می‌کنه.'}
          </p>
        </div>
      ) : (
        <div className="education-grid">
          {filteredData.map((item, index) => (
            <div key={item.id || index} className={`education-card education-card-${activeTab}`}>
              <div className="education-card-accent" style={{ background: activeTabConfig?.gradient }} />

              {/* ویدیوها */}
              {activeTab === 'videos' && (
                <>
                  <div className="education-video-thumb">
                    {item.thumbnail ? (
                      <img src={item.thumbnail} alt={item.title} className="education-thumbnail-img" />
                    ) : (
                      <Video className="w-16 h-16 text-white opacity-50" />
                    )}
                    <div className="education-video-overlay">
                      <div className="education-video-play">
                        <Play className="w-6 h-6 text-white" fill="white" />
                      </div>
                    </div>
                  </div>
                  <h3 className="education-card-title">{item.title}</h3>
                  {item.description && <p className="education-card-desc">{item.description}</p>}
                  <div className="education-card-actions">
                    {item.aparat_link && (
                      <a href={item.aparat_link} target="_blank" className="education-link education-link-blue">
                        <ExternalLink className="w-4 h-4" /> آپارات
                      </a>
                    )}
                    {item.video_file && (
                      <a href={item.video_file} className="education-link education-link-green">
                        <Download className="w-4 h-4" /> دانلود
                      </a>
                    )}
                  </div>
                </>
              )}

              {/* پادکست‌ها */}
              {activeTab === 'podcasts' && (
                <>
                  <div className="education-podcast-header">
                    {item.cover_image ? (
                      <img src={item.cover_image} alt={item.title} className="education-podcast-cover" />
                    ) : (
                      <div className="education-podcast-cover education-podcast-cover-fallback">
                        <Headphones className="w-8 h-8 text-white" />
                      </div>
                    )}
                    <div>
                      <h3 className="education-card-title">{item.title}</h3>
                      <p className="education-podcast-duration">
                        <Clock className="w-3.5 h-3.5" /> {item.duration ? `${item.duration} دقیقه` : ''}
                      </p>
                    </div>
                  </div>
                  {item.description && <p className="education-card-desc">{item.description}</p>}
                  {item.audio_file && (
                    <PodcastPlayer src={item.audio_file} coverImage={item.cover_image} title={item.title} />
                  )}
                </>
              )}

              {/* جزوه‌ها */}
              {activeTab === 'notes' && (
                <>
                  {/* ✅ تصویر بزرگ بالا */}
                  <div className="education-file-cover-large">
                    {item.cover_image ? (
                      <img 
                        src={item.cover_image} 
                        alt={item.title} 
                        className="education-file-cover-large-img"
                      />
                    ) : (
                      <div className="education-file-icon education-file-icon-green education-file-icon-large">
                        <FileText className="w-10 h-10" />
                      </div>
                    )}
                  </div>
                  
                  {/* عنوان */}
                  <h3 className="education-card-title">{item.title}</h3>
                  
                  {/* متا */}
                  <div className="education-file-meta mb-3">
                    {item.course_name && <span>{item.course_name}</span>}
                    {item.grade_name && <span>• {item.grade_name}</span>}
                  </div>
                  
                  {/* توضیحات */}
                  {item.description && <p className="education-card-desc">{item.description}</p>}
                  
                  {/* دانلود */}
                  {item.pdf_file && (
                    <a href={item.pdf_file} target="_blank" className="education-download-btn education-download-green">
                      <FileDown className="w-4 h-4" />
                      دانلود PDF
                    </a>
                  )}
                </>
              )}

              {/* نمونه سوالات */}
              {activeTab === 'samples' && (
                <>
                  {/* ✅ تصویر بزرگ بالا */}
                  <div className="education-file-cover-large">
                    {item.cover_image ? (
                      <img 
                        src={item.cover_image} 
                        alt={item.title} 
                        className="education-file-cover-large-img"
                      />
                    ) : (
                      <div className="education-file-icon education-file-icon-orange education-file-icon-large">
                        <BookOpen className="w-10 h-10" />
                      </div>
                    )}
                  </div>
                  
                  <h3 className="education-card-title">{item.title}</h3>
                  
                  <div className="education-file-meta mb-3">
                    {item.course_name && <span>{item.course_name}</span>}
                    {item.grade_name && <span>• {item.grade_name}</span>}
                  </div>
                  
                  {item.description && <p className="education-card-desc">{item.description}</p>}
                  
                  {item.pdf_file && (
                    <a href={item.pdf_file} target="_blank" className="education-download-btn education-download-orange">
                      <FileDown className="w-4 h-4" />
                      دانلود PDF
                    </a>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default StudentEducation