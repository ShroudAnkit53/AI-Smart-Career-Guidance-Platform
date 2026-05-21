import { Routes, Route } from "react-router-dom";
import LandingPage from "./components/LandingPage";
import SignIn from "./components/Authentication/SignIn";
import SignUp from "./components/Authentication/SignUp";
import Home from "./pages/Home";
import ProtectedRoute from "./components/ProtectedRoute";
import FAQ from "./pages/FAQ";
import About from "./pages/About";
import Profile from "./pages/Profile";
import IndustryInsights from "./pages/IndustryInsights";
import ChatPage from "./pages/ChatPage";
import Dashboard from "./pages/Dashboard";
import SessionPage from "./pages/SessionPage";
import SkillGapAnalysis from "./pages/SkillGapAnalysis";
import InterviewShortlisting from "./pages/InterviewShortlisting";

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<SignIn />} />
      <Route path="/register" element={<SignUp />} />

      <Route
        path="/home"
        element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        }
      />

      <Route
        path="/about"
        element={
          <ProtectedRoute>
            <About />
          </ProtectedRoute>
        }
      />

      <Route
        path="/faq"
        element={
          <ProtectedRoute>
            <FAQ />
          </ProtectedRoute>
        }
      />

      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />

      <Route
        path="/sessions"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/sessions/:id"
        element={
          <ProtectedRoute>
            <SessionPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/industry-insights"
        element={
          <ProtectedRoute>
            <IndustryInsights />
          </ProtectedRoute>
        }
      />

      <Route
        path="/career-chat"
        element={
          <ProtectedRoute>
            <ChatPage />
          </ProtectedRoute>
        }
      />


      {/* ✅ SKILL GAP ANALYSIS */}
      <Route
        path="/skill-gap-analysis"
        element={
          <ProtectedRoute>
            <SkillGapAnalysis />
          </ProtectedRoute>
        }
      />

      {/* ✅ INTERVIEW SHORTLISTING */}
      <Route
        path="/interview-shortlisting"
        element={
          <ProtectedRoute>
            <InterviewShortlisting />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

export default App;
