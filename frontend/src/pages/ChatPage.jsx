import { useState, useEffect } from "react";
import Sidebar from "../components/Chatbot/Sidebar";
import ChatWindow from "../components/Chatbot/ChatWindow";

import {
  createSession,
  getSessions,
  getMessages,
  sendMessage,
  deleteSession
} from "../api/chatApi";

export default function ChatPage() {

  const [sessions, setSessions] = useState([]);
  const [messages, setMessages] = useState([]);
  const [session, setSession] = useState(null);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    const data = await getSessions();
    setSessions(data);
  };

  const newChat = async () => {

    const s = await createSession();

    setSession(s._id);
    setMessages([]);

    loadSessions();
  };

  const selectSession = async (id) => {

    setSession(id);

    const msgs = await getMessages(id);

    setMessages(msgs);
  };

  /* DELETE CHAT HANDLER */

  const deleteChat = async (id) => {

    await deleteSession(id);

    // refresh sidebar sessions
    loadSessions();

    // if current chat deleted
    if (session === id) {
      setSession(null);
      setMessages([]);
    }

  };

  const send = async (text, setTyping) => {

  if (!session) {
    alert("Create a new chat first");
    return;
  }

  setMessages(prev => [
    ...prev,
    { role: "user", message: text }
  ]);

  setTyping(true);

  const res = await sendMessage({
    sessionId: session,
    message: text
  });

  setTyping(false);

  /* refresh sidebar titles */
  loadSessions();

  let i = 0;
  const reply = res.reply;

  setMessages(prev => [
    ...prev,
    { role: "assistant", message: "" }
  ]);

  const interval = setInterval(() => {

    setMessages(prev => {

      const last = prev[prev.length - 1];

      const updated = {
        ...last,
        message: last.message + reply[i]
      };

      return [...prev.slice(0, -1), updated];

    });

    i++;

    if (i >= reply.length) clearInterval(interval);

  }, 15);

};

  return (
    <div className="flex">

      <Sidebar
        sessions={sessions}
        onSelect={selectSession}
        newChat={newChat}
        onDelete={deleteChat}   
      />

      <ChatWindow
        messages={messages}
        onSend={send}
      />

    </div>
  );
}