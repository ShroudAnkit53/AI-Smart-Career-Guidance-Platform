import React from "react";

const TrendsSection = ({ data }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10">

      {/* Industry Trends */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-lg hover:border-orange-500 cursor-pointer transition-colors duration-300">

        <h2 className="text-2xl font-semibold text-orange-500 mb-4">
          Key Industry Trends
        </h2>

        <div className="space-y-2">
          {data.keyTrends.map((trend, i) => (
            <p key={i} className="text-gray-300">
              • {trend}
            </p>
          ))}
        </div>

      </div>

      {/* Recommended Skills */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-lg hover:border-orange-500 cursor-pointer transition-colors duration-300">

        <h2 className="text-2xl font-semibold text-orange-500 mb-4">
          Recommended Skills
        </h2>

        <div className="flex flex-wrap gap-2">
          {data.recommendedSkills.map((skill, i) => (
            <span
              key={i}
              className="bg-orange-500/20 text-orange-400 px-3 py-1 rounded-md text-sm"
            >
              {skill}
            </span>
          ))}
        </div>

      </div>

    </div>
  );
};

export default TrendsSection;