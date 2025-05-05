// 进度趋势折线图原型，使用模拟数据
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";

const data = [
  { day: "周一", value: 60 },
  { day: "周二", value: 68 },
  { day: "周三", value: 74 },
  { day: "周四", value: 78 },
  { day: "周五", value: 80 },
  { day: "周六", value: 85 },
  { day: "周日", value: 90 },
];

export default function ProgressTrendLineChart() {
  return (
    <div style={{ height: 220, width: '100%' }} className="bg-white dark:bg-card rounded-lg shadow p-4 flex items-center justify-center">
      <ResponsiveContainer width="100%" height={180}>
        <LineChart data={data} margin={{ top: 20, right: 30, bottom: 40, left: 50 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="day" />
          <YAxis domain={[0, 100]} />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="value" name="整体完成率" stroke="#3b82f6" strokeWidth={3} dot={{ r: 6 }} activeDot={{ r: 8 }} fill="#3b82f6" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
