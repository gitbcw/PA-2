// 目标评估卡片列表占位组件，后续可接入真实目标数据
export default function GoalCheckCardList() {
  return (
    <div className="space-y-4">
      {[1,2,3].map(i => (
        <div key={i} className="bg-white dark:bg-card rounded-lg shadow p-6 flex flex-col gap-2 border border-muted">
          <div className="flex justify-between items-center">
            <span className="font-semibold text-lg">目标名称示例 {i}</span>
            <span className="text-sm text-green-600 font-bold">进度：{Math.floor(Math.random()*100)}%</span>
          </div>
          <div className="text-muted-foreground text-sm">偏差说明/风险预警示例</div>
        </div>
      ))}
    </div>
  );
}
