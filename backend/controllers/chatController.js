const { generateReply } = require("../services/chatbotService");
const Message = require("../model/Message");
const ChatSession = require("../model/chatSession");
const jwt = require("jsonwebtoken");

const chat = async (req, res) => {

  try {

    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const { sessionId, message } = req.body;

    if (!sessionId) {
      return res.status(400).json({ error: "Session ID missing" });
    }

    /* check session belongs to logged-in user */

    const session = await ChatSession.findOne({
      _id: sessionId,
      userId: decoded.id
    });

    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }

    const reply = await generateReply(message);

    /* save user message */

    await Message.create({
      sessionId,
      role: "user",
      message
    });

    /* save AI message */

    await Message.create({
      sessionId,
      role: "assistant",
      message: reply
    });

    /* auto title */

    if (session.title === "New Chat") {

      session.title = message.substring(0, 30);

      await session.save();
    }

    res.json({ reply });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      error: "Chatbot failed"
    });

  }

};

module.exports = { chat };