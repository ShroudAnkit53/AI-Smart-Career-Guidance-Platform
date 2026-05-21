import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../components/HomePage/Sidebar'
import AnalysisResult from '../components/SkillGapAnalysis/AnalysisResult'
import { analyzeSkills, getJobTitles } from '../api/skillGapApi'
import {
  Loader2, Zap, User, Briefcase, Code2, FileText, ChevronDown, Users
} from 'lucide-react'

// ─── Skill Tag Input ──────────────────────────────────────────────────────────
function SkillTagInput({ value, onChange, color = 'orange' }) {
  const [input, setInput] = useState('')
  const [tags, setTags] = useState(() =>
    value ? value.split(',').map(s => s.trim()).filter(Boolean) : []
  )
  const inputRef = useRef(null)

  const tagStyle = color === 'purple'
    ? { bg: 'rgba(167,139,250,0.15)', text: '#c4b5fd', border: 'rgba(167,139,250,0.35)', boxBorder: 'rgba(167,139,250,0.2)' }
    : { bg: 'rgba(249,115,22,0.15)',  text: '#fb923c', border: 'rgba(249,115,22,0.35)',  boxBorder: 'rgba(249,115,22,0.2)' }

  const commitSkills = (raw) => {
    const parts = raw.split(',').map(s => s.trim()).filter(Boolean)
    if (!parts.length) return
    const existing = new Set(tags.map(t => t.toLowerCase()))
    const fresh = parts.filter(p => !existing.has(p.toLowerCase()))
    const next = [...tags, ...fresh]
    setTags(next)
    onChange(next.join(', '))
    setInput('')
  }

  const removeTag = (tag) => {
    const next = tags.filter(t => t !== tag)
    setTags(next)
    onChange(next.join(', '))
  }

  return (
    <div
      className="min-h-[52px] w-full rounded-xl px-3 py-2 flex flex-wrap gap-2 items-center cursor-text transition-colors"
      style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${tagStyle.boxBorder}` }}
      onClick={() => inputRef.current?.focus()}
    >
      {tags.map(tag => (
        <span key={tag}
          className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-mono font-medium"
          style={{ background: tagStyle.bg, color: tagStyle.text, border: `1px solid ${tagStyle.border}` }}
        >
          {tag}
          <button type="button"
            onClick={e => { e.stopPropagation(); removeTag(tag) }}
            className="ml-0.5 hover:text-red-400 transition-colors leading-none cursor-pointer"
          >×</button>
        </span>
      ))}
      <input
        ref={inputRef}
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); commitSkills(input) }
          if (e.key === 'Backspace' && !input && tags.length) removeTag(tags[tags.length - 1])
        }}
        onPaste={e => { e.preventDefault(); commitSkills(e.clipboardData.getData('text')) }}
        onBlur={() => { if (input.trim()) commitSkills(input) }}
        placeholder={tags.length === 0
          ? 'Type + Enter, or paste comma-separated list…'
          : 'Add more…'}
        className="flex-1 min-w-[180px] bg-transparent outline-none text-sm text-neutral-200 placeholder-neutral-500"
      />
    </div>
  )
}

// ─── Skills preview ───────────────────────────────────────────────────────────
function SkillsPreview({ value, color }) {
  if (!value) return null
  const count = value.split(',').filter(s => s.trim()).length
  const dotColor = color === 'purple' ? '#a78bfa' : '#f97316'
  return (
    <p className="text-xs text-neutral-500 font-mono px-1 -mt-2">
      <span style={{ color: dotColor }}>✅ {count} skill{count !== 1 ? 's' : ''} ready: </span>
      <span style={{ color: dotColor }}>{value}</span>
    </p>
  )
}

// ─── Field wrapper ────────────────────────────────────────────────────────────
function Field({ label, icon: Icon, iconColor = 'text-orange-400', children, hint }) {
  return (
    <div className="space-y-2">
      <label className="flex items-center gap-2 text-sm font-medium text-neutral-300">
        <Icon className={`w-4 h-4 ${iconColor}`} />
        {label}
      </label>
      {children}
      {hint && <p className="text-xs text-neutral-500">{hint}</p>}
    </div>
  )
}

// ─── Section Divider ──────────────────────────────────────────────────────────
function SectionDivider({ label }) {
  return (
    <div className="flex items-center gap-3 py-1">
      <div className="flex-1 h-px bg-white/5" />
      <span className="text-xs font-mono text-neutral-500 uppercase tracking-widest">{label}</span>
      <div className="flex-1 h-px bg-white/5" />
    </div>
  )
}

// ─── Job Title Autocomplete ───────────────────────────────────────────────────
function JobTitleInput({ value, onChange, suggestions }) {
  const [open, setOpen] = useState(false)
  const filtered = suggestions
    .filter(t => t.toLowerCase().includes(value.toLowerCase()) && t !== value)
    .slice(0, 8)

  return (
    <div className="relative">
      <div className="relative">
        <input
          value={value}
          onChange={e => { onChange(e.target.value); setOpen(true) }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          placeholder="e.g. Data Scientist, DevOps Engineer…"
          className="w-full rounded-xl px-4 py-3 text-sm text-neutral-200 placeholder-neutral-500 outline-none pr-8 bg-neutral-800 border border-neutral-700 focus:border-orange-500 transition-colors"
        />
        <ChevronDown className="absolute right-3 top-3.5 w-4 h-4 text-neutral-500 pointer-events-none" />
      </div>
      {open && filtered.length > 0 && (
        <div className="absolute z-50 w-full mt-1 rounded-xl overflow-hidden shadow-2xl bg-neutral-800 border border-neutral-700">
          {filtered.map(t => (
            <button key={t} type="button"
              onMouseDown={() => { onChange(t); setOpen(false) }}
              className="w-full text-left px-4 py-2.5 text-sm text-neutral-300 hover:bg-orange-500/10 hover:text-orange-400 transition-colors font-mono cursor-pointer"
            >{t}</button>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
const SkillGapAnalysis = () => {
  const [user, setUser] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const navigate = useNavigate()

  const [form, setForm] = useState({
    name:           '',
    skills:         '',
    softSkills:     '',
    jobTitle:       '',
    jobDescription: '',
  })
  const [jobSuggestions, setJobSuggestions] = useState([])
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  // Fetch user profile
  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('token')
      const response = await fetch('http://localhost:5000/user/profile', {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await response.json()
      if (data.status) {
        setUser(data.data)
        // Pre-fill name from profile
        setForm(f => ({ ...f, name: data.data.name || '' }))
      } else {
        localStorage.removeItem('token')
        navigate('/login')
      }
    }
    fetchProfile()
  }, [navigate])

  // Fetch job title suggestions
  useEffect(() => {
    getJobTitles()
      .then(d => setJobSuggestions(d.titles || []))
      .catch(() => {})
  }, [])

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim())    { setError('Please enter your name.'); return }
    if (!form.jobTitle.trim()) { setError('Please enter a job title.'); return }
    if (!form.skills.trim()) {
      setError('Please add at least one IT skill. Type it and press Enter.')
      return
    }
    setLoading(true); setError(null)
    try {
      const data = await analyzeSkills(form)
      setResult(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (!user) return (
    <div className="bg-neutral-950 min-h-screen text-white flex items-center justify-center">
      Loading...
    </div>
  )

  return (
    <div className="flex bg-neutral-950 text-white min-h-screen">

      {/* Sidebar */}
      <Sidebar user={user} isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      {/* Main Content */}
      <div className="flex-1 w-full">

        {/* Mobile Navbar */}
        <div className="md:hidden flex items-center justify-between p-4 border-b border-neutral-800 bg-neutral-900">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-orange-500 text-2xl cursor-pointer"
          >
            ☰
          </button>
          <h1 className="text-lg font-semibold text-orange-500">CareerAI</h1>
        </div>

        {/* Page Content */}
        <div className="p-6 md:p-10">

          {/* Page Header */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/25">
                <Zap className="w-3.5 h-3.5 text-orange-400" />
                <span className="text-xs font-mono text-orange-400 tracking-wider uppercase">AI-Powered</span>
              </div>
            </div>
            <h1 className="text-2xl md:text-3xl font-semibold mb-2">
              Skill <span className="text-orange-500">Gap Analysis</span>
            </h1>
            <p className="text-neutral-400">
              Discover your IT & soft skill gaps for any role and get personalized YouTube learning paths.
            </p>
          </div>

          {/* Form or Result */}
          {!result ? (
            <form onSubmit={handleSubmit} className="max-w-3xl space-y-6">

              {/* Row: Name + Job Title */}
              <div className="grid md:grid-cols-2 gap-6">
                <Field label="Your Name" icon={User}>
                  <input
                    value={form.name}
                    onChange={e => set('name', e.target.value)}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full rounded-xl px-4 py-3 text-sm text-neutral-200 placeholder-neutral-500 outline-none bg-neutral-800 border border-neutral-700 focus:border-orange-500 transition-colors"
                  />
                </Field>

                <Field label="Target Job Title" icon={Briefcase} hint="Pick from dropdown or type your own">
                  <JobTitleInput
                    value={form.jobTitle}
                    onChange={v => set('jobTitle', v)}
                    suggestions={jobSuggestions}
                  />
                </Field>
              </div>

              <SectionDivider label="Your Skills" />

              {/* IT Skills */}
              <Field
                label="IT / Technical Skills"
                icon={Code2}
                iconColor="text-orange-400"
                hint='💡 Press Enter or comma after each — or paste "Python, SQL, Docker" to add all at once'
              >
                <SkillTagInput
                  value={form.skills}
                  onChange={v => set('skills', v)}
                  color="orange"
                />
              </Field>
              <SkillsPreview value={form.skills} color="orange" />

              {/* Soft Skills */}
              <Field
                label="Soft Skills"
                icon={Users}
                iconColor="text-purple-400"
                hint='💡 e.g. Communication, Problem-solving, Leadership, Teamwork'
              >
                <SkillTagInput
                  value={form.softSkills}
                  onChange={v => set('softSkills', v)}
                  color="purple"
                />
              </Field>
              <SkillsPreview value={form.softSkills} color="purple" />

              <SectionDivider label="Job Details" />

              {/* Job Description */}
              <Field label="Job Description (optional)" icon={FileText}
                hint="Paste the JD to improve role matching accuracy">
                <textarea
                  value={form.jobDescription}
                  onChange={e => set('jobDescription', e.target.value)}
                  placeholder="Paste the job description here…"
                  rows={4}
                  className="w-full rounded-xl px-4 py-3 text-sm text-neutral-200 placeholder-neutral-500 outline-none bg-neutral-800 border border-neutral-700 focus:border-orange-500 transition-colors resize-none"
                />
              </Field>

              {/* Error */}
              {error && (
                <p className="text-red-400 text-sm px-4 py-3 rounded-xl"
                  style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
                  ⚠️ {error}
                </p>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-semibold text-base tracking-wide transition-all duration-300 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                style={{
                  background: loading
                    ? 'rgba(249,115,22,0.4)'
                    : 'linear-gradient(135deg,#c2410c 0%,#ea580c 50%,#f97316 100%)',
                  color: '#fff',
                  boxShadow: loading ? 'none' : '0 8px 32px rgba(249,115,22,0.35)',
                }}
              >
                {loading
                  ? <><Loader2 className="w-5 h-5 animate-spin" />Analyzing your skills…</>
                  : <><Zap className="w-5 h-5" />Analyze Skill Gap</>
                }
              </button>

              <p className="text-xs text-neutral-600 font-mono">
                Powered by JobsDatasetProcessed.csv · 3000 Roles · TF-IDF ML · YouTube API
              </p>
            </form>
          ) : (
            <div className="max-w-5xl">
              <AnalysisResult result={result} onReset={() => setResult(null)} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default SkillGapAnalysis
