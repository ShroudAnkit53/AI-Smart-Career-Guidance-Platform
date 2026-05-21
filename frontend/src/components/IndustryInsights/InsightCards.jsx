import React, { useState } from "react";

const InsightCards = ({ data }) => {

  const [showModal, setShowModal] = useState(false);

  // Market outlook color
  const getMarketColor = () => {
    if (data.marketOutlook === "Positive") return "text-green-400";
    if (data.marketOutlook === "Neutral") return "text-yellow-400";
    if (data.marketOutlook === "Negative") return "text-red-400";
    return "text-white";
  };

  // Demand level color
  const getDemandColor = () => {
    if (data.demandLevel === "High") return "text-green-400";
    if (data.demandLevel === "Medium") return "text-yellow-400";
    if (data.demandLevel === "Low") return "text-red-400";
    return "text-white";
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mt-8">

        {/* Market Outlook */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-5 hover:border-orange-500 transition">

          <h3 className="text-lg font-semibold text-orange-500 mb-2">
            Market Outlook
          </h3>

          <p className={`text-lg font-semibold ${getMarketColor()}`}>
            {data.marketOutlook}
          </p>

        </div>


        {/* Growth Rate */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-5 hover:border-orange-500 transition">

          <h3 className="text-lg font-semibold text-orange-500 mb-2">
            Growth Rate
          </h3>

          <p className="text-2xl text-white font-semibold mb-3">
            {data.growthRate}%
          </p>

          <div className="w-full h-2 bg-zinc-700 rounded-full">
            <div
              className="h-2 bg-green-500 rounded-full"
              style={{ width: `${data.growthRate}%` }}
            />
          </div>

        </div>


        {/* Demand Level */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-5 hover:border-orange-500 transition">

          <h3 className="text-lg font-semibold text-orange-500 mb-2">
            Demand Level
          </h3>

          <p className={`text-lg font-semibold ${getDemandColor()}`}>
            {data.demandLevel}
          </p>

        </div>


        {/* Top Skills */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-5 hover:border-orange-500 transition">

          <h3 className="text-lg font-semibold text-orange-500 mb-3">
            Top Skills
          </h3>

          <div className="space-y-2">

            {data.topSkills.slice(0, 2).map((skill, i) => (
              <span
                key={i}
                className="block bg-orange-500/20 text-orange-400 px-3 py-2 rounded text-sm"
              >
                {skill}
              </span>
            ))}

          </div>

          <button
            onClick={() => setShowModal(true)}
            className="text-sm text-white-400 mt-3 hover:text-orange-500 transition-all cursor-pointer"
          >
            View all skills
          </button>

        </div>

      </div>


      {/* Modal */}
      {showModal && (

        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">

          <div className="bg-zinc-900 border border-orange-500 rounded-xl p-6 w-[420px]">

            <h2 className="text-xl text-orange-500 font-semibold mb-4">
              Top Skills
            </h2>

            <div className="flex flex-wrap gap-2">

              {data.topSkills.map((skill, i) => (
                <span
                  key={i}
                  className="bg-orange-500/20 text-orange-400 px-3 py-2 rounded text-sm"
                >
                  {skill}
                </span>
              ))}

            </div>

            <button
              onClick={() => setShowModal(false)}
              className="mt-5 text-sm text-white-400 hover:text-red-500 transition-all cursor-pointer"
            >
              Close
            </button>

          </div>

        </div>

      )}

    </>
  );
};

export default InsightCards;