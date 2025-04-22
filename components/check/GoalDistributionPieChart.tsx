// 目标分布饼图（环形图）原型，使用模拟数据
import { ResponsivePie } from "@nivo/pie";

const data = [
  { id: "进行中", label: "进行中", value: 6, color: "#3b82f6" },
  { id: "已完成", label: "已完成", value: 4, color: "#10b981" },
  { id: "逾期", label: "逾期", value: 2, color: "#ef4444" },
];

export default function GoalDistributionPieChart() {
  return (
    <div style={{ height: 220 }} className="bg-white dark:bg-card rounded-lg shadow p-4 flex items-center justify-center">
      <ResponsivePie
        data={data}
        margin={{ top: 20, right: 40, bottom: 20, left: 40 }}
        innerRadius={0.6}
        padAngle={2}
        cornerRadius={5}
        colors={{ datum: 'data.color' }}
        borderWidth={1}
        enableArcLabels={true}
        arcLinkLabelsSkipAngle={10}
        arcLabelsTextColor="#222"
        arcLinkLabelsTextColor="#666"
        arcLinkLabelsColor={{ from: 'color' }}
      />
    </div>
  );
}
