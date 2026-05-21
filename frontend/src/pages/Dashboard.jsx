import React, { useState, useEffect } from "react";
import SessionCard from "../components/InterviewPrep/SessionCard";
import CreateSessionModal from "../components/InterviewPrep/CreateSessionModal";

const Dashboard = () => {
  const [sessions, setSessions] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  const fetchSessions = async () => {
    try {

      const token = localStorage.getItem("token"); // ⭐ get saved token

      const response = await fetch(
        "http://localhost:5000/interview/sessions",
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const data = await response.json();

      if (Array.isArray(data)) {
        setSessions(data);
      } 
      else if (data.sessions) {
        setSessions(data.sessions);
      }

    } catch (error) {
      console.error("Error fetching sessions:", error);
    } finally {
      setLoading(false);
    }
  };

  fetchSessions();
}, []);

  if (loading) {
    return (
      <div className="dashboard">
        <p>Loading sessions...</p>
      </div>
    );
  }

  return (
    <div className="dashboard">

      <h2 className="dashboard-title">
        Your Interview Preparations
      </h2>

      <div className="session-grid">
        {sessions.length > 0 ? (
          sessions.map((session) => (
            <SessionCard
              key={session._id}
              session={session}
              onDelete={(id) =>
                setSessions((prev) => prev.filter((s) => s._id !== id))
              }
            />
          ))
        ) : (
          <p>No sessions created yet.</p>
        )}
      </div>

      {/* Floating Create Button */}
      <button
        className="floating-btn"
        onClick={() => setShowModal(true)}
      >
        + Create Session
      </button>

      {/* Create Modal */}
      {showModal && (
        <CreateSessionModal
          close={() => setShowModal(false)}
          setSessions={setSessions}
        />
      )}

    </div>
  );
};

export default Dashboard;