import { useEffect, useState } from "react";
import { getIndustryInsights } from "../api/industryApi";

import InsightCards from "../components/IndustryInsights/InsightCards";
import SalaryChart from "../components/IndustryInsights/SalaryChart";
import TrendsSection from "../components/IndustryInsights/TrendsSection";

const IndustryInsights = () => {

  const [data, setData] = useState(null);
  const [timeLeft, setTimeLeft] = useState("");
  const [country, setCountry] = useState("USA");

  // Country list with flag icons
  const countries = [
    { name: "USA", flag: "https://flagcdn.com/w40/us.png" },
    { name: "India", flag: "https://flagcdn.com/w40/in.png" },
    { name: "Canada", flag: "https://flagcdn.com/w40/ca.png" },
    { name: "United Kingdom", flag: "https://flagcdn.com/w40/gb.png" },
    { name: "Germany", flag: "https://flagcdn.com/w40/de.png" },
    { name: "Australia", flag: "https://flagcdn.com/w40/au.png" },
    { name: "Singapore", flag: "https://flagcdn.com/w40/sg.png" },
    { name: "Netherlands", flag: "https://flagcdn.com/w40/nl.png" }
  ];

  const currencySymbols = {
  "USA": "$",
  "India": "₹",
  "Canada": "C$",
  "United Kingdom": "£",
  "Germany": "€",
  "Australia": "A$",
  "Singapore": "S$",
  "Netherlands": "€"
};

  // Fetch insights when country changes
  useEffect(() => {

    const fetchInsights = async () => {
      try {
        const insights = await getIndustryInsights(country);
        setData(insights);
      } catch (error) {
        console.error("Error fetching insights:", error);
      }
    };

    fetchInsights();

  }, [country]);



  // Countdown timer
  useEffect(() => {

    if (!data?.nextUpdate) return;

    const updateCountdown = () => {

      const now = new Date();
      const next = new Date(data.nextUpdate);

      const diff = next - now;

      if (diff <= 0) {
        setTimeLeft("Updating soon...");
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s`);
    };

    updateCountdown();

    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);

  }, [data]);



  if (!data) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-white text-lg animate-pulse">
          Loading insights...
        </p>
      </div>
    );
  }



  return (

    <div className="min-h-screen bg-black px-6 py-10">

      <div className="max-w-7xl mx-auto">

        {/* Header + Country Selector */}
        <div className="flex flex-wrap justify-between items-center mb-4">

          <h1 className="text-3xl font-light text-white">
            Industry <span className="text-orange-500">Insights</span>
          </h1>

          <div className="relative flex items-center gap-2">

            {/* Dynamic Flag */}
            <img
              src={countries.find((c) => c.name === country)?.flag}
              alt={country}
              className="w-6 h-4 rounded-sm"
            />

            {/* Dropdown */}
            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="bg-zinc-900 border border-zinc-700 text-white px-4 py-2 rounded-lg
              hover:border-orange-500 focus:border-orange-500 focus:outline-none
              transition-colors cursor-pointer"
            >

              {countries.map((c) => (
                <option key={c.name} value={c.name}>
                  {c.name}
                </option>
              ))}

            </select>

          </div>

        </div>



        {/* Update Information */}
        <div className="flex flex-wrap gap-8 text-gray-400 mb-10 text-sm">

          <p>
            Last Updated:
            <span className="text-white ml-1">
              {new Date(data.lastUpdated).toLocaleDateString("en-GB")}
            </span>
          </p>

          <p>
            Next Update:
            <span className="text-orange-400 ml-1">
              {new Date(data.nextUpdate).toLocaleDateString("en-GB")}
            </span>
          </p>

          <p>
            Next Update In:
            <span className="text-green-400 ml-1">
              {timeLeft}
            </span>
          </p>

        </div>



        {/* Insight Cards */}
        <div className="mb-12">
          <InsightCards data={data} />
        </div>



        {/* Salary Chart */}
        <div className="mb-12">
          <SalaryChart data={data.salaryRanges} currency={currencySymbols[country]}/>
        </div>



        {/* Trends Section */}
        <div className="mb-12">
          <TrendsSection data={data} />
        </div>

      </div>

    </div>
  );
};

export default IndustryInsights;