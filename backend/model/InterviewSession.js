const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
  question: String,
  shortAnswer: String,
  detailedAnswer: String,
  userAnswer: String,
  pinned: { type: Boolean, default: false }
});

// NEW: Quiz question schema
const quizQuestionSchema = new mongoose.Schema({
  question: String,
  options: [String],          // 3 options
  correctAnswer: Number,      // index of correct option (0, 1, or 2)
  explanation: String,        // answer explanation
  userAnswer: { type: Number, default: -1 }  // index chosen by user, -1 = unanswered
});

const interviewSessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  role: { type: String, required: true },
  experience: { type: String, required: true },
  skills: { type: [String], required: true },
  description: { type: String },
  sessionType: { type: String, enum: ["qa", "quiz"], default: "qa" }, // NEW
  questions: [questionSchema],
  quizQuestions: [quizQuestionSchema],  // NEW
  quizSubmitted: { type: Boolean, default: false }, // NEW
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("InterviewSession", interviewSessionSchema);