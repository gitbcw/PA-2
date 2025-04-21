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
  LineChart, Line, PieChart, Pie, Cell, ScatterChart, Scatter, ZAxis
} from "recharts";
import { 
  Zap, AlertCircle, Filter, ArrowUpRight, ArrowDownRight, 
  Minus, Clock, Calendar, Target, LightbulbIcon
} from "lucide-react";

// 颜色常量
const COLORS = {
  primary: "#3b82f6",
  success: "#10b981",
  warning: "#f59e0b",
  danger: "#ef4444",
  neutral: "#6b7280",
  purple: "#8b5cf6",
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

export default function EfficiencyAnalysis() {
  const { userId } = useAuth();
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("month"); // week, month, year
  const [efficiencyStats, setEfficiencyStats] = useState<any>(null);
  const [timeUtilizationData, setTimeUtilizationData] = useState<any[]>([]);
  const [taskEfficiencyData, setTaskEfficiencyData] = useState<any[]>([]);
  const [productivityScoreData, setProductivityScoreData] = useState<any[]>([]);
  const [taskTimeScatterData, setTaskTimeScatterData] = useState<any[]>([]);
  const [improvementSuggestions, setImprovementSuggestions] = useState<string[]>([]);

  // 加载效率统计数据
  const loadEfficiencyStats = async () => {
    if (!userId) return;

    try {
      setLoading(true);
      // 这里应该调用后端API获取效率统计数据
      // 目前使用模拟数据
      
      // 模拟时间利用率数据
      const mockTimeUtilizationData = [
        { name: "高效工作", value: 45 },
        { name: "一般工作", value: 30 },
        { name: "低效工作", value: 15 },
        { name: "休息时间", value: 10 },
      ];
      
      // 模拟任务效率数据
      const mockTaskEfficiencyData = [
        { name: "项目A", 计划时间: 10, 实际时间: 8 },
        { name: "项目B", 计划时间: 8, 实际时间: 10 },
        { name: "项目C", 计划时间: 12, 实际时间: 15 },
        { name: "项目D", 计划时间: 6, 实际时间: 5 },
        { name: "项目E", 计划时间: 9, 实际时间: 9 },
      ];
      
      // 模拟生产力得分数据
      const mockProductivityScoreData = [
        { date: "周一", 得分: 75 },
        { date: "周二", 得分: 82 },
        { date: "周三", 得分: 68 },
        { date: "周四", 得分: 90 },
        { date: "周五", 得分: 85 },
        { date: "周六", 得分: 60 },
        { date: "周日", 得分: 50 },
      ];
      
      // 模拟任务时间散点图数据
      const mockTaskTimeScatterData = [
        { x: 2, y: 85, z: 100, name: "任务A" },
        { x: 5, y: 90, z: 150, name: "任务B" },
        { x: 8, y: 65, z: 200, name: "任务C" },
        { x: 3, y: 75, z: 120, name: "任务D" },
        { x: 6, y: 95, z: 180, name: "任务E" },
        { x: 4, y: 60, z: 130, name: "任务F" },
        { x: 7, y: 80, z: 190, name: "任务G" },
      ];
      
      // 模拟效率统计数据
      const mockEfficiencyStats = {
        avgProductivityScore: 72.9,
        timeUtilizationRate: 75.0,
        taskCompletionEfficiency: 92.5,
        mostEfficientDay: "周四",
        mostEfficientScore: 90,
        trend: "up", // up, down, neutral
        trendValue: 8.3, // 百分比变化
      };
      
      // 模拟改进建议
      const mockImprovementSuggestions = [
        "尝试使用番茄工作法提高专注度",
        "将复杂任务安排在精力最充沛的上午时段",
        "减少工作中的干扰和中断",
        "为重要任务设置明确的时间限制",
        "每完成一个重要任务后给自己适当的休息奖励"
      ];
      
      setTimeUtilizationData(mockTimeUtilizationData);
      setTaskEfficiencyData(mockTaskEfficiencyData);
      setProductivityScoreData(mockProductivityScoreData);
      setTaskTimeScatterData(mockTaskTimeScatterData);
      setEfficiencyStats(mockEfficiencyStats);
      setImprovementSuggestions(mockImprovementSuggestions);
    } catch (error) {
      console.error("Error loading efficiency stats:", error);
      toast.error("加载效率统计数据失败");
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
      loadEfficiencyStats();
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
        {/* 生产力得分卡片 */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">生产力得分</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-4">
                <p className="text-muted-foreground">加载中...</p>
              </div>
            ) : efficiencyStats ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">平均得分</p>
                    <div className="flex items-center gap-1">
                      <p className="text-2xl font-bold">{efficiencyStats.avgProductivityScore}</p>
                      {getTrendIcon(efficiencyStats.trend)}
                      <span className={`text-xs ${efficiencyStats.trend === "up" ? "text-green-500" : efficiencyStats.trend === "down" ? "text-red-500" : "text-gray-500"}`}>
                        {efficiencyStats.trendValue}%
                      </span>
                    </div>
                  </div>
                  
                  <div className="h-16 w-16 rounded-full border-4 border-primary flex items-center justify-center">
                    <span className="text-xl font-bold">{Math.round(efficiencyStats.avgProductivityScore)}</span>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-muted-foreground">得分等级</p>
                    <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">良好</Badge>
                  </div>
                  <Progress value={efficiencyStats.avgProductivityScore} className="h-2" />
                </div>
                
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">最高效日</p>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{efficiencyStats.mostEfficientDay}</span>
                    <span className="text-muted-foreground">({efficiencyStats.mostEfficientScore}分)</span>
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

        {/* 效率指标卡片 */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">效率指标</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-4">
                <p className="text-muted-foreground">加载中...</p>
              </div>
            ) : efficiencyStats ? (
              <div className="space-y-4">
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-muted-foreground">时间利用率</p>
                    <span className="font-medium">{efficiencyStats.timeUtilizationRate}%</span>
                  </div>
                  <Progress value={efficiencyStats.timeUtilizationRate} className="h-2" />
                </div>
                
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-muted-foreground">任务完成效率</p>
                    <span className="font-medium">{efficiencyStats.taskCompletionEfficiency}%</span>
                  </div>
                  <Progress value={efficiencyStats.taskCompletionEfficiency} className="h-2" />
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="space-y-1">
                    <p className="text-muted-foreground">平均任务完成时间</p>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <p className="font-medium">2.5小时</p>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-muted-foreground">平均每日完成任务</p>
                    <div className="flex items-center gap-1">
                      <Target className="h-4 w-4 text-muted-foreground" />
                      <p className="font-medium">3.2个</p>
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
        {/* 时间利用率饼图 */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">时间利用率分布</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">加载中...</p>
              </div>
            ) : timeUtilizationData.length > 0 ? (
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={timeUtilizationData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {timeUtilizationData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={[COLORS.success, COLORS.primary, COLORS.warning, COLORS.neutral][index % 4]} />
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
        
        {/* 生产力得分趋势图 */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">生产力得分趋势</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">加载中...</p>
              </div>
            ) : productivityScoreData.length > 0 ? (
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={productivityScoreData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Line type="monotone" dataKey="得分" stroke={COLORS.purple} activeDot={{ r: 8 }} />
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

      {/* 更多图表 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 任务效率对比图 */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">任务效率对比</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">加载中...</p>
              </div>
            ) : taskEfficiencyData.length > 0 ? (
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={taskEfficiencyData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar dataKey="计划时间" fill={COLORS.primary} />
                    <Bar dataKey="实际时间" fill={COLORS.warning} />
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
        
        {/* 任务时间与效率散点图 */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">任务时间与效率关系</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">加载中...</p>
              </div>
            ) : taskTimeScatterData.length > 0 ? (
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart
                    margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                  >
                    <CartesianGrid />
                    <XAxis type="number" dataKey="x" name="时长(小时)" />
                    <YAxis type="number" dataKey="y" name="效率得分" domain={[0, 100]} />
                    <ZAxis type="number" dataKey="z" range={[60, 400]} name="任务规模" />
                    <Tooltip cursor={{ strokeDasharray: '3 3' }} content={<CustomTooltip />} />
                    <Legend />
                    <Scatter name="任务" data={taskTimeScatterData} fill={COLORS.primary} />
                  </ScatterChart>
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

      {/* 改进建议 */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2">
            <LightbulbIcon className="h-5 w-5 text-yellow-500" />
            效率改进建议
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-4">
              <p className="text-muted-foreground">加载中...</p>
            </div>
          ) : improvementSuggestions.length > 0 ? (
            <ul className="space-y-2">
              {improvementSuggestions.map((suggestion, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-primary font-bold mt-0.5">•</span>
                  <span>{suggestion}</span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-4">
              <AlertCircle className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-muted-foreground">暂无建议</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
