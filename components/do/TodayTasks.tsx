"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Task } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  Clock,
  Calendar,
  CheckCircle2,
  XCircle,
  Play,
  Pause,
  MoreHorizontal,
  AlertCircle,
  Target,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatLocalDate } from "@/utils/date";

interface TaskWithRelations extends Task {
  goal?: {
    id: string;
    title: string;
  } | null;
  parent?: {
    id: string;
    title: string;
  } | null;
  tags?: {
    id: string;
    name: string;
    color: string;
  }[];
}

export default function TodayTasks() {
  const { userId } = useAuth();
  const [tasks, setTasks] = useState<TaskWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);

  // 加载今日任务
  const loadTodayTasks = async () => {
    if (!userId) return;

    try {
      setLoading(true);
      // 获取今天的日期范围
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const response = await fetch(`/api/tasks?userId=${userId}`);
      if (!response.ok) throw new Error("Failed to fetch tasks");
      const allTasks = await response.json();

      // 筛选今日任务：
      // 1. 没有截止日期但状态为进行中的任务
      // 2. 截止日期是今天的任务
      // 3. 截止日期已过但尚未完成的任务
      const todayTasks = allTasks.filter((task: TaskWithRelations) => {
        if (task.status === "COMPLETED" || task.status === "CANCELLED") {
          // 只显示今天完成的任务
          return task.updatedAt && new Date(task.updatedAt) >= today && new Date(task.updatedAt) < tomorrow;
        }
        
        if (task.status === "IN_PROGRESS") {
          return true; // 所有进行中的任务
        }
        
        if (!task.dueDate) {
          return false; // 没有截止日期且不是进行中的任务不显示
        }
        
        const dueDate = new Date(task.dueDate);
        dueDate.setHours(0, 0, 0, 0);
        
        // 截止日期是今天或已过期的任务
        return dueDate <= tomorrow;
      });

      setTasks(todayTasks);
    } catch (error) {
      console.error("Error loading today's tasks:", error);
      toast.error("加载今日任务失败");
    } finally {
      setLoading(false);
    }
  };

  // 更新任务状态
  const updateTaskStatus = async (id: string, status: string) => {
    try {
      const response = await fetch(`/api/tasks/${id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update task status");
      }

      const updatedTask = await response.json();
      setTasks(tasks.map(task => task.id === updatedTask.id ? updatedTask : task));
      
      if (status === "COMPLETED") {
        toast.success("任务已完成");
      } else if (status === "IN_PROGRESS") {
        toast.success("任务已开始");
        setActiveTaskId(id);
      } else if (status === "CANCELLED") {
        toast.success("任务已取消");
        if (activeTaskId === id) {
          setActiveTaskId(null);
        }
      } else {
        toast.success("任务状态已更新");
      }
    } catch (error) {
      console.error("Error updating task status:", error);
      toast.error("更新任务状态失败");
    }
  };

  // 开始计时
  const startTimer = (taskId: string) => {
    // 如果有其他正在计时的任务，先暂停它
    if (activeTaskId && activeTaskId !== taskId) {
      // 这里可以添加暂停之前任务的逻辑
      toast.info("已暂停之前的任务计时");
    }
    
    setActiveTaskId(taskId);
    updateTaskStatus(taskId, "IN_PROGRESS");
    toast.success("开始计时");
  };

  // 暂停计时
  const pauseTimer = () => {
    if (activeTaskId) {
      setActiveTaskId(null);
      toast.info("计时已暂停");
    }
  };

  // 过滤任务
  const filteredTasks = () => {
    if (filter === "all") return tasks;
    return tasks.filter(task => task.status === filter);
  };

  // 获取任务优先级标签
  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "URGENT":
        return <Badge variant="destructive">紧急</Badge>;
      case "HIGH":
        return <Badge variant="default">高</Badge>;
      case "MEDIUM":
        return <Badge variant="secondary">中</Badge>;
      case "LOW":
        return <Badge variant="outline">低</Badge>;
      default:
        return null;
    }
  };

  // 获取任务状态标签
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">已完成</Badge>;
      case "IN_PROGRESS":
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">进行中</Badge>;
      case "CANCELLED":
        return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">已取消</Badge>;
      case "TODO":
        return <Badge variant="outline">待办</Badge>;
      default:
        return null;
    }
  };

  // 初始加载
  useEffect(() => {
    if (userId) {
      loadTodayTasks();
    }
  }, [userId]);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="筛选任务" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">所有任务</SelectItem>
              <SelectItem value="TODO">待办</SelectItem>
              <SelectItem value="IN_PROGRESS">进行中</SelectItem>
              <SelectItem value="COMPLETED">已完成</SelectItem>
              <SelectItem value="CANCELLED">已取消</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={loadTodayTasks}>
            刷新
          </Button>
        </div>
        
        {activeTaskId && (
          <div className="flex items-center gap-2 bg-blue-50 px-3 py-1 rounded-full">
            <Clock className="h-4 w-4 text-blue-500 animate-pulse" />
            <span className="text-sm font-medium">
              正在进行: {tasks.find(t => t.id === activeTaskId)?.title}
            </span>
            <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={pauseTimer}>
              <Pause className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">加载中...</p>
        </div>
      ) : filteredTasks().length === 0 ? (
        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground mb-4">今日暂无任务</p>
          <Button asChild>
            <a href="/plan?tab=tasks">创建新任务</a>
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTasks().map((task) => (
            <Card key={task.id} className={`overflow-hidden ${task.status === "COMPLETED" ? "opacity-70" : ""}`}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Checkbox 
                    checked={task.status === "COMPLETED"}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        updateTaskStatus(task.id, "COMPLETED");
                      } else {
                        updateTaskStatus(task.id, "TODO");
                      }
                    }}
                    className="mt-1"
                  />
                  
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <h3 className={`font-medium ${task.status === "COMPLETED" ? "line-through text-muted-foreground" : ""}`}>
                        {task.title}
                      </h3>
                      <div className="flex items-center gap-2">
                        {getPriorityBadge(task.priority)}
                        {getStatusBadge(task.status)}
                      </div>
                    </div>
                    
                    {task.description && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {task.description}
                      </p>
                    )}
                    
                    <div className="flex flex-wrap gap-2 mt-2">
                      {task.dueDate && (
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3 mr-1" />
                          {formatLocalDate(task.dueDate)}
                        </div>
                      )}
                      
                      {task.goal && (
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Target className="h-3 w-3 mr-1" />
                          {task.goal.title}
                        </div>
                      )}
                      
                      {task.tags && task.tags.map(tag => (
                        <Badge 
                          key={tag.id} 
                          variant="outline" 
                          style={{ 
                            backgroundColor: `${tag.color}20`, 
                            borderColor: tag.color,
                            color: tag.color
                          }}
                          className="text-xs"
                        >
                          {tag.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
              
              <CardFooter className="bg-muted/50 px-4 py-2 flex justify-between">
                <div className="flex gap-1">
                  {task.status !== "COMPLETED" && task.status !== "CANCELLED" && (
                    <>
                      {task.status !== "IN_PROGRESS" || activeTaskId !== task.id ? (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => startTimer(task.id)}
                          className="h-8"
                        >
                          <Play className="h-3 w-3 mr-1" />
                          开始
                        </Button>
                      ) : (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={pauseTimer}
                          className="h-8"
                        >
                          <Pause className="h-3 w-3 mr-1" />
                          暂停
                        </Button>
                      )}
                    </>
                  )}
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => updateTaskStatus(task.id, "COMPLETED")}>
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      标记为已完成
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => updateTaskStatus(task.id, "IN_PROGRESS")}>
                      <Play className="h-4 w-4 mr-2" />
                      标记为进行中
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => updateTaskStatus(task.id, "CANCELLED")}>
                      <XCircle className="h-4 w-4 mr-2" />
                      取消任务
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <a href={`/tasks/${task.id}`}>
                        查看详情
                      </a>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
