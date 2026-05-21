import ScoreRing from './ScoreRing'
import SkillChip from './SkillChip'
import YouTubeCard from './YouTubeCard'
import {
  CheckCircle2,
  XCircle,
  Sparkles,
  BookOpen,
  Briefcase,
  RotateCcw,
  Cpu,
  Users,
  GraduationCap,
} from 'lucide-react'
import CourseCard from './CourseCard'

// Mini score bar for IT vs Soft breakdown
function ScoreBar({ label, score, color }) {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center">
        <span className="text-xs text-slate-400 font-body">{label}</span>

        <span
          className="text-xs font-mono font-medium"
          style={{ color }}
        >
          {score}%
        </span>
      </div>

      <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-1000"
          style={{
            width: `${score}%`,
            background: color,
          }}
        />
      </div>
    </div>
  )
}

export default function AnalysisResult({ result, onReset }) {
  const {
    name,
    matchedJobTitle,
    matchedJobDescription,
    jobSimilarity,

    requiredITSkills,
    requiredSoftSkills,
    userSkills,

    matchedITSkills,
    missingITSkills,
    itScore,

    matchedSoftSkills,
    missingSoftSkills,
    softScore,

    extraSkills,
    score,

    youtubeResources,
    courseResources,
  } = result

  const allMissing = [
    ...new Set([
      ...(missingITSkills || []),
      ...(missingSoftSkills || []),
    ]),
  ]

  return (
    <div className="space-y-6 animate-fade-up">

      {/* ── Header card ──────────────────────────────────────────────── */}
      <div className="glass rounded-2xl p-6 glow-teal">
        <div className="flex flex-col md:flex-row items-center gap-8">

          <div className="flex flex-wrap gap-6 justify-center md:justify-start">
            <ScoreRing
              score={itScore}
              title="IT Skills"
              color="#2dd4bf"
            />

            <ScoreRing
              score={softScore}
              title="Soft Skills"
              color="#a78bfa"
            />
          </div>

          <div className="flex-1 text-center md:text-left space-y-3">

            <div>
              <p className="text-brand-400 text-sm font-mono mb-1">
                Analysis for
              </p>

              <h2 className="font-display text-3xl font-700 text-white">
                {name}
              </h2>
            </div>

            <div className="flex flex-wrap gap-2 justify-center md:justify-start">
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-700 text-slate-300 text-sm">
                <Briefcase className="w-3.5 h-3.5 text-brand-400" />
                {matchedJobTitle}
              </span>

              <span className="px-3 py-1 rounded-full bg-surface-700 text-slate-400 text-xs font-mono">
                {jobSimilarity}% role similarity
              </span>
            </div>

            <p className="text-slate-400 text-sm leading-relaxed max-w-lg line-clamp-3">
              {matchedJobDescription}
            </p>

            {/* IT vs Soft score breakdown */}
            <div className="pt-2 space-y-2 max-w-xs">
              <ScoreBar
                label="IT Skills Match"
                score={itScore}
                color="#2dd4bf"
              />

              <ScoreBar
                label="Soft Skills Match"
                score={softScore}
                color="#a78bfa"
              />

              <p className="text-xs text-slate-500 font-mono">
                Overall = IT×70% + Soft×30%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Stats row ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

        {[
          {
            label: 'IT Matched',
            count: (matchedITSkills || []).length,
            color: '#2dd4bf',
            bg: 'rgba(45,212,191,0.08)',
          },

          {
            label: 'IT Missing',
            count: (missingITSkills || []).length,
            color: '#ef4444',
            bg: 'rgba(239,68,68,0.08)',
          },

          {
            label: 'Soft Matched',
            count: (matchedSoftSkills || []).length,
            color: '#a78bfa',
            bg: 'rgba(167,139,250,0.08)',
          },

          {
            label: 'Soft Missing',
            count: (missingSoftSkills || []).length,
            color: '#f97316',
            bg: 'rgba(249,115,22,0.08)',
          },
        ].map((s) => (
          <div
            key={s.label}
            className="glass rounded-xl p-4 text-center"
            style={{ background: s.bg }}
          >
            <div
              className="font-display text-3xl font-700"
              style={{ color: s.color }}
            >
              {s.count}
            </div>

            <div className="text-xs text-slate-400 font-body mt-1">
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* ── IT Skills section ─────────────────────────────────────────── */}
      <div>

        <div className="flex items-center gap-2 mb-3">
          <Cpu className="w-4 h-4 text-brand-400" />

          <h3 className="font-display text-lg font-600 text-white">
            IT Skills
          </h3>

          <span
            className="text-xs font-mono text-brand-400 px-2 py-0.5 rounded-full"
            style={{
              background: 'rgba(45,212,191,0.1)',
              border: '1px solid rgba(45,212,191,0.2)',
            }}
          >
            70% weight
          </span>
        </div>

        <div className="grid md:grid-cols-2 gap-4">

          {/* Matched IT */}
          <div className="glass rounded-2xl p-5">

            <div className="flex items-center gap-2 mb-3">
              <CheckCircle2 className="w-4 h-4 text-brand-400" />

              <span className="font-display font-600 text-white text-sm">
                Skills You Have
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              {(matchedITSkills || []).length > 0 ? (
                matchedITSkills.map((s) => (
                  <SkillChip
                    key={s}
                    label={s}
                    variant="matched"
                  />
                ))
              ) : (
                <p className="text-slate-500 text-sm">
                  No IT skills matched yet
                </p>
              )}
            </div>
          </div>

          {/* Missing IT */}
          <div className="glass rounded-2xl p-5">

            <div className="flex items-center gap-2 mb-3">
              <XCircle className="w-4 h-4 text-red-400" />

              <span className="font-display font-600 text-white text-sm">
                Skills to Learn
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              {(missingITSkills || []).length > 0 ? (
                missingITSkills.map((s) => (
                  <SkillChip
                    key={s}
                    label={s}
                    variant="missing"
                  />
                ))
              ) : (
                <p className="text-slate-500 text-sm">
                  🎉 All IT skills matched!
                </p>
              )}
            </div>
          </div>
        </div>

        {/* All required IT skills */}
        <div className="glass rounded-2xl p-5 mt-4">

          <div className="flex items-center gap-2 mb-3">
            <BookOpen className="w-4 h-4 text-slate-400" />

            <span className="font-display font-600 text-white text-sm">
              All Required IT Skills
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {(requiredITSkills || []).map((s) => (
              <SkillChip
                key={s}
                label={s}
                variant={
                  (matchedITSkills || []).includes(s)
                    ? 'matched'
                    : 'missing'
                }
              />
            ))}
          </div>
        </div>
      </div>

      {/* ── Soft Skills section ───────────────────────────────────────── */}
      <div>

        <div className="flex items-center gap-2 mb-3">
          <Users className="w-4 h-4 text-purple-400" />

          <h3 className="font-display text-lg font-600 text-white">
            Soft Skills
          </h3>

          <span
            className="text-xs font-mono text-purple-400 px-2 py-0.5 rounded-full"
            style={{
              background: 'rgba(167,139,250,0.1)',
              border: '1px solid rgba(167,139,250,0.2)',
            }}
          >
            30% weight
          </span>
        </div>

        <div className="grid md:grid-cols-2 gap-4">

          {/* Matched Soft */}
          <div className="glass rounded-2xl p-5">

            <div className="flex items-center gap-2 mb-3">
              <CheckCircle2 className="w-4 h-4 text-purple-400" />

              <span className="font-display font-600 text-white text-sm">
                Soft Skills You Have
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              {(matchedSoftSkills || []).length > 0 ? (
                matchedSoftSkills.map((s) => (
                  <SkillChip
                    key={s}
                    label={s}
                    variant="soft_matched"
                  />
                ))
              ) : (
                <p className="text-slate-500 text-sm">
                  No soft skills matched yet
                </p>
              )}
            </div>
          </div>

          {/* Missing Soft */}
          <div className="glass rounded-2xl p-5">

            <div className="flex items-center gap-2 mb-3">
              <XCircle className="w-4 h-4 text-orange-400" />

              <span className="font-display font-600 text-white text-sm">
                Soft Skills to Develop
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              {(missingSoftSkills || []).length > 0 ? (
                missingSoftSkills.map((s) => (
                  <SkillChip
                    key={s}
                    label={s}
                    variant="soft_missing"
                  />
                ))
              ) : (
                <p className="text-slate-500 text-sm">
                  🎉 All soft skills matched!
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Bonus Skills ─────────────────────────────────────────────── */}
      {(extraSkills || []).length > 0 && (
        <div className="glass rounded-2xl p-5">

          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-indigo-400" />

            <h3 className="font-display font-600 text-white">
              Bonus Skills You Have
            </h3>

            <span className="text-xs text-slate-500 font-body">
              — beyond the role requirements
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {extraSkills.map((s) => (
              <SkillChip
                key={s}
                label={s}
                variant="extra"
              />
            ))}
          </div>
        </div>
      )}

      {/* ── YouTube Learning Resources ────────────────────────────────── */}
      {allMissing.length > 0 &&
        Object.keys(youtubeResources || {}).length > 0 && (
          <div>

            <div className="flex items-center gap-3 mb-4">

              <div className="w-8 h-8 rounded-lg bg-red-600/20 flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-red-500"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M23.5 6.19a3.02 3.02 0 00-2.12-2.14C19.54 3.5 12 3.5 12 3.5s-7.54 0-9.38.55A3.02 3.02 0 00.5 6.19C0 8.04 0 12 0 12s0 3.96.5 5.81a3.02 3.02 0 002.12 2.14C4.46 20.5 12 20.5 12 20.5s7.54 0 9.38-.55a3.02 3.02 0 002.12-2.14C24 15.96 24 12 24 12s0-3.96-.5-5.81zM9.75 15.52V8.48L15.5 12l-5.75 3.52z" />
                </svg>
              </div>

              <div>
                <h3 className="font-display text-xl font-700 text-white">
                  Learn Missing Skills

                  <span className="ml-2 text-sm font-body font-normal text-slate-400">
                    via YouTube
                  </span>
                </h3>

                <p className="text-xs text-slate-500 font-body">
                  Covering both IT and Soft skill gaps
                </p>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {Object.entries(youtubeResources).map(
                ([skill, resource]) => (
                  <YouTubeCard
                    key={skill}
                    skill={skill}
                    resource={resource}
                  />
                )
              )}
            </div>
          </div>
        )}

      {/* ── Course Recommendations ───────────────────────────────── */}
      {courseResources &&
        Object.keys(courseResources).length > 0 && (
          <div>

            <div className="flex items-center gap-3 mb-4">

              <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                <GraduationCap className="w-4 h-4 text-cyan-400" />
              </div>

              <div>
                <h3 className="font-display text-xl font-700 text-white">
                  Recommended Courses
                </h3>

                <p className="text-xs text-slate-500 font-body">
                  Curated learning paths for your missing skills
                </p>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(courseResources).map(
                ([skill, courses]) => (
                  <CourseCard
                    key={skill}
                    skill={skill}
                    courses={courses}
                  />
                )
              )}
            </div>
          </div>
        )}

      {/* ── Reset ────────────────────────────────────────────────────── */}
      <div className="flex justify-center pt-4">
        <button
          onClick={onReset}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-surface-700 hover:bg-surface-600 text-slate-300 hover:text-white transition-all duration-200 font-body font-medium"
        >
          <RotateCcw className="w-4 h-4" />

          Analyze Another Role
        </button>
      </div>
    </div>
  )
}