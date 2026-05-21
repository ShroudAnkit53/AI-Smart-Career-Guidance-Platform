let cachedModelName = null;

// Two keys to rotate between when one hits rate limit
const GEMINI_KEYS = [
  process.env.GEMINI_API_KEY,
  process.env.GEMINI_API_KEY2,
  process.env.GEMINI_API_KEY3
].filter(Boolean); // removes undefined if second key not set

console.log("Keys loaded:", GEMINI_KEYS.length, GEMINI_KEYS.map(k => k?.substring(0, 10) + "..."));

let currentKeyIndex = 0;

const getNextKey = () => {
  const key = GEMINI_KEYS[currentKeyIndex];
  currentKeyIndex = (currentKeyIndex + 1) % GEMINI_KEYS.length;
  return key;
};

/* =========================
   GET AVAILABLE MODEL
========================= */
const getAvailableModel = async () => {
  if (cachedModelName) return cachedModelName;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models?key=${GEMINI_KEYS[0]}`
    );
    const data = await response.json();

    if (data.models && data.models.length > 0) {
      const availableModel = data.models.find(model =>
        model.supportedGenerationMethods?.includes("generateContent")
      );
      if (availableModel) {
        cachedModelName = availableModel.name.split("/")[1];
        console.log("Available model found:", cachedModelName);
        return cachedModelName;
      }
    }
  } catch (error) {
    console.error("Error fetching available models:", error);
  }

  return "gemini-1.5-flash";
};

/* =========================
   RETRY HELPER — with key rotation + rate limit handling
========================= */
const fetchWithRetry = async (url, options, retries = 3) => {
  for (let i = 0; i < retries; i++) {

    // Rotate key on each attempt
    const key = getNextKey();
    const urlWithKey = url.replace(/key=[^&]+/, `key=${key}`);

    const res = await fetch(urlWithKey, options);
    const data = await res.json();

    if (!data.error) return data;

    const errorMsg = data.error?.message || data.error || "";
    const status = data.error?.code;

    // Rate limit (429) — wait longer
    if (status === 429 || errorMsg.includes("quota") || errorMsg.includes("rate")) {
      console.warn(`Retry ${i + 1}: Rate limit hit, switching key and waiting ${(i + 1) * 3}s...`);
      await new Promise(r => setTimeout(r, (i + 1) * 3000));
      continue;
    }

    // Model overloaded — short wait
    if (status === 503 || errorMsg.includes("overloaded")) {
      console.warn(`Retry ${i + 1}: Gemini overloaded, waiting ${(i + 1) * 2}s...`);
      await new Promise(r => setTimeout(r, (i + 1) * 2000));
      continue;
    }

    // Any other error
    console.warn(`Retry ${i + 1}: Gemini error — ${errorMsg}`);
    await new Promise(r => setTimeout(r, (i + 1) * 1000));
  }

  throw new Error("Gemini API failed after retries");
};

/* =========================
   INTERVIEW QUESTIONS
========================= */
const generateInterviewQuestions = async (role, level, topics = [], description = "") => {
  try {
    const modelName = await getAvailableModel();
    const topicsText = Array.isArray(topics) ? topics.join(", ") : topics;

    const prompt = `
Generate 10-15 interview questions for a ${level} ${role}.
Focus on: ${topicsText}
Return ONLY JSON:
[
  {
    "question": "Question",
    "shortAnswer": "Short answer",
    "detailedAnswer": "Detailed answer"
  }
]`;

    const primaryUrl = `https://generativelanguage.googleapis.com/v1/models/${modelName}:generateContent?key=PLACEHOLDER`;
    const fallbackUrl = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=PLACEHOLDER`;

    let data;
    try {
      data = await fetchWithRetry(primaryUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
      });
    } catch (err) {
      console.warn("Switching to fallback model...");
      data = await fetchWithRetry(fallbackUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
      });
    }

    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) { console.error("No text returned"); return []; }

    const match = text.match(/\[[\s\S]*\]/);
    if (!match) return [];

    return JSON.parse(match[0]);

  } catch (error) {
    console.error("Interview Error:", error);
    return [];
  }
};

/* =========================
   INDUSTRY INSIGHTS
========================= */
const generateIndustryInsights = async (country) => {
  try {
    const modelName = await getAvailableModel();

    const prompt = `
Give IT industry insights for ${country} in JSON only, no markdown, no explanation.
Use EXACTLY this structure with EXACTLY these field names:
{
  "salaryRanges": [
    { "role": "Software Engineer", "min": 80000, "median": 110000, "max": 150000 },
    { "role": "Data Scientist",    "min": 90000, "median": 120000, "max": 160000 },
    { "role": "DevOps Engineer",   "min": 85000, "median": 115000, "max": 155000 },
    { "role": "Frontend Developer","min": 70000, "median": 100000, "max": 140000 },
    { "role": "ML Engineer",       "min": 95000, "median": 130000, "max": 175000 }
  ],
  "growthRate": 0,
  "demandLevel": "High",
  "topSkills": [],
  "marketOutlook": "Positive",
  "keyTrends": [],
  "recommendedSkills": []
}
Rules:
- salaryRanges must have EXACTLY these keys: role, min, median, max (numbers, no currency symbols)
- Include 5-7 common IT roles relevant to ${country}
- All salary values must be plain numbers (integers)
- Return ONLY the JSON object, nothing else`;

    const data = await fetchWithRetry(
      `https://generativelanguage.googleapis.com/v1/models/${modelName}:generateContent?key=PLACEHOLDER`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
      }
    );

    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) return null;

    const match = text.match(/\{[\s\S]*\}/);
    return match ? JSON.parse(match[0]) : null;

  } catch (error) {
    console.error("Insights Error:", error);
    return null;
  }
};

/* =========================
   QUIZ QUESTIONS
========================= */
const generateQuizQuestions = async (role, level, topics = [], description = "") => {
  try {
    const modelName = await getAvailableModel();
    const topicsText = Array.isArray(topics) ? topics.join(", ") : topics;

    const prompt = `
Generate exactly 10 multiple choice quiz questions for a ${level} ${role}.
Focus on: ${topicsText}
${description ? `Context: ${description}` : ""}
Return ONLY a JSON array (no markdown, no backticks):
[
  {
    "question": "Question text here?",
    "options": ["Option A", "Option B", "Option C"],
    "correctAnswer": 0,
    "explanation": "Why this answer is correct and others are wrong"
  }
]
Rules:
- Exactly 3 options per question
- correctAnswer is the index (0, 1, or 2)
- Make options plausible, not obviously wrong
- explanation should be 2-3 sentences`;

    const primaryUrl = `https://generativelanguage.googleapis.com/v1/models/${modelName}:generateContent?key=PLACEHOLDER`;
    const fallbackUrl = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=PLACEHOLDER`;

    let data;
    try {
      data = await fetchWithRetry(primaryUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
      });
    } catch (err) {
      data = await fetchWithRetry(fallbackUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
      });
    }

    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) return [];

    const match = text.match(/\[[\s\S]*\]/);
    if (!match) return [];

    return JSON.parse(match[0]);

  } catch (error) {
    console.error("Quiz Error:", error);
    return [];
  }
};

/* =========================
   EXPORTS
========================= */
module.exports = {
  generateInterviewQuestions,
  generateIndustryInsights,
  generateQuizQuestions
};