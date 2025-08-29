import { PieChart, Pie, Tooltip, Legend, Cell, ResponsiveContainer } from "recharts";

const COLORS = ["#b5540e", "#27c227", "#f5a402  ", "#6d83f2   "];

export default function ProfitGraph({ nameOfData, valOfData }) {
  const data = [
    { name: "Gross Profit", value: 2000 },
    { name: "Equipments", value: 4000 },
    { name: "Net Profit", value: 1500 },
    { name: "Packaging Cost", value: 3000 },
  ];

  return (
    <div className="flex flex-col items-center justify-center p-6 w-full">
      <h1 className="font-semibold text-base sm:text-lg text-gray-500">
        Monthly Profit
      </h1>

      {/* Responsive Container */}
      <div className="w-full sm:w-[300px] lg:w-[400px] h-[300px] lg:h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              outerRadius="70%" // stays proportional
              dataKey="value"
              label
            >
              {data.map((entry, i) => (
                <Cell
                  key={`cell-${i}`}
                  fill={COLORS[i % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
