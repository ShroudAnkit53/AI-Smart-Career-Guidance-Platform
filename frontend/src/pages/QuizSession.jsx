import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const QuizSession = ({ session: initialSession }) => {
  const navigate = useNavigate();
  const [session, setSession] = useState(initialSession);
  const [answers, setAnswers] = useState(
    // Pre-fill from saved answers if already submitted
    initialSession.quizQuestions.map(q => q.userAnswer ?? -1)
  );
  const [submitted, setSubmitted] = useState(initialSession.quizSubmitted || false);
  const [submitting, setSubmitting] = useState(false);

  const questions = session.quizQuestions || [];

  // Score calculation
  const score = submitted
    ? questions.filter((q, i) => answers[i] === q.correctAnswer).length
    : null;
  const percent = score !== null ? Math.round((score / questions.length) * 100) : null;

  const getPerformanceLabel = (pct) => {
    if (pct >= 90) return { label: "Excellent!", color: "#22c55e" };
    if (pct >= 70) return { label: "Good job!", color: "#ff7f00" };
    if (pct >= 50) return { label: "Keep practicing", color: "#eab308" };
    return { label: "Needs improvement", color: "#ef4444" };
  };

  const handleSelect = (qIndex, optIndex) => {
    if (submitted) return;
    setAnswers(prev => {
      const updated = [...prev];
      updated[qIndex] = optIndex;
      return updated;
    });
  };

  const handleSubmit = async () => {
    const unanswered = answers.filter(a => a === -1).length;
    if (unanswered > 0) {
      if (!window.confirm(`You have ${unanswered} unanswered question(s). Submit anyway?`)) return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/ai/sessions/${session._id}/submit-quiz`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ answers }),
      });

      if (!res.ok) throw new Error("Submit failed");

      const data = await res.json();
      setSession(data.session);
      setSubmitted(true);
      // Scroll to results
      setTimeout(() => document.getElementById("quiz-results")?.scrollIntoView({ behavior: "smooth" }), 100);
    } catch (err) {
      console.error(err);
      alert("Failed to submit quiz. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const perf = submitted ? getPerformanceLabel(percent) : null;

  // Bar chart data: per-question correct/wrong
  const barData = submitted
    ? questions.map((q, i) => ({
        label: `Q${i + 1}`,
        correct: answers[i] === q.correctAnswer,
      }))
    : [];

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "24px 16px", color: "#fff" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
        <button
          onClick={() => navigate(-1)}
          style={{ background: "none", border: "none", color: "#ff7f00", cursor: "pointer", fontSize: "20px" }}>
          ←
        </button>
        <div>
          <h2 style={{ margin: 0, fontSize: "22px" }}>{session.role} — Quiz</h2>
          <p style={{ margin: 0, color: "#aaa", fontSize: "13px" }}>
            Level: {session.experience} &nbsp;|&nbsp; {questions.length} questions
            {submitted && <span style={{ color: perf.color, marginLeft: "8px" }}>✓ Submitted</span>}
          </p>
        </div>
      </div>

      {/* Progress bar (pre-submit) */}
      {!submitted && (
        <div style={{ marginBottom: "24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#aaa", marginBottom: "4px" }}>
            <span>{answers.filter(a => a !== -1).length} of {questions.length} answered</span>
          </div>
          <div style={{ background: "#333", borderRadius: "4px", height: "6px" }}>
            <div style={{
              height: "6px", borderRadius: "4px", background: "#ff7f00",
              width: `${(answers.filter(a => a !== -1).length / questions.length) * 100}%`,
              transition: "width 0.3s"
            }} />
          </div>
        </div>
      )}

      {/* Questions */}
      {questions.map((q, qi) => {
        const userAns = answers[qi];
        const isCorrect = submitted && userAns === q.correctAnswer;
        const isWrong = submitted && userAns !== -1 && userAns !== q.correctAnswer;

        return (
          <div key={qi} style={{
            background: "#1e1e1e",
            border: `1px solid ${submitted ? (isCorrect ? "#22c55e44" : isWrong ? "#ef444444" : "#333") : "#333"}`,
            borderRadius: "10px",
            padding: "20px",
            marginBottom: "16px"
          }}>
            {/* Question */}
            <p style={{ margin: "0 0 16px", fontSize: "15px", fontWeight: 500 }}>
              <span style={{ color: "#ff7f00", marginRight: "8px" }}>Q{qi + 1}.</span>
              {q.question}
            </p>

            {/* Options */}
            {q.options.map((opt, oi) => {
              let bg = "#2a2a2a";
              let border = "1px solid #444";
              let color = "#fff";

              if (submitted) {
                if (oi === q.correctAnswer) { bg = "#052e16"; border = "1px solid #22c55e"; color = "#4ade80"; }
                else if (oi === userAns && oi !== q.correctAnswer) { bg = "#2d0a0a"; border = "1px solid #ef4444"; color = "#f87171"; }
              } else if (userAns === oi) {
                bg = "#2a1a00"; border = "1px solid #ff7f00"; color = "#ff7f00";
              }

              return (
                <div
                  key={oi}
                  onClick={() => handleSelect(qi, oi)}
                  style={{
                    background: bg, border, borderRadius: "8px", padding: "10px 14px",
                    marginBottom: "8px", cursor: submitted ? "default" : "pointer",
                    color, fontSize: "14px", display: "flex", alignItems: "center", gap: "10px",
                    transition: "all 0.15s"
                  }}>
                  <span style={{
                    width: "22px", height: "22px", borderRadius: "50%",
                    border: `2px solid ${color}`, display: "flex", alignItems: "center",
                    justifyContent: "center", fontSize: "11px", flexShrink: 0
                  }}>
                    {["A", "B", "C"][oi]}
                  </span>
                  {opt}
                  {submitted && oi === q.correctAnswer && <span style={{ marginLeft: "auto" }}>✓</span>}
                  {submitted && oi === userAns && oi !== q.correctAnswer && <span style={{ marginLeft: "auto" }}>✗</span>}
                </div>
              );
            })}

            {/* Explanation (post-submit) */}
            {submitted && (
              <div style={{
                marginTop: "12px", padding: "12px 14px",
                background: "#0f1f0f", border: "1px solid #1a3a1a",
                borderRadius: "8px", fontSize: "13px", color: "#86efac"
              }}>
                <strong style={{ color: "#4ade80" }}>Explanation: </strong>
                {q.explanation}
              </div>
            )}
          </div>
        );
      })}

      {/* Submit button */}
      {!submitted && (
        <button
          onClick={handleSubmit}
          disabled={submitting}
          style={{
            width: "100%", padding: "14px", background: "#ff7f00",
            border: "none", borderRadius: "8px", color: "#fff",
            fontSize: "16px", fontWeight: 600, cursor: submitting ? "not-allowed" : "pointer",
            opacity: submitting ? 0.7 : 1, marginTop: "8px"
          }}>
          {submitting ? "Submitting..." : "Submit Quiz"}
        </button>
      )}

      {/* Results (post-submit) */}
      {submitted && (
        <div id="quiz-results" style={{
          marginTop: "32px", background: "#1e1e1e",
          border: "1px solid #333", borderRadius: "12px", padding: "28px"
        }}>
          <h3 style={{ margin: "0 0 20px", fontSize: "18px", textAlign: "center" }}>Your Results</h3>

          {/* Score circle */}
          <div style={{ textAlign: "center", marginBottom: "28px" }}>
            <div style={{
              display: "inline-flex", flexDirection: "column", alignItems: "center",
              justifyContent: "center", width: "120px", height: "120px",
              borderRadius: "50%", border: `4px solid ${perf.color}`,
              background: "#111"
            }}>
              <span style={{ fontSize: "32px", fontWeight: 700, color: perf.color }}>{score}/{questions.length}</span>
              <span style={{ fontSize: "14px", color: "#aaa" }}>{percent}%</span>
            </div>
            <p style={{ margin: "12px 0 0", fontSize: "18px", color: perf.color, fontWeight: 600 }}>
              {perf.label}
            </p>
          </div>

          {/* Performance bar chart */}
          <div style={{ marginBottom: "24px" }}>
            <p style={{ fontSize: "13px", color: "#aaa", marginBottom: "12px" }}>Question-by-question breakdown</p>
            <div style={{ display: "flex", gap: "6px", alignItems: "flex-end", height: "60px" }}>
              {barData.map((d, i) => (
                <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
                  <div style={{
                    width: "100%", height: d.correct ? "48px" : "24px",
                    background: d.correct ? "#22c55e" : "#ef4444",
                    borderRadius: "4px 4px 0 0", transition: "height 0.4s"
                  }} />
                  <span style={{ fontSize: "10px", color: "#666" }}>{d.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Performance analysis */}
          <div style={{
            background: "#111", borderRadius: "8px", padding: "16px",
            fontSize: "13px", lineHeight: "1.7", color: "#ccc"
          }}>
            <strong style={{ color: "#ff7f00", display: "block", marginBottom: "8px" }}>Performance Analysis</strong>
            {percent >= 90 && "Outstanding performance! You have a strong command of the subject. You're well-prepared for this role."}
            {percent >= 70 && percent < 90 && "Good understanding overall. Review the questions you missed and strengthen those areas before your interview."}
            {percent >= 50 && percent < 70 && "You have a basic understanding but there are clear gaps. Focus on the topics where you got answers wrong and revisit the fundamentals."}
            {percent < 50 && "This topic needs more study. Go back to basics, practice more questions, and focus especially on the areas where you struggled in this quiz."}
            <br /><br />
            <span style={{ color: "#aaa" }}>
              You got <strong style={{ color: "#22c55e" }}>{score} correct</strong> and{" "}
              <strong style={{ color: "#ef4444" }}>{questions.length - score} wrong</strong>.{" "}
              {answers.filter(a => a === -1).length > 0 &&
                `${answers.filter(a => a === -1).length} question(s) were left unanswered.`}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizSession;