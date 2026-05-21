export const getIndustryInsights = async (country) => {

  const res = await fetch(
    `http://localhost:5000/api/industry-insights?country=${country}`
  );

  if (!res.ok) {
    throw new Error("Failed to fetch insights");
  }

  return res.json();
};