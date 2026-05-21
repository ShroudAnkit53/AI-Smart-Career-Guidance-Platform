import { useState, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import Sidebar from "../components/HomePage/Sidebar";
import { useNavigate } from "react-router-dom";

const faqData = [
  {
    question: "How does CareerAI analyze my skills?",
    answer:
      "CareerAI uses AI-based analysis to evaluate your current skills, compare them with industry requirements, and detect gaps to suggest personalized improvements.",
  },
  {
    question: "Is CareerAI suitable for students and professionals?",
    answer:
      "Yes. Whether you're a student exploring career paths or a professional looking to upskill, CareerAI provides tailored recommendations based on your goals.",
  },
  {
    question: "How accurate are the career predictions?",
    answer:
      "Our predictions are based on industry trends, job market data, and AI models trained to evaluate skill-to-role alignment for high accuracy insights.",
  },
  {
    question: "Do I need technical knowledge to use CareerAI?",
    answer:
      "No technical background is required. The platform is designed to be simple, intuitive, and easy to use for everyone.",
  },
];

const FAQ = () => {
  const [activeIndex, setActiveIndex] = useState(null);
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

  const toggleFAQ = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

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
          <section className="mt-8" id="faq">
      
      {/* 🔥 Your Provided Heading (Added Properly Here) */}
      <div className="text-center">

        <h2 className="text-3xl sm:text-5xl lg:text-6xl mt-6 tracking-wide">
          Frequently Asked{" "}
          <span className="bg-gradient-to-r from-orange-500 to-orange-800 text-transparent bg-clip-text">
            Question
          </span>
        </h2>

        {/* <p className="text-neutral-500 mt-6 max-w-3xl mx-auto">
          Have questions about our AI-powered career guidance platform?
  Find clear answers about how CareerAI works, who it’s for,
  and how it can help you achieve better career outcomes.
        </p> */}
      </div>

      {/* FAQ Items */}
      <div className="max-w-3xl mx-auto mt-16 space-y-4">
        {faqData.map((item, index) => (
          <div
            key={index}
            className="border border-neutral-700 rounded-lg p-5 cursor-pointer hover:border-orange-500 transition"
            onClick={() => toggleFAQ(index)}
          >
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">{item.question}</h3>
              <ChevronDown
                className={`transition-transform duration-300 ${
                  activeIndex === index ? "rotate-180" : ""
                }`}
              />
            </div>

            <div
              className={`overflow-hidden transition-all duration-300 ease-in-out ${
                activeIndex === index
                  ? "max-h-96 opacity-100 mt-4"
                  : "max-h-0 opacity-0"
              }`}
            >
              <p className="text-neutral-400 text-sm leading-relaxed">
                {item.answer}
              </p>
            </div>
          </div>
        ))}
      </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default FAQ;