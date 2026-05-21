const express = require("express");
const router = express.Router();

const { getIndustryInsights } = require("../controllers/industryController");

router.get("/industry-insights", getIndustryInsights);

module.exports = router;