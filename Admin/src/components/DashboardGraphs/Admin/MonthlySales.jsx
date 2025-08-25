import { PieChart, Pie, Tooltip, Legend, Cell } from "recharts";

const COLORS = [ "#b5540e", "#27c227", "#ffed21"];



export default function ProfitGraph({ nameOfData, valOfData }) {

    const data = [
       { name: "Gross Profit", value: 2000 },
       { name: "Equipments", value: 4000 },
       { name: "Net Profit", value: 1500 },
    ]
    return (
        <>
            <div className="flex flex-col items-center justify-center p-6 blur-xs">
                <h1 className="font-semibold text-lg text-gray-500">Monthly Profit</h1>
                <PieChart width={400} height={400}>
                    <Pie 
                        data={data}
                        cx="50%"
                        cy="50%"
                        outerRadius={120}
                        dataKey="value"
                        label
                    >
                        {data.map((entry, i) => (
                            <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
                        ))}

                    </Pie>
                    <Tooltip />
                    <Legend />
                </PieChart>
            </div>
        </>
    )
}