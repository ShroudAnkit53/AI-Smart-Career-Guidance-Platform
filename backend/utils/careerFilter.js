const keywords = [
  "career","job","skills","developer","programming",
  "software","technology","interview","resume","ai",
  "data science","web development","salary"
];

const isCareerRelated = (text) => {
  const lower = text.toLowerCase();
  return keywords.some(word => lower.includes(word));
};

module.exports = isCareerRelated;