import { useState } from "react";
import { ChevronDown } from "lucide-react";

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

  const toggleFAQ = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <section className="mt-24" id="faq">
      
      {/* 🔥 Your Provided Heading (Added Properly Here) */}
      <div className="text-center">
        <span className="bg-neutral-900 text-orange-500 rounded-full text-sm font-medium px-4 py-1 uppercase">
          FAQ
        </span>

        <h2 className="text-3xl sm:text-5xl lg:text-6xl mt-6 tracking-wide">
          Frequently Asked{" "}
          <span className="bg-gradient-to-r from-orange-500 to-orange-800 text-transparent bg-clip-text">
            Question
          </span>
        </h2>

        <p className="text-neutral-500 mt-6 max-w-3xl mx-auto">
          Have questions about our AI-powered career guidance platform?
  Find clear answers about how CareerAI works, who it’s for,
  and how it can help you achieve better career outcomes.
        </p>
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
  );
};

export default FAQ;