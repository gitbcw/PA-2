// 目标分布饼图（环形图）原型，使用模拟数据
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

const data = [
  { name: "进行中", value: 6, color: "#3b82f6" },
  { name: "已完成", value: 4, color: "#10b981" },
  { name: "逾期", value: 2, color: "#ef4444" },
];

export default function GoalDistributionPieChart() {
  return (
    <div style={{ height: 220, width: '100%' }} className="bg-white dark:bg-card rounded-lg shadow p-4 flex items-center justify-center">
      <ResponsiveContainer width="100%" height={180}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={80}
            paddingAngle={2}
            label
          >
            {data.map((entry, idx) => (
              <Cell key={`cell-${idx}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
