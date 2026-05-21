import { useState } from "react"

function Field({
  label,
  name,
  value,
  onChange,
  textarea,
  placeholder,
  required,
  hint,
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-300 mb-1">
        {label}
        {required && <span className="text-red-400 ml-1">*</span>}
        {hint && (
          <span className="text-slate-500 font-normal ml-1">
            ({hint})
          </span>
        )}
      </label>

      {textarea ? (
        <textarea
          name={name}
          value={value}
          onChange={onChange}
          rows={3}
          placeholder={placeholder}
          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2
                     text-sm text-white placeholder-slate-600 focus:outline-none
                     focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30
                     resize-none transition-colors"
        />
      ) : (
        <input
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2
                     text-sm text-white placeholder-slate-600 focus:outline-none
                     focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30
                     transition-colors"
        />
      )}
    </div>
  )
}

const EMPTY_FORM = {
  education: "",
  skills: "",
  projects: "",
  experience: "",
  internships: "",
}

export default function ResumeForm({
  mode,
  onAnalyze,
  loading,
}) {
  const [form, setForm] = useState(EMPTY_FORM)
  const [jd, setJd] = useState("")
  const [pdfFile, setPdfFile] = useState(null)

  const handleChange = (e) =>
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!jd.trim()) {
      alert("Please paste a Job Description.")
      return
    }

    if (mode === "upload" && !pdfFile) {
      alert("Please upload a PDF resume.")
      return
    }

    onAnalyze({
      resume: form,
      jd_text: jd,
      pdfFile: mode === "upload" ? pdfFile : null,
    })
  }

  const handleReset = () => {
    setForm(EMPTY_FORM)
    setJd("")
    setPdfFile(null)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">

      {/* Resume Block */}
      <div className="bg-white/5 rounded-xl p-4 space-y-3 border border-white/10">

        <h2 className="text-xs font-semibold text-blue-300 uppercase tracking-widest">
          Resume Info
        </h2>

        {mode === "upload" ? (
          <div>

            <label className="block text-xs font-medium text-slate-300 mb-1">
              Upload PDF Resume
              <span className="text-red-400 ml-1">*</span>
            </label>

            <input
              type="file"
              accept=".pdf"
              onChange={(e) =>
                setPdfFile(e.target.files[0] || null)
              }
              className="w-full text-sm text-slate-400
                         file:mr-3 file:py-1.5 file:px-3
                         file:rounded-lg file:border-0
                         file:bg-blue-600 file:text-white file:text-xs
                         file:cursor-pointer hover:file:bg-blue-500
                         file:transition-colors"
            />

            {pdfFile && (
              <p className="text-xs text-green-400 mt-1">
                ✓ {pdfFile.name}
              </p>
            )}

          </div>
        ) : (
          <>

            <Field
              label="Education"
              name="education"
              value={form.education}
              onChange={handleChange}
              required
              placeholder="B.Tech CSE, XYZ University, CGPA 8.5"
            />

            <Field
              label="Skills"
              name="skills"
              value={form.skills}
              onChange={handleChange}
              textarea
              required
              placeholder="React, Node.js, Python, SQL, Machine Learning..."
            />

            <Field
              label="Projects"
              name="projects"
              value={form.projects}
              onChange={handleChange}
              textarea
              placeholder="AI chatbot, E-commerce website..."
            />

            <Field
              label="Experience"
              name="experience"
              value={form.experience}
              onChange={handleChange}
              textarea
              hint="leave blank if fresher"
              placeholder="Frontend Developer Intern..."
            />

            <Field
              label="Internships"
              name="internships"
              value={form.internships}
              onChange={handleChange}
              textarea
              placeholder="ML Intern at XYZ..."
            />

          </>
        )}

      </div>

      {/* JD Block */}
      <div className="bg-white/5 rounded-xl p-4 space-y-3 border border-white/10">

        <h2 className="text-xs font-semibold text-blue-300 uppercase tracking-widest">
          Job Description
        </h2>

        <textarea
          value={jd}
          onChange={(e) => setJd(e.target.value)}
          rows={6}
          placeholder="Paste the job description here..."
          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2
                     text-sm text-white placeholder-slate-600 focus:outline-none
                     focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30
                     resize-none transition-colors"
        />

      </div>

      {/* Actions */}
      <div className="flex gap-3 flex-wrap">

        <button
          type="submit"
          disabled={loading}
          className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50
                     disabled:cursor-not-allowed rounded-xl font-semibold text-sm
                     transition-colors"
        >
          {loading ? "⏳ Analyzing..." : "🔍 Analyze Match"}
        </button>

        <button
          type="button"
          onClick={handleReset}
          disabled={loading}
          className="px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10
                     rounded-xl text-sm text-slate-400 transition-colors"
        >
          Reset
        </button>
      </div>

      <p className="text-xs text-orange-300 font-medium mt-3">
        *Use this analysis as a guide, not as a final decision.
      </p>

    </form>
  )
}