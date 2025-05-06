import GoalDistributionPieChart from "./GoalDistributionPieChart";
import GoalProgressBarChart from "./GoalProgressBarChart";
import ProgressTrendLineChart from "./ProgressTrendLineChart";

export default function CheckSummaryCharts() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div>
        <div className="font-semibold mb-2">目标分布</div>
        <GoalDistributionPieChart />
      </div>
      <div>
        <div className="font-semibold mb-2">目标进度对比</div>
        <GoalProgressBarChart />
      </div>
      <div>
        <div className="font-semibold mb-2">进度趋势</div>
        <ProgressTrendLineChart />
      </div>
    </div>
  );
}
