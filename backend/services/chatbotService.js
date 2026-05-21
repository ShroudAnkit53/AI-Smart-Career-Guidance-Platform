const isCareerRelated = require("../utils/careerFilter");

// Rotate between all 3 keys
const GEMINI_KEYS = [
  process.env.GEMINI_API_KEY,
  process.env.GEMINI_API_KEY2,
  process.env.GEMINI_API_KEY3,
].filter(Boolean);

let currentKeyIndex = 0;
let cachedModelName = null;

const getNextKey = () => {
  const key = GEMINI_KEYS[currentKeyIndex];
  currentKeyIndex = (currentKeyIndex + 1) % GEMINI_KEYS.length;
  return key;
};

const getAvailableModel = async () => {
  if (cachedModelName) return cachedModelName;

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1/models?key=${GEMINI_KEYS[0]}`
    );

    const data = await res.json();

    if (!data.models || data.models.length === 0) {
      return "gemini-1.5-flash";
    }

    const model = data.models.find(m =>
      m.supportedGenerationMethods?.includes("generateContent")
    );

    cachedModelName = model ? model.name.split("/")[1] : "gemini-1.5-flash";
    return cachedModelName;

  } catch (error) {
    console.error("Error fetching model:", error);
    return "gemini-1.5-flash";
  }
};

const generateReply = async (message, retries = 3) => {
  if (!isCareerRelated(message)) {
    return "Sorry, I only answer career related questions.";
  }

  const model = await getAvailableModel();

  const prompt = `
You are an AI career assistant.
Answer only career and tech related questions.
User Question: ${message}
`;

  for (let i = 0; i < retries; i++) {
    const key = getNextKey(); // rotates key on every attempt

    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${key}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }]
          })
        }
      );

      const data = await res.json();

      if (data.error) {
        const status = data.error?.code;
        const msg = data.error?.message || "";

        if (status === 429 || msg.includes("quota") || msg.includes("rate")) {
          console.warn(`Chat retry ${i + 1}: Rate limit on key ${i % GEMINI_KEYS.length + 1}, switching...`);
          await new Promise(r => setTimeout(r, (i + 1) * 3000));
          continue;
        }

        if (status === 503 || msg.includes("overloaded")) {
          console.warn(`Chat retry ${i + 1}: Overloaded, waiting...`);
          await new Promise(r => setTimeout(r, (i + 1) * 2000));
          continue;
        }

        console.error("Gemini Chat Error:", msg);
        return "I'm having trouble responding right now. Please try again.";
      }

      return data.candidates?.[0]?.content?.parts?.[0]?.text || "No response";

    } catch (error) {
      console.error(`Chat attempt ${i + 1} failed:`, error.message);
      if (i === retries - 1) break;
      await new Promise(r => setTimeout(r, (i + 1) * 2000));
    }
  }

  return "I'm having trouble responding right now. Please try again in a moment.";
};

module.exports = { generateReply };