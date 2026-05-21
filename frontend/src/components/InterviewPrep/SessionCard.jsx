import { useNavigate } from "react-router-dom";
import { Trash2 } from "lucide-react";

const SessionCard = ({ session, onDelete }) => {
  const navigate = useNavigate();

  const isQuiz = session.sessionType === "quiz";
  const totalQuestions = isQuiz
    ? session.quizQuestions?.length || 0
    : session.questions?.length || 0;

  // Calculate score if quiz was submitted
  const quizScore = isQuiz && session.quizSubmitted
    ? session.quizQuestions.filter(q => q.userAnswer === q.correctAnswer).length
    : null;

  const handleDelete = async (e) => {
    e.stopPropagation();
    const confirmDelete = window.confirm("Delete this session?");
    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/interview/sessions/${session._id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) onDelete(session._id);
      else alert("Failed to delete session");
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  return (
    <div className="session-card" onClick={() => navigate(`/sessions/${session._id}`)}>
      <button className="delete-btn" onClick={handleDelete}>
        <Trash2 size={18} />
      </button>

      <div className="session-header">
        <div className="session-icon">
          {session.role?.substring(0, 2).toUpperCase()}
        </div>
        <div>
          <h3>{session.role}</h3>
          <p>{session.topics?.join(", ")}</p>
        </div>
      </div>

      <div className="session-tags">
        <span>Level: {session.experience}</span>
        {/* Show quiz badge OR Q&A count */}
        {isQuiz ? (
          <>
            <span style={{ background: "#ff7f00", color: "#fff" }}>Quiz</span>
            {quizScore !== null && (
              <span>{quizScore}/{totalQuestions} Score</span>
            )}
          </>
        ) : (
          <span>{totalQuestions} Q&A</span>
        )}
        <span>Updated: {new Date(session.createdAt).toLocaleDateString()}</span>
      </div>

      <p className="session-desc">
        {session.description || "Interview preparation session"}
      </p>
    </div>
  );
};

export default SessionCard;