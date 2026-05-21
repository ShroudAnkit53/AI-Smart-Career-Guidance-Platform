import { ExternalLink, Star } from 'lucide-react'

export default function CourseCard({ skill, courses }) {
  if (!courses || courses.length === 0) return null

  return (
    <div className="glass rounded-2xl p-4 space-y-3">

      {/* Skill label */}
      <div className="flex items-center gap-2 pb-1 border-b border-white/5">
        <span className="text-xs font-mono font-medium text-brand-400
                         px-2 py-0.5 rounded-full"
          style={{ background: 'rgba(45,212,191,0.1)',
                   border: '1px solid rgba(45,212,191,0.2)' }}>
          {skill}
        </span>
      </div>

      {/* Course rows */}
      {courses.map((course, i) => (
        <a key={i}
          href={course.url}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-start gap-3 p-3 rounded-xl
                     transition-all duration-200 hover:-translate-y-0.5 block"
          style={{
            background: `${course.color}18`,
            border: `1px solid ${course.color}40`,
          }}
        >
          {/* Platform emoji */}
          <span className="text-lg flex-shrink-0 mt-0.5">{course.emoji}</span>

          {/* Info */}
          <div className="flex-1 min-w-0 space-y-1">
            <p className="text-sm text-slate-200 font-body leading-snug
                          line-clamp-2 group-hover:text-white transition-colors">
              {course.title}
            </p>
            <div className="flex items-center gap-2 flex-wrap">
              {/* Platform name */}
              <span className="text-xs font-mono font-medium"
                style={{ color: course.color }}>
                {course.provider}
              </span>
              {/* Rating */}
              {course.rating && (
                <span className="flex items-center gap-1 text-xs
                                 text-amber-400 font-mono">
                  <Star className="w-2.5 h-2.5 fill-amber-400" />
                  {course.rating}
                </span>
              )}
              {/* Badge */}
              {course.badge && (
                <span className="text-xs text-slate-500 font-body">
                  · {course.badge}
                </span>
              )}
              {/* Fallback label */}
              {course.source === 'link' && (
                <span className="text-xs text-slate-600 italic font-body">
                  search results
                </span>
              )}
            </div>
          </div>

          {/* Arrow */}
          <ExternalLink className="w-3.5 h-3.5 text-slate-600
                                   group-hover:text-brand-400 transition-colors
                                   flex-shrink-0 mt-1" />
        </a>
      ))}
    </div>
  )
}