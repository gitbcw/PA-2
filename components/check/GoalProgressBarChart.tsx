// 目标进度条形图原型，使用模拟数据
import { ResponsiveBar } from "@nivo/bar";

const data = [
  { goal: "英语学习", progress: 80 },
  { goal: "健身", progress: 60 },
  { goal: "阅读", progress: 95 },
  { goal: "编程", progress: 50 },
];

export default function GoalProgressBarChart() {
  return (
    <div style={{ height: 220 }} className="bg-white dark:bg-card rounded-lg shadow p-4 flex items-center justify-center">
      <ResponsiveBar
        data={data}
        keys={["progress"]}
        indexBy="goal"
        margin={{ top: 20, right: 30, bottom: 40, left: 50 }}
        padding={0.4}
        colors={["#3b82f6"]}
        axisBottom={{ tickSize: 5, tickPadding: 5, tickRotation: 0 }}
        axisLeft={{ tickSize: 5, tickPadding: 5, tickRotation: 0 }}
        labelSkipWidth={20}
        labelSkipHeight={12}
        labelTextColor="#222"
        maxValue={100}
      />
    </div>
  );
}
