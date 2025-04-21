"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from "recharts";
import { 
  CheckCircle2, XCircle, Clock, Calendar, AlertCircle, 
  ArrowUpRight, ArrowDownRight, Minus, Filter
} from "lucide-react";

// 颜色常量
const COLORS = {
  completed: "#10b981",
  inProgress: "#3b82f6",
  todo: "#6b7280",
  cancelled: "#ef4444",
  time: "#8b5cf6",
};

// 图表自定义工具提示
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background border rounded-md shadow-md p-2 text-sm">
        <p className="font-medium">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={`item-${index}`} style={{ color: entry.color }}>
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function DataAnalysis() {
  const { userId } = useAuth();
  const [loading, setLoading] = useState(true);
  const [taskStats, setTaskStats] = useState<any>(null);
  const [timeStats, setTimeStats] = useState<any>(null);
  const [timeRange, setTimeRange] = useState("week"); // week, month, year
  const [taskStatusData, setTaskStatusData] = useState<any[]>([]);
  const [taskTrendData, setTaskTrendData] = useState<any[]>([]);
  const [timeDistributionData, setTimeDistributionData] = useState<any[]>([]);
  const [timeUsageData, setTimeUsageData] = useState<any[]>([]);

  // 加载任务统计数据
  const loadTaskStats = async () => {
    if (!userId) return;

    try {
      setLoading(true);
      // 这里应该调用后端API获取任务统计数据
      // 目前使用模拟数据
      
      // 模拟任务状态分布数据
      const mockTaskStatusData = [
        { name: "已完成", value: 12, color: COLORS.completed },
        { name: "进行中", value: 5, color: COLORS.inProgress },
        { name: "待办", value: 8, color: COLORS.todo },
        { name: "已取消", value: 2, color: COLORS.cancelled },
      ];
      
      // 模拟任务趋势数据
      const mockTaskTrendData = [
        { date: "周一", 完成: 2, 新增: 3 },
        { date: "周二", 完成: 3, 新增: 2 },
        { date: "周三", 完成: 1, 新增: 4 },
        { date: "周四", 完成: 4, 新增: 1 },
        { date: "周五", 完成: 2, 新增: 2 },
        { date: "周六", 完成: 0, 新增: 1 },
        { date: "周日", 完成: 0, 新增: 0 },
      ];
      
      // 模拟任务统计数据
      const mockTaskStats = {
        total: 27,
        completed: 12,
        inProgress: 5,
        todo: 8,
        cancelled: 2,
        completionRate: 44.4, // (12 / 27) * 100
        trend: "up", // up, down, neutral
        trendValue: 15.2, // 百分比变化
      };
      
      setTaskStatusData(mockTaskStatusData);
      setTaskTrendData(mockTaskTrendData);
      setTaskStats(mockTaskStats);
    } catch (error) {
      console.error("Error loading task stats:", error);
      toast.error("加载任务统计数据失败");
    } finally {
      setLoading(false);
    }
  };

  // 加载时间统计数据
  const loadTimeStats = async () => {
    if (!userId) return;

    try {
      setLoading(true);
      // 这里应该调用后端API获取时间统计数据
      // 目前使用模拟数据
      
      // 模拟时间分布数据
      const mockTimeDistributionData = [
        { name: "项目A", value: 8.5, color: "#3b82f6" },
        { name: "项目B", value: 5.2, color: "#10b981" },
        { name: "项目C", value: 3.7, color: "#8b5cf6" },
        { name: "项目D", value: 2.1, color: "#f59e0b" },
        { name: "其他", value: 1.5, color: "#6b7280" },
      ];
      
      // 模拟时间使用数据
      const mockTimeUsageData = [
        { date: "周一", 时间: 3.5 },
        { date: "周二", 时间: 4.2 },
        { date: "周三", 时间: 2.8 },
        { date: "周四", 时间: 5.1 },
        { date: "周五", 时间: 3.9 },
        { date: "周六", 时间: 1.2 },
        { date: "周日", 时间: 0.3 },
      ];
      
      // 模拟时间统计数据
      const mockTimeStats = {
        totalHours: 21.0,
        avgDailyHours: 3.0,
        mostProductiveDay: "周四",
        mostProductiveHours: 5.1,
        trend: "up", // up, down, neutral
        trendValue: 8.5, // 百分比变化
      };
      
      setTimeDistributionData(mockTimeDistributionData);
      setTimeUsageData(mockTimeUsageData);
      setTimeStats(mockTimeStats);
    } catch (error) {
      console.error("Error loading time stats:", error);
      toast.error("加载时间统计数据失败");
    } finally {
      setLoading(false);
    }
  };

  // 获取趋势图标
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <ArrowUpRight className="h-4 w-4 text-green-500" />;
      case "down":
        return <ArrowDownRight className="h-4 w-4 text-red-500" />;
      default:
        return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  // 初始加载
  useEffect(() => {
    if (userId) {
      loadTaskStats();
      loadTimeStats();
    }
  }, [userId, timeRange]);

  return (
    <div className="space-y-6">
      {/* 筛选器 */}
      <div className="flex justify-end">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="选择时间范围" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">本周</SelectItem>
              <SelectItem value="month">本月</SelectItem>
              <SelectItem value="year">本年</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 任务统计卡片 */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">任务统计</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-4">
                <p className="text-muted-foreground">加载中...</p>
              </div>
            ) : taskStats ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">总任务数</p>
                    <p className="text-2xl font-bold">{taskStats.total}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">完成率</p>
                    <div className="flex items-center gap-1">
                      <p className="text-2xl font-bold">{taskStats.completionRate}%</p>
                      {getTrendIcon(taskStats.trend)}
                      <span className={`text-xs ${taskStats.trend === "up" ? "text-green-500" : taskStats.trend === "down" ? "text-red-500" : "text-gray-500"}`}>
                        {taskStats.trendValue}%
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-4 gap-2 text-center">
                  <div className="space-y-1">
                    <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">已完成</Badge>
                    <p className="font-bold">{taskStats.completed}</p>
                  </div>
                  <div className="space-y-1">
                    <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">进行中</Badge>
                    <p className="font-bold">{taskStats.inProgress}</p>
                  </div>
                  <div className="space-y-1">
                    <Badge variant="outline">待办</Badge>
                    <p className="font-bold">{taskStats.todo}</p>
                  </div>
                  <div className="space-y-1">
                    <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">已取消</Badge>
                    <p className="font-bold">{taskStats.cancelled}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <AlertCircle className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-muted-foreground">暂无数据</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 时间统计卡片 */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">时间统计</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-4">
                <p className="text-muted-foreground">加载中...</p>
              </div>
            ) : timeStats ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">总计时间</p>
                    <p className="text-2xl font-bold">{timeStats.totalHours}小时</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">日均时间</p>
                    <div className="flex items-center gap-1">
                      <p className="text-2xl font-bold">{timeStats.avgDailyHours}小时</p>
                      {getTrendIcon(timeStats.trend)}
                      <span className={`text-xs ${timeStats.trend === "up" ? "text-green-500" : timeStats.trend === "down" ? "text-red-500" : "text-gray-500"}`}>
                        {timeStats.trendValue}%
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">最高效日</p>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{timeStats.mostProductiveDay}</span>
                    <span className="text-muted-foreground">({timeStats.mostProductiveHours}小时)</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <AlertCircle className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-muted-foreground">暂无数据</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 图表区域 */}
      <Tabs defaultValue="tasks" className="space-y-4">
        <TabsList>
          <TabsTrigger value="tasks">任务分析</TabsTrigger>
          <TabsTrigger value="time">时间分析</TabsTrigger>
        </TabsList>
        
        <TabsContent value="tasks" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 任务状态分布图 */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">任务状态分布</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">加载中...</p>
                  </div>
                ) : taskStatusData.length > 0 ? (
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={taskStatusData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {taskStatusData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">暂无数据</p>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* 任务趋势图 */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">任务趋势</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">加载中...</p>
                  </div>
                ) : taskTrendData.length > 0 ? (
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={taskTrendData}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        <Line type="monotone" dataKey="完成" stroke={COLORS.completed} activeDot={{ r: 8 }} />
                        <Line type="monotone" dataKey="新增" stroke={COLORS.inProgress} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">暂无数据</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="time" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 时间分布图 */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">时间分布</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">加载中...</p>
                  </div>
                ) : timeDistributionData.length > 0 ? (
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={timeDistributionData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {timeDistributionData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">暂无数据</p>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* 时间使用趋势图 */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">时间使用趋势</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">加载中...</p>
                  </div>
                ) : timeUsageData.length > 0 ? (
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={timeUsageData}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        <Bar dataKey="时间" fill={COLORS.time} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">暂无数据</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
