"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Task, Goal } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  Bell,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  Target,
  BarChart2,
  Lightbulb,
  ArrowRight,
} from "lucide-react";
import { formatLocalDate, formatDistanceToNow } from "@/utils/date";

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

interface Notification {
  id: string;
  type: "deadline" | "progress" | "suggestion";
  title: string;
  description: string;
  createdAt: string;
  relatedItemId?: string;
  relatedItemType?: "task" | "goal";
  status: "unread" | "read" | "dismissed";
  priority: "low" | "medium" | "high";
  dueDate?: string;
}

export default function Notifications() {
  const { userId } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");

  // 加载通知
  const loadNotifications = async () => {
    if (!userId) return;

    try {
      setLoading(true);
      // 模拟从API获取通知
      // 实际实现中，这里应该调用后端API
      
      // 模拟数据
      const mockNotifications: Notification[] = [
        {
          id: "1",
          type: "deadline",
          title: "任务即将到期",
          description: "任务「完成项目文档」将在明天到期，请及时处理。",
          createdAt: new Date().toISOString(),
          relatedItemId: "task-1",
          relatedItemType: "task",
          status: "unread",
          priority: "high",
          dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: "2",
          type: "progress",
          title: "进度更新提醒",
          description: "您已经3天没有更新「学习React」的进度了，建议及时更新。",
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          relatedItemId: "task-2",
          relatedItemType: "task",
          status: "unread",
          priority: "medium",
        },
        {
          id: "3",
          type: "suggestion",
          title: "AI建议",
          description: "根据您的进度报告，建议将「网站开发」任务拆分为更小的子任务以提高效率。",
          createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
          relatedItemId: "task-3",
          relatedItemType: "task",
          status: "read",
          priority: "low",
        },
        {
          id: "4",
          type: "deadline",
          title: "目标截止日期临近",
          description: "您的季度目标「提高工作效率」将在7天后到期，当前进度为65%。",
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          relatedItemId: "goal-1",
          relatedItemType: "goal",
          status: "unread",
          priority: "high",
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: "5",
          type: "suggestion",
          title: "AI分析结果",
          description: "您在「编程学习」方面的进度良好，建议增加难度或拓展学习范围。",
          createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          relatedItemId: "goal-2",
          relatedItemType: "goal",
          status: "unread",
          priority: "medium",
        },
      ];
      
      setNotifications(mockNotifications);
    } catch (error) {
      console.error("Error loading notifications:", error);
      toast.error("加载通知失败");
    } finally {
      setLoading(false);
    }
  };

  // 标记通知为已读
  const markAsRead = async (id: string) => {
    try {
      // 模拟API调用
      // 实际实现中，这里应该调用后端API
      
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === id 
            ? { ...notification, status: "read" } 
            : notification
        )
      );
      
      toast.success("已标记为已读");
    } catch (error) {
      console.error("Error marking notification as read:", error);
      toast.error("操作失败");
    }
  };

  // 忽略通知
  const dismissNotification = async (id: string) => {
    try {
      // 模拟API调用
      // 实际实现中，这里应该调用后端API
      
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === id 
            ? { ...notification, status: "dismissed" } 
            : notification
        )
      );
      
      toast.success("已忽略通知");
    } catch (error) {
      console.error("Error dismissing notification:", error);
      toast.error("操作失败");
    }
  };

  // 处理通知
  const handleNotification = async (id: string, type: string) => {
    const notification = notifications.find(n => n.id === id);
    if (!notification) return;
    
    // 标记为已读
    await markAsRead(id);
    
    // 根据通知类型执行不同操作
    if (type === "view") {
      // 查看相关项目
      if (notification.relatedItemType === "task") {
        // 跳转到任务详情页
        window.location.href = `/do?tab=today`;
      } else if (notification.relatedItemType === "goal") {
        // 跳转到目标详情页
        window.location.href = `/plan?tab=goals`;
      }
    } else if (type === "update") {
      // 更新进度
      window.location.href = `/do?tab=progress`;
    }
  };

  // 过滤通知
  const filteredNotifications = () => {
    if (activeTab === "all") {
      return notifications.filter(n => n.status !== "dismissed");
    }
    
    return notifications.filter(
      n => n.type === activeTab && n.status !== "dismissed"
    );
  };

  // 获取通知图标
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "deadline":
        return <Clock className="h-5 w-5 text-orange-500" />;
      case "progress":
        return <BarChart2 className="h-5 w-5 text-blue-500" />;
      case "suggestion":
        return <Lightbulb className="h-5 w-5 text-yellow-500" />;
      default:
        return <Bell className="h-5 w-5" />;
    }
  };

  // 获取通知优先级样式
  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high":
        return <Badge variant="destructive">高优先级</Badge>;
      case "medium":
        return <Badge variant="default">中优先级</Badge>;
      case "low":
        return <Badge variant="outline">低优先级</Badge>;
      default:
        return null;
    }
  };

  // 初始加载
  useEffect(() => {
    if (userId) {
      loadNotifications();
    }
  }, [userId]);

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">
            <Bell className="h-4 w-4 mr-2" />
            全部
          </TabsTrigger>
          <TabsTrigger value="deadline">
            <Clock className="h-4 w-4 mr-2" />
            截止日期
          </TabsTrigger>
          <TabsTrigger value="progress">
            <BarChart2 className="h-4 w-4 mr-2" />
            进度提醒
          </TabsTrigger>
          <TabsTrigger value="suggestion">
            <Lightbulb className="h-4 w-4 mr-2" />
            AI建议
          </TabsTrigger>
        </TabsList>
      </Tabs>
      
      {loading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">加载中...</p>
        </div>
      ) : filteredNotifications().length === 0 ? (
        <div className="text-center py-12">
          <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground mb-4">暂无通知</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredNotifications().map((notification) => (
            <Card key={notification.id} className={`overflow-hidden ${notification.status === "read" ? "opacity-70" : ""}`}>
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className="mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h4 className="font-medium">{notification.title}</h4>
                      {getPriorityBadge(notification.priority)}
                    </div>
                    <p className="text-sm mt-1">{notification.description}</p>
                    <div className="flex items-center text-sm text-muted-foreground mt-2">
                      <Calendar className="h-3 w-3 mr-1" />
                      {formatDistanceToNow(notification.createdAt)}前
                      {notification.dueDate && (
                        <span className="ml-2">
                          <Clock className="h-3 w-3 inline mr-1" />
                          截止日期: {formatLocalDate(notification.dueDate)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="bg-muted/50 px-4 py-2">
                <div className="flex justify-end gap-2 w-full">
                  {notification.status === "unread" && (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => markAsRead(notification.id)}
                    >
                      <CheckCircle2 className="h-4 w-4 mr-1" />
                      标记已读
                    </Button>
                  )}
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => dismissNotification(notification.id)}
                  >
                    <XCircle className="h-4 w-4 mr-1" />
                    忽略
                  </Button>
                  {notification.type === "deadline" && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleNotification(notification.id, "view")}
                    >
                      <Target className="h-4 w-4 mr-1" />
                      查看任务
                    </Button>
                  )}
                  {notification.type === "progress" && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleNotification(notification.id, "update")}
                    >
                      <BarChart2 className="h-4 w-4 mr-1" />
                      更新进度
                    </Button>
                  )}
                  {notification.type === "suggestion" && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleNotification(notification.id, "view")}
                    >
                      <ArrowRight className="h-4 w-4 mr-1" />
                      查看详情
                    </Button>
                  )}
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
