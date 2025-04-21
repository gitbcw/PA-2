"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Task, Goal } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  BarChart2,
  Calendar,
  CheckCircle2,
  XCircle,
  Edit,
  Trash2,
  Target,
  AlertCircle,
  ListTodo,
} from "lucide-react";
import { formatLocalDate } from "@/utils/date";

interface TaskWithRelations extends Task {
  goal?: {
    id: string;
    title: string;
  } | null;
}

interface GoalWithRelations extends Goal {
  tasks?: {
    id: string;
    title: string;
    status: string;
  }[];
}

interface ProgressLog {
  id: string;
  progress: number;
  note?: string;
  createdAt: string;
  userId: string;
  taskId?: string;
  goalId?: string;
  task?: {
    id: string;
    title: string;
    status: string;
  };
  goal?: {
    id: string;
    title: string;
    status: string;
  };
}

export default function ProgressUpdater() {
  const { userId } = useAuth();
  const [tasks, setTasks] = useState<TaskWithRelations[]>([]);
  const [goals, setGoals] = useState<GoalWithRelations[]>([]);
  const [progressLogs, setProgressLogs] = useState<ProgressLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("tasks");
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [selectedItemType, setSelectedItemType] = useState<"task" | "goal">("task");
  const [progress, setProgress] = useState(0);
  const [note, setNote] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedLog, setSelectedLog] = useState<ProgressLog | null>(null);
  const [editProgress, setEditProgress] = useState(0);
  const [editNote, setEditNote] = useState("");

  // 加载任务
  const loadTasks = async () => {
    if (!userId) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/tasks?userId=${userId}`);
      if (!response.ok) throw new Error("Failed to fetch tasks");
      const allTasks = await response.json();

      // 筛选未完成的任务
      const activeTasks = allTasks.filter((task: TaskWithRelations) => 
        task.status !== "COMPLETED" && task.status !== "CANCELLED"
      );

      setTasks(activeTasks);
    } catch (error) {
      console.error("Error loading tasks:", error);
      toast.error("加载任务失败");
    } finally {
      setLoading(false);
    }
  };

  // 加载目标
  const loadGoals = async () => {
    if (!userId) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/goals?userId=${userId}`);
      if (!response.ok) throw new Error("Failed to fetch goals");
      const allGoals = await response.json();

      // 筛选活跃的目标
      const activeGoals = allGoals.filter((goal: GoalWithRelations) => 
        goal.status === "ACTIVE"
      );

      setGoals(activeGoals);
    } catch (error) {
      console.error("Error loading goals:", error);
      toast.error("加载目标失败");
    } finally {
      setLoading(false);
    }
  };

  // 加载进度日志
  const loadProgressLogs = async () => {
    if (!userId) return;

    try {
      setLoading(true);
      // 获取今天的日期
      const today = new Date().toISOString().split('T')[0];
      
      const response = await fetch(`/api/progress-logs?userId=${userId}&date=${today}`);
      if (!response.ok) throw new Error("Failed to fetch progress logs");
      const logs = await response.json();
      
      setProgressLogs(logs);
    } catch (error) {
      console.error("Error loading progress logs:", error);
      toast.error("加载进度日志失败");
    } finally {
      setLoading(false);
    }
  };

  // 提交进度更新
  const submitProgressUpdate = async () => {
    if (!selectedItemId) {
      toast.error("请先选择一个任务或目标");
      return;
    }

    try {
      const response = await fetch("/api/progress-logs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          progress,
          note,
          userId,
          ...(selectedItemType === "task" ? { taskId: selectedItemId } : { goalId: selectedItemId }),
        }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to save progress update");
      }
      
      toast.success("进度更新已保存");
      setProgress(0);
      setNote("");
      
      // 重新加载数据
      loadProgressLogs();
      loadTasks();
      loadGoals();
    } catch (error) {
      console.error("Error saving progress update:", error);
      toast.error("保存进度更新失败");
    }
  };

  // 编辑进度日志
  const editProgressLog = async () => {
    if (!selectedLog) return;
    
    try {
      const response = await fetch(`/api/progress-logs/${selectedLog.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          progress: editProgress,
          note: editNote,
        }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to update progress log");
      }
      
      toast.success("进度日志已更新");
      setOpenDialog(false);
      
      // 重新加载数据
      loadProgressLogs();
      loadTasks();
      loadGoals();
    } catch (error) {
      console.error("Error updating progress log:", error);
      toast.error("更新进度日志失败");
    }
  };

  // 删除进度日志
  const deleteProgressLog = async (id: string) => {
    try {
      const response = await fetch(`/api/progress-logs/${id}`, {
        method: "DELETE",
      });
      
      if (!response.ok) {
        throw new Error("Failed to delete progress log");
      }
      
      toast.success("进度日志已删除");
      
      // 重新加载数据
      loadProgressLogs();
    } catch (error) {
      console.error("Error deleting progress log:", error);
      toast.error("删除进度日志失败");
    }
  };

  // 打开编辑对话框
  const openEditDialog = (log: ProgressLog) => {
    setSelectedLog(log);
    setEditProgress(log.progress);
    setEditNote(log.note || "");
    setOpenDialog(true);
  };

  // 获取任务或目标的当前进度
  const getCurrentProgress = () => {
    if (!selectedItemId) return 0;
    
    if (selectedItemType === "task") {
      const task = tasks.find(t => t.id === selectedItemId);
      // 任务没有进度字段，根据状态返回进度
      if (task) {
        switch (task.status) {
          case "COMPLETED": return 100;
          case "IN_PROGRESS": return 50;
          case "TODO": return 0;
          case "CANCELLED": return 0;
          default: return 0;
        }
      }
    } else {
      const goal = goals.find(g => g.id === selectedItemId);
      return goal ? goal.progress : 0;
    }
    
    return 0;
  };

  // 初始加载
  useEffect(() => {
    if (userId) {
      loadTasks();
      loadGoals();
      loadProgressLogs();
    }
  }, [userId]);

  // 切换标签时重置选择
  useEffect(() => {
    setSelectedItemId(null);
    setProgress(0);
  }, [activeTab]);

  // 选择项目变化时，设置初始进度
  useEffect(() => {
    if (selectedItemId) {
      setProgress(getCurrentProgress());
    }
  }, [selectedItemId, selectedItemType]);

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="tasks">
            <ListTodo className="h-4 w-4 mr-2" />
            任务进度
          </TabsTrigger>
          <TabsTrigger value="goals">
            <Target className="h-4 w-4 mr-2" />
            目标进度
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="tasks" className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">选择任务</label>
            <Select
              value={selectedItemId || ""}
              onValueChange={(value) => {
                setSelectedItemId(value);
                setSelectedItemType("task");
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="选择要更新进度的任务" />
              </SelectTrigger>
              <SelectContent>
                {tasks.map((task) => (
                  <SelectItem key={task.id} value={task.id}>
                    {task.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {selectedItemId && selectedItemType === "task" && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  {tasks.find(t => t.id === selectedItemId)?.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <label className="text-sm font-medium">进度: {progress}%</label>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setProgress(0)}
                        className="h-6 px-2"
                      >
                        0%
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setProgress(50)}
                        className="h-6 px-2"
                      >
                        50%
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setProgress(100)}
                        className="h-6 px-2"
                      >
                        100%
                      </Button>
                    </div>
                  </div>
                  <Slider
                    value={[progress]}
                    min={0}
                    max={100}
                    step={5}
                    onValueChange={(values) => setProgress(values[0])}
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">备注</label>
                  <Textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="添加关于此次进度更新的备注..."
                    rows={3}
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={submitProgressUpdate} className="w-full">
                  <BarChart2 className="h-4 w-4 mr-2" />
                  更新进度
                </Button>
              </CardFooter>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="goals" className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">选择目标</label>
            <Select
              value={selectedItemId || ""}
              onValueChange={(value) => {
                setSelectedItemId(value);
                setSelectedItemType("goal");
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="选择要更新进度的目标" />
              </SelectTrigger>
              <SelectContent>
                {goals.map((goal) => (
                  <SelectItem key={goal.id} value={goal.id}>
                    {goal.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {selectedItemId && selectedItemType === "goal" && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  {goals.find(g => g.id === selectedItemId)?.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <label className="text-sm font-medium">进度: {progress}%</label>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setProgress(0)}
                        className="h-6 px-2"
                      >
                        0%
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setProgress(25)}
                        className="h-6 px-2"
                      >
                        25%
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setProgress(50)}
                        className="h-6 px-2"
                      >
                        50%
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setProgress(75)}
                        className="h-6 px-2"
                      >
                        75%
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setProgress(100)}
                        className="h-6 px-2"
                      >
                        100%
                      </Button>
                    </div>
                  </div>
                  <Slider
                    value={[progress]}
                    min={0}
                    max={100}
                    step={5}
                    onValueChange={(values) => setProgress(values[0])}
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">备注</label>
                  <Textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="添加关于此次进度更新的备注..."
                    rows={3}
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={submitProgressUpdate} className="w-full">
                  <BarChart2 className="h-4 w-4 mr-2" />
                  更新进度
                </Button>
              </CardFooter>
            </Card>
          )}
        </TabsContent>
      </Tabs>
      
      {/* 进度日志列表 */}
      <div>
        <h3 className="text-lg font-medium mb-4">今日进度记录</h3>
        
        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">加载中...</p>
          </div>
        ) : progressLogs.length === 0 ? (
          <div className="text-center py-12">
            <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">今日暂无进度记录</p>
          </div>
        ) : (
          <div className="space-y-3">
            {progressLogs.map((log) => (
              <Card key={log.id}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium">
                        {log.task?.title || log.goal?.title || "未知项目"}
                      </h4>
                      <div className="flex items-center text-sm text-muted-foreground mt-1">
                        <Calendar className="h-3 w-3 mr-1" />
                        {formatLocalDate(log.createdAt)}
                        {log.task && (
                          <Badge className="ml-2" variant="outline">任务</Badge>
                        )}
                        {log.goal && (
                          <Badge className="ml-2" variant="outline">目标</Badge>
                        )}
                      </div>
                      {log.note && (
                        <p className="text-sm mt-2">{log.note}</p>
                      )}
                    </div>
                    <div className="flex flex-col items-end">
                      <div className="flex items-center">
                        <BarChart2 className="h-4 w-4 mr-1 text-blue-500" />
                        <span className="font-medium">{log.progress}%</span>
                      </div>
                      <div className="flex gap-1 mt-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => openEditDialog(log)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-destructive"
                          onClick={() => deleteProgressLog(log.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
      
      {/* 编辑对话框 */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>编辑进度记录</DialogTitle>
            <DialogDescription>
              修改此进度记录的信息
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">项目</label>
              <Input 
                value={selectedLog?.task?.title || selectedLog?.goal?.title || ""} 
                disabled 
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <label className="text-sm font-medium">进度: {editProgress}%</label>
              </div>
              <Slider
                value={[editProgress]}
                min={0}
                max={100}
                step={5}
                onValueChange={(values) => setEditProgress(values[0])}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">备注</label>
              <Textarea
                value={editNote}
                onChange={(e) => setEditNote(e.target.value)}
                placeholder="添加关于此次进度更新的备注..."
                rows={3}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenDialog(false)}>
              取消
            </Button>
            <Button onClick={editProgressLog}>
              保存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
