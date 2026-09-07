import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Users, Search, Plus, X, Send, AlertCircle, CheckCircle, Edit3, Trash2, Phone, GraduationCap, BookOpen, Wallet } from 'lucide-react'
import api from '../../api/axios'

const AdminUsers = ({ roleFilter }) => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')
  const [formSuccess, setFormSuccess] = useState('')
  const [counselors, setCounselors] = useState([])

  const [form, setForm] = useState({
    username: '', password: '', password_confirm: '',
    first_name: '', last_name: '', phone: '', role: 'student',
    grade: '', field_of_study: '', counselor: '',
    // ✅ سیستم شهریه ماهانه
    tuition_amount: '', tuition_day: '', last_payment_date: ''
  })

  useEffect(() => {
    fetchUsers()
    fetchCounselors()
  }, [roleFilter])

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const params = roleFilter ? `?role=${roleFilter}` : ''
      const res = await api.get(`/accounts/users/${params}`)
      setUsers(res.data)
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  const fetchCounselors = async () => {
    try {
      const res = await api.get('/accounts/users/?role=counselor')
      setCounselors(res.data)
    } catch (err) { console.error(err) }
  }

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const resetForm = () => {
    setForm({ 
      username: '', password: '', password_confirm: '', 
      first_name: '', last_name: '', phone: '', role: 'student',
      grade: '', field_of_study: '', counselor: '',
      tuition_amount: '', tuition_day: '', last_payment_date: ''
    })
    setEditingUser(null)
    setFormError('')
    setFormSuccess('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormError('')
    if (!form.username || (!editingUser && !form.password)) { setFormError('نام کاربری و رمز الزامی است.'); return }
    if (!editingUser && form.password !== form.password_confirm) { setFormError('رمزها مطابقت ندارند.'); return }
    
    setSubmitting(true)
    try {
      const data = { ...form }
      if (editingUser) { delete data.password; delete data.password_confirm }
      else { data.counselor = data.counselor || null }
      
      // ✅ تبدیل به عدد
      if (data.tuition_amount) data.tuition_amount = Number(data.tuition_amount)
      else data.tuition_amount = null
      
      if (data.tuition_day) data.tuition_day = Number(data.tuition_day)
      else data.tuition_day = null
      
      if (editingUser) {
        await api.put(`/accounts/users/${editingUser.id}/`, data)
        setFormSuccess('کاربر ویرایش شد!')
      } else {
        await api.post('/accounts/users/', data)
        setFormSuccess('کاربر جدید ساخته شد!')
      }
      setTimeout(() => { setShowForm(false); resetForm() }, 1500)
      fetchUsers()
    } catch (err) {
      setFormError(err.response?.data?.error || Object.values(err.response?.data||{}).flat().join(', ') || 'خطا در ثبت.')
    } finally { setSubmitting(false) }
  }

  const toggleActive = async (user) => {
    try {
      await api.put(`/accounts/users/${user.id}/`, { is_active: !user.is_active })
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, is_active: !u.is_active } : u))
    } catch { alert('خطا!') }
  }

  const deleteUser = async (id) => {
    if (!confirm('آیا مطمئنی؟')) return
    try { await api.delete(`/accounts/users/${id}/`); fetchUsers() }
    catch { alert('خطا در حذف.') }
  }

  const editUser = (user) => {
    setForm({
      username: user.username, password: '', password_confirm: '',
      first_name: user.first_name || '', last_name: user.last_name || '',
      phone: user.phone || '', role: user.role,
      grade: user.grade || '', field_of_study: user.field_of_study || '',
      counselor: user.counselor || '',
      // ✅ سیستم شهریه ماهانه
      tuition_amount: user.tuition_amount || '',
      tuition_day: user.tuition_day || '',
      last_payment_date: user.last_payment_date || ''
    })
    setEditingUser(user)
    setShowForm(true)
  }

  const roleLabels = { admin: 'ادمین', counselor: 'مشاور', student: 'دانش‌آموز', psychologist: 'روانشناس' }
  const roleColors = { admin: '#F59E0B', counselor: '#8B5CF6', student: '#3B82F6', psychologist: '#10B981' }

  const filteredUsers = users.filter(u =>
    (u.full_name || '').includes(search) || u.username.includes(search) || (u.phone || '').includes(search)
  )

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <h2 className="text-xl font-black text-gray-800 dark:text-white">
          {roleFilter ? `مدیریت ${roleLabels[roleFilter] || 'کاربران'}ها` : 'مدیریت کاربران'}
          <span className="text-sm text-gray-400 font-normal mr-2">{users.length} نفر</span>
        </h2>
        <button onClick={() => { resetForm(); setShowForm(!showForm) }} className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-2xl font-bold text-sm">
          {showForm ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
          {showForm ? 'انصراف' : 'افزودن کاربر'}
        </button>
      </div>

      {/* Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden mb-8">
            <div className="bg-white dark:bg-navy-800 rounded-2xl p-6 border shadow-lg">
              {formSuccess && <div className="mb-4 p-3 bg-emerald-50 rounded-xl text-emerald-600 flex items-center gap-2"><CheckCircle className="w-5 h-5" />{formSuccess}</div>}
              {formError && <div className="mb-4 p-3 bg-red-50 rounded-xl text-red-600 flex items-center gap-2"><AlertCircle className="w-5 h-5" />{formError}</div>}
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div><input name="username" value={form.username} onChange={handleChange} placeholder="نام کاربری *" className="w-full h-12 px-4 bg-gray-50 dark:bg-navy-700 border rounded-xl text-sm" /></div>
                {!editingUser && <>
                  <div><input name="password" type="password" value={form.password} onChange={handleChange} placeholder="رمز عبور *" className="w-full h-12 px-4 bg-gray-50 dark:bg-navy-700 border rounded-xl text-sm" /></div>
                  <div><input name="password_confirm" type="password" value={form.password_confirm} onChange={handleChange} placeholder="تکرار رمز *" className="w-full h-12 px-4 bg-gray-50 dark:bg-navy-700 border rounded-xl text-sm" /></div>
                </>}
                <div><input name="first_name" value={form.first_name} onChange={handleChange} placeholder="نام" className="w-full h-12 px-4 bg-gray-50 dark:bg-navy-700 border rounded-xl text-sm" /></div>
                <div><input name="last_name" value={form.last_name} onChange={handleChange} placeholder="نام خانوادگی" className="w-full h-12 px-4 bg-gray-50 dark:bg-navy-700 border rounded-xl text-sm" /></div>
                <div><input name="phone" value={form.phone} onChange={handleChange} placeholder="شماره تماس" className="w-full h-12 px-4 bg-gray-50 dark:bg-navy-700 border rounded-xl text-sm" /></div>
                <div>
                  <select name="role" value={form.role} onChange={handleChange} className="w-full h-12 px-4 bg-gray-50 dark:bg-navy-700 border rounded-xl text-sm">
                    {Object.entries(roleLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </div>
                {form.role === 'student' && <>
                  <div><input name="grade" value={form.grade} onChange={handleChange} placeholder="پایه" className="w-full h-12 px-4 bg-gray-50 dark:bg-navy-700 border rounded-xl text-sm" /></div>
                  <div><input name="field_of_study" value={form.field_of_study} onChange={handleChange} placeholder="رشته" className="w-full h-12 px-4 bg-gray-50 dark:bg-navy-700 border rounded-xl text-sm" /></div>
                  <div>
                    <select name="counselor" value={form.counselor} onChange={handleChange} className="w-full h-12 px-4 bg-gray-50 dark:bg-navy-700 border rounded-xl text-sm">
                      <option value="">انتخاب مشاور...</option>
                      {counselors.map(c => <option key={c.id} value={c.id}>{c.full_name || c.username}</option>)}
                    </select>
                  </div>
                  {/* ✅ فیلدهای شهریه ماهانه */}
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block flex items-center gap-1">
                      <Wallet className="w-3.5 h-3.5" /> مبلغ شهریه (تومان)
                    </label>
                    <input name="tuition_amount" type="number" value={form.tuition_amount} onChange={handleChange} placeholder="مثلاً: 2500000" className="w-full h-12 px-4 bg-gray-50 dark:bg-navy-700 border rounded-xl text-sm" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">روز پرداخت شهریه (۱ تا ۳۰)</label>
                    <input name="tuition_day" type="number" min="1" max="30" value={form.tuition_day} onChange={handleChange} placeholder="مثلاً: ۱۰" className="w-full h-12 px-4 bg-gray-50 dark:bg-navy-700 border rounded-xl text-sm" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">آخرین پرداخت</label>
                    <input name="last_payment_date" value={form.last_payment_date} onChange={handleChange} placeholder="مثلاً: 1405/05/10" className="w-full h-12 px-4 bg-gray-50 dark:bg-navy-700 border rounded-xl text-sm" />
                  </div>
                </>}
                <div className="md:col-span-2 lg:col-span-3 flex justify-end">
                  <button type="submit" disabled={submitting} className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-2xl font-bold disabled:opacity-50">
                    {submitting ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <Send className="w-5 h-5" />}
                    {editingUser ? 'ویرایش کاربر' : 'ثبت کاربر'}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search */}
      <div className="relative w-full sm:w-64 mb-6">
        <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="جستجو..." className="w-full h-12 pr-12 pl-4 bg-white dark:bg-navy-800 border rounded-2xl text-sm" />
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-navy-800 rounded-2xl border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-navy-700">
              <tr>
                <th className="p-4 text-right">کاربر</th>
                <th className="p-4 text-right hidden md:table-cell">نقش</th>
                <th className="p-4 text-right hidden lg:table-cell">شماره</th>
                <th className="p-4 text-right hidden lg:table-cell">پایه/رشته</th>
                <th className="p-4 text-center">وضعیت</th>
                <th className="p-4 text-center">عملیات</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(user => (
                <tr key={user.id} className="border-t border-gray-100 dark:border-navy-700 hover:bg-gray-50 dark:hover:bg-navy-700">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white font-bold text-sm">{(user.full_name || user.username).charAt(0)}</div>
                      <div>
                        <p className="font-bold">{user.full_name || user.username}</p>
                        <p className="text-xs text-gray-400">@{user.username}</p>
                        {user.tuition_day && (
                          <p className="text-xs text-amber-500 mt-0.5">💰 روز {user.tuition_day} هر ماه</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="p-4 hidden md:table-cell">
                    <span className="px-2 py-1 rounded-full text-xs font-bold" style={{ background: `${roleColors[user.role] || '#999'}20`, color: roleColors[user.role] }}>{roleLabels[user.role]}</span>
                  </td>
                  <td className="p-4 hidden lg:table-cell text-gray-500">{user.phone || '—'}</td>
                  <td className="p-4 hidden lg:table-cell text-gray-500 text-xs">{user.grade || '—'} / {user.field_of_study || '—'}</td>
                  <td className="p-4 text-center">
                    <button onClick={() => toggleActive(user)} className={`px-3 py-1 rounded-full text-xs font-bold ${user.is_active ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                      {user.is_active ? 'فعال' : 'غیرفعال'}
                    </button>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => editUser(user)} className="w-8 h-8 rounded-lg bg-sky-50 text-sky-500 flex items-center justify-center"><Edit3 className="w-4 h-4" /></button>
                      <button onClick={() => deleteUser(user.id)} className="w-8 h-8 rounded-lg bg-red-50 text-red-500 flex items-center justify-center"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredUsers.length === 0 && <div className="text-center py-12 text-gray-400">کاربری یافت نشد.</div>}
      </div>
    </div>
  )
}

export default AdminUsers