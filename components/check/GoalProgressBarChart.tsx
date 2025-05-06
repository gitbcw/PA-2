// 目标进度条形图原型，使用模拟数据
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid } from "recharts";

const data = [
  { goal: "英语学习", progress: 80 },
  { goal: "健身", progress: 60 },
  { goal: "阅读", progress: 95 },
  { goal: "编程", progress: 50 },
];

export default function GoalProgressBarChart() {
  return (
    <div style={{ height: 220, width: '100%' }} className="bg-white dark:bg-card rounded-lg shadow p-4 flex items-center justify-center">
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={data} margin={{ top: 20, right: 30, bottom: 40, left: 50 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="goal" />
          <YAxis domain={[0, 100]} />
          <Tooltip />
          <Legend />
          <Bar dataKey="progress" fill="#3b82f6" maxBarSize={40} label={{ position: 'top', fill: '#222' }} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
