import { BotMessageSquare, TrendingUp, Clock, CheckCircle2, Search, CircleQuestionMarkIcon } from "lucide-react";
import { GlobeLock } from "lucide-react";

import user1 from "../assets/profile-pictures/user1.jpg";
import user2 from "../assets/profile-pictures/user2.jpg";
import user3 from "../assets/profile-pictures/user3.jpg";
import user4 from "../assets/profile-pictures/user4.jpg";
import user5 from "../assets/profile-pictures/user5.jpg";
import user6 from "../assets/profile-pictures/user6.jpg";

export const navItems = [
  { label: "Home", href: "#home" },
  { label: "Features", href: "#features" },
  { label: "Workflow", href: "#workflow" },
  { label: "Testimonials", href: "#testimonials" },
  { label: "FAQ", href: "#faq" },
];

export const testimonials = [
  {
    user: "John Doe",
    company: "Stellar Solutions",
    image: user1,
    text: "I am extremely satisfied with the services provided. The team was responsive, professional, and delivered results beyond my expectations.",
  },
  {
    user: "Jane Smith",
    company: "Blue Horizon Technologies",
    image: user2,
    text: "I couldn't be happier with the outcome of our project. The team's creativity and problem-solving skills were instrumental in bringing our vision to life",
  },
  {
    user: "David Johnson",
    company: "Quantum Innovations",
    image: user3,
    text: "I am amazed by the level of professionalism and dedication shown by the team. They were able to deliver outstanding results.",
  },
];

export const features = [
  {
    icon: <BotMessageSquare />, // chat bubble for the chatbot
    text: "AI Career Chatbot",
    description:
      "Get personalized career advice powered by intelligent AI assistance.",
  },
  {
    icon: <TrendingUp />, // trend arrow for industry skill trends
    text: "Industry Skill Trends",
    description:
      "Discover high-demand skills updated every week.",
  },
  {
    icon: <CircleQuestionMarkIcon />, // globe with lock for privacy/security
    text: "Interview Preparation",
    description:
      "Receive tailored interview questions and improvement suggestions based on your profile.",
  },
  {
    icon: <Clock />, // clock representing decay over time
    text: "Skill Decay Analysis",
    description:
      "Detect outdated technologies in your resume and stay future-ready.",
  },
  {
    icon: <CheckCircle2 />, // check for probability/outcome
    text: "Shortlisting Probability",
    description:
      "Predict your interview call chances using data-driven scoring models.",
  },
  {
    icon: <Search />, // search for gap detection
    text: "Skill Gap Detection",
    description:
      "Identify missing skills in your profile and get recommendations to close gaps.",
  },
];

export const checklistItems = [
  {
    title: "Upload Resume or Enter Skills",
    description:
      "Provide your resume or manually enter your skills to start personalized career evaluation.",
  },
  {
    title: "AI Skill Gap Analysis",
    description:
      "Our system compares your skills with industry requirements and identifies missing competencies.",
  },
  {
    title: "Shortlisting Probability Prediction",
    description:
      "Get an AI-driven estimate of your chances of getting shortlisted for your selected job role.",
  },
  {
    title: "Personalized Interview Preparation",
    description:
      "Receive tailored interview questions and improvement suggestions based on your profile.",
  },
];

export const resourcesLinks = [
  { href: "#", text: "Getting Started" },
  { href: "#", text: "Documentation" },
  { href: "#", text: "Tutorials" },
  { href: "#", text: "API Reference" },
  { href: "#", text: "Community Forums" },
];

export const platformLinks = [
  { href: "#", text: "Features" },
  { href: "#", text: "Supported Devices" },
  { href: "#", text: "System Requirements" },
  { href: "#", text: "Downloads" },
  { href: "#", text: "Release Notes" },
];

export const communityLinks = [
  { href: "#", text: "Events" },
  { href: "#", text: "Meetups" },
  { href: "#", text: "Conferences" },
  { href: "#", text: "Hackathons" },
  { href: "#", text: "Jobs" },
];
