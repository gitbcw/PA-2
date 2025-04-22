import React from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Target, CheckCircle2, XCircle, Clock, Edit, Trash2, ChevronRight, BarChart2 } from "lucide-react";
import GoalTaskList from "./GoalTaskList";

interface GoalCardProps {
  goal: any;
  goalLevelMap: any;
  goalStatusMap: any;
  onEdit: (goal: any) => void;
  onDelete: (goalId: string) => void;
}

const GoalCard: React.FC<GoalCardProps> = ({ goal, goalLevelMap, goalStatusMap, onEdit, onDelete }) => (
  <Card className="overflow-hidden">
    <CardHeader className="pb-2">
      <div className="flex justify-between items-start">
        <CardTitle className="text-lg">{goal.title}</CardTitle>
        <div className="flex gap-1">
          <Badge className={goalLevelMap[goal.level]?.color || "bg-gray-100"}>
            {goalLevelMap[goal.level]?.label || goal.level}
          </Badge>
          <Badge className={goalStatusMap[goal.status]?.color || "bg-gray-100"}>
            {goalStatusMap[goal.status]?.label || goal.status}
          </Badge>
        </div>
      </div>
      {goal.description && (
        <p className="text-sm text-muted-foreground mt-1">{goal.description}</p>
      )}
    </CardHeader>
    <CardContent className="pb-2">
      <div className="flex justify-between text-xs text-muted-foreground">
        <div className="flex items-center">
          <Calendar className="h-3 w-3 mr-1" />
          <span>
            {new Date(goal.startDate).toLocaleDateString()} - {new Date(goal.endDate).toLocaleDateString()}
          </span>
        </div>
        <div className="flex items-center">
          <Target className="h-3 w-3 mr-1" />
          <span>{Math.round(goal.progress * 100)}%</span>
        </div>
      </div>
      <div className="mt-2 pt-2">
        <div className="w-full bg-gray-200 rounded-full h-1.5">
          <div
            className="bg-blue-600 h-1.5 rounded-full"
            style={{ width: `${goal.progress * 100}%` }}
          ></div>
        </div>
      </div>
      {goal.tasks && goal.tasks.length > 0 && <GoalTaskList tasks={goal.tasks} />}
    </CardContent>
    <CardFooter className="pt-2 flex justify-between">
      <Button variant="outline" size="sm" onClick={() => onEdit(goal)}>
        <Edit className="h-3 w-3 mr-1" />
        编辑
      </Button>
      <div className="flex gap-1">
        <Button variant="outline" size="sm">
          <BarChart2 className="h-3 w-3 mr-1" />
          详情
        </Button>
        <Button variant="outline" size="sm" className="text-red-500" onClick={() => onDelete(goal.id)}>
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
    </CardFooter>
  </Card>
);

export default GoalCard;
