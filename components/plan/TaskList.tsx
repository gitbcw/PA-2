import TaskCard from "./TaskCard";

interface TaskListProps {
  groupedTasks: Record<string, any[]>;
  taskStatusMap: any;
  taskPriorityMap: any;
  getGoalTitle: (goalId: string) => string;
  getParentTaskTitle: (parentId: string) => string;
  onEdit: (task: any) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: string) => void;
}

export default function TaskList({
  groupedTasks,
  taskStatusMap,
  taskPriorityMap,
  getGoalTitle,
  getParentTaskTitle,
  onEdit,
  onDelete,
  onStatusChange
}: TaskListProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {Object.entries(taskStatusMap).map(([status, { label }]) => (
        <div key={status} className="border rounded-lg p-2 bg-muted/40">
          <div className="font-bold text-sm mb-2 flex items-center gap-2">
            <span className={taskStatusMap[status].color + " px-2 py-1 rounded text-xs"}>{label}</span>
          </div>
          <div className="flex flex-col gap-2 min-h-[120px]">
            {(groupedTasks[status] || []).map((task: any) => (
              <TaskCard
                key={task.id}
                task={task}
                getGoalTitle={getGoalTitle}
                getParentTaskTitle={getParentTaskTitle}
                onEdit={onEdit}
                onDelete={onDelete}
                onStatusChange={onStatusChange}
                taskStatusMap={taskStatusMap}
                taskPriorityMap={taskPriorityMap}
              />
            ))}
            {(groupedTasks[status]?.length === 0 || !groupedTasks[status]) && (
              <div className="text-center py-4 border border-dashed rounded-lg">
                <p className="text-xs text-muted-foreground">暂无{label}任务</p>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
