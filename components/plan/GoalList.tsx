import React from "react";
import GoalCard from "./GoalCard";

interface GoalListProps {
  goals: any[];
  goalLevelMap: any;
  goalStatusMap: any;
  onEdit: (goal: any) => void;
  onDelete: (goalId: string) => void;
  loading: boolean;
}

const GoalList: React.FC<GoalListProps> = ({ goals, goalLevelMap, goalStatusMap, onEdit, onDelete, loading }) => {
  if (loading) {
    return <div className="text-center py-12"><p className="text-muted-foreground">加载中...</p></div>;
  }
  if (goals.length === 0) {
    return <div className="text-center py-12"><p className="text-muted-foreground mb-4">暂无目标</p></div>;
  }
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {goals.map((goal) => (
        <GoalCard
          key={goal.id}
          goal={goal}
          goalLevelMap={goalLevelMap}
          goalStatusMap={goalStatusMap}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};

export default GoalList;
