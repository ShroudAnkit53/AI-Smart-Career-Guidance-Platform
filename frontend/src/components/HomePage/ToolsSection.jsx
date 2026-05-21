import { useNavigate } from "react-router-dom";
import chatbotImg from "../../assets/chatbot.png";
import dashboardImg from "../../assets/industry_dashboard.png";
import prepImg from "../../assets/interview_prep.png";
import shortlistingImg from "../../assets/interview_shortlisting.png";
import decayImg from "../../assets/skill_decay.png";
import gapImg from "../../assets/skill_gap.png";

const ToolsSection = () => {
  const navigate = useNavigate();

  return (
    <div className="mt-8  text-neutral-200">

      <h2 className="text-2xl font-semibold mb-8">
        Available AI Tools
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

        {/* Tool Card 1 */}
        <div className="bg-neutral-900 p-6 rounded-xl border border-neutral-800 hover:border-orange-500 transition duration-300 hover:shadow-lg">
          <div className="flex items-center gap-4 mb-3">
            <img src={chatbotImg} alt="chatbot" className="w-10 h-10 rounded-md object-cover" />
            <h3 className="text-lg font-semibold">
              AI Career Q&A Chat
            </h3>
          </div>
          <p className="text-sm text-neutral-400 mb-4">
            Ask any career-related question and get instant AI insights.
          </p>
          <button
            onClick={() => navigate("/career-chat")}
            className="bg-orange-600 px-4 py-2 rounded-lg hover:opacity-90 transition cursor-pointer"
          >
            Ask Now
          </button>
        </div>

        {/* Tool Card 2 */}
        <div className="bg-neutral-900 p-6 rounded-xl border border-neutral-800 hover:border-orange-500 transition duration-300 hover:shadow-lg">
          <div className="flex items-center gap-4 mb-3">
            <img src={dashboardImg} alt="resume" className="w-10 h-10 rounded-md object-cover" />
            <h3 className="text-lg font-semibold">
              Industry Dashboard
            </h3>
          </div>
          <p className="text-sm text-neutral-400 mb-4">
            Explore AI-generated insights on industry trends and skills.
          </p>
          <button
            onClick={() => navigate("/industry-insights")}
            className="bg-orange-600 px-4 py-2 rounded-lg hover:opacity-90 transition cursor-pointer"
          >
            View Dashboard
          </button>
        </div>

        {/* Tool Card 3 */}
        <div className="bg-neutral-900 p-6 rounded-xl border border-neutral-800 hover:border-orange-500 transition duration-300 hover:shadow-lg">
          <div className="flex items-center gap-4 mb-3">
            <img src={prepImg} alt="roadmap" className="w-10 h-10 rounded-md object-cover" />
            <h3 className="text-lg font-semibold">
              Interview Preparation
            </h3>
          </div>
          <p className="text-sm text-neutral-400 mb-4">
            Get AI-generated interview questions, answers and tips.
          </p>
          <button
            onClick={() => navigate("/sessions")}
            className="bg-orange-600 px-4 py-2 rounded-lg hover:opacity-90 transition cursor-pointer"
          >
            Prepare Now
          </button>
        </div>

        {/*Tool Card 4 */}
        {/* <div className="bg-neutral-900 p-6 rounded-xl border border-neutral-800 hover:border-orange-500 transition duration-300 hover:shadow-lg">
          <div className="flex items-center gap-4 mb-3">
            <img src={decayImg} alt="resume" className="w-10 h-10 rounded-md object-cover" />
            <h3 className="text-lg font-semibold">
              Skill relevance prediction
            </h3>
          </div>
          <p className="text-sm text-neutral-400 mb-4">
            Predict which of your skills are most relevant or least relevant.
          </p>
          <button
            onClick={() => navigate("/skill-decay")}
            className="bg-orange-600 px-4 py-2 rounded-lg hover:opacity-90 transition cursor-pointer"
          >
            Check Now
          </button>
        </div> */}

        {/*Tool Card 5 */}
        <div className="bg-neutral-900 p-6 rounded-xl border border-neutral-800 hover:border-orange-500 transition duration-300 hover:shadow-lg">
          <div className="flex items-center gap-4 mb-3">
            <img src={shortlistingImg} alt="resume" className="w-10 h-10 rounded-md object-cover" />
            <h3 className="text-lg font-semibold">
              Interview Shortlisting
            </h3>
          </div>
          <p className="text-sm text-neutral-400 mb-4">
            Check the probability of getting shortlisted based on your resume.
          </p>
          <button
            onClick={() => navigate("/interview-shortlisting")}
            className="bg-orange-600 px-4 py-2 rounded-lg hover:opacity-90 transition cursor-pointer"
          >
            Check Now
          </button>
        </div>

        {/*Tool Card 6 */}
        <div className="bg-neutral-900 p-6 rounded-xl border border-neutral-800 hover:border-orange-500 transition duration-300 hover:shadow-lg">
          <div className="flex items-center gap-4 mb-3">
            <img src={gapImg} alt="resume" className="w-10 h-10 rounded-md object-cover" />
            <h3 className="text-lg font-semibold">
              Skill gap analysis
            </h3>
          </div>
          <p className="text-sm text-neutral-400 mb-4">
            Analyze the skill gaps in your profile for your dream job.
          </p>
          <button
            onClick={() => navigate("/skill-gap-analysis")}
            className="bg-orange-600 px-4 py-2 rounded-lg hover:opacity-90 transition cursor-pointer"
          >
            Check Now
          </button>
        </div>

      </div>
    </div>
  );
};

export default ToolsSection;