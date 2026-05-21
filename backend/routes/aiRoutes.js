const express = require("express");
const router = express.Router();
const { generateInterviewQuestions, generateQuizQuestions } = require("../services/geminiService");
const InterviewSession = require("../model/InterviewSession");
const jwt = require("jsonwebtoken");

router.post("/generate-session", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "Unauthorized" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { role, level, topics, description, sessionType = "qa" } = req.body;  // NEW: sessionType

    let session;

    if (sessionType === "quiz") {
      // Generate quiz questions
      const quizQuestions = await generateQuizQuestions(role, level, topics, description);

      session = new InterviewSession({
        userId: decoded.id,
        role,
        experience: level,
        skills: topics || [role],
        description: description || `Quiz session for ${role}`,
        sessionType: "quiz",
        questions: [],
        quizQuestions: quizQuestions.map(q => ({
          question: q.question,
          options: q.options,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation,
          userAnswer: -1
        })),
        quizSubmitted: false
      });

    } else {
      // Original Q&A flow
      const questions = await generateInterviewQuestions(role, level, topics, description);

      session = new InterviewSession({
        userId: decoded.id,
        role,
        experience: level,
        skills: topics || [role],
        description: description || `Interview session for ${role}`,
        sessionType: "qa",
        questions: questions.map(q => ({
          question: typeof q === "string" ? q : q.question,
          shortAnswer: q.shortAnswer || "",
          detailedAnswer: q.detailedAnswer || "",
          userAnswer: "",
          pinned: false
        })),
        quizQuestions: []
      });
    }

    const savedSession = await session.save();
    res.json({ session: savedSession });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to generate session" });
  }
});

// Get a specific session by ID
router.get("/sessions/:id", async (req, res) => {
  try {
    const session = await InterviewSession.findById(req.params.id);
    if (!session) return res.status(404).json({ error: "Session not found" });
    res.json({ session });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch session" });
  }
});

// NEW: Submit quiz answers
router.post("/sessions/:id/submit-quiz", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "Unauthorized" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { answers } = req.body; // array of selected option indices

    const session = await InterviewSession.findOne({
      _id: req.params.id,
      userId: decoded.id
    });

    if (!session) return res.status(404).json({ error: "Session not found" });
    if (session.quizSubmitted) return res.json({ session }); // already submitted, return as-is

    // Save user answers
    session.quizQuestions = session.quizQuestions.map((q, i) => ({
      ...q.toObject(),
      userAnswer: answers[i] !== undefined ? answers[i] : -1
    }));
    session.quizSubmitted = true;

    await session.save();
    res.json({ session });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to submit quiz" });
  }
});

module.exports = router;