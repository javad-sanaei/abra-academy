import { motion } from 'framer-motion'

const AbraIllustration = ({ size = 280, className = '' }) => {
  return (
    <motion.div
      className={`abra-illustration ${className}`}
      style={{ width: size, height: size * 0.8 }}
      animate={{ y: [0, -12, 0] }}
      transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
    >
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 400 320"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* ===== آرچ (دروازه موفقیت) ===== */}
        <defs>
          <linearGradient id="archGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FEF3C7" stopOpacity="0.35" />
            <stop offset="40%" stopColor="#FDF2F8" stopOpacity="0.2" />
            <stop offset="70%" stopColor="#EEF2FF" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.05" />
          </linearGradient>
          
          <linearGradient id="cloudGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#60A5FA" />
            <stop offset="35%" stopColor="#3B82F6" />
            <stop offset="70%" stopColor="#2563EB" />
            <stop offset="100%" stopColor="#1D4ED8" />
          </linearGradient>
          
          <linearGradient id="cloudHighlight" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#93C5FD" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#60A5FA" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#7C3AED" stopOpacity="0.4" />
          </linearGradient>
          
          <linearGradient id="capGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1E40AF" />
            <stop offset="100%" stopColor="#1E3A8A" />
          </linearGradient>
          
          <radialGradient id="sunGlow" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0%" stopColor="#FEF3C7" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#FDF2F8" stopOpacity="0" />
          </radialGradient>
          
          <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="8" />
            <feOffset dy="6" />
            <feComposite in2="SourceGraphic" operator="out" />
            <feColorMatrix type="matrix" values="0 0 0 0 0.145 0 0 0 0 0.388 0 0 0 0 0.921" />
            <feBlend in2="SourceGraphic" mode="normal" />
          </filter>
        </defs>

        {/* ===== آرچ پشت ابر ===== */}
        <path
          d="M 60 260 L 60 180 Q 60 60 200 60 Q 340 60 340 180 L 340 260"
          fill="url(#archGradient)"
          stroke="#E0E7FF"
          strokeWidth="2"
          strokeOpacity="0.4"
        />
        
        {/* آرچ داخلی */}
        <path
          d="M 90 260 L 90 190 Q 90 90 200 90 Q 310 90 310 190 L 310 260"
          fill="none"
          stroke="#E0E7FF"
          strokeWidth="1.5"
          strokeOpacity="0.25"
        />
        
        {/* نور خورشید داخل آرچ */}
        <circle cx="200" cy="140" r="45" fill="url(#sunGlow)" />
        
        {/* ===== ابر اصلی ===== */}
        <g filter="url(#softShadow)">
          {/* بدنه اصلی ابر */}
          <ellipse cx="200" cy="180" rx="110" ry="62" fill="url(#cloudGradient)" />
          
          {/* برجستگی بالای ابر - چپ */}
          <circle cx="145" cy="135" r="48" fill="url(#cloudGradient)" />
          
          {/* برجستگی بالای ابر - وسط */}
          <circle cx="200" cy="118" r="55" fill="url(#cloudGradient)" />
          
          {/* برجستگی بالای ابر - راست */}
          <circle cx="255" cy="140" r="44" fill="url(#cloudGradient)" />
          
          {/* هایلایت روی ابر */}
          <ellipse cx="180" cy="105" rx="50" ry="25" fill="url(#cloudHighlight)" opacity="0.35" />
        </g>

        {/* ===== متن ابر ===== */}
        <text
          x="200"
          y="195"
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="58"
          fontWeight="900"
          fill="white"
          fontFamily="Vazirmatn, sans-serif"
          style={{ textShadow: '0 2px 8px rgba(30, 58, 138, 0.4)' }}
        >
          ابر
        </text>

        {/* ===== کلاه فارغ‌التحصیلی ===== */}
        <g transform="translate(255, 70) rotate(8)">
          {/* صفحه کلاه */}
          <polygon
            points="-25,-8 25,-8 15,-25 -15,-25"
            fill="url(#capGradient)"
          />
          
          {/* دکمه کلاه */}
          <circle cx="0" cy="-8" r="6" fill="#3B82F6" stroke="#93C5FD" strokeWidth="1.5" />
          
          {/* منگوله */}
          <line x1="0" y1="-8" x2="20" y2="20" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="22" cy="23" r="7" fill="#F59E0B" />
          <circle cx="20" cy="21" r="2.5" fill="#FBBF24" />
          
          {/* خطوط روی کلاه */}
          <line x1="-15" y1="-5" x2="15" y2="-5" stroke="#1E40AF" strokeWidth="1" opacity="0.3" />
        </g>

        {/* ===== ذرات جادویی ===== */}
        <motion.g
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          <circle cx="130" cy="95" r="3" fill="#FBBF24" />
        </motion.g>
        <motion.g
          animate={{ opacity: [0, 1, 0], scale: [0, 1.5, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}
        >
          <circle cx="290" cy="85" r="2.5" fill="#FBBF24" />
        </motion.g>
        <motion.g
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
        >
          <circle cx="100" cy="130" r="2" fill="#93C5FD" />
        </motion.g>
        <motion.g
          animate={{ opacity: [0, 1, 0], scale: [0, 1.3, 0] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        >
          <circle cx="310" cy="145" r="2.5" fill="#A78BFA" />
        </motion.g>

        {/* ===== ستاره‌های کوچک ===== */}
        <motion.g
          animate={{ rotate: [0, 180, 360] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
          style={{ transformOrigin: '140px 80px' }}
        >
          <path d="M 140 75 L 142 79 L 146 80 L 142 81 L 140 85 L 138 81 L 134 80 L 138 79 Z" fill="#FBBF24" opacity="0.6" />
        </motion.g>
        <motion.g
          animate={{ rotate: [360, 180, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'linear' }}
          style={{ transformOrigin: '285px 75px' }}
        >
          <path d="M 285 70 L 286.5 74 L 290 75 L 286.5 76 L 285 80 L 283.5 76 L 280 75 L 283.5 74 Z" fill="#FBBF24" opacity="0.4" />
        </motion.g>

        {/* ===== پرنده‌ها ===== */}
        <motion.path
          d="M 70 70 Q 74 66 78 70 Q 82 66 86 70"
          stroke="#94A3B8"
          strokeWidth="1.5"
          strokeLinecap="round"
          fill="none"
          opacity="0.3"
          animate={{ x: [0, 15, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.path
          d="M 320 55 Q 323 52 326 55 Q 329 52 332 55"
          stroke="#94A3B8"
          strokeWidth="1.5"
          strokeLinecap="round"
          fill="none"
          opacity="0.25"
          animate={{ x: [0, -12, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* ===== ابرهای تزئینی ===== */}
        <motion.g
          animate={{ x: [0, 10, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
          opacity="0.5"
        >
          <circle cx="55" cy="200" r="18" fill="white" opacity="0.5" />
          <circle cx="72" cy="195" r="14" fill="white" opacity="0.4" />
          <circle cx="85" cy="200" r="12" fill="white" opacity="0.3" />
        </motion.g>
        
        <motion.g
          animate={{ x: [0, -8, 0] }}
          transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
          opacity="0.35"
        >
          <circle cx="330" cy="215" r="20" fill="white" opacity="0.5" />
          <circle cx="348" cy="210" r="15" fill="white" opacity="0.35" />
        </motion.g>
      </svg>
    </motion.div>
  )
}

export default AbraIllustration