const InterviewSession = require("../model/InterviewSession");
const { generateInterviewQuestions } = require("../services/geminiService");
const jwt = require("jsonwebtoken");

const createSession = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ status: false, message: "Unauthorized" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    let { role, experience, skills, description } = req.body;

    if (typeof skills === "string") {
      skills = skills.split(",").map((s) => s.trim()).filter(Boolean);
    }

    // 🔥 Call Gemini
    const aiText = await generateInterviewQuestions({
      role,
      experience,
      skills,
      description,
    });

    let questions;
    try {
      questions = JSON.parse(aiText);
    } catch (err) {
      return res.status(500).json({
        status: false,
        message: "AI returned invalid JSON",
        raw: aiText,
      });
    }

    // Save to DB
    const newSession = await InterviewSession.create({
      userId: decoded.id,
      role,
      experience,
      skills,
      description,
      questions,
    });

    return res.json({
      status: true,
      message: "Session created",
      data: newSession,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: false,
      message: "Server error",
    });
  }
};

module.exports = { createSession };