import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  Users, Search, AlertCircle, GraduationCap, 
  BookOpen, Phone, Filter, X, ChevronLeft
} from 'lucide-react'
import api from '../../api/axios'

const CounselorStudents = () => {
  const navigate = useNavigate()
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const [filterGrade, setFilterGrade] = useState('')
  const [filterField, setFilterField] = useState('')
  const [grades, setGrades] = useState([])
  const [fields, setFields] = useState([])

  useEffect(() => {
    fetchStudents()
    fetchFilters()
  }, [])

  const fetchStudents = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await api.get('/accounts/users/?role=student')
      setStudents(res.data)
    } catch (err) {
      setError('خطا در دریافت لیست دانش‌آموزان.')
    } finally {
      setLoading(false)
    }
  }

  const fetchFilters = async () => {
    try {
      const [gradesRes, fieldsRes] = await Promise.all([
        api.get('/core/grades/'),
        api.get('/core/fields/'),
      ])
      setGrades(gradesRes.data)
      setFields(fieldsRes.data)
    } catch (err) {
      console.error('Error fetching filters:', err)
    }
  }

  const filteredStudents = students.filter(s => {
    const matchesSearch = !search || 
      s.full_name?.includes(search) || 
      s.username?.includes(search) ||
      s.phone?.includes(search) ||
      s.grade?.includes(search) ||
      s.field_of_study?.includes(search)
    
    const matchesGrade = !filterGrade || s.grade === filterGrade
    const matchesField = !filterField || s.field_of_study === filterField
    
    return matchesSearch && matchesGrade && matchesField
  })

  const activeStudents = students.filter(s => s.is_active).length

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-white dark:bg-navy-800 rounded-2xl p-6 animate-pulse">
            <div className="h-4 bg-gray-200 dark:bg-navy-700 rounded w-3/4 mb-3"></div>
            <div className="h-3 bg-gray-200 dark:bg-navy-700 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
          <AlertCircle className="w-10 h-10 text-red-500" />
        </div>
        <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">خطا!</h3>
        <p className="text-gray-500 dark:text-gray-400">{error}</p>
        <button onClick={fetchStudents} className="mt-6 px-6 py-3 bg-purple-500 text-white rounded-2xl font-bold hover:bg-purple-600">
          تلاش دوباره
        </button>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col gap-4 mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-black text-gray-800 dark:text-white">دانش‌آموزان من</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {students.length} دانش‌آموز • {activeStudents} فعال
            </p>
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="جستجوی دانش‌آموز..."
              className="w-full h-12 pr-12 pl-4 bg-white dark:bg-navy-800 border border-gray-200 dark:border-navy-700 rounded-2xl text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all font-vazir text-sm"
            />
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 p-3 bg-white dark:bg-navy-800 rounded-2xl border border-gray-100 dark:border-navy-700">
          <Filter className="w-4 h-4 text-gray-400" />
          
          <select
            value={filterGrade}
            onChange={(e) => setFilterGrade(e.target.value)}
            className="h-10 px-3 bg-gray-50 dark:bg-navy-700 border border-gray-200 dark:border-navy-600 rounded-xl text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 font-vazir"
          >
            <option value="">همه پایه‌ها</option>
            {grades.map((g) => (
              <option key={g.id} value={g.name}>{g.name}</option>
            ))}
          </select>

          <select
            value={filterField}
            onChange={(e) => setFilterField(e.target.value)}
            className="h-10 px-3 bg-gray-50 dark:bg-navy-700 border border-gray-200 dark:border-navy-600 rounded-xl text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 font-vazir"
          >
            <option value="">همه رشته‌ها</option>
            {fields.map((f) => (
              <option key={f.id} value={f.name}>{f.name}</option>
            ))}
          </select>

          {(filterGrade || filterField) && (
            <button
              onClick={() => { setFilterGrade(''); setFilterField('') }}
              className="flex items-center gap-1 h-10 px-3 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              حذف فیلترها
            </button>
          )}

          <span className="text-xs text-gray-400 mr-auto">
            {filteredStudents.length} نفر
          </span>
        </div>
      </div>

      {/* Students Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredStudents.length === 0 ? (
          <div className="col-span-full text-center py-16">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center">
              <Users className="w-10 h-10 text-purple-400" />
            </div>
            <p className="text-gray-500 dark:text-gray-400">
              {search || filterGrade || filterField ? 'دانش‌آموزی با این مشخصات یافت نشد.' : 'هنوز دانش‌آموزی نداری!'}
            </p>
          </div>
        ) : (
          filteredStudents.map((student) => (
            <motion.div
              key={student.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={() => navigate(`/dashboard/counselor/students/${student.id}`)}
              className="bg-white dark:bg-navy-800 rounded-2xl p-5 border-2 border-gray-100 dark:border-navy-700 transition-all cursor-pointer hover:shadow-lg hover:border-purple-300 dark:hover:border-purple-600"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white font-bold text-xl shadow-lg flex-shrink-0">
                  {(student.full_name || student.username).charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-800 dark:text-white truncate">
                    {student.full_name || student.username}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    @{student.username}
                  </p>
                </div>
                <ChevronLeft className="w-5 h-5 text-gray-400" />
              </div>

              <div className="flex flex-wrap gap-2 text-xs">
                {student.grade && (
                  <span className="px-2.5 py-1 rounded-full bg-sky-50 dark:bg-sky-900/20 text-sky-600 dark:text-sky-400 flex items-center gap-1">
                    <GraduationCap className="w-3 h-3" />
                    {student.grade}
                  </span>
                )}
                {student.field_of_study && (
                  <span className="px-2.5 py-1 rounded-full bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 flex items-center gap-1">
                    <BookOpen className="w-3 h-3" />
                    {student.field_of_study}
                  </span>
                )}
                {student.phone && (
                  <span className="px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <Phone className="w-3 h-3" />
                    {student.phone}
                  </span>
                )}
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  )
}

export default CounselorStudents