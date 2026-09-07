import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { 
  Menu, X, Sun, Moon, ChevronDown, ChevronUp,
  Phone, Mail, MapPin, MessageCircle, Send,
  GraduationCap, Heart, Brain, Target,
  Clock, Users, FileText, Smile, Zap, Trophy,
  Headphones, PhoneCall, Lock,
  ArrowLeft, ArrowRight, LogIn, Cloud, Sparkles, 
  Check, Quote, Star, Rocket, HelpCircle, Shield,
  DollarSign, UserCheck, BookOpen, CheckCircle,
  AlertCircle, Loader, ExternalLink, Gift,
  Eye, TrendingUp, Award, ThumbsUp, ZapIcon,
  ArrowUp, Crown, Gem, BadgeCheck, Lightbulb,
  CalendarCheck, Video, Mic, Bookmark, ShieldCheck,
  ChevronLeft, ChevronRight,BarChart3,User,PenLine 
} from 'lucide-react'

import { motion, AnimatePresence } from 'framer-motion'




// ===== تصاویر پس‌زمینه Hero Slider =====
const heroImages = [
  '/hero-section-1.png',
  '/hero-section-2.png',
  '/hero-section-3.png',
  '/hero-section-4.png',
]

const Home = () => {
  // ===== STATES =====
  const [isDark, setIsDark] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [openFaq, setOpenFaq] = useState(null)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [phoneNumber, setPhoneNumber] = useState('')
  const [formError, setFormError] = useState('')
  const [formSuccess, setFormSuccess] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeTestimonial, setActiveTestimonial] = useState(0)
  const [countersAnimated, setCountersAnimated] = useState(false)

  const heroRef = useRef(null)
  const sliderIntervalRef = useRef(null)
  const statsRef = useRef(null)

  // State های فرم مشاوره
  const [formFullName, setFormFullName] = useState('')
  const [formPhone, setFormPhone] = useState('')
  const [formGrade, setFormGrade] = useState('')
  const [formTarget, setFormTarget] = useState('')
  const [formSubject, setFormSubject] = useState('')
  const [formDescription, setFormDescription] = useState('')

  // State فوتر موبایل
  const [openFooter, setOpenFooter] = useState(null)

  // ===== EFFECTS =====
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 60)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    setIsDark(prefersDark)
    if (prefersDark) document.documentElement.classList.add('dark')
    
    // فعال کردن انیمیشن‌ها با تأخیر کم
    const timer = setTimeout(() => setIsVisible(true), 150)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark)
  }, [isDark])

  // ===== HERO SLIDER =====
  useEffect(() => {
    sliderIntervalRef.current = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroImages.length)
    }, 5000)
    return () => clearInterval(sliderIntervalRef.current)
  }, [])

  const goToSlide = (index) => {
    setCurrentSlide(index)
    clearInterval(sliderIntervalRef.current)
    sliderIntervalRef.current = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroImages.length)
    }, 5000)
  }

  // ===== COUNTERS ANIMATION ON SCROLL =====
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setCountersAnimated(true)
        }
      },
      { threshold: 0.3 }
    )
    
    if (statsRef.current) {
      observer.observe(statsRef.current)
    }
    
    return () => {
      if (statsRef.current) {
        observer.unobserve(statsRef.current)
      }
    }
  }, [])

  // ===== TOGGLE DARK MODE =====
  const toggleDark = () => setIsDark(!isDark)

  // ===== FORM HANDLER =====
  const handleSubmitConsultation = async (e) => {
    e.preventDefault()
    
    if (!formFullName.trim() || !formPhone.trim()) {
      setFormError('لطفاً نام و شماره موبایل را وارد کنید.')
      return
    }
    
    setIsSubmitting(true)
    
    try {
      // اینجا API صدا زده میشه
      await new Promise(resolve => setTimeout(resolve, 1500))
      setFormSuccess(true)
    } catch {
      setFormError('خطا در ثبت درخواست. لطفاً دوباره تلاش کنید.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // ===== AUTO TESTIMONIAL ROTATION =====
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  // ===== DATA =====
  const stats = [
    { 
      value: '۳,۰۰۰+', 
      label: 'دانش‌آموز موفق', 
      sub: 'که به هدفشون رسیدن', 
      icon: <Users className="w-10 h-10" />, 
      color: 'from-sky-400 to-sky-600', 
      barColor: 'from-sky-400 via-sky-500 to-sky-600',
      bgCard: 'bg-gradient-to-br from-sky-50 to-blue-50 dark:from-sky-950/60 dark:to-blue-950/40',
      borderCard: 'border-sky-200/70 dark:border-sky-700/40',
      iconBg: 'bg-gradient-to-br from-sky-400 to-sky-600',
      iconShadow: 'shadow-sky-500/40',
      glowColor: 'rgba(14, 165, 233, 0.3)'
    },
    { 
      value: '۵۰+', 
      label: 'مشاور برتر', 
      sub: 'با سابقه درخشان', 
      icon: <GraduationCap className="w-10 h-10" />, 
      color: 'from-purple-400 to-purple-600', 
      barColor: 'from-purple-400 via-purple-500 to-purple-600',
      bgCard: 'bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-950/60 dark:to-violet-950/40',
      borderCard: 'border-purple-200/70 dark:border-purple-700/40',
      iconBg: 'bg-gradient-to-br from-purple-400 to-purple-600',
      iconShadow: 'shadow-purple-500/40',
      glowColor: 'rgba(147, 51, 234, 0.3)'
    },
    { 
      value: '۱۰,۰۰۰+', 
      label: 'آزمون برگزار شده', 
      sub: 'با تحلیل هوشمند', 
      icon: <FileText className="w-10 h-10" />, 
      color: 'from-emerald-400 to-emerald-600', 
      barColor: 'from-emerald-400 via-emerald-500 to-emerald-600',
      bgCard: 'bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/60 dark:to-teal-950/40',
      borderCard: 'border-emerald-200/70 dark:border-emerald-700/40',
      iconBg: 'bg-gradient-to-br from-emerald-400 to-emerald-600',
      iconShadow: 'shadow-emerald-500/40',
      glowColor: 'rgba(16, 185, 129, 0.3)'
    },
    { 
      value: '۹۶٪', 
      label: 'رضایت کاربران', 
      sub: 'از خدمات ما', 
      icon: <Smile className="w-10 h-10" />, 
      color: 'from-amber-400 to-amber-600', 
      barColor: 'from-amber-400 via-amber-500 to-amber-600',
      bgCard: 'bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-950/60 dark:to-yellow-950/40',
      borderCard: 'border-amber-200/70 dark:border-amber-700/40',
      iconBg: 'bg-gradient-to-br from-amber-400 to-amber-600',
      iconShadow: 'shadow-amber-500/40',
      glowColor: 'rgba(245, 158, 11, 0.3)'
    },
  ]

  const services = [
    {
      icon: <Target className="w-9 h-9" />,
      title: 'برنامه‌ریزی نانو',
      frontDesc: 'برنامه‌ای که انگار برای DNA تو نوشته شده! هر روزت رو دقیق و هوشمند می‌چینیم.',
      backDesc: 'با تحلیل دقیق عادت‌های مطالعه، نقاط قوت و ضعف، و اهداف شخصی، یه برنامه کاملاً اختصاصی دریافت می‌کنی. هیچوقت سردرگم نمیشی و هر روز می‌دونی دقیقاً باید چیکار کنی.',
      color: 'from-blue-400 via-blue-500 to-blue-600',
      bgLight: 'bg-blue-50 dark:bg-blue-950/50',
      borderLight: 'border-blue-200/60 dark:border-blue-700/40',
      backBg: 'from-blue-600 to-indigo-700',
      darkBackBg: 'from-blue-900 to-indigo-950'
    },
    {
      icon: <Zap className="w-9 h-9" />,
      title: 'تکنیک‌های تست‌زنی',
      frontDesc: 'تست‌ها رو مثل آب خوردن بزنی! سرعت و دقتت رو چند برابر می‌کنیم.',
      backDesc: 'راز سرعت و دقت در تست‌زنی رو با تکنیک‌های انحصاری یاد می‌گیری. مدیریت زمان، روش‌های حذف گزینه، و استراتژی‌های برخورد با سوالات دشوار رو مسلط میشی.',
      color: 'from-purple-400 via-purple-500 to-purple-600',
      bgLight: 'bg-purple-50 dark:bg-purple-950/50',
      borderLight: 'border-purple-200/60 dark:border-purple-700/40',
      backBg: 'from-purple-600 to-violet-700',
      darkBackBg: 'from-purple-900 to-violet-950'
    },
    {
      icon: <Brain className="w-9 h-9" />,
      title: 'تندخوانی و تمرکز',
      frontDesc: 'یه کتاب رو تو یه شب ببلعی! تمرکزت مثل لیزر تیز میشه.',
      backDesc: 'تکنیک‌های علمی تندخوانی، تقویت حافظه، و افزایش تمرکز رو بهت یاد می‌دیم. دیگه ساعت‌ها پای کتاب نمیشینی بدون اینکه چیزی یاد بگیری!',
      color: 'from-pink-400 via-pink-500 to-pink-600',
      bgLight: 'bg-pink-50 dark:bg-pink-950/50',
      borderLight: 'border-pink-200/60 dark:border-pink-700/40',
      backBg: 'from-pink-600 to-rose-700',
      darkBackBg: 'from-pink-900 to-rose-950'
    },
    {
      icon: <Headphones className="w-9 h-9" />,
      title: 'پادکست‌های آموزشی',
      frontDesc: 'حین راه رفتنم یاد بگیر! یادگیری دیگه محدود به پشت میز نیست.',
      backDesc: 'مجموعه پادکست‌های اختصاصی رو هر جا که هستی گوش کن. توی اتوبوس، باشگاه، یا قبل از خواب. محتوای باکیفیت و جذاب که حوصله‌ات سر نره.',
      color: 'from-orange-400 via-orange-500 to-orange-600',
      bgLight: 'bg-orange-50 dark:bg-orange-950/50',
      borderLight: 'border-orange-200/60 dark:border-orange-700/40',
      backBg: 'from-orange-600 to-red-700',
      darkBackBg: 'from-orange-900 to-red-950'
    },
    {
      icon: <Bookmark className="w-9 h-9" />,
      title: 'جزوه‌های VIP',
      frontDesc: 'جزوه‌هایی که رقیبات آرزوشون رو دارن! خلاصه و نکته‌دار.',
      backDesc: 'خلاصه نکات طلایی هر درس، دسته‌بندی شده و آماده مرور سریع. این جزوه‌ها حاصل سال‌ها تجربه مشاوران برتر ماست و هر سال آپدیت میشن.',
      color: 'from-green-400 via-green-500 to-green-600',
      bgLight: 'bg-green-50 dark:bg-green-950/50',
      borderLight: 'border-green-200/60 dark:border-green-700/40',
      backBg: 'from-green-600 to-emerald-700',
      darkBackBg: 'from-green-900 to-emerald-950'
    },
    {
      icon: <Trophy className="w-9 h-9" />,
      title: 'آزمون‌های هوشمند',
      frontDesc: 'آزمونی که نقاط ضعفت رو لو میده! تحلیل ۱۰۰٪ دقیق.',
      backDesc: 'با آزمون‌های هوشمند، تحلیل کامل از عملکردت می‌گیری. نقاط قوت و ضعف، روند پیشرفت، و رتبه‌ات بین همه دانش‌آموزان رو ببین و هوشمندانه درس بخون.',
      color: 'from-yellow-400 via-yellow-500 to-yellow-600',
      bgLight: 'bg-yellow-50 dark:bg-yellow-950/50',
      borderLight: 'border-yellow-200/60 dark:border-yellow-700/40',
      backBg: 'from-yellow-600 to-amber-700',
      darkBackBg: 'from-yellow-900 to-amber-950'
    },
    {
      icon: <Heart className="w-9 h-9" />,
      title: 'روانشناس اختصاصی',
      frontDesc: 'حال دلت بده؟ یه روانشناس فقط برای تو داری!',
      backDesc: 'استرس امتحان، اضطراب کنکور، یا مشکلات شخصی — روانشناسان متخصص ما همیشه آماده کمک به تو هستن. ذهن آروم = نمره عالی!',
      color: 'from-rose-400 via-rose-500 to-rose-600',
      bgLight: 'bg-rose-50 dark:bg-rose-950/50',
      borderLight: 'border-rose-200/60 dark:border-rose-700/40',
      backBg: 'from-rose-600 to-pink-700',
      darkBackBg: 'from-rose-900 to-pink-950'
    },
    {
      icon: <Video className="w-9 h-9" />,
      title: 'تماس تصویری هفتگی',
      frontDesc: 'هفته‌ای ۲ بار مشاورت رو می‌بینی! انگار کنارته.',
      backDesc: 'مشاورت هفته‌ای ۲ بار از طریق تماس تصویری باهات صحبت می‌کنه، پیشرفتت رو چک می‌کنه و بهت انگیزه میده. حس یه رفیق واقعی که همیشه هوات رو داره!',
      color: 'from-cyan-400 via-cyan-500 to-cyan-600',
      bgLight: 'bg-cyan-50 dark:bg-cyan-950/50',
      borderLight: 'border-cyan-200/60 dark:border-cyan-700/40',
      backBg: 'from-cyan-600 to-teal-700',
      darkBackBg: 'from-cyan-900 to-teal-950'
    },
    {
      icon: <Star className="w-9 h-9" />,
      title: 'مشاوره رایگان ویژه',
      frontDesc: '۳ تا ۵ جلسه اول کاملاً رایگان! ریسکش صفره.',
      backDesc: 'چون به کیفیت کارمون ایمان داریم، ۳ تا ۵ جلسه اول مشاوره رو کاملاً رایگان ارائه می‌دیم. بیا و بدون هیچ ریسکی، طعم موفقیت رو بچش!',
      color: 'from-indigo-400 via-indigo-500 to-indigo-600',
      bgLight: 'bg-indigo-50 dark:bg-indigo-950/50',
      borderLight: 'border-indigo-200/60 dark:border-indigo-700/40',
      backBg: 'from-indigo-600 to-blue-700',
      darkBackBg: 'from-indigo-900 to-blue-950'
    },
    {
      icon: <Lock className="w-9 h-9" />,
      title: 'کانال VIP محرمانه',
      frontDesc: 'محتوایی که فقط VIPها می‌بینن! رازهای موفقیت رو فوت می‌کنیم.',
      backDesc: 'تحلیل سوالات پرتکرار، پیش‌بینی سوالات کنکور، و استراتژی‌های خاص که فقط در اختیار اعضای VIP قرار می‌گیره. این محتوا رو هیچ‌جای دیگه پیدا نمی‌کنی!',
      color: 'from-red-400 via-red-500 to-red-600',
      bgLight: 'bg-red-50 dark:bg-red-950/50',
      borderLight: 'border-red-200/60 dark:border-red-700/40',
      backBg: 'from-red-600 to-rose-700',
      darkBackBg: 'from-red-900 to-rose-950'
    },
  ]

  const steps = [
    { 
      stepNum: '۰۱', 
      icon: <CalendarCheck className="w-10 h-10" />, 
      title: 'درخواست مشاوره', 
      desc: 'فرم مشاوره رو پر کن تا کارشناسان ما ظرف ۲ ساعت باهات تماس بگیرن و نیازهات رو کامل بشناسن. کاملاً رایگان و بدون تعهد!',
      color: 'from-blue-400 to-blue-600',
      bgLight: 'bg-blue-50 dark:bg-blue-950/50',
      borderLight: 'border-blue-200/60 dark:border-blue-700/40',
      iconBg: 'bg-gradient-to-br from-blue-400 to-blue-600',
      iconShadow: 'shadow-blue-500/40'
    },
    { 
      stepNum: '۰۲', 
      icon: <UserCheck className="w-10 h-10" />, 
      title: 'انتخاب مشاور توسط تیم ما', 
      desc: 'تیم پشتیبانی ما با بررسی دقیق نیازها و روحیاتت، بهترین مشاور رو از بین برترین متخصصان ایران برات انتخاب می‌کنه.',
      color: 'from-purple-400 to-purple-600',
      bgLight: 'bg-purple-50 dark:bg-purple-950/50',
      borderLight: 'border-purple-200/60 dark:border-purple-700/40',
      iconBg: 'bg-gradient-to-br from-purple-400 to-purple-600',
      iconShadow: 'shadow-purple-500/40'
    },
    { 
      stepNum: '۰۳', 
      icon: <Target className="w-10 h-10" />, 
      title: 'دریافت برنامه اختصاصی', 
      desc: 'یه برنامه نانو شده مخصوص خودت دریافت می‌کنی. انگار که برای DNA تو نوشته شده! با قدرت شروع کن و پیش برو.',
      color: 'from-pink-400 to-pink-600',
      bgLight: 'bg-pink-50 dark:bg-pink-950/50',
      borderLight: 'border-pink-200/60 dark:border-pink-700/40',
      iconBg: 'bg-gradient-to-br from-pink-400 to-pink-600',
      iconShadow: 'shadow-pink-500/40'
    },
    { 
      stepNum: '۰۴', 
      icon: <Rocket className="w-10 h-10" />, 
      title: 'اوج بگیر!', 
      desc: 'با پشتیبانی ۲۴ ساعته و پیگیری مداوم تیم ما، به رتبه‌ای که همیشه آرزوش رو داشتی می‌رسی. ما تا روز کنکور کنارتیم!',
      color: 'from-amber-400 to-amber-600',
      bgLight: 'bg-amber-50 dark:bg-amber-950/50',
      borderLight: 'border-amber-200/60 dark:border-amber-700/40',
      iconBg: 'bg-gradient-to-br from-amber-400 to-amber-600',
      iconShadow: 'shadow-amber-500/40'
    },
  ]

  const testimonials = [
    { name: 'علی محمدی', grade: 'قبولی پزشکی تهران', text: 'بهترین تصمیم زندگیم ثبت‌نام تو ابرا بود! از رتبه ۸۰۰۰ رسیدم به ۲۰۰۰ و پزشکی تهران قبول شدم. باورنکردنیه! برنامه‌ریزیشون فوق‌العاده‌ست و مشاورم واقعاً پیگیر بود.', color: 'from-blue-400 to-blue-600', rating: 5, avatar: 'ع' },
    { name: 'سارا احمدی', grade: 'قبولی حقوق تهران', text: 'مشاورم مثل خواهرم بود! همیشه پیگیر بود و واقعاً به فکر موفقیت من. پادکست‌ها و جزوه‌هاشون عالیه. بدون ابرا هرگز حقوق تهران قبول نمی‌شدم.', color: 'from-purple-400 to-purple-600', rating: 5, avatar: 'س' },
    { name: 'محمد رضایی', grade: 'قبولی مهندسی شریف', text: 'آزمون‌های هوشمندشون فوق‌العاده‌ست! دقیقاً نقاط ضعفم رو نشون میداد. الان می‌دونم چی کار کنم و با اعتماد به نفس رفتم سر جلسه. مهندسی شریف قبول شدم!', color: 'from-pink-400 to-pink-600', rating: 5, avatar: 'م' },
    { name: 'فاطمه کرمی', grade: 'قبولی دندانپزشکی', text: 'روانشناس ابرا واقعاً بهم کمک کرد استرسم رو کنترل کنم. الان با آرامش درس می‌خونم و دندانپزشکی قبول شدم. مرسی ابرا که کنارم بودی!', color: 'from-emerald-400 to-emerald-600', rating: 5, avatar: 'ف' },
    { name: 'حسین مرادی', grade: 'رتبه ۵۰۰ کنکور', text: 'تکنیک‌های تست‌زنی ابرا معجزه کرد! سرعتم ۳ برابر شد و تعداد غلط‌هام به حداقل رسید. رتبه ۵۰۰ کنکور رو مدیون ابرا هستم.', color: 'from-orange-400 to-orange-600', rating: 5, avatar: 'ح' },
    { name: 'زهرا موسوی', grade: 'قبولی داروسازی', text: 'جزوه‌های VIP ابرا بهترین منبع مطالعاتیم بودن. همه نکات کنکوری رو پوشش میدادن. داروسازی قبول شدم و این موفقیت رو مدیون ابرا هستم!', color: 'from-cyan-400 to-cyan-600', rating: 5, avatar: 'ز' },
  ]

  const [faqFilter, setFaqFilter] = useState('all')

  const faqs = [
    {
      q: 'آکادمی ابرا چه خدماتی ارائه می‌دهد؟',
      a: 'آکادمی ابرا یک پلتفرم جامع مشاوره تحصیلی است که خدمات برنامه‌ریزی درسی، برگزاری آزمون‌های آنلاین، ارائه محتوای آموزشی، پشتیبانی روانشناسی و مشاوره تخصصی کنکور را به دانش‌آموزان ارائه می‌دهد.',
      icon: <GraduationCap className="w-5 h-5" />,
      bg: '#EFF6FF',
      color: '#2563EB',
      gradient: 'linear-gradient(180deg, #3B82F6, #2563EB)',
      category: 'education',
      categoryLabel: '🎓 تحصیلی',
    },
    {
      q: 'هزینه خدمات آکادمی ابرا چقدر است؟',
      a: 'هزینه خدمات بسته به نوع برنامه و سطح مشاوره متفاوت است. برای دریافت اطلاعات دقیق، فرم مشاوره رایگان را تکمیل کنید تا کارشناسان ما با شما تماس بگیرند.',
      icon: <Shield className="w-5 h-5" />,
      bg: '#ECFDF5',
      color: '#10B981',
      gradient: 'linear-gradient(180deg, #10B981, #059669)',
      category: 'payment',
      categoryLabel: '💰 هزینه',
    },
    {
      q: 'آیا اطلاعات من محرمانه می‌ماند؟',
      a: 'بله، امنیت اطلاعات شما برای ما در اولویت است. تمام داده‌ها با پروتکل‌های امنیتی پیشرفته محافظت می‌شوند و فقط افراد مجاز به آنها دسترسی دارند.',
      icon: <Lock className="w-5 h-5" />,
      bg: '#F5F3FF',
      color: '#8B5CF6',
      gradient: 'linear-gradient(180deg, #8B5CF6, #7C3AED)',
      category: 'security',
      categoryLabel: '🔒 امنیت',
    },
    {
      q: 'ساعات پشتیبانی آکادمی چگونه است؟',
      a: 'تیم پشتیبانی ما همه روزه از ساعت ۸ صبح تا ۱۰ شب آماده پاسخگویی به سوالات شماست. در روزهای تعطیل نیز از طریق پیامک می‌توانید با ما در ارتباط باشید.',
      icon: <Phone className="w-5 h-5" />,
      bg: '#FFF7ED',
      color: '#F59E0B',
      gradient: 'linear-gradient(180deg, #F59E0B, #D97706)',
      category: 'support',
      categoryLabel: '📞 پشتیبانی',
    },
    {
      q: 'چطور می‌توانم در آکادمی ثبت‌نام کنم؟',
      a: 'برای ثبت‌نام کافی است فرم مشاوره رایگان را در صفحه اصلی تکمیل کنید. تیم ما با شما تماس می‌گیرد و پس از مشاوره اولیه، حساب کاربری شما فعال می‌شود.',
      icon: <Users className="w-5 h-5" />,
      bg: '#FDF2F8',
      color: '#EC4899',
      gradient: 'linear-gradient(180deg, #EC4899, #DB2777)',
      category: 'register',
      categoryLabel: '📝 ثبت‌نام',
    },
    {
      q: 'گزارش‌های پیشرفت چگونه ارائه می‌شوند؟',
      a: 'دانش‌آموزان به صورت روزانه گزارش کار ثبت می‌کنند و مشاوران با تحلیل این گزارش‌ها، نمودارهای پیشرفت و کارنامه‌های دقیق را در اختیار دانش‌آموز و والدین قرار می‌دهند.',
      icon: <BarChart3 className="w-5 h-5" />,
      bg: '#ECFEFF',
      color: '#06B6D4',
      gradient: 'linear-gradient(180deg, #06B6D4, #0891B2)',
      category: 'education',
      categoryLabel: '🎓 تحصیلی',
    },
  ]

  const [activeSlide, setActiveSlide] = useState(0);
  const carouselRef = useRef(null);

  const scrollToSlide = (index) => {
    const clamped = Math.max(0, Math.min(index, services.length - 1));
    const card = carouselRef.current?.children[clamped];
    if (card) {
      card.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }
    setActiveSlide(clamped);
  };

  const handleCarouselScroll = () => {
    if (!carouselRef.current) return;
    const track = carouselRef.current;
    const trackCenter = track.scrollLeft + track.offsetWidth / 2;
    let closestIndex = 0;
    let closestDistance = Infinity;
    Array.from(track.children).forEach((card, i) => {
      const cardCenter = card.offsetLeft + card.offsetWidth / 2;
      const distance = Math.abs(trackCenter - cardCenter);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = i;
      }
    });
    setActiveSlide(closestIndex);
  };


  // ===== STEPS SECTION - چت مشاور =====
  const chatSectionRef = useRef(null);
  const [chatRevealCount, setChatRevealCount] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const chatStarted = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !chatStarted.current) {
          chatStarted.current = true;
          runChatSequence();
        }
      },
      { threshold: 0.25 }
    );
    if (chatSectionRef.current) observer.observe(chatSectionRef.current);
    return () => observer.disconnect();
  }, []);

  const runChatSequence = () => {
    const totalMessages = steps.length + 1; // +۱ برای پیام خوش‌آمد
    let i = 0;

    const showNext = () => {
      if (i >= totalMessages) return;
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        setChatRevealCount((prev) => prev + 1);
        i += 1;
        if (i < totalMessages) {
          setTimeout(showNext, 500);
        }
      }, 900);
    };

    showNext();
  };

  const toPersianDigits = (num) =>
    num.toString().replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[d]);

  const journeyStats = [
    { icon: <Star className="w-6 h-6" />, value: '۹۸٪', label: 'رضایت دانش‌آموزان' },
    { icon: <Smile className="w-6 h-6" />, value: '+۱۲۰۰', label: 'دانش‌آموز موفق' },
    { icon: <Trophy className="w-6 h-6" />, value: '+۸۵۰', label: 'رتبه زیر ۱۰۰۰ کنکور' },
  ];

  const serviceStats = [
    { icon: <Smile className="w-6 h-6" />, value: '۹۸٪', label: 'رضایت بالا', color: 'from-sky-400 to-sky-600' },
    { icon: <Users className="w-6 h-6" />, value: '+۲۰K', label: 'دانش‌آموزان', color: 'from-purple-400 to-purple-600' },
    { icon: <ShieldCheck className="w-6 h-6" />, value: 'تخصصی', label: 'مشاوره', color: 'from-emerald-400 to-emerald-600' },
    { icon: <Trophy className="w-6 h-6" />, value: 'درخشان', label: 'نتایج', color: 'from-amber-400 to-amber-600' },
  ];

  return (
    <div className="min-h-screen transition-colors duration-500" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      
      {/* ===== NAVBAR ===== */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ${
        isScrolled 
          ? 'glass-heavy shadow-2xl shadow-sky-500/10 dark:shadow-sky-500/5' 
          : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            
            {/* Logo - بدون متن ابرا */}
            <Link to="/" className="flex items-center gap-3 group">
              <div className="relative">
                <div className="absolute inset-0 bg-sky-400 rounded-2xl blur-lg opacity-50 group-hover:opacity-100 transition-all duration-500"></div>
                <div className="relative w-12 h-12 rounded-2xl overflow-hidden shadow-xl shadow-sky-500/30 group-hover:scale-110 transition-all duration-500">
                  <img src="/logo.png" alt="آکادمی ابرا" className="w-full h-full object-cover" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-tight">
                  <span className="bg-gradient-to-r from-sky-500 via-sky-600 to-navy-700 dark:from-sky-400 dark:via-sky-300 dark:to-white bg-clip-text text-transparent animate-gradient">آکادمی ابرا</span>
                </h1>
                <p className="text-[10px] text-gray-500 dark:text-gray-400 tracking-[0.3em] uppercase font-medium">برترین در مشاوره تحصیلی</p>
              </div>
            </Link>

            {/* Desktop Menu */}
            <div className="hidden lg:flex items-center gap-1 mr-auto pr-8">
              {[
                { name: 'خانه', href: '#', active: true },
                { name: 'خدمات', href: '#services' },
                { name: 'مسیر موفقیت', href: '#steps' },
                { name: 'نظرات', href: '#testimonials' },
                { name: 'سوالات', href: '#faq' },
                { name: 'تماس', href: '#footer' },
              ].map((item, index) => (
                <a 
                  key={index} 
                  href={item.href} 
                  className={`nav-link relative px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
                    item.active 
                      ? 'text-sky-600 dark:text-sky-400 bg-sky-50/80 dark:bg-sky-900/30 shadow-sm active' 
                      : 'text-gray-600 dark:text-gray-300 hover:text-sky-500 dark:hover:text-sky-400 hover:bg-gray-50/80 dark:hover:bg-navy-800/80'
                  }`}
                >
                  {item.name}
                </a>
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <button 
                onClick={toggleDark}
                className="relative w-16 h-8 rounded-full bg-gray-200 dark:bg-navy-700 transition-all duration-500 p-1 hover:scale-105"
                aria-label="تغییر تم"
              >
                <div className={`absolute top-1 w-6 h-6 rounded-full bg-white shadow-lg transform transition-all duration-500 flex items-center justify-center ${
                  isDark ? 'left-1 bg-navy-800' : 'right-1'
                }`}>
                  {isDark ? <Moon className="w-3.5 h-3.5 text-amber-400" /> : <Sun className="w-3.5 h-3.5 text-amber-500" />}
                </div>
              </button>
              
              <Link 
                to="/login"
                className="hidden lg:flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white rounded-2xl font-semibold text-sm transition-all duration-300 hover:shadow-xl hover:shadow-sky-500/30 hover:-translate-y-0.5 active:scale-95 btn-shimmer"
              >
                <LogIn className="w-4 h-4" />
                ورود به پنل
              </Link>

              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="lg:hidden p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-navy-800 transition-all"
                aria-label="منو"
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <div className={`lg:hidden transition-all duration-500 overflow-hidden ${
          isMenuOpen ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'
        }`}>
          <div className="glass-heavy mx-4 mb-4 rounded-2xl p-5 space-y-2 shadow-2xl">
            {['خانه', 'خدمات', 'مسیر موفقیت', 'نظرات', 'سوالات', 'تماس'].map((item, index) => (
              <a 
                key={index} 
                href="#" 
                className="block py-3.5 px-4 rounded-xl text-gray-700 dark:text-gray-200 hover:text-sky-500 dark:hover:text-sky-400 hover:bg-sky-50 dark:hover:bg-navy-700 transition-all font-semibold text-sm"
                onClick={() => setIsMenuOpen(false)}
              >
                {item}
              </a>
            ))}
            <Link 
              to="/login"
              className="block w-full text-center py-3.5 bg-gradient-to-r from-sky-500 to-sky-600 text-white rounded-2xl font-semibold text-sm mt-3"
              onClick={() => setIsMenuOpen(false)}
            >
              <LogIn className="w-4 h-4 inline-block ml-1" />
              ورود به پنل
            </Link>
          </div>
        </div>
      </nav>

      {/* ===== SVG Clip Path Definitions (فقط یه بار توی صفحه کافیه) ===== */}
      <svg className="hero-v3-clip-defs" aria-hidden="true">
        <defs>
          {/* پنج‌ضلعی عکس — گوشه‌های چپ کاملاً تیز، فقط نوک راست گرد */}
          <clipPath id="pentagon-clip-desktop" clipPathUnits="objectBoundingBox">
            <path d="M 0,0 L 0.6120,0 Q 0.6400,0 0.6548,0.0238 L 0.9384,0.4813 Q 0.9500,0.5000 0.9384,0.5187 L 0.6548,0.9762 Q 0.6400,1 0.6120,1 L 0,1 Z"></path>
          </clipPath>

          {/* قاب دور محتوا — با بریدگی سه‌گوش که با نوک پنج‌ضلعی قفل می‌شه */}
          <clipPath id="content-frame-clip-desktop" clipPathUnits="objectBoundingBox">
            <path d="M 0.0107,0.5333 Q 0.0000,0.5000 0.0107,0.4667 L 0.1493,0.0333 Q 0.1600,0.0000 0.1950,0.0000 L 0.8300,0.0000 Q 0.9200,0.0000 0.9200,0.0900 L 0.9200,0.9100 Q 0.9200,1.0000 0.8300,1.0000 L 0.1950,1.0000 Q 0.1600,1.0000 0.1493,0.9667 L 0.0107,0.5333 Z"></path>
          </clipPath>
        </defs>
      </svg>

      {/* ===== HERO SECTION WITH SLIDER ===== */}
      {/* ===== HERO V3 FINAL — Image LEFT, Text RIGHT ===== */}
      <section className="hero-v3">
        {/* Background Decorations */}
        <div className="hero-v3-bg-glow-1"></div>
        <div className="hero-v3-bg-glow-2"></div>

        {/* ===== Image Section (LEFT SIDE) ===== */}
        <div className="hero-v3-image-wrapper">
          <div className="hero-v3-pentagon-shape">
            {heroImages.map((img, index) => (
              <img
                key={index}
                src={img}
                alt={`اسلاید ${index + 1}`}
                className={index === currentSlide ? 'active' : ''}
              />
            ))}
            <div className="hero-v3-pentagon-border"></div>
          </div>

          {/* Slider Dots */}
          <div className="hero-v3-image-dots">
            {heroImages.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`hero-v3-image-dot ${index === currentSlide ? 'active' : ''}`}
                aria-label={`اسلاید ${index + 1}`}
              ></button>
            ))}
          </div>
        </div>

        {/* ===== Decorative Content Frame (قاب دور متن) ===== */}
        <div className="hero-v3-content-frame"></div>

        {/* ===== Dot-grid Decorations ===== */}
        <div className="hero-v3-dots hero-v3-dots-top"></div>
        <div className="hero-v3-dots hero-v3-dots-bottom"></div>

        {/* ===== Text Content (RIGHT SIDE) ===== */}
        <div className={`hero-v3-content ${isVisible ? 'animate-fade-in-up' : ''}`}>
          {/* Title */}
          <h1 className="hero-v3-title">
            با <span className="hl-blue">ما</span>،<br />
            تا <span className="hl-blue">آسمون</span><br />
            <span className="hl-gold">اوج بگیر!</span>
          </h1>

          {/* Subtitle with bullet */}
          <div className="hero-v3-subtitle-row">
            <span className="hero-v3-subtitle-dot"></span>
            <p className="hero-v3-subtitle">
              برنامه‌ریزی هوشمند، مشاوره VIP، آزمون‌های حرفه‌ای و روانشناسی اختصاصی —
              همه زیر یک سقف، فقط برای موفقیت تو.
            </p>
          </div>

          {/* Single CTA Button */}
          <a href="#consultation-form" className="hero-v3-cta btn-shimmer">
            <span className="hero-v3-cta-icon">
              <ArrowLeft className="w-5 h-5" />
            </span>
            <span className="hero-v3-cta-text">به آکادمی ابرا خوش آمدید</span>
          </a>
        </div>
      </section>


      {/* شروع */}
      {/* ===== SERVICES SECTION ===== */}
      <section id="services" className="py-24 lg:py-32 relative overflow-hidden">
        {/* تزئینات پس‌زمینه - پررنگ‌تر شده برای پر کردن فضای خالی */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[3%] right-[2%] w-[500px] h-[500px] bg-sky-400/8 dark:bg-sky-500/6 rounded-full blur-[150px]"></div>
          <div className="absolute bottom-[3%] left-[2%] w-[600px] h-[600px] bg-purple-400/8 dark:bg-purple-500/6 rounded-full blur-[180px]"></div>
          <div className="absolute top-[45%] left-[8%] w-[300px] h-[300px] bg-amber-400/6 dark:bg-amber-500/5 rounded-full blur-[120px]"></div>
          {/* الگوی نقطه‌ای تزئینی */}
          <div className="hidden lg:grid absolute top-[8%] left-[4%] grid-cols-4 gap-2 opacity-30">
            {Array.from({ length: 16 }).map((_, i) => (
              <div key={i} className="w-1.5 h-1.5 rounded-full bg-sky-400"></div>
            ))}
          </div>
          <div className="hidden lg:grid absolute bottom-[10%] right-[4%] grid-cols-4 gap-2 opacity-30">
            {Array.from({ length: 16 }).map((_, i) => (
              <div key={i} className="w-1.5 h-1.5 rounded-full bg-purple-400"></div>
            ))}
          </div>
        </div>

        <div className="max-w-6xl mx-auto relative z-10 px-4">

          {/* هدر بخش */}
          <div className="text-center mb-14 lg:mb-20">
            <div className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 text-sm font-semibold mb-8 border-2 border-sky-200/60 dark:border-sky-700/40 backdrop-blur-sm shadow-md">
              <Sparkles className="w-4 h-4" />
              خدمات ویژه ما
              <Sparkles className="w-4 h-4" />
            </div>

            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black mb-8">
              <span className="text-gray-900 dark:text-white">چرا </span>
              <span className="text-gradient-sky">آکادمی ما</span>
              <span className="text-gray-900 dark:text-white"> رو</span>
              <br />
              <span className="text-gradient-rainbow">انتخاب کنی؟</span>
            </h2>

            <div className="flex items-center justify-center gap-3 mb-8">
              <div className="w-20 h-1.5 bg-gradient-to-r from-transparent to-sky-400 rounded-full"></div>
              <div className="w-6 h-6 bg-sky-500 rounded-full shadow-xl shadow-sky-500/50 animate-pulse"></div>
              <div className="w-20 h-1.5 bg-gradient-to-l from-transparent to-sky-400 rounded-full"></div>
            </div>

            <p className="text-gray-600 dark:text-gray-300 text-lg max-w-3xl mx-auto leading-relaxed">
              یه دنیا سرویس <span className="text-sky-500 dark:text-sky-400 font-bold text-xl">حرفه‌ای</span> که
              هر دانش‌آموزی <span className="text-amber-500 dark:text-amber-400 font-bold text-xl">آرزوش</span> رو داره!
            </p>
          </div>

          {/* ===== دسکتاپ: مدار دور لوگو با فلیپ‌بک ===== */}
          <div className="hidden lg:block services-orbit max-w-5xl mx-auto aspect-[16/10] mb-16">
            <svg className="services-orbit-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
              <line x1="50" y1="50" x2="16.67" y2="16.67" />
              <line x1="50" y1="50" x2="50" y2="16.67" />
              <line x1="50" y1="50" x2="83.33" y2="16.67" />
              <line x1="50" y1="50" x2="16.67" y2="50" />
              <line x1="50" y1="50" x2="83.33" y2="50" />
              <line x1="50" y1="50" x2="16.67" y2="83.33" />
              <line x1="50" y1="50" x2="50" y2="83.33" />
              <line x1="50" y1="50" x2="83.33" y2="83.33" />
            </svg>

            <div className="services-orbit-grid">
              {services.slice(0, 4).map((service, i) => (
                <div key={i} className="service-flip" tabIndex={0}>
                  <div className="service-flip-inner">
                    <div className={`service-flip-front border-2 ${service.borderLight} shadow-lg`}>
                      <div className={`icon-glossy w-14 h-14 bg-gradient-to-br ${service.color} flex items-center justify-center text-white mb-3`}>
                        {service.icon}
                      </div>
                      <h3 className="text-sm font-bold mb-1.5 text-gray-800 dark:text-white">{service.title}</h3>
                      <p className="text-gray-500 dark:text-gray-400 text-xs leading-relaxed">{service.frontDesc}</p>
                    </div>
                    <div className={`service-flip-back bg-gradient-to-br ${service.backBg} dark:bg-gradient-to-br ${service.darkBackBg}`}>
                      <CheckCircle className="w-8 h-8 text-amber-400 mb-3 drop-shadow-lg" />
                      <h3 className="text-sm font-bold mb-2 text-white">{service.title}</h3>
                      <p className="text-white/95 text-xs leading-loose">{service.backDesc}</p>
                    </div>
                  </div>
                </div>
              ))}

              {/* لوگوی مرکزی */}
              <div className="services-orbit-center">
                <div className="services-orbit-center-ring"></div>
                <div className="services-orbit-center-ring-2"></div>
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-sky-400 to-sky-600 shadow-2xl shadow-sky-500/40 flex items-center justify-center">
                  <Cloud className="w-9 h-9 text-white" />
                </div>
              </div>

              {services.slice(4, 8).map((service, i) => (
                <div key={i + 4} className="service-flip" tabIndex={0}>
                  <div className="service-flip-inner">
                    <div className={`service-flip-front border-2 ${service.borderLight} shadow-lg`}>
                      <div className={`icon-glossy w-14 h-14 bg-gradient-to-br ${service.color} flex items-center justify-center text-white mb-3`}>
                        {service.icon}
                      </div>
                      <h3 className="text-sm font-bold mb-1.5 text-gray-800 dark:text-white">{service.title}</h3>
                      <p className="text-gray-500 dark:text-gray-400 text-xs leading-relaxed">{service.frontDesc}</p>
                    </div>
                    <div className={`service-flip-back bg-gradient-to-br ${service.backBg} dark:bg-gradient-to-br ${service.darkBackBg}`}>
                      <CheckCircle className="w-8 h-8 text-amber-400 mb-3 drop-shadow-lg" />
                      <h3 className="text-sm font-bold mb-2 text-white">{service.title}</h3>
                      <p className="text-white/95 text-xs leading-loose">{service.backDesc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ===== موبایل/تبلت: کاروسل ===== */}
          <div className="lg:hidden mb-10">
            <div
              ref={carouselRef}
              onScroll={handleCarouselScroll}
              className="services-carousel-track"
            >
              {services.map((service, i) => (
                <div key={i} className="services-carousel-card">
                  <div className={`icon-glossy w-24 h-24 bg-gradient-to-br ${service.color} flex items-center justify-center text-white mb-5`}>
                    {service.icon}
                  </div>
                  <h3 className="text-lg font-bold mb-3 text-gray-800 dark:text-white">{service.title}</h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed mb-6">{service.frontDesc}</p>
                  <a
                    href="#consultation-form"
                    className={`inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r ${service.color} text-white font-bold text-sm shadow-lg`}
                  >
                    جزئیات بیشتر
                    <ChevronLeft className="w-4 h-4" />
                  </a>
                </div>
              ))}
            </div>

            {/* پیکان‌ها + نقطه‌ها */}
            <div className="flex items-center justify-center gap-6 mt-2">
              <button
                onClick={() => scrollToSlide(activeSlide + 1)}
                aria-label="خدمت بعدی"
                className="services-carousel-arrow"
              >
                <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              </button>

              <div className="services-carousel-dots">
                {services.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => scrollToSlide(i)}
                    aria-label={`رفتن به خدمت ${i + 1}`}
                    className={`services-carousel-dot ${i === activeSlide ? 'active' : ''}`}
                  />
                ))}
              </div>

              <button
                onClick={() => scrollToSlide(activeSlide - 1)}
                aria-label="خدمت قبلی"
                className="services-carousel-arrow"
              >
                <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              </button>
            </div>
          </div>

          {/* ===== نوار آمار - برای پر کردن فضای خالی ===== */}
          <div className="services-stats-bar max-w-4xl mx-auto mb-16">
            {serviceStats.map((stat, i) => (
              <div key={i} className="flex flex-col items-center text-center gap-2">
                <div className={`icon-glossy w-12 h-12 bg-gradient-to-br ${stat.color} flex items-center justify-center text-white`}>
                  {stat.icon}
                </div>
                <span className="font-black text-lg text-gray-800 dark:text-white">{stat.value}</span>
                <span className="text-gray-500 dark:text-gray-400 text-xs">{stat.label}</span>
              </div>
            ))}
          </div>

          {/* بنر پیشنهاد ویژه - بدون تغییر ساختاری، فقط آیکون گلاسی شد */}
          <div
            className="p-10 lg:p-14 rounded-3xl relative overflow-hidden border-2 border-amber-300/40 dark:border-amber-600/30 max-w-4xl mx-auto"
            style={{
              background: 'linear-gradient(135deg, rgba(251,191,36,0.12) 0%, rgba(245,158,11,0.06) 30%, rgba(14,165,233,0.06) 70%, rgba(139,92,246,0.06) 100%)'
            }}
          >
            <div className="absolute -top-20 -left-20 w-60 h-60 bg-amber-400/15 dark:bg-amber-400/20 rounded-full blur-[100px] animate-pulse-glow"></div>
            <div className="absolute -bottom-20 -right-20 w-60 h-60 bg-sky-400/15 dark:bg-sky-400/20 rounded-full blur-[100px] animate-pulse-glow" style={{ animationDelay: '2s' }}></div>

            <div className="relative z-10 text-center">
              <div className="icon-glossy inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-amber-400 to-amber-600 shadow-2xl shadow-amber-500/40 mb-6 animate-float">
                <Gift className="w-10 h-10 text-white" />
              </div>

              <div className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 font-bold text-base mb-6 border-2 border-amber-200/60 dark:border-amber-700/40 backdrop-blur-sm shadow-md">
                <Crown className="w-5 h-5" />
                پیشنهاد استثنائی
                <Crown className="w-5 h-5" />
              </div>

              <h3 className="text-3xl lg:text-4xl font-black text-gray-800 dark:text-white mb-6 leading-tight">
                <span className="text-gradient-gold">۳ تا ۵ جلسه اول</span> مشاوره
                <br />
                کاملاً <span className="text-gradient-gold">رایگان</span> و بدون تعهد!
              </h3>

              <p className="text-gray-600 dark:text-gray-300 text-lg lg:text-xl max-w-2xl mx-auto mb-8 leading-relaxed font-medium">
                این یه فرصت <span className="text-amber-500 dark:text-amber-400 font-bold">طلاییه</span> که
                <span className="text-sky-500 dark:text-sky-400 font-bold"> بدون هیچ ریسکی </span>
                کیفیت مشاوره ما رو بسنجی.
                <span className="text-amber-500 dark:text-amber-400 font-bold"> ۳ تا ۵ جلسه رایگان </span>
                یعنی یه ماه کامل راهنمایی اختصاصی،
                <span className="font-extrabold text-gray-800 dark:text-white"> بدون پرداخت حتی یک تومان!</span>
              </p>

              <div className="flex flex-wrap items-center justify-center gap-4 mb-10">
                {[
                  { icon: <BadgeCheck className="w-5 h-5 text-emerald-500" />, text: 'بدون هیچ تعهدی' },
                  { icon: <Shield className="w-5 h-5 text-sky-500" />, text: 'تضمین کیفیت' },
                  { icon: <Clock className="w-5 h-5 text-purple-500" />, text: 'شروع فوری' },
                  { icon: <TrendingUp className="w-5 h-5 text-amber-500" />, text: 'پیشرفت محسوس از همون جلسه اول' },
                ].map((feature, i) => (
                  <span key={i} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/80 dark:bg-navy-800/80 border border-gray-200/60 dark:border-navy-700/40 text-sm font-semibold text-gray-700 dark:text-gray-200 shadow-md backdrop-blur-sm">
                    {feature.icon}
                    {feature.text}
                  </span>
                ))}
              </div>

              <a
                href="#consultation-form"
                className="inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-amber-400 to-amber-600 hover:from-amber-500 hover:to-amber-700 text-gray-900 rounded-2xl font-black text-xl transition-all duration-300 hover:shadow-[0_0_60px_rgba(251,191,36,0.5)] hover:-translate-y-1.5 active:scale-95 btn-shimmer btn-shimmer-gold"
              >
                <Rocket className="w-6 h-6" />
                می‌خوام رایگان شروع کنم!
              </a>
            </div>
          </div>
        </div>
      </section>
      {/* ===== STEPS SECTION - گفتگو با مشاور آکادمی ===== */}
      <section id="steps" ref={chatSectionRef} className="py-24 lg:py-32 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-sky-50/50 to-transparent dark:via-navy-800/40 pointer-events-none"></div>

        <div className="max-w-3xl mx-auto relative z-10">

          {/* هدر بخش */}
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 text-sm font-semibold mb-8 border-2 border-purple-200/60 dark:border-purple-700/40 backdrop-blur-sm shadow-md">
              <Sparkles className="w-4 h-4" />
              مسیر موفقیت
              <Sparkles className="w-4 h-4" />
            </div>

            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black mb-6">
              فقط <span className="text-gradient-rainbow">۴ قدم</span>
              <br />
              <span className="text-gray-800 dark:text-white">تا اوج گرفتن!</span>
            </h2>

            <p className="text-gray-600 dark:text-gray-300 text-lg max-w-xl mx-auto leading-relaxed">
              بذار خودمون قدم‌به‌قدم برات تعریف کنیم، همین الان.
            </p>
          </div>

          {/* ===== پنجره چت ===== */}
          <div className="chat-window">

            {/* هدر چت */}
            <div className="chat-header">
              <div className="relative">
                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-sky-400 to-sky-600 flex items-center justify-center shadow-lg">
                  <Cloud className="w-6 h-6 text-white" />
                </div>
                <span className="chat-online-dot"></span>
              </div>
              <div>
                <h4 className="font-bold text-sm text-gray-800 dark:text-white">مشاور آکادمی ابر</h4>
                <span className="text-xs text-emerald-500 font-medium">آنلاین · آماده‌ی راهنمایی</span>
              </div>
            </div>

            {/* بدنه چت */}
            <div className="chat-body">

              {/* پیام خوش‌آمد */}
              <div className={`chat-bubble-wrap ${chatRevealCount > 0 ? 'chat-visible' : ''}`}>
                <div className="chat-avatar">
                  <Cloud className="w-4 h-4 text-white" />
                </div>
                <div className="chat-bubble chat-bubble-advisor">
                  سلام! خوش اومدی 👋 بذار تو ۴ قدم ساده نشونت بدم چطور می‌رسی به هدفت.
                </div>
              </div>

              {/* پیام هر مرحله */}
              {steps.map((item, index) => (
                <div
                  key={index}
                  className={`chat-bubble-wrap ${chatRevealCount > index + 1 ? 'chat-visible' : ''}`}
                >
                  <div className={`chat-avatar bg-gradient-to-br ${item.color}`}>
                    {item.icon}
                  </div>
                  <div className="chat-bubble chat-bubble-advisor">
                    <span className="chat-step-tag">قدم {toPersianDigits(index + 1)}</span>
                    <strong className="block text-sm mb-1">{item.title}</strong>
                    <span className="text-sm opacity-90 leading-relaxed">{item.desc}</span>
                  </div>
                </div>
              ))}

              {/* نشانگر "در حال تایپ..." */}
              <div className={`chat-bubble-wrap ${isTyping ? 'chat-visible' : 'chat-hidden-instant'}`}>
                <div className="chat-avatar">
                  <Cloud className="w-4 h-4 text-white" />
                </div>
                <div className="chat-bubble chat-bubble-advisor chat-typing-bubble">
                  <span className="chat-typing-dot"></span>
                  <span className="chat-typing-dot"></span>
                  <span className="chat-typing-dot"></span>
                </div>
              </div>

              {/* پیام پایانی + دکمه CTA - فقط بعد از تمام‌شدن همه پیام‌ها */}
              <div className={`chat-bubble-wrap ${chatRevealCount > steps.length && !isTyping ? 'chat-visible' : ''}`}>
                <div className="chat-avatar">
                  <Cloud className="w-4 h-4 text-white" />
                </div>
                <div className="chat-bubble chat-bubble-advisor">
                  همینه! فقط همین ۴ قدم. آماده‌ای شروع کنیم؟ 🚀
                </div>
              </div>

              <div className={`chat-cta-wrap ${chatRevealCount > steps.length && !isTyping ? 'chat-visible' : ''}`}>
                <a href="#consultation-form" className="chat-cta-btn">
                  <Rocket className="w-4 h-4" />
                  بله، می‌خوام شروع کنم
                </a>
              </div>
            </div>
          </div>

          {/* ===== نوار آمار کوچک زیر چت ===== */}
          <div className="chat-stats-row">
            {journeyStats.map((stat, i) => (
              <div key={i} className="chat-stat-item">
                <div className="chat-stat-icon">{stat.icon}</div>
                <div>
                  <div className="font-black text-base text-gray-800 dark:text-white">{stat.value}</div>
                  <div className="text-gray-500 dark:text-gray-400 text-[11px]">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== TESTIMONIALS SECTION - بازطراحی شده با Carousel ===== */}
      <section id="testimonials" className="py-24 lg:py-32 px-4 relative overflow-hidden">
        {/* پس‌زمینه */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-sky-50 dark:from-navy-950 dark:via-navy-900 dark:to-navy-950"></div>
        
        {/* علامت نقل قول تزئینی */}
        <div className="absolute top-10 left-10 text-[280px] font-serif text-sky-100/70 dark:text-navy-700/15 select-none pointer-events-none leading-none">"</div>
        <div className="absolute bottom-10 right-10 text-[280px] font-serif text-sky-100/70 dark:text-navy-700/15 select-none pointer-events-none leading-none rotate-180">"</div>

        <div className="max-w-7xl mx-auto relative z-10">
          
          {/* هدر بخش */}
          <div className="text-center mb-20 lg:mb-24">
            <div className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 text-sm font-semibold mb-8 border-2 border-amber-200/60 dark:border-amber-700/40 backdrop-blur-sm shadow-md animate-fade-in-up">
              <Trophy className="w-4 h-4" />
              داستان موفقیت‌ها
              <Trophy className="w-4 h-4" />
            </div>
            
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black mb-8 animate-fade-in-up" style={{ animationDelay: '0.1s', animationFillMode: 'backwards' }}>
              <span className="text-gray-800 dark:text-white">دانش‌آموزان ما</span>{" "}
              <span className="text-gradient-rainbow">چی می‌گن؟</span>
            </h2>
            
            <div className="flex items-center justify-center gap-3 mb-8 animate-fade-in-up" style={{ animationDelay: '0.2s', animationFillMode: 'backwards' }}>
              <div className="w-20 h-1.5 bg-gradient-to-r from-transparent to-amber-400 rounded-full"></div>
              <Star className="w-7 h-7 text-amber-400 fill-amber-400 animate-pulse" />
              <div className="w-20 h-1.5 bg-gradient-to-l from-transparent to-amber-400 rounded-full"></div>
            </div>
            
            <p className="text-gray-600 dark:text-gray-300 text-lg max-w-2xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.3s', animationFillMode: 'backwards' }}>
              <span className="text-amber-500 dark:text-amber-400 font-black text-3xl">۳۰۰۰+</span>{" "}
              <span className="text-gray-700 dark:text-gray-200 font-semibold">دانش‌آموز موفق</span>،{" "}
              <span className="text-amber-500 dark:text-amber-400 font-black text-3xl">۹۶٪</span>{" "}
              <span className="text-gray-700 dark:text-gray-200 font-semibold">رضایت</span>
            </p>
          </div>

          {/* Carousel نظرات */}
          <div className="relative">
            {/* کامنت فعال */}
            <div className="max-w-4xl mx-auto">
              {testimonials.map((t, index) => (
                <div 
                  key={index}
                  className={`transition-all duration-700 ${
                    index === activeTestimonial 
                      ? 'opacity-100 scale-100 translate-y-0' 
                      : 'opacity-0 scale-95 translate-y-8 absolute inset-0 pointer-events-none'
                  }`}
                >
                  <div className="relative glass-card rounded-3xl p-8 lg:p-12 border-2 border-white/50 dark:border-navy-700/50 shadow-2xl overflow-hidden">
                    {/* نوار رنگی بالا */}
                    <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${t.color} rounded-t-2xl`}></div>
                    
                    {/* محتوای کامنت */}
                    <div className="flex flex-col lg:flex-row items-center gap-8">
                      {/* آواتار */}
                      <div className="flex-shrink-0">
                        <div className={`w-24 h-24 rounded-3xl bg-gradient-to-br ${t.color} flex items-center justify-center text-white font-black text-4xl shadow-2xl`}>
                          {t.avatar}
                        </div>
                      </div>
                      
                      {/* متن کامنت */}
                      <div className="flex-1 text-center lg:text-right">
                        {/* نقل قول */}
                        <Quote className="w-10 h-10 text-sky-200 dark:text-sky-800 mb-4 opacity-50 mx-auto lg:mx-0" />
                        
                        {/* متن */}
                        <p className="text-gray-700 dark:text-gray-200 text-lg lg:text-xl leading-loose mb-6 font-medium">
                          "{t.text}"
                        </p>
                        
                        {/* ستاره‌ها */}
                        <div className="flex gap-1.5 justify-center lg:justify-start mb-5">
                          {[...Array(t.rating)].map((_, i) => (
                            <Star key={i} className="w-6 h-6 fill-amber-400 text-amber-400 drop-shadow-md" />
                          ))}
                        </div>
                        
                        {/* اطلاعات کاربر */}
                        <div className="flex items-center gap-3 justify-center lg:justify-start pt-5 border-t border-gray-200 dark:border-navy-700/50">
                          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${t.color} flex items-center justify-center text-white font-bold text-lg shadow-lg`}>
                            {t.avatar}
                          </div>
                          <div className="text-right">
                            <h4 className="font-bold text-gray-800 dark:text-white text-base">
                              {t.name}
                            </h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {t.grade}
                            </p>
                          </div>
                          <div className="mr-auto hidden sm:block">
                            <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center">
                              <Check className="w-5 h-5 text-emerald-500" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* دات‌های نویگیشن */}
            <div className="flex justify-center items-center gap-3 mt-10">
              {testimonials.map((_, index) => (
                <button 
                  key={index}
                  onClick={() => setActiveTestimonial(index)}
                  className={`slider-dot rounded-full transition-all duration-500 ${
                    index === activeTestimonial 
                      ? 'w-12 h-3 bg-sky-500 shadow-xl shadow-sky-500/50' 
                      : 'w-3 h-3 bg-gray-300 dark:bg-navy-600 hover:bg-sky-400 dark:hover:bg-sky-500'
                  }`}
                  aria-label={`نظر ${index + 1}`}
                ></button>
              ))}
            </div>
            
            {/* دکمه‌های قبلی/بعدی */}
            <div className="flex justify-center gap-4 mt-8">
              <button 
                onClick={() => setActiveTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length)}
                className="w-14 h-14 rounded-2xl bg-white dark:bg-navy-800 border-2 border-gray-200 dark:border-navy-700 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-sky-50 dark:hover:bg-navy-700 hover:border-sky-300 dark:hover:border-sky-600 transition-all shadow-lg hover:shadow-xl"
                aria-label="نظر قبلی"
              >
                <ArrowRight className="w-6 h-6" />
              </button>
              <button 
                onClick={() => setActiveTestimonial((prev) => (prev + 1) % testimonials.length)}
                className="w-14 h-14 rounded-2xl bg-white dark:bg-navy-800 border-2 border-gray-200 dark:border-navy-700 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-sky-50 dark:hover:bg-navy-700 hover:border-sky-300 dark:hover:border-sky-600 transition-all shadow-lg hover:shadow-xl"
                aria-label="نظر بعدی"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </section>
      {/* ===== FAQ Section ===== */}
      <section id="faq" className={`relative py-24 lg:py-32 px-4 overflow-hidden ${isDark ? 'bg-[#0A1425]' : 'bg-[#F8FAFC]'}`}>
        
        {/* ===== پس‌زمینه ===== */}
        <div className={`absolute top-[-5%] left-[-3%] w-[500px] h-[500px] rounded-full blur-[130px] pointer-events-none ${isDark ? 'bg-sky-500/8' : 'bg-sky-100/60'}`} />
        <div className={`absolute bottom-[-10%] right-[-5%] w-[450px] h-[450px] rounded-full blur-[120px] pointer-events-none ${isDark ? 'bg-purple-500/8' : 'bg-purple-100/50'}`} />
        <div className={`absolute top-[40%] left-[50%] -translate-x-1/2 w-[300px] h-[300px] rounded-full blur-[90px] pointer-events-none ${isDark ? 'bg-amber-500/5' : 'bg-amber-50/50'}`} />

        {/* ابرهای تزئینی */}
        <div className={`absolute top-[8%] right-[6%] opacity-30 pointer-events-none ${isDark ? 'text-sky-500/20' : 'text-sky-200'}`}>
          <Cloud className="w-36 h-36" />
        </div>
        <div className={`absolute top-[15%] left-[4%] opacity-25 pointer-events-none ${isDark ? 'text-purple-500/20' : 'text-purple-200'}`}>
          <Cloud className="w-28 h-28" />
        </div>

        {/* ستاره‌ها */}
        <motion.div
          animate={{ opacity: [0.2, 0.7, 0.2], scale: [1, 1.3, 1] }}
          transition={{ duration: 3, repeat: Infinity }}
          className={`absolute top-[10%] left-[22%] text-lg pointer-events-none ${isDark ? 'text-sky-400/50' : 'text-sky-300'}`}
        >
          ✦
        </motion.div>
        <motion.div
          animate={{ opacity: [0.2, 0.6, 0.2], scale: [1, 1.2, 1] }}
          transition={{ duration: 3.5, repeat: Infinity, delay: 1 }}
          className={`absolute top-[18%] right-[20%] text-sm pointer-events-none ${isDark ? 'text-sky-400/40' : 'text-sky-300'}`}
        >
          ✧
        </motion.div>
        <motion.div
          animate={{ opacity: [0.2, 0.5, 0.2] }}
          transition={{ duration: 4, repeat: Infinity, delay: 2 }}
          className={`absolute top-[30%] left-[12%] text-sm pointer-events-none ${isDark ? 'text-purple-400/40' : 'text-purple-300'}`}
        >
          ✦
        </motion.div>

        <div className="relative z-10 max-w-[900px] mx-auto">
          
          {/* ===== هدر ===== */}
          <div className="text-center mb-14">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className={`inline-flex items-center gap-2.5 px-6 py-2.5 rounded-full text-sm font-bold mb-7 shadow-md border ${
                isDark 
                  ? 'bg-sky-500/10 text-sky-400 border-sky-500/20 shadow-sky-500/10' 
                  : 'bg-white border-sky-100 text-sky-600 shadow-sky-100'
              }`}
            >
              <MessageCircle className="w-4 h-4" />
              سوالات متداول
            </motion.div>

            {/* عنوان */}
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-5xl lg:text-[52px] font-black leading-[1.3] mb-5"
            >
              <span className={isDark ? 'text-white' : 'text-gray-800'}>هر چی می‌خوای</span>
              <br />
              <span className="bg-gradient-to-l from-sky-500 via-blue-600 to-purple-600 bg-clip-text text-transparent">
                بدونی، اینجاست!
              </span>
            </motion.h2>

            {/* جداکننده */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="flex items-center justify-center gap-3 mb-5"
            >
              <div className={`w-16 h-px bg-gradient-to-l from-transparent ${isDark ? 'to-sky-500/50' : 'to-sky-300'}`} />
              <Cloud className={`w-6 h-6 ${isDark ? 'text-sky-400' : 'text-sky-500'}`} />
              <div className={`w-16 h-px bg-gradient-to-r from-transparent ${isDark ? 'to-sky-500/50' : 'to-sky-300'}`} />
            </motion.div>

            {/* توضیح */}
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className={`text-base ${isDark ? 'text-gray-400' : 'text-gray-500'}`}
            >
              سوالی داری؟ جوابش اینجاست! اگه باز هم سوالی مونده،{' '}
              <a href="#contact" className={`font-bold hover:underline underline-offset-4 ${isDark ? 'text-sky-400' : 'text-sky-600'}`}>
                با ما تماس بگیر
              </a>
              .
            </motion.p>
          </div>

          {/* ===== چیپ‌های فیلتر ===== */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.35 }}
            className="flex flex-wrap justify-center gap-2.5 mb-10"
          >
            {[
              { id: 'all', label: 'همه', icon: null },
              { id: 'education', label: '🎓 تحصیلی', icon: null },
              { id: 'payment', label: '💰 هزینه', icon: null },
              { id: 'security', label: '🔒 امنیت', icon: null },
              { id: 'support', label: '📞 پشتیبانی', icon: null },
              { id: 'register', label: '📝 ثبت‌نام', icon: null },
            ].map((filter) => (
              <button
                key={filter.id}
                onClick={() => setFaqFilter(filter.id)}
                className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-300 ${
                  faqFilter === filter.id
                    ? 'bg-gradient-to-l from-sky-500 to-blue-600 text-white shadow-lg shadow-sky-300/30 scale-105'
                    : isDark
                      ? 'bg-white/5 border border-white/10 text-gray-400 hover:border-sky-500/30 hover:text-sky-400 hover:shadow-md'
                      : 'bg-white border border-gray-200 text-gray-600 hover:border-sky-300 hover:text-sky-600 hover:shadow-md'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </motion.div>

          {/* ===== لیست FAQ ===== */}
          <div className="space-y-4">
            {faqs
              .filter((faq) => faqFilter === 'all' || faq.category === faqFilter)
              .map((faq, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 25 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.06, duration: 0.5 }}
                >
                  <div
                    className={`faq-premium-card ${openFaq === index ? 'faq-premium-card-open' : ''} ${isDark ? 'faq-premium-card-dark' : ''}`}
                    style={{
                      '--faq-color': faq.color,
                      '--faq-bg': faq.bg,
                      '--faq-gradient': faq.gradient,
                    }}
                  >
                    <button
                      onClick={() => setOpenFaq(openFaq === index ? null : index)}
                      className="faq-premium-btn"
                      aria-expanded={openFaq === index}
                    >
                      {/* آیکون */}
                      <div className="faq-premium-icon">
                        {faq.icon}
                      </div>

                      {/* سوال */}
                      <span className={`faq-premium-question ${isDark ? 'faq-premium-question-dark' : ''}`}>
                        {faq.q}
                      </span>

                      {/* دسته */}
                      <span className="faq-premium-category">{faq.categoryLabel}</span>

                      {/* چرخش */}
                      <div className={`faq-premium-toggle ${isDark ? 'faq-premium-toggle-dark' : ''}`}>
                        <ChevronDown className="faq-premium-chevron" />
                      </div>
                    </button>

                    {/* پاسخ */}
                    <div className={`faq-premium-answer ${openFaq === index ? 'faq-premium-answer-open' : ''}`}>
                      <p className={`faq-premium-answer-text ${isDark ? 'faq-premium-answer-text-dark' : ''}`}>
                        {faq.a}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
          </div>

          {/* ===== بنر پشتیبانی ===== */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className={`mt-14 rounded-[28px] p-8 md:p-12 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden border ${
              isDark 
                ? 'border-sky-500/15' 
                : 'border-sky-100/50'
            }`}
            style={{
              background: isDark 
                ? 'linear-gradient(135deg, #0C2344 0%, #162D50 30%, #0F2A1F 60%, #1A1A2E 100%)'
                : 'linear-gradient(135deg, #EFF6FF 0%, #F5F3FF 40%, #F0FDF4 70%, #FFFBEB 100%)',
            }}
          >
            {/* ===== تصویر ماسکات — بزرگ و محو ===== */}
            <div className="flex-shrink-0 relative md:w-[45%] lg:w-[40%]">
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className="relative w-full flex justify-center"
              >
                <img
                  src="/images/support-mascot.png"
                  alt="پشتیبانی آکادمی ابرا"
                  className="w-full max-w-[280px] md:max-w-[350px] lg:max-w-[400px] h-auto object-contain"
                  style={{
                    maskImage: 'radial-gradient(ellipse at center, black 35%, transparent 78%)',
                    WebkitMaskImage: 'radial-gradient(ellipse at center, black 35%, transparent 78%)',
                    opacity: 0.85,
                    filter: 'blur(0.5px)',
                  }}
                  onError={(e) => {
                    e.target.style.display = 'none'
                  }}
                />
                
                {/* هاله نور پشت تصویر */}
                <div 
                  className="absolute inset-0 rounded-full pointer-events-none"
                  style={{
                    background: 'radial-gradient(ellipse at center, rgba(59, 130, 246, 0.15), transparent 70%)',
                    filter: 'blur(30px)',
                  }}
                />
                
                {/* ستاره‌های دور تصویر */}
                <motion.span
                  animate={{ opacity: [0.3, 1, 0.3], rotate: [0, 180, 360] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="absolute -top-2 -right-2 text-amber-400 text-2xl"
                >
                  ✦
                </motion.span>
                <motion.span
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 4, repeat: Infinity, delay: 1.5 }}
                  className={`absolute -bottom-1 -left-3 text-lg ${isDark ? 'text-sky-400/60' : 'text-sky-300'}`}
                >
                  ✧
                </motion.span>
              </motion.div>
            </div>

            {/* ===== متن ===== */}
            <div className="flex-1 text-center md:text-right">
              <h3 className={`text-2xl md:text-3xl font-black mb-3 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                سوالی باقی مونده؟ ما پاسخگو هستیم!
              </h3>
              <p className={`text-sm md:text-base mb-6 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                تیم پشتیبانی ابرا همیشه آماده پاسخگویی به سوالات شماست. سوالی داری، بپرس!
              </p>
              
              {/* دکمه تماس مستقیم */}
              <a
                href="tel:0900000000"
                className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-l from-sky-500 to-blue-600 text-white font-bold rounded-2xl shadow-xl shadow-sky-300/20 hover:shadow-sky-300/35 hover:-translate-y-0.5 transition-all"
              >
                <Headphones className="w-5 h-5 text-white" />
                <span className="text-white">تماس با پشتیبانی</span>
              </a>
            </div>
          </motion.div>

        </div>
      </section>

      {/* ===== CONSULTATION SECTION ===== */}
      <section className={`relative py-20 lg:py-28 px-4 overflow-hidden`} id="consultation" style={{ background: isDark ? 'linear-gradient(135deg, #020B22, #061A3F)' : 'linear-gradient(135deg, #EEF5FF 0%, #F8FBFF 45%, #EAF2FF 100%)' }}>
        
        {/* پس‌زمینه */}
        <div className="absolute top-[10%] right-[15%] w-[400px] h-[400px] bg-sky-400/8 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-[5%] left-[10%] w-[350px] h-[350px] bg-purple-400/6 rounded-full blur-[90px] pointer-events-none" />
        
        {/* ابرهای تزئینی */}
        <Cloud className={`absolute top-[8%] left-[5%] w-40 h-40 pointer-events-none ${isDark ? 'text-white/5' : 'text-blue-200/20'}`} />
        <Cloud className={`absolute bottom-[15%] right-[5%] w-56 h-56 pointer-events-none ${isDark ? 'text-white/5' : 'text-purple-200/15'}`} />

        {/* ===== دسکتاپ: فرم RTL راست + تصویر LTR چپ ===== */}
        <div className="relative z-10 max-w-6xl mx-auto hidden lg:flex items-center gap-14" style={{ direction: 'ltr' }}>
          
          {/* تصویر سمت چپ */}
          <div className="flex-shrink-0 w-[45%] flex flex-col items-center gap-8" style={{ direction: 'ltr' }}>
            <motion.div
              animate={{ y: [0, -12, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
              className="relative w-full flex items-center justify-center"
            >
              <img 
                src="/images/consultation-illustration.png" 
                alt="مشاوره آکادمی ابرا" 
                className="w-full max-w-[450px] h-auto object-contain"
                style={{
                  maskImage: 'radial-gradient(ellipse at center, black 50%, transparent 80%)',
                  WebkitMaskImage: 'radial-gradient(ellipse at center, black 50%, transparent 80%)',
                  opacity: 0.85,
                }}
                onError={(e) => {
                  e.target.style.display = 'none'
                }}
              />
            </motion.div>

            {/* کارت اعتماد */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className={`rounded-2xl p-5 shadow-xl ${isDark ? 'bg-white/5 border border-white/10' : 'bg-white/85 border border-blue-100 shadow-sky-100'}`}
            >
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  {['A', 'B', 'C', 'D'].map((letter, i) => (
                    <div 
                      key={i} 
                      className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold border-2 border-white"
                      style={{ background: `linear-gradient(135deg, ${['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B'][i]}, ${['#2563EB', '#7C3AED', '#059669', '#D97706'][i]})` }}
                    >
                      {letter}
                    </div>
                  ))}
                </div>
                <div>
                  <p className={`text-sm font-extrabold ${isDark ? 'text-white' : 'text-gray-800'}`}>۳۰۰۰+ دانش‌آموز</p>
                  <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>مشاوره رایگان دریافت کردند</p>
                </div>
              </div>
              <div className="flex gap-1 mt-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                ))}
              </div>
            </motion.div>
          </div>

          {/* فرم سمت راست */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className={`flex-1 rounded-[30px] p-8 lg:p-10 ${isDark ? 'bg-gray-900/80 border border-white/10 shadow-2xl shadow-black/20' : 'bg-white border border-blue-100 shadow-2xl shadow-sky-100'}`}
            style={{ direction: 'rtl' }}
          >
            {formSuccess ? (
              <div className="text-center py-10">
                <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${isDark ? 'bg-emerald-500/10' : 'bg-emerald-50'}`}>
                  <CheckCircle className="w-12 h-12 text-emerald-500" />
                </div>
                <h3 className={`text-2xl font-black mb-2 ${isDark ? 'text-white' : 'text-gray-800'}`}>درخواست با موفقیت ثبت شد! 🎉</h3>
                <p className={`${isDark ? 'text-gray-400' : 'text-gray-500'}`}>کارشناسان ما در کمتر از ۲۴ ساعت با شما تماس خواهند گرفت.</p>
              </div>
            ) : (
              <>
                {/* هدر فرم */}
                <div className="text-center mb-8">
                  <div className={`inline-flex items-center gap-2 px-5 py-2 rounded-full text-xs font-bold mb-4 ${isDark ? 'bg-sky-500/10 text-sky-400' : 'bg-sky-50 text-sky-600'}`}>
                    <Headphones className="w-3.5 h-3.5" />
                    فرم مشاوره رایگان
                  </div>
                  <h2 className={`text-2xl lg:text-3xl font-black mb-3 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                    فرم مشاوره <span className="text-blue-500">رایگان</span> آکادمی ابرا
                  </h2>
                  <p className={`text-sm leading-relaxed ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    با تکمیل این فرم، مشاوران ما در کمتر از ۲۴ ساعت با شما تماس خواهند گرفت.
                  </p>
                </div>

                {/* فرم */}
                <form onSubmit={handleSubmitConsultation} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* نام */}
                    <div>
                      <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>نام و نام خانوادگی</label>
                      <div className="relative">
                        <input
                          type="text"
                          value={formFullName}
                          onChange={(e) => { setFormFullName(e.target.value); setFormError('') }}
                          placeholder="مثلاً: علی محمدی"
                          className={`w-full h-12 pr-11 pl-4 rounded-xl text-sm outline-none transition-all border ${isDark ? 'bg-white/5 border-white/10 text-white placeholder-gray-500 focus:border-sky-500' : 'bg-white border-blue-100 text-gray-800 placeholder-gray-400 focus:border-blue-500'}`}
                        />
                        <User className={`absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-sky-400' : 'text-blue-500'}`} />
                      </div>
                    </div>

                    {/* موبایل */}
                    <div>
                      <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>شماره موبایل</label>
                      <div className="relative">
                        <input
                          type="tel"
                          value={formPhone}
                          onChange={(e) => { setFormPhone(e.target.value); setFormError('') }}
                          placeholder="مثلاً: ۰۹۱۲۳۴۵۶۷۸۹"
                          className={`w-full h-12 pr-11 pl-4 rounded-xl text-sm outline-none transition-all border ${isDark ? 'bg-white/5 border-white/10 text-white placeholder-gray-500 focus:border-sky-500' : 'bg-white border-blue-100 text-gray-800 placeholder-gray-400 focus:border-blue-500'}`}
                          dir="ltr"
                        />
                        <Phone className={`absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-sky-400' : 'text-blue-500'}`} />
                      </div>
                    </div>

                    {/* پایه */}
                    <div>
                      <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>پایه تحصیلی</label>
                      <div className="relative">
                        <select
                          value={formGrade}
                          onChange={(e) => setFormGrade(e.target.value)}
                          className={`w-full h-12 pr-11 pl-4 rounded-xl text-sm outline-none transition-all border appearance-none cursor-pointer ${isDark ? 'bg-white/5 border-white/10 text-white focus:border-sky-500' : 'bg-white border-blue-100 text-gray-800 focus:border-blue-500'}`}
                        >
                          <option value="">انتخاب کنید...</option>
                          <option value="10">دهم</option>
                          <option value="11">یازدهم</option>
                          <option value="12">دوازدهم</option>
                        </select>
                        <GraduationCap className={`absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none ${isDark ? 'text-sky-400' : 'text-blue-500'}`} />
                      </div>
                    </div>

                    {/* هدف */}
                    <div>
                      <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>مقطع هدف</label>
                      <div className="relative">
                        <select
                          value={formTarget}
                          onChange={(e) => setFormTarget(e.target.value)}
                          className={`w-full h-12 pr-11 pl-4 rounded-xl text-sm outline-none transition-all border appearance-none cursor-pointer ${isDark ? 'bg-white/5 border-white/10 text-white focus:border-sky-500' : 'bg-white border-blue-100 text-gray-800 focus:border-blue-500'}`}
                        >
                          <option value="">انتخاب کنید...</option>
                          <option value="konkur">کنکور سراسری</option>
                          <option value="emtehan">امتحان نهایی</option>
                          <option value="tizhoushan">تیزهوشان</option>
                        </select>
                        <Target className={`absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none ${isDark ? 'text-sky-400' : 'text-blue-500'}`} />
                      </div>
                    </div>
                  </div>

                  {/* موضوع */}
                  <div>
                    <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>موضوع مشاوره</label>
                    <div className="relative">
                      <select
                        value={formSubject}
                        onChange={(e) => setFormSubject(e.target.value)}
                        className={`w-full h-12 pr-11 pl-4 rounded-xl text-sm outline-none transition-all border appearance-none cursor-pointer ${isDark ? 'bg-white/5 border-white/10 text-white focus:border-sky-500' : 'bg-white border-blue-100 text-gray-800 focus:border-blue-500'}`}
                      >
                        <option value="">انتخاب کنید...</option>
                        <option value="programming">برنامه‌ریزی درسی</option>
                        <option value="exam">آزمون و تحلیل</option>
                        <option value="psychology">روانشناسی</option>
                        <option value="general">مشاوره عمومی</option>
                      </select>
                      <MessageCircle className={`absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none ${isDark ? 'text-sky-400' : 'text-blue-500'}`} />
                    </div>
                  </div>

                  {/* توضیحات */}
                  <div>
                    <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>توضیحات (اختیاری)</label>
                    <div className="relative">
                      <textarea
                        value={formDescription}
                        onChange={(e) => setFormDescription(e.target.value)}
                        rows={3}
                        placeholder="اگر توضیحی دارید، اینجا بنویسید..."
                        className={`w-full pr-11 pl-4 py-3 rounded-xl text-sm outline-none transition-all border resize-none ${isDark ? 'bg-white/5 border-white/10 text-white placeholder-gray-500 focus:border-sky-500' : 'bg-white border-blue-100 text-gray-800 placeholder-gray-400 focus:border-blue-500'}`}
                      />
                      <PenLine className={`absolute right-3.5 top-4 w-4 h-4 pointer-events-none ${isDark ? 'text-sky-400' : 'text-blue-500'}`} />
                    </div>
                  </div>

                  {/* پیام امنیت */}
                  <div className="flex items-center gap-2 text-xs text-emerald-500 font-semibold">
                    <Shield className="w-4 h-4" />
                    اطلاعات شما کاملاً محرمانه و امن است.
                  </div>

                  {/* خطا */}
                  {formError && (
                    <div className={`flex items-center gap-2 rounded-xl px-4 py-3 text-sm border ${isDark ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-red-50 border-red-100 text-red-500'}`}>
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      <span>{formError}</span>
                    </div>
                  )}

                  {/* دکمه */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-4 bg-gradient-to-l from-blue-600 to-blue-500 text-white font-bold text-base rounded-2xl shadow-xl shadow-sky-200 hover:shadow-sky-300 hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-60"
                  >
                    {isSubmitting ? (
                      <Loader className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        درخواست مشاوره رایگان
                      </>
                    )}
                  </button>
                </form>
              </>
            )}
          </motion.div>
        </div>

        {/* ===== موبایل: ستونی ===== */}
        <div className="relative z-10 max-w-md mx-auto lg:hidden flex flex-col gap-8" style={{ direction: 'rtl' }}>
          
          {/* تصویر */}
          <div className="flex flex-col items-center gap-5">
            <motion.img
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              src="/images/consultation-illustration.png" 
              alt="مشاوره آکادمی ابرا" 
              className="w-[70%] max-w-[260px] h-auto object-contain"
              style={{
                maskImage: 'radial-gradient(ellipse at center, black 45%, transparent 78%)',
                WebkitMaskImage: 'radial-gradient(ellipse at center, black 45%, transparent 78%)',
                opacity: 0.8,
              }}
            />
          </div>

          {/* فرم موبایل — همون فرم با padding کمتر */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className={`rounded-3xl p-5 ${isDark ? 'bg-gray-900/80 border border-white/10' : 'bg-white border border-blue-100 shadow-xl shadow-sky-100'}`}
            style={{ direction: 'rtl' }}
          >
            {/* محتوای فرم — عیناً مثل دسکتاپ با کلاس‌های موبایل */}
            {formSuccess ? (
              <div className="text-center py-8">
                <CheckCircle className="w-14 h-14 text-emerald-500 mx-auto mb-3" />
                <h3 className={`text-xl font-black mb-2 ${isDark ? 'text-white' : 'text-gray-800'}`}>درخواست ثبت شد! 🎉</h3>
                <p className={isDark ? 'text-gray-400 text-sm' : 'text-gray-500 text-sm'}>به زودی با شما تماس می‌گیریم.</p>
              </div>
            ) : (
              <>
                <div className="text-center mb-6">
                  <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-bold mb-3 ${isDark ? 'bg-sky-500/10 text-sky-400' : 'bg-sky-50 text-sky-600'}`}>
                    <Headphones className="w-3 h-3" />
                    فرم مشاوره رایگان
                  </div>
                  <h2 className={`text-xl font-black mb-2 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                    فرم مشاوره <span className="text-blue-500">رایگان</span>
                  </h2>
                </div>

                <form onSubmit={handleSubmitConsultation} className="space-y-3">
                  <div>
                    <label className={`block text-[11px] font-bold mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>نام و نام خانوادگی</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={formFullName}
                        onChange={(e) => { setFormFullName(e.target.value); setFormError('') }}
                        placeholder="مثلاً: علی محمدی"
                        className={`w-full h-11 pr-10 pl-3 rounded-lg text-xs outline-none border transition-all ${isDark ? 'bg-white/5 border-white/10 text-white placeholder-gray-500' : 'bg-white border-blue-100 text-gray-800 placeholder-gray-400'}`}
                      />
                      <User className={`absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 ${isDark ? 'text-sky-400' : 'text-blue-500'}`} />
                    </div>
                  </div>

                  <div>
                    <label className={`block text-[11px] font-bold mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>شماره موبایل</label>
                    <div className="relative">
                      <input
                        type="tel"
                        value={formPhone}
                        onChange={(e) => { setFormPhone(e.target.value); setFormError('') }}
                        placeholder="۰۹۱۲۳۴۵۶۷۸۹"
                        className={`w-full h-11 pr-10 pl-3 rounded-lg text-xs outline-none border transition-all ${isDark ? 'bg-white/5 border-white/10 text-white placeholder-gray-500' : 'bg-white border-blue-100 text-gray-800 placeholder-gray-400'}`}
                        dir="ltr"
                      />
                      <Phone className={`absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 ${isDark ? 'text-sky-400' : 'text-blue-500'}`} />
                    </div>
                  </div>

                  <div>
                    <label className={`block text-[11px] font-bold mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>پایه تحصیلی</label>
                    <div className="relative">
                      <select
                        value={formGrade}
                        onChange={(e) => setFormGrade(e.target.value)}
                        className={`w-full h-11 pr-10 pl-3 rounded-lg text-xs outline-none border appearance-none ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-blue-100 text-gray-800'}`}
                      >
                        <option value="">انتخاب کنید...</option>
                        <option value="10">دهم</option>
                        <option value="11">یازدهم</option>
                        <option value="12">دوازدهم</option>
                      </select>
                      <GraduationCap className={`absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none ${isDark ? 'text-sky-400' : 'text-blue-500'}`} />
                    </div>
                  </div>

                  <div>
                    <label className={`block text-[11px] font-bold mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>مقطع هدف</label>
                    <div className="relative">
                      <select
                        value={formTarget}
                        onChange={(e) => setFormTarget(e.target.value)}
                        className={`w-full h-11 pr-10 pl-3 rounded-lg text-xs outline-none border appearance-none ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-blue-100 text-gray-800'}`}
                      >
                        <option value="">انتخاب کنید...</option>
                        <option value="konkur">کنکور سراسری</option>
                        <option value="emtehan">امتحان نهایی</option>
                      </select>
                      <Target className={`absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none ${isDark ? 'text-sky-400' : 'text-blue-500'}`} />
                    </div>
                  </div>

                  <div>
                    <label className={`block text-[11px] font-bold mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>موضوع مشاوره</label>
                    <div className="relative">
                      <select
                        value={formSubject}
                        onChange={(e) => setFormSubject(e.target.value)}
                        className={`w-full h-11 pr-10 pl-3 rounded-lg text-xs outline-none border appearance-none ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-blue-100 text-gray-800'}`}
                      >
                        <option value="">انتخاب کنید...</option>
                        <option value="programming">برنامه‌ریزی درسی</option>
                        <option value="psychology">روانشناسی</option>
                      </select>
                      <MessageCircle className={`absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none ${isDark ? 'text-sky-400' : 'text-blue-500'}`} />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 bg-gradient-to-l from-blue-600 to-blue-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-sky-200 flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    {isSubmitting ? <Loader className="w-4 h-4 animate-spin" /> : <><Send className="w-4 h-4" /> درخواست مشاوره رایگان</>}
                  </button>
                </form>
              </>
            )}
          </motion.div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="relative bg-[#031433] text-white pt-20 lg:pt-24 pb-8 px-4 overflow-hidden">
        
        {/* پس‌زمینه */}
        <div className="absolute top-[-20%] left-[30%] w-[500px] h-[500px] bg-sky-500/8 rounded-full blur-[150px] pointer-events-none" />
        <div className="absolute bottom-[-30%] right-[10%] w-[400px] h-[400px] bg-purple-500/6 rounded-full blur-[120px] pointer-events-none" />

        {/* ابرهای تزئینی */}
        <Cloud className="absolute bottom-[5%] left-[3%] w-48 h-48 text-white/3 pointer-events-none" />
        <Cloud className="absolute top-[10%] right-[5%] w-40 h-40 text-white/2 pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto">
          
          {/* ===== دسکتاپ ===== */}
          <div className="hidden lg:grid grid-cols-12 gap-10 mb-14">
            
            {/* برند */}
            <div className="col-span-4">
              <div className="flex items-center gap-3 mb-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-sky-500 rounded-2xl blur-lg opacity-50" />
                  <div className="relative w-14 h-14 rounded-2xl overflow-hidden shadow-xl shadow-sky-500/30">
                    <img src="/logo.png" alt="آکادمی ابرا" className="w-full h-full object-cover" />
                  </div>
                </div>
                <span className="text-2xl font-black bg-gradient-to-r from-sky-400 to-white bg-clip-text text-transparent">
                  آکادمی ابر
                </span>
              </div>
              <p className="text-gray-400 text-sm leading-loose mb-7">
                همراه شما در مسیر موفقیت تحصیلی با برنامه‌ریزی هوشمند، مشاوره تخصصی و پشتیبانی ۲۴ ساعته.
              </p>
              <div className="flex gap-3">
                {[
                  { icon: <MessageCircle className="w-5 h-5" />, label: 'Telegram' },
                  { icon: <Send className="w-5 h-5" />, label: 'WhatsApp' },
                  { icon: <Phone className="w-5 h-5" />, label: 'Phone' },
                  { icon: <Mail className="w-5 h-5" />, label: 'Email' },
                ].map((social, i) => (
                  <a
                    key={i}
                    href="#"
                    aria-label={social.label}
                    className="w-11 h-11 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:bg-sky-500 hover:text-white hover:border-sky-500 hover:shadow-lg hover:shadow-sky-500/30 transition-all duration-300"
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>

            {/* خدمات */}
            <div className="col-span-2">
              <h4 className="text-white font-bold text-sm mb-5">خدمات</h4>
              <ul className="space-y-3">
                {['برنامه‌ریزی نانو', 'مشاوره VIP', 'آزمون‌های شبیه‌ساز', 'کلاس‌های آنلاین', 'پشتیبانی و رفع اشکال'].map((item, i) => (
                  <li key={i}>
                    <a href="#" className="text-gray-400 text-sm hover:text-sky-400 transition-colors">{item}</a>
                  </li>
                ))}
              </ul>
            </div>

            {/* مسیر موفقیت */}
            <div className="col-span-2">
              <h4 className="text-white font-bold text-sm mb-5">مسیر موفقیت</h4>
              <ul className="space-y-3">
                {['برنامه راهبردی ابر', 'دانشنامه کنکور', 'تکنیک‌های مطالعه', 'منابع و جزوات', 'داستان‌های موفقیت'].map((item, i) => (
                  <li key={i}>
                    <a href="#" className="text-gray-400 text-sm hover:text-sky-400 transition-colors">{item}</a>
                  </li>
                ))}
              </ul>
            </div>

            {/* دسترسی سریع */}
            <div className="col-span-2">
              <h4 className="text-white font-bold text-sm mb-5">دسترسی سریع</h4>
              <ul className="space-y-3">
                {['درباره ما', 'سوالات متداول', 'وبلاگ', 'تماس با ما', 'ثبت مشاوره رایگان'].map((item, i) => (
                  <li key={i}>
                    <a href="#" className="text-gray-400 text-sm hover:text-sky-400 transition-colors">{item}</a>
                  </li>
                ))}
              </ul>
            </div>

            {/* تماس */}
            <div className="col-span-2">
              <h4 className="text-white font-bold text-sm mb-5">اطلاعات تماس</h4>
              <ul className="space-y-4">
                <li className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-sky-400 flex-shrink-0" />
                  <span className="text-gray-400 text-sm" dir="ltr">۰۲۱-۱۲۳۴۵۶۷۸</span>
                </li>
                <li className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-sky-400 flex-shrink-0" />
                  <span className="text-gray-400 text-sm">info@abra-academy.ir</span>
                </li>
                <li className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-sky-400 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-400 text-sm">تهران، خیابان ولیعصر، نبش کوچه ابر</span>
                </li>
              </ul>
            </div>
          </div>

          {/* ===== موبایل ===== */}
          <div className="lg:hidden mb-10">
            {/* لوگو */}
            <div className="flex items-center gap-3 mb-5">
              <div className="relative w-12 h-12 rounded-xl overflow-hidden">
                <img src="/logo.png" alt="آکادمی ابرا" className="w-full h-full object-cover" />
              </div>
              <span className="text-xl font-black bg-gradient-to-r from-sky-400 to-white bg-clip-text text-transparent">
                آکادمی ابر
              </span>
            </div>
            <p className="text-gray-400 text-sm leading-loose mb-5">
              همراه شما در مسیر موفقیت تحصیلی با برنامه‌ریزی هوشمند، مشاوره تخصصی و پشتیبانی ۲۴ ساعته.
            </p>
            
            {/* شبکه‌های اجتماعی */}
            <div className="flex gap-3 mb-8">
              {[
                { icon: <MessageCircle className="w-5 h-5" /> },
                { icon: <Send className="w-5 h-5" /> },
                { icon: <Phone className="w-5 h-5" /> },
                { icon: <Mail className="w-5 h-5" /> },
              ].map((social, i) => (
                <a key={i} href="#" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:bg-sky-500 hover:text-white transition-colors">
                  {social.icon}
                </a>
              ))}
            </div>

            {/* آکاردئون */}
            {[
              { title: 'خدمات', items: ['برنامه‌ریزی نانو', 'مشاوره VIP', 'آزمون‌های شبیه‌ساز', 'کلاس‌های آنلاین'] },
              { title: 'مسیر موفقیت', items: ['برنامه راهبردی', 'دانشنامه کنکور', 'تکنیک‌های مطالعه', 'منابع و جزوات'] },
              { title: 'دسترسی سریع', items: ['درباره ما', 'سوالات متداول', 'وبلاگ', 'تماس با ما'] },
              { title: 'اطلاعات تماس', items: ['۰۲۱-۱۲۳۴۵۶۷۸', 'info@abra-academy.ir', 'تهران، خیابان ولیعصر'] },
            ].map((section, i) => (
              <div key={i} className="mb-2">
                <button
                  onClick={() => setOpenFooter(i === openFooter ? null : i)}
                  className="w-full flex items-center justify-between px-4 py-3.5 bg-white/3 border border-white/8 rounded-xl text-white text-sm font-bold"
                >
                  {section.title}
                  <ChevronDown className={`w-4 h-4 transition-transform ${openFooter === i ? 'rotate-180' : ''}`} />
                </button>
                {openFooter === i && (
                  <div className="px-4 py-3 space-y-2">
                    {section.items.map((item, j) => (
                      <a key={j} href="#" className="block text-gray-400 text-sm hover:text-sky-400 transition-colors">
                        {item}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* ===== نوار پایینی ===== */}
          <div className="border-t border-white/8 pt-7 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-500 text-xs text-center md:text-right">
              © ۱۴۰۴ تمامی حقوق این سایت متعلق به <span className="text-sky-400">آکادمی ابر</span> می‌باشد.
            </p>
            <div className="flex items-center gap-5 text-xs text-gray-500">
              <a href="#" className="hover:text-sky-400 transition-colors">حریم خصوصی</a>
              <span className="w-1 h-1 bg-gray-700 rounded-full" />
              <a href="#" className="hover:text-sky-400 transition-colors">قوانین و مقررات</a>
              <span className="w-1 h-1 bg-gray-700 rounded-full" />
              <a href="#" className="hover:text-sky-400 transition-colors">شرایط استفاده</a>
            </div>
          </div>
        </div>
      </footer>

      {/* ===== دکمه بازگشت به بالا ===== */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        aria-label="بازگشت به بالا"
        className={`back-to-top fixed bottom-8 left-8 z-50 w-14 h-14 rounded-2xl bg-gradient-to-br from-sky-400 to-sky-600 text-white shadow-2xl shadow-sky-500/30 flex items-center justify-center transition-all duration-500 hover:shadow-[0_0_40px_rgba(56,189,248,0.5)] ${isScrolled ? 'visible' : 'hidden'}`}
      >
        <ChevronUp className="w-7 h-7" />
      </button>

    </div>
  )
}

export default Home