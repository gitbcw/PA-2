"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from "recharts";
import { 
  Target, AlertCircle, Filter, ArrowUpRight, ArrowDownRight, 
  Minus, CheckCircle2, XCircle, Calendar
} from "lucide-react";
import { Goal } from "@prisma/client";

// 颜色常量
const COLORS = {
  primary: "#3b82f6",
  success: "#10b981",
  warning: "#f59e0b",
  danger: "#ef4444",
  neutral: "#6b7280",
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

interface GoalWithRelations extends Goal {
  tasks?: {
    id: string;
    title: string;
    status: string;
  }[];
}

export default function GoalEvaluation() {
  const { userId } = useAuth();
  const [loading, setLoading] = useState(true);
  const [goals, setGoals] = useState<GoalWithRelations[]>([]);
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);
  const [selectedGoal, setSelectedGoal] = useState<GoalWithRelations | null>(null);
  const [timeRange, setTimeRange] = useState("month"); // week, month, year
  const [goalStats, setGoalStats] = useState<any>(null);
  const [progressTrendData, setProgressTrendData] = useState<any[]>([]);
  const [goalCategoryData, setGoalCategoryData] = useState<any[]>([]);
  const [goalCompletionData, setGoalCompletionData] = useState<any[]>([]);

  // 加载目标数据
  const loadGoals = async () => {
    if (!userId) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/goals?userId=${userId}`);
      if (!response.ok) throw new Error("Failed to fetch goals");
      const goalsData = await response.json();
      
      setGoals(goalsData);
      
      // 如果有目标，默认选择第一个
      if (goalsData.length > 0 && !selectedGoalId) {
        setSelectedGoalId(goalsData[0].id);
        setSelectedGoal(goalsData[0]);
      } else if (selectedGoalId) {
        const goal = goalsData.find((g: GoalWithRelations) => g.id === selectedGoalId);
        setSelectedGoal(goal || null);
      }
    } catch (error) {
      console.error("Error loading goals:", error);
      toast.error("加载目标数据失败");
    } finally {
      setLoading(false);
    }
  };

  // 加载目标统计数据
  const loadGoalStats = async () => {
    if (!userId) return;

    try {
      setLoading(true);
      // 这里应该调用后端API获取目标统计数据
      // 目前使用模拟数据
      
      // 模拟目标进度趋势数据
      const mockProgressTrendData = [
        { date: "第1周", 进度: 10 },
        { date: "第2周", 进度: 25 },
        { date: "第3周", 进度: 40 },
        { date: "第4周", 进度: 55 },
        { date: "第5周", 进度: 70 },
        { date: "第6周", 进度: 85 },
        { date: "第7周", 进度: 90 },
      ];
      
      // 模拟目标类别数据
      const mockGoalCategoryData = [
        { subject: '工作', A: 80, fullMark: 100 },
        { subject: '学习', A: 65, fullMark: 100 },
        { subject: '健康', A: 45, fullMark: 100 },
        { subject: '家庭', A: 90, fullMark: 100 },
        { subject: '财务', A: 70, fullMark: 100 },
        { subject: '兴趣', A: 60, fullMark: 100 },
      ];
      
      // 模拟目标完成数据
      const mockGoalCompletionData = [
        { name: "已完成", value: 8 },
        { name: "进行中", value: 12 },
        { name: "未开始", value: 5 },
        { name: "已取消", value: 2 },
      ];
      
      // 模拟目标统计数据
      const mockGoalStats = {
        total: 27,
        completed: 8,
        inProgress: 12,
        notStarted: 5,
        cancelled: 2,
        completionRate: 29.6, // (8 / 27) * 100
        trend: "up", // up, down, neutral
        trendValue: 12.5, // 百分比变化
        avgProgress: 65.3, // 平均进度
      };
      
      setProgressTrendData(mockProgressTrendData);
      setGoalCategoryData(mockGoalCategoryData);
      setGoalCompletionData(mockGoalCompletionData);
      setGoalStats(mockGoalStats);
    } catch (error) {
      console.error("Error loading goal stats:", error);
      toast.error("加载目标统计数据失败");
    } finally {
      setLoading(false);
    }
  };

  // 处理目标选择变化
  const handleGoalChange = (goalId: string) => {
    setSelectedGoalId(goalId);
    const goal = goals.find(g => g.id === goalId);
    setSelectedGoal(goal || null);
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

  // 获取目标状态徽章
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">已完成</Badge>;
      case "ACTIVE":
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">进行中</Badge>;
      case "CANCELLED":
        return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">已取消</Badge>;
      case "ARCHIVED":
        return <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-200">已归档</Badge>;
      default:
        return null;
    }
  };

  // 获取目标级别徽章
  const getLevelBadge = (level: string) => {
    switch (level) {
      case "VISION":
        return <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-200">愿景</Badge>;
      case "YEARLY":
        return <Badge variant="outline" className="bg-indigo-100 text-indigo-800 border-indigo-200">年度</Badge>;
      case "QUARTERLY":
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">季度</Badge>;
      case "MONTHLY":
        return <Badge variant="outline" className="bg-cyan-100 text-cyan-800 border-cyan-200">月度</Badge>;
      case "WEEKLY":
        return <Badge variant="outline" className="bg-teal-100 text-teal-800 border-teal-200">周</Badge>;
      default:
        return null;
    }
  };

  // 初始加载
  useEffect(() => {
    if (userId) {
      loadGoals();
      loadGoalStats();
    }
  }, [userId, timeRange]);

  return (
    <div className="space-y-6">
      {/* 筛选器 */}
      <div className="flex justify-between">
        <div className="flex items-center gap-2">
          <Target className="h-4 w-4 text-muted-foreground" />
          <Select value={selectedGoalId || ""} onValueChange={handleGoalChange}>
            <SelectTrigger className="w-[250px]">
              <SelectValue placeholder="选择目标" />
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

      {/* 选中目标详情 */}
      {selectedGoal && (
        <Card>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <CardTitle className="text-lg">{selectedGoal.title}</CardTitle>
              <div className="flex gap-2">
                {getStatusBadge(selectedGoal.status)}
                {getLevelBadge(selectedGoal.level)}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {selectedGoal.description && (
                <p className="text-sm text-muted-foreground">{selectedGoal.description}</p>
              )}
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">进度: {selectedGoal.progress}%</span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(selectedGoal.startDate).toLocaleDateString()} - {new Date(selectedGoal.endDate).toLocaleDateString()}
                  </span>
                </div>
                <Progress value={selectedGoal.progress} className="h-2" />
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-1">
                  <p className="text-muted-foreground">优先级</p>
                  <p className="font-medium">{selectedGoal.priority}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-muted-foreground">权重</p>
                  <p className="font-medium">{selectedGoal.weight}</p>
                </div>
              </div>
              
              {/* 相关任务 */}
              {selectedGoal.tasks && selectedGoal.tasks.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">相关任务</p>
                  <div className="space-y-1">
                    {selectedGoal.tasks.map(task => (
                      <div key={task.id} className="flex justify-between items-center text-sm p-2 rounded-md hover:bg-muted">
                        <span>{task.title}</span>
                        {getStatusBadge(task.status)}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 目标完成情况卡片 */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">目标完成情况</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-4">
                <p className="text-muted-foreground">加载中...</p>
              </div>
            ) : goalStats ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">总目标数</p>
                    <p className="text-2xl font-bold">{goalStats.total}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">完成率</p>
                    <div className="flex items-center gap-1">
                      <p className="text-2xl font-bold">{goalStats.completionRate}%</p>
                      {getTrendIcon(goalStats.trend)}
                      <span className={`text-xs ${goalStats.trend === "up" ? "text-green-500" : goalStats.trend === "down" ? "text-red-500" : "text-gray-500"}`}>
                        {goalStats.trendValue}%
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-4 gap-2 text-center">
                  <div className="space-y-1">
                    <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">已完成</Badge>
                    <p className="font-bold">{goalStats.completed}</p>
                  </div>
                  <div className="space-y-1">
                    <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">进行中</Badge>
                    <p className="font-bold">{goalStats.inProgress}</p>
                  </div>
                  <div className="space-y-1">
                    <Badge variant="outline">未开始</Badge>
                    <p className="font-bold">{goalStats.notStarted}</p>
                  </div>
                  <div className="space-y-1">
                    <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">已取消</Badge>
                    <p className="font-bold">{goalStats.cancelled}</p>
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

        {/* 目标进度卡片 */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">目标进度</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-4">
                <p className="text-muted-foreground">加载中...</p>
              </div>
            ) : goalStats ? (
              <div className="space-y-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">平均进度</p>
                  <div className="flex items-center gap-2">
                    <Progress value={goalStats.avgProgress} className="flex-1 h-2" />
                    <span className="font-bold">{goalStats.avgProgress}%</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">进度最高目标</p>
                    <p className="font-medium">健康生活</p>
                    <div className="flex items-center gap-2">
                      <Progress value={90} className="flex-1 h-2" />
                      <span className="text-sm">90%</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">进度最低目标</p>
                    <p className="font-medium">学习新技能</p>
                    <div className="flex items-center gap-2">
                      <Progress value={25} className="flex-1 h-2" />
                      <span className="text-sm">25%</span>
                    </div>
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 目标进度趋势图 */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">目标进度趋势</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">加载中...</p>
              </div>
            ) : progressTrendData.length > 0 ? (
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={progressTrendData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Line type="monotone" dataKey="进度" stroke={COLORS.primary} activeDot={{ r: 8 }} />
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
        
        {/* 目标类别雷达图 */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">目标类别完成度</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">加载中...</p>
              </div>
            ) : goalCategoryData.length > 0 ? (
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={goalCategoryData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="subject" />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} />
                    <Radar name="完成度" dataKey="A" stroke={COLORS.primary} fill={COLORS.primary} fillOpacity={0.6} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                  </RadarChart>
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
    </div>
  );
}
