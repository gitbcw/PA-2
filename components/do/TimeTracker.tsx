"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Task } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  Play,
  Pause,
  StopCircle,
  Clock,
  Calendar,
  CheckCircle2,
  XCircle,
  Edit,
  Trash2,
  Target,
  AlertCircle,
} from "lucide-react";
import { formatLocalDate, formatTime } from "@/utils/date";

interface TaskWithRelations extends Task {
  goal?: {
    id: string;
    title: string;
  } | null;
}

interface TimeRecord {
  id: string;
  startTime: string;
  endTime?: string;
  duration?: number;
  note?: string;
  userId: string;
  taskId: string;
  task: {
    id: string;
    title: string;
    status: string;
  };
}

export default function TimeTracker() {
  const { userId } = useAuth();
  const [tasks, setTasks] = useState<TaskWithRelations[]>([]);
  const [timeRecords, setTimeRecords] = useState<TimeRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [trackingStartTime, setTrackingStartTime] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [note, setNote] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<TimeRecord | null>(null);
  const [editNote, setEditNote] = useState("");
  const [todayTotal, setTodayTotal] = useState(0);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);

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

  // 加载时间记录
  const loadTimeRecords = async () => {
    if (!userId) return;

    try {
      setLoading(true);
      // 获取今天的日期
      const today = new Date().toISOString().split('T')[0];
      
      const response = await fetch(`/api/time-records?userId=${userId}&date=${today}`);
      if (!response.ok) throw new Error("Failed to fetch time records");
      const records = await response.json();
      
      setTimeRecords(records);
      
      // 计算今日总时间
      const total = records.reduce((sum: number, record: TimeRecord) => {
        return sum + (record.duration || 0);
      }, 0);
      
      setTodayTotal(total);
    } catch (error) {
      console.error("Error loading time records:", error);
      toast.error("加载时间记录失败");
    } finally {
      setLoading(false);
    }
  };

  // 开始计时
  const startTimer = () => {
    if (!selectedTaskId) {
      toast.error("请先选择一个任务");
      return;
    }

    const now = new Date();
    setTrackingStartTime(now);
    setIsTracking(true);
    setElapsedTime(0);
    
    // 启动计时器
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    timerRef.current = setInterval(() => {
      setElapsedTime(prev => prev + 1);
    }, 1000);
    
    toast.success("开始计时");
  };

  // 暂停计时
  const pauseTimer = async () => {
    if (!isTracking || !trackingStartTime || !selectedTaskId) return;
    
    // 停止计时器
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    const now = new Date();
    const duration = Math.floor((now.getTime() - trackingStartTime.getTime()) / 1000);
    
    try {
      const response = await fetch("/api/time-records", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          startTime: trackingStartTime.toISOString(),
          endTime: now.toISOString(),
          duration,
          note,
          userId,
          taskId: selectedTaskId,
        }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to save time record");
      }
      
      toast.success("时间记录已保存");
      setIsTracking(false);
      setTrackingStartTime(null);
      setElapsedTime(0);
      setNote("");
      
      // 重新加载时间记录
      loadTimeRecords();
    } catch (error) {
      console.error("Error saving time record:", error);
      toast.error("保存时间记录失败");
    }
  };

  // 停止计时
  const stopTimer = () => {
    pauseTimer();
  };

  // 编辑时间记录
  const editTimeRecord = async () => {
    if (!selectedRecord) return;
    
    try {
      const response = await fetch(`/api/time-records/${selectedRecord.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          note: editNote,
        }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to update time record");
      }
      
      toast.success("时间记录已更新");
      setOpenDialog(false);
      
      // 重新加载时间记录
      loadTimeRecords();
    } catch (error) {
      console.error("Error updating time record:", error);
      toast.error("更新时间记录失败");
    }
  };

  // 删除时间记录
  const deleteTimeRecord = async (id: string) => {
    try {
      const response = await fetch(`/api/time-records/${id}`, {
        method: "DELETE",
      });
      
      if (!response.ok) {
        throw new Error("Failed to delete time record");
      }
      
      toast.success("时间记录已删除");
      
      // 重新加载时间记录
      loadTimeRecords();
    } catch (error) {
      console.error("Error deleting time record:", error);
      toast.error("删除时间记录失败");
    }
  };

  // 打开编辑对话框
  const openEditDialog = (record: TimeRecord) => {
    setSelectedRecord(record);
    setEditNote(record.note || "");
    setOpenDialog(true);
  };

  // 格式化持续时间
  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // 初始加载
  useEffect(() => {
    if (userId) {
      loadTasks();
      loadTimeRecords();
    }
    
    // 清理函数
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [userId]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* 计时器卡片 */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>任务计时器</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">选择任务</label>
                <Select
                  value={selectedTaskId || ""}
                  onValueChange={setSelectedTaskId}
                  disabled={isTracking}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="选择要计时的任务" />
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
              
              <div className="space-y-2">
                <label className="text-sm font-medium">备注</label>
                <Textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="添加关于此次工作的备注..."
                  rows={2}
                />
              </div>
              
              <div className="flex justify-center py-6">
                <div className="text-4xl font-mono">
                  {formatDuration(elapsedTime)}
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            {!isTracking ? (
              <Button onClick={startTimer} disabled={!selectedTaskId}>
                <Play className="h-4 w-4 mr-2" />
                开始计时
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button onClick={pauseTimer} variant="outline">
                  <Pause className="h-4 w-4 mr-2" />
                  暂停
                </Button>
                <Button onClick={stopTimer} variant="destructive">
                  <StopCircle className="h-4 w-4 mr-2" />
                  停止
                </Button>
              </div>
            )}
          </CardFooter>
        </Card>
        
        {/* 今日统计卡片 */}
        <Card>
          <CardHeader>
            <CardTitle>今日统计</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">总计时间</span>
                <span className="text-xl font-mono">{formatDuration(todayTotal)}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">记录数量</span>
                <span className="text-xl">{timeRecords.length}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">当前状态</span>
                <Badge variant={isTracking ? "default" : "outline"}>
                  {isTracking ? "计时中" : "未计时"}
                </Badge>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" onClick={loadTimeRecords}>
              刷新数据
            </Button>
          </CardFooter>
        </Card>
      </div>
      
      {/* 时间记录列表 */}
      <div>
        <h3 className="text-lg font-medium mb-4">今日时间记录</h3>
        
        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">加载中...</p>
          </div>
        ) : timeRecords.length === 0 ? (
          <div className="text-center py-12">
            <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">今日暂无时间记录</p>
          </div>
        ) : (
          <div className="space-y-3">
            {timeRecords.map((record) => (
              <Card key={record.id}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium">{record.task.title}</h4>
                      <div className="flex items-center text-sm text-muted-foreground mt-1">
                        <Clock className="h-3 w-3 mr-1" />
                        {formatTime(record.startTime)} - {record.endTime ? formatTime(record.endTime) : "进行中"}
                      </div>
                      {record.note && (
                        <p className="text-sm mt-2">{record.note}</p>
                      )}
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-lg font-mono">
                        {record.duration ? formatDuration(record.duration) : "--:--:--"}
                      </span>
                      <div className="flex gap-1 mt-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => openEditDialog(record)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-destructive"
                          onClick={() => deleteTimeRecord(record.id)}
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
            <DialogTitle>编辑时间记录</DialogTitle>
            <DialogDescription>
              修改此时间记录的备注信息
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">任务</label>
              <Input value={selectedRecord?.task.title || ""} disabled />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">时间</label>
              <Input 
                value={`${selectedRecord ? formatTime(selectedRecord.startTime) : ""} - ${selectedRecord?.endTime ? formatTime(selectedRecord.endTime) : ""}`} 
                disabled 
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">持续时间</label>
              <Input 
                value={selectedRecord?.duration ? formatDuration(selectedRecord.duration) : "--:--:--"} 
                disabled 
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">备注</label>
              <Textarea
                value={editNote}
                onChange={(e) => setEditNote(e.target.value)}
                placeholder="添加关于此次工作的备注..."
                rows={3}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenDialog(false)}>
              取消
            </Button>
            <Button onClick={editTimeRecord}>
              保存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
