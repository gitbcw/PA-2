import { Objective } from "./ObjectiveManager";

export default function ObjectiveCard({ objective }: { objective: Objective }) {
  return (
    <div className="border rounded p-4">
      <div className="font-bold text-lg mb-1">{objective.title}</div>
      <div className="text-sm text-gray-700 mb-1">{objective.description}</div>
      <div className="flex gap-2 text-xs text-gray-500">
        <span>类型: {objective.type}</span>
        <span>状态: {objective.status}</span>
        {objective.level && <span>级别: {objective.level}</span>}
        {objective.startDate && <span>开始: {objective.startDate.slice(0, 10)}</span>}
        {objective.endDate && <span>结束: {objective.endDate.slice(0, 10)}</span>}
      </div>
    </div>
  );
}
