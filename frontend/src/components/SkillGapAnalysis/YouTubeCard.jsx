import { Play, ExternalLink } from 'lucide-react'

export default function YouTubeCard({ skill, resource }) {
  return (
    <a
      href={resource.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group block rounded-xl overflow-hidden bg-neutral-900 border border-neutral-800 hover:border-orange-500 transition-all duration-300 hover:-translate-y-1"
      style={{ boxShadow: '0 0 0 0 transparent' }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = '0 8px 24px rgba(249,115,22,0.15)'}
      onMouseLeave={e => e.currentTarget.style.boxShadow = '0 0 0 0 transparent'}
    >
      {/* Thumbnail */}
      <div className="relative aspect-video bg-neutral-800 overflow-hidden">
        {resource.thumbnail ? (
          <img
            src={resource.thumbnail}
            alt={resource.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Play className="w-10 h-10 text-orange-500 opacity-60" />
          </div>
        )}
        {/* Play overlay */}
        <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="w-12 h-12 rounded-full bg-red-600 flex items-center justify-center">
            <Play className="w-5 h-5 text-white fill-white ml-0.5" />
          </div>
        </div>
        {/* Skill badge */}
        <div className="absolute top-2 left-2">
          <span className="px-2 py-0.5 rounded-md text-xs font-mono font-medium bg-neutral-900/90 text-orange-400 border border-orange-500/30">
            {skill}
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="p-3">
        <p className="text-sm text-neutral-200 font-body line-clamp-2 group-hover:text-white transition-colors leading-snug">
          {resource.title}
        </p>
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-neutral-500">{resource.channel}</span>
          <ExternalLink className="w-3.5 h-3.5 text-neutral-500 group-hover:text-orange-400 transition-colors" />
        </div>
      </div>
    </a>
  )
}
