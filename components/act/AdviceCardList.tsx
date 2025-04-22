// 建议卡片列表组件，支持三类建议（目标、整体、灵感）
import AdviceCard from "./AdviceCard";

const mockData = {
  goal: [
    { id: 1, title: "提升英语学习频率", advice: "建议每天至少学习20分钟英语，可设定定时提醒。" },
    { id: 2, title: "优化健身计划", advice: "每周至少3次锻炼，建议尝试HIIT训练提升效率。" },
  ],
  overall: [
    { id: 3, title: "整体时间管理", advice: "建议使用番茄工作法，提升每日专注时长。" },
  ],
  inspiration: [
    { id: 4, title: "灵感：尝试晨间写作", advice: "每天早晨花10分钟写作，有助于激发创造力。" },
  ],
};

export default function AdviceCardList({ type }: { type: "goal"|"overall"|"inspiration" }) {
  return (
    <div className="space-y-4 mt-4">
      {mockData[type].map(item => (
        <AdviceCard key={item.id} title={item.title} advice={item.advice} />
      ))}
    </div>
  );
}
