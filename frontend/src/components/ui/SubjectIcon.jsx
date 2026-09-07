import { useState } from 'react'
import { 
  BookOpen, FlaskConical, Calculator, Atom, BookText, 
  Languages, ScrollText, HeartHandshake, Globe2, Sigma, 
  FileQuestion, Music, Palette, Dumbbell, Microscope, Brain,
  Landmark, Map, Binary,
} from 'lucide-react'

// ===== نقشه آیکون‌های پیش‌فرض =====
const fallbackIcons = {
  'biology': Microscope,
  'chemistry': FlaskConical,
  'math': Calculator,
  'physics': Atom,
  'literature': BookText,
  'english': Languages,
  'arabic': ScrollText,
  'religion': HeartHandshake,
  'geology': Globe2,
  'statistics': Sigma,
  'music': Music,
  'art': Palette,
  'sport': Dumbbell,
  'psychology': Brain,
  'history': Landmark,
  'geography': Map,
  'computer': Binary,
  'default': FileQuestion,
}

// ===== تابع تبدیل آدرس نسبی به کامل =====
const getFullMediaUrl = (url) => {
  if (!url) return null
  if (url.startsWith('http')) return url
  if (url.startsWith('/media/')) return url  // چون proxy داریم، همین نسبی اوکیه
  return `/media/${url.replace(/^\/+/, '')}`
}

const SubjectIcon = ({ 
  icon = 'default', 
  color = '#3B82F6', 
  size = 48, 
  imageUrl = null,
  className = '' 
}) => {
  const [imgError, setImgError] = useState(false)
  const [svgError, setSvgError] = useState(false)
  
  // ===== ۱. اگه تصویر آپلود شده داریم =====
  if (imageUrl && !imgError) {
    return (
      <div
        className={`subject-icon-container ${className}`}
        style={{
          width: size,
          height: size,
          borderRadius: '20%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          position: 'relative',
          overflow: 'hidden',
          background: `linear-gradient(135deg, ${color}10, ${color}20)`,
        }}
      >
        <img
          src={getFullMediaUrl(imageUrl)}
          alt="درس"
          width={size}
          height={size}
          onError={() => setImgError(true)}
          style={{
            position: 'relative',
            zIndex: 10,
            objectFit: 'cover',
            borderRadius: '20%',
            width: '100%',
            height: '100%',
          }}
        />
      </div>
    )
  }
  
  // ===== ۲. اگه SVG سفارشی داریم =====
  if (!svgError && icon !== 'default') {
    const svgPath = `/icons/subjects/${icon}.svg`
    
    return (
      <div
        className={`subject-icon-container ${className}`}
        style={{
          width: size,
          height: size,
          background: `linear-gradient(135deg, ${color}15, ${color}25)`,
          borderRadius: '20%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          className="subject-icon-glow"
          style={{
            position: 'absolute',
            inset: 0,
            background: `radial-gradient(circle at 30% 30%, ${color}20, transparent 70%)`,
          }}
        />
        <img
          src={svgPath}
          alt={icon}
          width={size * 0.55}
          height={size * 0.55}
          onError={() => setSvgError(true)}
          style={{
            position: 'relative',
            zIndex: 10,
            objectFit: 'contain',
          }}
        />
      </div>
    )
  }
  
  // ===== ۳. Fallback به Lucide Icons =====
  const FallbackIcon = fallbackIcons[icon] || fallbackIcons.default
  
  return (
    <div
      className={`subject-icon-container ${className}`}
      style={{
        width: size,
        height: size,
        background: `linear-gradient(135deg, ${color}15, ${color}25)`,
        borderRadius: '20%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div
        className="subject-icon-glow"
        style={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(circle at 30% 30%, ${color}20, transparent 70%)`,
        }}
      />
      <FallbackIcon
        style={{
          width: size * 0.5,
          height: size * 0.5,
          color: color,
          position: 'relative',
          zIndex: 10,
        }}
      />
    </div>
  )
}

export default SubjectIcon