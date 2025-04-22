// 进度趋势折线图原型，使用模拟数据
import { ResponsiveLine } from "@nivo/line";

const data = [
  {
    id: "整体完成率",
    color: "#3b82f6",
    data: [
      { x: "周一", y: 60 },
      { x: "周二", y: 68 },
      { x: "周三", y: 74 },
      { x: "周四", y: 78 },
      { x: "周五", y: 80 },
      { x: "周六", y: 85 },
      { x: "周日", y: 90 },
    ],
  },
];

export default function ProgressTrendLineChart() {
  return (
    <div style={{ height: 220, width: '100%' }} className="bg-white dark:bg-card rounded-lg shadow p-4 flex items-center justify-center">
      <ResponsiveLine
        data={data}
        margin={{ top: 20, right: 30, bottom: 40, left: 50 }}
        xScale={{ type: "point" }}
        yScale={{ type: "linear", min: 0, max: 100 }}
        axisBottom={{ tickSize: 5, tickPadding: 5, tickRotation: 0 }}
        axisLeft={{ tickSize: 5, tickPadding: 5, tickRotation: 0 }}
        colors={["#3b82f6"]}
        pointSize={8}
        pointColor={{ theme: 'background' }}
        pointBorderWidth={2}
        pointBorderColor={{ from: 'serieColor' }}
        enableArea={true}
        areaOpacity={0.15}
        enableGridX={false}
        enableGridY={true}
        useMesh={true}
      />
    </div>
  );
}
