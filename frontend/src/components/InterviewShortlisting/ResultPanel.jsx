const TIP_STYLES = {
  keyword_gap: {
    bg: "bg-yellow-500/10",
    border: "border-yellow-500/30",
    icon: "🔑",
  },

  section: {
    bg: "bg-orange-500/10",
    border: "border-orange-500/30",
    icon: "📋",
  },

  writing: {
    bg: "bg-cyan-500/10",
    border: "border-cyan-500/30",
    icon: "✍️",
  },

  impact: {
    bg: "bg-purple-500/10",
    border: "border-purple-500/30",
    icon: "📊",
  },

  enhancement: {
    bg: "bg-indigo-500/10",
    border: "border-indigo-500/30",
    icon: "⭐",
  },

  critical: {
    bg: "bg-red-500/10",
    border: "border-red-500/30",
    icon: "🚨",
  },

  warning: {
    bg: "bg-yellow-500/10",
    border: "border-yellow-500/30",
    icon: "⚠️",
  },

  success: {
    bg: "bg-green-500/10",
    border: "border-green-500/30",
    icon: "✅",
  },
}

const RING_COLORS = {
  green: "#22c55e",
  yellow: "#eab308",
  red: "#ef4444",
}

function ScoreRing({ score, color }) {
  const r = 52
  const circ = 2 * Math.PI * r
  const dash = (Math.min(score, 100) / 100) * circ

  const hex = RING_COLORS[color] || RING_COLORS.yellow

  return (
    <svg width="140" height="140" viewBox="0 0 140 140">

      <circle
        cx="70"
        cy="70"
        r={r}
        fill="none"
        stroke="rgba(255,255,255,0.08)"
        strokeWidth="10"
      />

      <circle
        cx="70"
        cy="70"
        r={r}
        fill="none"
        stroke={hex}
        strokeWidth="10"
        strokeDasharray={`${dash} ${circ}`}
        strokeLinecap="round"
        transform="rotate(-90 70 70)"
        style={{
          transition:
            "stroke-dasharray 0.9s cubic-bezier(.4,0,.2,1)",
        }}
      />

      <text
        x="70"
        y="62"
        textAnchor="middle"
        fill="white"
        fontSize="26"
        fontWeight="700"
      >
        {score}%
      </text>

      <text
        x="70"
        y="80"
        textAnchor="middle"
        fill="rgba(255,255,255,0.4)"
        fontSize="10"
      >
        Match Score
      </text>

    </svg>
  )
}

export default function ResultPanel({ result }) {

  const {
    probability,
    raw_similarity,
    verdict,
    tips,
  } = result

  return (
    <div className="space-y-4 animate-in fade-in duration-300">

      <div className="bg-white/5 rounded-xl p-5 border border-white/10 text-center">

        <div className="flex justify-center">
          <ScoreRing
            score={probability}
            color={verdict.color}
          />
        </div>

        <p className="text-lg font-semibold mt-2">
          {verdict.emoji} {verdict.label}
        </p>

        <p className="text-sm text-slate-400 mt-1 max-w-xs mx-auto">
          {verdict.message}
        </p>

        <div className="flex justify-center gap-6 mt-4">

          <div className="text-center">
            <p className="text-xs text-slate-500">
              ATS Score
            </p>
            <p className="text-white font-semibold">
              {probability}%
            </p>
          </div>

          <div className="w-px bg-white/10" />

          <div className="text-center">
            <p className="text-xs text-slate-500">
              Raw Similarity
            </p>
            <p className="text-white font-semibold">
              {raw_similarity}%
            </p>
          </div>

          <div className="w-px bg-white/10" />

          <div className="text-center">
            <p className="text-xs text-slate-500">
              Tips
            </p>
            <p className="text-white font-semibold">
              {tips.length}
            </p>
          </div>

        </div>

      </div>

      <div className="bg-white/5 rounded-xl p-4 border border-white/10">

        <h3 className="text-xs font-semibold text-blue-300 uppercase tracking-widest mb-3">
          💡 Improvement Tips
        </h3>

        <div className="space-y-2">

          {tips.map((tip, i) => {

            const s =
              TIP_STYLES[tip.type] ||
              TIP_STYLES.warning

            return (
              <div
                key={i}
                className={`rounded-lg p-3 border ${s.bg} ${s.border}`}
              >

                <p className="text-sm font-medium text-white">
                  {s.icon} {tip.title}
                </p>

                <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                  {tip.detail}
                </p>

              </div>
            )
          })}

        </div>

      </div>

      <p className="text-xs text-slate-600 text-center px-4">
        Score is based on TF-IDF keyword similarity
        trained on resume-job datasets.
      </p>

    </div>
  )
}