import React from "react";
import { CheckCircle2, XCircle, Clock, Target, ChevronRight } from "lucide-react";

interface GoalTaskListProps {
  tasks: any[];
}

const GoalTaskList: React.FC<GoalTaskListProps> = ({ tasks }) => {
  if (!tasks || tasks.length === 0) return null;
  return (
    <div className="mt-3 pt-3 border-t">
      <p className="text-xs font-medium mb-1">相关任务 ({tasks.length})</p>
      <div className="space-y-1">
        {tasks.slice(0, 2).map((task) => (
          <div key={task.id} className="flex items-center text-xs">
            {task.status === "COMPLETED" ? (
              <CheckCircle2 className="h-3 w-3 mr-1 text-green-500" />
            ) : task.status === "IN_PROGRESS" ? (
              <Clock className="h-3 w-3 mr-1 text-blue-500" />
            ) : task.status === "CANCELLED" ? (
              <XCircle className="h-3 w-3 mr-1 text-red-500" />
            ) : (
              <Target className="h-3 w-3 mr-1 text-gray-500" />
            )}
            <span className="truncate">{task.title}</span>
          </div>
        ))}
        {tasks.length > 2 && (
          <div className="text-xs text-muted-foreground flex items-center">
            <span>还有 {tasks.length - 2} 个任务</span>
            <ChevronRight className="h-3 w-3 ml-1" />
          </div>
        )}
      </div>
    </div>
  );
};

export default GoalTaskList;
