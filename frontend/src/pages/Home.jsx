import { useEffect, useState } from "react";
import Sidebar from "../components/HomePage/Sidebar";
import ToolsSection from "../components/HomePage/ToolsSection";
import { useNavigate } from "react-router-dom";

const Home = () => {
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
        <div className="p-6 md:p-10">
          <h1 className="text-2xl md:text-3xl font-500 mb-2">
            Welcome,{" "}
            <span className="text-orange-500">
              {user.name}
            </span>{" "}
            to CareerAI
          </h1>

          <p className="text-neutral-400 mb-6">
            Let’s build your career with AI-powered insights.
          </p>

          <ToolsSection />
        </div>
      </div>
    </div>
  );
};

export default Home;