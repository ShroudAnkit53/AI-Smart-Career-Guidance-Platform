import { FaTrash } from "react-icons/fa";
import logo from "../../assets/logo.png";

export default function Sidebar({
  sessions,
  onSelect,
  newChat,
  onDelete
}) {

  return (
    <div className="w-72 bg-[#171717] text-white h-screen p-4 flex flex-col border-r border-gray-800">

       {/* Logo Section */}

  <div className="flex items-center gap-3 mb-6">
    <img src={logo} className="w-10 h-10" />
    <h1 className="text-orange-500 font-light text-lg">
      CareerAI
    </h1>
  </div>

      <button
        onClick={newChat}
        className="bg-orange-500 hover:bg-orange-600 p-2 rounded mb-4 cursor-pointer"
      >
        + New Chat
      </button>

      <div className="flex-1 overflow-y-auto">

        {Array.isArray(sessions) && sessions.map((s) => (

          <div
            key={s._id}
            className="flex font-light justify-between items-center p-2 mb-2 bg-[#1f1f1f] rounded hover:bg-[#2a2a2a] transition-all"
          >

            <span
              onClick={() => onSelect(s._id)}
              className="cursor-pointer text-xs truncate max-w-[180px]"
            >
              {s.title}
            </span>

            <FaTrash
              className="text-red-400 cursor-pointer hover:text-red-600"
              onClick={() => {

                if (confirm("Delete this chat?")) {
                  onDelete(s._id);
                }

              }}
            />

          </div>

        ))}

      </div>

    </div>
  );
}