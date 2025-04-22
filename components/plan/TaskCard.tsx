import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, Edit, Trash2, Clock } from "lucide-react";

interface TaskCardProps {
  task: any;
  getGoalTitle: (goalId: string) => string;
  getParentTaskTitle: (parentId: string) => string;
  onEdit: (task: any) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: string) => void;
  taskStatusMap: any;
  taskPriorityMap: any;
}

export default function TaskCard({
  task,
  getGoalTitle,
  getParentTaskTitle,
  onEdit,
  onDelete,
  onStatusChange,
  taskStatusMap,
  taskPriorityMap
}: TaskCardProps) {
  const status = task.status;
  const priority = task.priority;
  return (
    <Card className="mb-2">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-medium truncate max-w-[180px]">
          {task.title}
        </CardTitle>
        <Badge className={taskStatusMap[status].color}>{taskStatusMap[status].label}</Badge>
      </CardHeader>
      <CardContent className="text-xs text-muted-foreground pb-1">
        <div className="flex flex-wrap gap-1 items-center">
          <Badge className={taskPriorityMap[priority].color}>{taskPriorityMap[priority].label}</Badge>
          {task.dueDate && <span>截止: {task.dueDate.split("T")[0]}</span>}
          {task.goalId && <span>目标: {getGoalTitle(task.goalId)}</span>}
          {task.parentId && <span>父任务: {getParentTaskTitle(task.parentId)}</span>}
        </div>
        <div className="mt-1 line-clamp-2 text-xs">{task.description}</div>
      </CardContent>
      <CardFooter className="flex justify-between gap-1 pt-2">
        <div className="flex gap-1">
          {status !== "COMPLETED" && (
            <Button variant="outline" size="sm" className="text-green-500" onClick={() => onStatusChange(task.id, "COMPLETED")}> <CheckCircle2 className="h-3 w-3" /> </Button>
          )}
          {status !== "IN_PROGRESS" && status !== "COMPLETED" && (
            <Button variant="outline" size="sm" className="text-blue-500" onClick={() => onStatusChange(task.id, "IN_PROGRESS")}> <Clock className="h-3 w-3" /> </Button>
          )}
          {status !== "CANCELLED" && (
            <Button variant="outline" size="sm" className="text-red-500" onClick={() => onStatusChange(task.id, "CANCELLED")}> <XCircle className="h-3 w-3" /> </Button>
          )}
        </div>
        <div className="flex gap-1">
          <Button variant="outline" size="sm" onClick={() => onEdit(task)}> <Edit className="h-3 w-3" /> </Button>
          <Button variant="outline" size="sm" className="text-red-500" onClick={() => onDelete(task.id)}> <Trash2 className="h-3 w-3" /> </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
