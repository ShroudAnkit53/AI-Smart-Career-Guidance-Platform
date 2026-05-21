const express = require("express");
const router = express.Router();
const { createSession } = require("../controllers/interviewController");
const InterviewSession = require("../model/InterviewSession");
const jwt = require("jsonwebtoken");

router.post("/create", createSession);

// Get all sessions
router.get("/sessions", async (req, res) => {

  try {

    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "Unauthorized" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const sessions = await InterviewSession.find({
      userId: decoded.id
    });

    res.json({ sessions });

  } catch (error) {

    console.error(error);
    res.status(500).json({ error: "Failed to fetch sessions" });

  }

});

router.delete("/sessions/:id", async (req, res) => {

  try {

    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "Unauthorized" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    await InterviewSession.findOneAndDelete({
      _id: req.params.id,
      userId: decoded.id
    });

    res.json({ success: true });

  } catch (error) {

    res.status(500).json({ success: false });

  }

});

module.exports = router;