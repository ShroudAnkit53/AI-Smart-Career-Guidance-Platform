import { useState } from "react";
import { useNavigate } from "react-router-dom";

const CreateSessionModal = ({ close, setSessions }) => {
  const [role, setRole] = useState("");
  const [level, setLevel] = useState("");
  const [topics, setTopics] = useState("");
  const [description, setDescription] = useState("");
  const [sessionType, setSessionType] = useState("qa"); // NEW
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleCreate = async () => {
    if (!role.trim()) { alert("Please enter a role"); return; }
    if (!level) { alert("Please select a level"); return; }
    if (!topics.trim()) { alert("Please enter topics (comma-separated)"); return; }

    setLoading(true);

    try {
      const token = localStorage.getItem("token");

      const response = await fetch("http://localhost:5000/ai/generate-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          role,
          level,
          topics: topics.split(",").map((t) => t.trim()),
          description,
          sessionType,  // NEW
        }),
      });

      if (!response.ok) throw new Error("Failed to create session");

      const data = await response.json();

      if (data.session && data.session._id) {
        setSessions((prev) => [...prev, data.session]);
        close();
        navigate(`/sessions/${data.session._id}`);
      } else {
        alert("Error: Invalid session data received");
      }
    } catch (error) {
      console.error("Error creating session:", error);
      alert("Failed to create session. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>Create Interview Session</h2>

        <input
          placeholder="Role (e.g., Backend Developer)"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          disabled={loading}
        />

        <select value={level} onChange={(e) => setLevel(e.target.value)} disabled={loading}>
          <option value="">Select Level</option>
          <option value="Fresher">Fresher</option>
          <option value="Intermediate">Intermediate</option>
          <option value="Experienced">Experienced</option>
        </select>

        {/* NEW: Session Type Toggle */}
        <select value={sessionType} onChange={(e) => setSessionType(e.target.value)} disabled={loading}>
          <option value="qa">Q&A Session</option>
          <option value="quiz">Quiz Session (10 MCQs)</option>
        </select>

        <textarea
          placeholder="Topics (comma-separated, e.g., REST APIs, Database Design, Security)"
          value={topics}
          onChange={(e) => setTopics(e.target.value)}
          disabled={loading}
          style={{
            padding: "10px", border: "1px solid #444", borderRadius: "5px",
            background: "#2a2a2a", color: "white", fontFamily: "Poppins, sans-serif",
            resize: "vertical", minHeight: "60px", fontSize: "14px",
          }}
        />

        <textarea
          placeholder="Description/Focus areas (optional, e.g., Focus on microservices architecture and scalability)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={loading}
          style={{
            padding: "10px", border: "1px solid #444", borderRadius: "5px",
            background: "#2a2a2a", color: "white", fontFamily: "Poppins, sans-serif",
            resize: "vertical", minHeight: "60px", fontSize: "14px",
          }}
        />

        <button onClick={handleCreate} disabled={loading}
          style={{ opacity: loading ? 0.6 : 1, cursor: loading ? "not-allowed" : "pointer" }}>
          {loading ? "Generating... This may take a minute" : "Create Session"}
        </button>
        <button onClick={close} disabled={loading}
          style={{ opacity: loading ? 0.6 : 1, cursor: loading ? "not-allowed" : "pointer" }}>
          Cancel
        </button>

        {loading && (
          <div style={{ textAlign: "center", marginTop: "15px", color: "#ff7f00", fontSize: "14px" }}>
            <div style={{ display: "inline-block", animation: "spin 1s linear infinite", marginRight: "8px" }}>⚙️</div>
            Generating {sessionType === "quiz" ? "quiz questions" : "interview questions"} with AI...
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateSessionModal;