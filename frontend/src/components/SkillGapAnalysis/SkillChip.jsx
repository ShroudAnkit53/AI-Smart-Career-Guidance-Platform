const VARIANTS = {
  matched:      { bg: 'rgba(249,115,22,0.12)',  border: 'rgba(249,115,22,0.3)',  text: '#fb923c', dot: '#f97316' },
  missing:      { bg: 'rgba(239,68,68,0.12)',   border: 'rgba(239,68,68,0.3)',   text: '#f87171', dot: '#ef4444' },
  extra:        { bg: 'rgba(99,102,241,0.12)',  border: 'rgba(99,102,241,0.3)',  text: '#a5b4fc', dot: '#818cf8' },
  required:     { bg: 'rgba(148,163,184,0.08)', border: 'rgba(148,163,184,0.2)', text: '#94a3b8', dot: '#94a3b8' },
  soft_matched: { bg: 'rgba(167,139,250,0.12)', border: 'rgba(167,139,250,0.3)', text: '#c4b5fd', dot: '#a78bfa' },
  soft_missing: { bg: 'rgba(251,146,60,0.12)',  border: 'rgba(251,146,60,0.3)',  text: '#fdba74', dot: '#fb923c' },
}

export default function SkillChip({ label, variant = 'required' }) {
  const v = VARIANTS[variant] || VARIANTS.required
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-medium"
      style={{ background: v.bg, border: `1px solid ${v.border}`, color: v.text }}
    >
      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: v.dot }} />
      {label}
    </span>
  )
}
