import { useEffect, useRef } from 'react'

const getColor = (score) => {
  if (score >= 75) return { stroke: '#f97316', text: '#f97316', label: 'Excellent Match' }
  if (score >= 50) return { stroke: '#f59e0b', text: '#f59e0b', label: 'Good Match' }
  if (score >= 25) return { stroke: '#fb923c', text: '#fb923c', label: 'Partial Match' }
  return { stroke: '#ef4444', text: '#ef4444', label: 'Low Match' }
}

export default function ScoreRing({ score, title = 'Match Score', color }) {
  const circleRef = useRef(null)
  const r = 70
  const circumference = 2 * Math.PI * r
  const offset = circumference - (score / 100) * circumference
  const status = getColor(score)
  const stroke = color || status.stroke
  const text = color || status.text
  const label = status.label

  useEffect(() => {
    const el = circleRef.current
    if (!el) return
    el.style.strokeDasharray = circumference
    el.style.strokeDashoffset = circumference
    requestAnimationFrame(() => {
      el.style.transition = 'stroke-dashoffset 1.4s cubic-bezier(0.34,1.2,0.64,1)'
      el.style.strokeDashoffset = offset
    })
  }, [score, circumference, offset])

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative" style={{ width: 180, height: 180 }}>
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className="rounded-full animate-pulse"
            style={{ width: 160, height: 160, border: `2px solid ${stroke}`, position: 'absolute', opacity: 0.3 }}
          />
        </div>
        <svg width="180" height="180" viewBox="0 0 180 180">
          <circle
            cx="90" cy="90" r={r}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth="10"
          />
          <circle
            ref={circleRef}
            cx="90" cy="90" r={r}
            fill="none"
            stroke={stroke}
            strokeWidth="10"
            strokeLinecap="round"
            transform="rotate(-90 90 90)"
            style={{ filter: `drop-shadow(0 0 8px ${stroke})` }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-bold text-4xl" style={{ color: text }}>{score}%</span>
          <span className="text-xs text-neutral-400 mt-1">{title}</span>
        </div>
      </div>
      <div
        className="px-4 py-1.5 rounded-full text-xs font-semibold"
        style={{ background: `${stroke}22`, color: stroke, border: `1px solid ${stroke}44` }}
      >
        {label}
      </div>
    </div>
  )
}
