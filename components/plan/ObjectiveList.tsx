import { Objective, ObjectiveType } from "./ObjectiveManager";
import ObjectiveCard from "./ObjectiveCard";

interface ObjectiveListProps {
  objectives: Objective[];
  loading: boolean;
  type: ObjectiveType;
}

export default function ObjectiveList({ objectives, loading, type }: ObjectiveListProps) {
  if (loading) return <div>加载中...</div>;
  if (!objectives.length) return <div>暂无{type === "GOAL" ? "目标" : "任务"}</div>;

  return (
    <div className="grid gap-4">
      {objectives.map(obj => (
        <ObjectiveCard key={obj.id} objective={obj} />
      ))}
    </div>
  );
}
