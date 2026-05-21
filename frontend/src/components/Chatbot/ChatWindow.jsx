import { useState } from "react";
import MessageBubble from "./MessageBubble";
import logo from "../../assets/logo.png";

const suggestions = [
  "How to become a frontend developer?",
  "What skills are needed for AI engineer?",
  "Backend vs frontend salary",
  "Best programming languages in 2025",
];

export default function ChatWindow({ messages, onSend }) {
  const [text, setText] = useState("");
  const [typing, setTyping] = useState(false);

  const sendMessage = () => {
    if (!text.trim()) return;

    onSend(text, setTyping);

    setText("");
  };

  return (
    <div className="flex flex-col h-screen w-full bg-[#0f0f0f]">
      <div className="flex-1 overflow-y-auto p-6">
        {messages.map((m, i) => (
          <MessageBubble key={i} role={m.role} message={m.message} />
        ))}

        {typing && (
          <div className="text-gray-400 animate-pulse">AI is thinking...</div>
        )}

        {messages.length === 0 && (
          <div className="flex flex-col items-center mt-20">
            <img src={logo} className="w-20 mb-4" />

            <h1 className="text-orange-500 text-2xl font-light mb-2">
              CareerAI Assistant
            </h1>

            <p className="text-gray-400 mb-4">
              Ask me anything about your career 🚀
            </p>

            <div className="w-32 h-[1px] bg-gray-700 mb-6"></div>

            <p className="text-gray-400 mb-3">Suggested Questions</p>

            <div className="flex flex-col items-center">
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  className="bg-[#1f1f1f] text-gray-200 px-4 py-2 rounded mb-2 hover:bg-[#2a2a2a]"
                  onClick={() => onSend(s, setTyping)}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="p-4 bg-[#171717] border-t border-gray-800">
        <div className="flex items-center bg-[#2a2a2a] rounded-full px-4 py-2">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Ask anything"
            className="flex-1 bg-transparent text-white outline-none placeholder-gray-400"
          />

          <button
            onClick={sendMessage}
            className="ml-3 bg-orange-500 hover:bg-orange-600 text-white px-4 py-1.5 rounded-full transition-all"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
