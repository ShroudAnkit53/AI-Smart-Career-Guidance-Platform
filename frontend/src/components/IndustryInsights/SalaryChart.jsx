import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts";

const CustomTooltip = ({ active, payload, label, currency }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-black/80 backdrop-blur-md border border-orange-500 rounded-lg p-4 shadow-lg text-sm">

        <p className="text-orange-400 font-semibold mb-2">{label}</p>

        <p className="text-green-400">
          Max Salary : {currency}{payload[2].value.toLocaleString()}
        </p>

        <p className="text-orange-400">
          Median Salary : {currency}{payload[1].value.toLocaleString()}
        </p>

        <p className="text-gray-400">
          Min Salary : {currency}{payload[0].value.toLocaleString()}
        </p>

      </div>
    );
  }

  return null;
};

const CustomXAxisTick = ({ x, y, payload }) => {
  const words = payload.value.split(" ");

  return (
    <g transform={`translate(${x},${y})`}>
      <text
        x={0}
        y={10}
        textAnchor="middle"
        fill="#ffffff"
        fontSize="12"
      >
        <tspan x="0" dy="0">
          {words.slice(0, 2).join(" ")}
        </tspan>
        <tspan x="0" dy="15">
          {words.slice(2).join(" ")}
        </tspan>
      </text>
    </g>
  );
};

const SalaryChart = ({ data, currency }) => {

  // Normalize — Gemini sometimes returns different key names
  // e.g. title/minSalary/maxSalary instead of role/min/max
  const normalized = (data || []).map((item) => ({
    role:   item.role    || item.title        || item.jobTitle   || item.position || "Unknown",
    min:    item.min     || item.minSalary    || item.minimum    || item.low      || 0,
    median: item.median  || item.medianSalary || item.average    || item.mid      || 0,
    max:    item.max     || item.maxSalary    || item.maximum    || item.high     || 0,
  })).filter(item => item.min > 0 || item.median > 0 || item.max > 0);

  if (!normalized.length) {
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-lg mt-10">
        <h2 className="text-2xl font-semibold text-orange-500 mb-4">Salary Ranges</h2>
        <p className="text-gray-500 text-sm">Salary data unavailable for this region.</p>
      </div>
    );
  }

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-lg mt-10 hover:border-orange-500 cursor-pointer transition-colors duration-300">

      <h2 className="text-2xl font-semibold text-orange-500 mb-6">
        Salary Ranges
      </h2>

      <ResponsiveContainer width="100%" height={400}>

        <BarChart
          data={normalized}
          margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
        >

          <XAxis
            dataKey="role"
            stroke="#ffffff"
            interval={0}
            tick={<CustomXAxisTick />}
          />

          <YAxis
            stroke="#ffffff"
            tick={{ fontSize: 13, fill: "#ffffff" }}
            tickFormatter={(value) => `${currency}${value.toLocaleString()}`}
          />

          <Tooltip
            content={(props) => (
              <CustomTooltip {...props} currency={currency} />
            )}
          />

          <Bar dataKey="min" fill="#64748b" name="Min Salary" />
          <Bar dataKey="median" fill="#ff7a00" name="Median Salary" />
          <Bar dataKey="max" fill="#22c55e" name="Max Salary" />

        </BarChart>

      </ResponsiveContainer>

    </div>
  );
};

export default SalaryChart;