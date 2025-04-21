"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { ChevronLeft, ChevronRight, Calendar, Target } from "lucide-react";

// 目标级别映射
const goalLevelMap = {
  VISION: { label: "愿景", color: "bg-purple-100 text-purple-800 hover:bg-purple-100" },
  YEARLY: { label: "年度", color: "bg-blue-100 text-blue-800 hover:bg-blue-100" },
  QUARTERLY: { label: "季度", color: "bg-green-100 text-green-800 hover:bg-green-100" },
  MONTHLY: { label: "月度", color: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100" },
  WEEKLY: { label: "周", color: "bg-orange-100 text-orange-800 hover:bg-orange-100" },
};

export default function GoalTimeline() {
  const { data: session } = useSession();
  const userId = session?.user?.id;

  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState({
    start: new Date(),
    end: new Date(new Date().setMonth(new Date().getMonth() + 3)), // 默认显示3个月
  });

  // 加载目标数据
  useEffect(() => {
    if (userId) {
      loadGoals();
    }
  }, [userId]);

  const loadGoals = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/goals?userId=${userId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch goals");
      }
      const data = await response.json();
      setGoals(data);
    } catch (error) {
      console.error("Error loading goals:", error);
      toast.error("加载目标失败");
    } finally {
      setLoading(false);
    }
  };

  // 调整时间范围
  const adjustTimeRange = (months) => {
    const newStart = new Date(timeRange.start);
    const newEnd = new Date(timeRange.end);
    
    newStart.setMonth(newStart.getMonth() + months);
    newEnd.setMonth(newEnd.getMonth() + months);
    
    setTimeRange({ start: newStart, end: newEnd });
  };

  // 格式化日期
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' });
  };

  // 检查目标是否在当前时间范围内
  const isGoalInTimeRange = (goal) => {
    const startDate = new Date(goal.startDate);
    const endDate = new Date(goal.endDate);
    
    return (
      (startDate >= timeRange.start && startDate <= timeRange.end) ||
      (endDate >= timeRange.start && endDate <= timeRange.end) ||
      (startDate <= timeRange.start && endDate >= timeRange.end)
    );
  };

  // 过滤在时间范围内的目标
  const filteredGoals = goals.filter(isGoalInTimeRange);

  // 计算目标在时间轴上的位置和宽度
  const calculateTimelinePosition = (goal) => {
    const startDate = new Date(goal.startDate);
    const endDate = new Date(goal.endDate);
    
    const timeRangeSpan = timeRange.end.getTime() - timeRange.start.getTime();
    
    const startPosition = Math.max(
      0,
      (startDate.getTime() - timeRange.start.getTime()) / timeRangeSpan * 100
    );
    
    const endPosition = Math.min(
      100,
      (endDate.getTime() - timeRange.start.getTime()) / timeRangeSpan * 100
    );
    
    const width = endPosition - startPosition;
    
    return {
      left: `${startPosition}%`,
      width: `${width}%`,
    };
  };

  // 生成月份标记
  const generateMonthMarkers = () => {
    const markers = [];
    const currentDate = new Date(timeRange.start);
    
    while (currentDate <= timeRange.end) {
      const position = (currentDate.getTime() - timeRange.start.getTime()) / 
                      (timeRange.end.getTime() - timeRange.start.getTime()) * 100;
      
      markers.push({
        date: new Date(currentDate),
        position: `${position}%`,
      });
      
      currentDate.setMonth(currentDate.getMonth() + 1);
    }
    
    return markers;
  };

  const monthMarkers = generateMonthMarkers();

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">目标时间线</h2>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={() => adjustTimeRange(-3)}>
            <ChevronLeft className="h-4 w-4" />
            上一季度
          </Button>
          <Button variant="outline" size="sm" onClick={() => adjustTimeRange(3)}>
            下一季度
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={loadGoals}>
            刷新
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            {timeRange.start.toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit' })} 至 
            {timeRange.end.toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit' })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          ) : (
            <div className="space-y-6">
              {/* 月份标记 */}
              <div className="relative h-8 border-b border-gray-200">
                {monthMarkers.map((marker, index) => (
                  <div 
                    key={index} 
                    className="absolute transform -translate-x-1/2"
                    style={{ left: marker.position }}
                  >
                    <div className="h-2 w-0.5 bg-gray-300 mb-1 mx-auto"></div>
                    <span className="text-xs text-gray-500">
                      {marker.date.toLocaleDateString('zh-CN', { month: '2-digit' })}月
                    </span>
                  </div>
                ))}
              </div>
              
              {/* 目标时间线 */}
              <div className="space-y-4">
                {filteredGoals.length === 0 ? (
                  <div className="text-center py-8">
                    <Target className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-muted-foreground">该时间段内暂无目标</p>
                  </div>
                ) : (
                  filteredGoals.map((goal) => {
                    const position = calculateTimelinePosition(goal);
                    return (
                      <div key={goal.id} className="relative h-16 group">
                        <div 
                          className={`absolute top-0 h-12 rounded-md px-2 py-1 flex flex-col justify-center cursor-pointer hover:brightness-95 ${goalLevelMap[goal.level]?.color.split(' ')[0] || 'bg-gray-100'}`}
                          style={{ left: position.left, width: position.width }}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-sm truncate">{goal.title}</span>
                            <Badge className={`text-xs ${goalLevelMap[goal.level]?.color || 'bg-gray-100'}`}>
                              {goalLevelMap[goal.level]?.label || '目标'}
                            </Badge>
                          </div>
                          <div className="text-xs text-gray-600 mt-1">
                            {formatDate(goal.startDate)} - {formatDate(goal.endDate)}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
