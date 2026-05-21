const { generateIndustryInsights } = require("../services/geminiService");
const IndustryInsights = require("../model/IndustryInsights");

const getIndustryInsights = async (req, res) => {

  try {

    const country = req.query.country || "USA";

    const existing = await IndustryInsights.findOne({ country });

    if (existing) {

      const now = new Date();
      const lastUpdated = new Date(existing.lastUpdated);

      const hoursPassed = (now - lastUpdated) / (1000 * 60 * 60);

      const nextUpdate = new Date(lastUpdated.getTime() + 72 * 60 * 60 * 1000);

      if (hoursPassed < 72) {

        console.log(`Returning cached insights for ${country}`);

        return res.json({
          ...existing.data,
          lastUpdated: existing.lastUpdated,
          nextUpdate
        });

      }
    }

    console.log(`Generating new insights for ${country}`);

    // ✅ PASS COUNTRY HERE
    const insights = await generateIndustryInsights(country);

    if (!insights) {
      return res.status(500).json({ message: "AI generation failed" });
    }

    const now = new Date();
    const nextUpdate = new Date(now.getTime() + 72 * 60 * 60 * 1000);

    if (existing) {

      existing.data = insights;
      existing.lastUpdated = now;
      await existing.save();

    } else {

      await IndustryInsights.create({
        country,
        data: insights
      });

    }

    res.json({
      ...insights,
      lastUpdated: now,
      nextUpdate
    });

  } catch (error) {

    console.error(error);
    res.status(500).json({ message: "Server error" });

  }

};

module.exports = { getIndustryInsights };