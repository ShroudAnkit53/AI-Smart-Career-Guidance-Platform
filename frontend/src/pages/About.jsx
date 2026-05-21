import { useEffect, useState } from "react";
import Sidebar from "../components/HomePage/Sidebar";
import { useNavigate } from "react-router-dom";

const About = () => {
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");

      const response = await fetch("http://localhost:5000/user/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.status) {
        setUser(data.data);
      } else {
        localStorage.removeItem("token");
        navigate("/login");
      }
    };

    fetchProfile();
  }, [navigate]);

  if (!user)
    return (
      <div className="bg-neutral-950 min-h-screen text-white flex items-center justify-center">
        Loading...
      </div>
    );

  return (
    <div className="flex bg-neutral-950 text-white min-h-screen">

      {/* Sidebar */}
      <Sidebar
        user={user}
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
      />

      {/* Main Content */}
      <div className="flex-1 w-full">

        {/* Mobile Navbar */}
        <div className="md:hidden flex items-center justify-between p-4 border-b border-neutral-800 bg-neutral-900">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-orange-500 text-2xl"
          >
            ☰
          </button>

          <h1 className="text-lg font-semibold text-orange-500">
            CareerAI
          </h1>
        </div>

        {/* Page Content */}
        <div className="p-6 md:p-10 flex items-center justify-center py-12">
          <div className="border border-neutral-700 bg-neutral-900 rounded-lg p-8 md:p-12 max-w-4xl shadow-lg">
            <h1 className="text-3xl font-semibold text-orange-500 mb-6 text-center">
              About CareerAI
            </h1>

            <div className="space-y-6 text-neutral-400 leading-relaxed">
            
              <p>
                <span className="text-white font-medium">CareerAI</span> is an
                AI-powered career guidance platform designed to help students and
                professionals make smarter career decisions.
              </p>

              <p>
                Our platform combines Artificial Intelligence, industry insights,
                and skill analysis to provide:
              </p>

              <ul className="list-disc list-inside space-y-2">
                <li>AI Career Q&A Chat</li>
                <li>Industry Trend Dashboard</li>
                <li>Interview Preparation Assistance</li>
                <li>Skill Gap Analysis</li>
                <li>Skill Decay Prediction</li>
                <li>Interview Shortlisting Probability</li>
              </ul>

              <p>
                Our mission is simple:
                <span className="text-white font-medium">
                  {" "}Help you build the right skills at the right time.
                </span>
              </p>

              <p>
                Built with modern web technologies and AI models,
                CareerAI aims to bridge the gap between learning and industry
                requirements.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;