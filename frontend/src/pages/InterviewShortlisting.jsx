import { useState } from "react"

import Sidebar from "../components/HomePage/Sidebar"
import ResumeForm from "../components/InterviewShortlisting/ResumeForm"
import ResultPanel from "../components/InterviewShortlisting/ResultPanel"

import {
  analyzeInterviewProbability,
} from "../api/interviewShortlistingApi"

export default function InterviewShortlisting() {

  const [mode, setMode] = useState("form")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)

  const handleAnalyze = async ({
    resume,
    jd_text,
    pdfFile,
  }) => {

    try {

      setLoading(true)
      setResult(null)

      // SEND DIRECTLY
      const response =
        await analyzeInterviewProbability({

          jd_text,

          pdfFile,

          resume: resume || {
            education: "",
            skills: "",
            projects: "",
            experience: "",
            internships: "",
          },
        })

      setResult(response)

    } catch (err) {

      console.error(err)

      alert(
        err.message ||
        "Analysis failed"
      )

    } finally {

      setLoading(false)

    }
  }

  return (
    <div className="flex min-h-screen bg-black text-white">

      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 p-8 overflow-y-auto">

        {/* Header */}
        <div className="mb-8">

          <h1 className="text-3xl font-light">
            Interview Shortlisting Probability
          </h1>

          <p className="text-slate-400 mt-2 max-w-2xl">
            Analyze how likely your resume is to get shortlisted
            for a specific job description using AI-powered
            ATS similarity scoring.
          </p>

        </div>

        {/* Mode Toggle */}
        <div className="flex gap-3 mb-6">

          <button
            onClick={() => setMode("form")}
            className={`px-5 py-2 rounded-xl border transition-all duration-200 ${
              mode === "form"
                ? "bg-blue-600 border-blue-500 text-white"
                : "bg-white/5 border-white/10 hover:bg-white/10 text-slate-300"
            }`}
          >
            ✍️ Fill Resume Form
          </button>

          <button
            onClick={() => setMode("upload")}
            className={`px-5 py-2 rounded-xl border transition-all duration-200 ${
              mode === "upload"
                ? "bg-blue-600 border-blue-500 text-white"
                : "bg-white/5 border-white/10 hover:bg-white/10 text-slate-300"
            }`}
          >
            📄 Upload PDF Resume
          </button>

        </div>

        {/* Grid Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

          {/* Left */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">

            <ResumeForm
              mode={mode}
              onAnalyze={handleAnalyze}
              loading={loading}
            />

          </div>

          {/* Right */}
          <div>

            {result ? (

              <ResultPanel result={result} />

            ) : (

              <div className="bg-white/5 border border-white/10 rounded-2xl p-10 h-full flex items-center justify-center backdrop-blur-sm">

                <div className="text-center max-w-md">

                  <div className="text-6xl mb-4">
                    🚀
                  </div>

                  <h2 className="text-2xl font-bold mb-3">
                    Ready for Analysis
                  </h2>

                  <p className="text-slate-400 leading-relaxed">
                    Fill your resume details manually or upload
                    a PDF resume, then paste the job description
                    to calculate your interview shortlisting
                    probability.
                  </p>

                </div>

              </div>

            )}

          </div>

        </div>

      </div>

    </div>
  )
}