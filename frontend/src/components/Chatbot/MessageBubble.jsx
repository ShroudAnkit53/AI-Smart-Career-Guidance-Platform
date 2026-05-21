import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function MessageBubble({ role, message }) {

  const isUser = role === "user";

  return (
    <div
      className={`flex mb-4 animate-fadeIn ${
        isUser ? "justify-end" : "justify-start"
      }`}
    >
      <div
        className={`max-w-xl px-4 py-3 rounded-lg text-sm shadow-md
        ${
          isUser
            ? "bg-orange-500 text-white"
            : "bg-[#1f1f1f] text-gray-200"
        }`}
      >

        {isUser ? (
          message
        ) : (
          <div className="prose prose-invert max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {message}
            </ReactMarkdown>
          </div>
        )}

      </div>
    </div>
  );
}