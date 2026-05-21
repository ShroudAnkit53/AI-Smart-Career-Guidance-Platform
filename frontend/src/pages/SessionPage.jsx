import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { ChevronDown, Pin, Sparkles } from "lucide-react";
import QuizSession from "./QuizSession"; // ADD THIS

const SessionPage = () => {
  const { id } = useParams();
  const [session, setSession] = useState(null);
  const [expanded, setExpanded] = useState(null);
  const [detailed, setDetailed] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`http://localhost:5000/ai/sessions/${id}`)
      .then((res) => res.json())
      .then((data) => {
        console.log("Full session data:", data);
        console.log("Session object:", data.session);
        console.log("Questions:", data.session?.questions);
        console.log("Questions count:", data.session?.questions?.length);
        setSession(data.session);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching session:", err);
        setLoading(false);
      });
  }, [id]);

  if (loading) return <div style={{padding: '20px'}}><p>Loading session...</p></div>;
  if (!session) return <div style={{padding: '20px'}}><p>Session not found</p></div>;

  // ADD THIS BLOCK — routes quiz sessions to QuizSession component
  if (session.sessionType === "quiz") {
    return <QuizSession session={session} />;
  }

  // KEEP THIS — original guard for Q&A sessions
  if (!session.questions || session.questions.length === 0) {
    return <div style={{padding: '20px'}}><p>No questions available</p></div>;
  }

  return (
    <div className="session-container">
      
      {/* HEADER */}
      <div className="session-header">
        <h1>{session.role}</h1>

        <p className="session-topics">
          {session.topics?.join(", ")}
        </p>

        <div className="session-tags">
          <span>Experience: {session.experience}</span>
          <span>{session.questions.length} Q&A</span>
          <span>
            Last Updated: {new Date(session.createdAt).toDateString()}
          </span>
        </div>
      </div>

      {/* QUESTIONS */}
      <h2 className="qa-title">Interview Q & A</h2>

      <div className="qa-list">
        {session.questions.map((q, index) => (
          <div
            key={index}
            className={`qa-card ${expanded === index ? "active" : ""}`}
          >
            <div
              className="qa-question"
              onClick={() =>
                setExpanded(expanded === index ? null : index)
              }
            >
              <span className="question-text">
                {index + 1}. {q.question}
              </span>

              <div className="qa-controls">
                <div className="arrow-icon">
                  <ChevronDown size={18} />
                </div>

                <div className="hover-actions">
                  <button className="pin-btn">
                    <Pin size={16} />
                  </button>

                  <button
                    className="learn-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDetailed(detailed === index ? null : index);
                    }}
                  >
                    <Sparkles size={14} className="ai-icon" />
                    Learn More
                  </button>
                </div>
              </div>
            </div>

            <div className={`qa-answer ${expanded === index ? "show" : ""}`}>
              <p>{q.shortAnswer}</p>
            </div>

            {detailed === index && (
              <div className="qa-detailed">
                <h4>Detailed Explanation</h4>
                <p>{q.detailedAnswer}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SessionPage;