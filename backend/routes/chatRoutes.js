const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");

const { chat } = require("../controllers/chatController");
const ChatSession = require("../model/chatSession");
const Message = require("../model/Message");

/* Send message */
router.post("/message", chat);

/* Create new chat */
router.post("/session", async (req, res) => {

  try {

    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const session = await ChatSession.create({
      userId: decoded.id,
      title: "New Chat"
    });

    res.json(session);

  } catch (error) {

    console.error(error);
    res.status(500).json({ error: "Failed to create session" });

  }

});

/* Get sessions */
router.get("/sessions", async (req, res) => {

  try {

    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const sessions = await ChatSession.find({
      userId: decoded.id
    }).sort({ createdAt: -1 });

    res.json(sessions);

  } catch (error) {

    console.error(error);
    res.status(500).json({ error: "Failed to fetch sessions" });

  }

});

/* Get messages */
router.get("/messages/:id", async (req, res) => {

  try {

    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const session = await ChatSession.findOne({
      _id: req.params.id,
      userId: decoded.id
    });

    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }

    const messages = await Message.find({
      sessionId: req.params.id
    });

    res.json(messages);

  } catch (error) {

    console.error(error);
    res.status(500).json({ error: "Failed to fetch messages" });

  }

});

/* Delete session */
router.delete("/session/:id", async (req, res) => {

  try {

    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const session = await ChatSession.findOneAndDelete({
      _id: req.params.id,
      userId: decoded.id
    });

    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }

    await Message.deleteMany({
      sessionId: req.params.id
    });

    res.json({ message: "Session deleted" });

  } catch (error) {

    console.error(error);
    res.status(500).json({ error: "Failed to delete session" });

  }

});

module.exports = router;