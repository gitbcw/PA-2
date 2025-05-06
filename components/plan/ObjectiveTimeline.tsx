"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight, Calendar, Target } from "lucide-react";
import { Objective, ObjectiveType } from "./ObjectiveManager";

// 目标级别映射（如需扩展任务优先级可新增）
const objectiveLevelMap = {
  VISION: { label: "愿景", color: "bg-purple-100 text-purple-800 hover:bg-purple-100" },
  YEARLY: { label: "年度", color: "bg-blue-100 text-blue-800 hover:bg-blue-100" },
  QUARTERLY: { label: "季度", color: "bg-green-100 text-green-800 hover:bg-green-100" },
  MONTHLY: { label: "月度", color: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100" },
  WEEKLY: { label: "周", color: "bg-orange-100 text-orange-800 hover:bg-orange-100" },
  DAILY: { label: "日", color: "bg-red-100 text-red-800 hover:bg-red-100" },
};

export default function ObjectiveTimeline({ objectives: propObjectives, type = "GOAL" }: { objectives?: Objective[]; type?: ObjectiveType }) {
  const [objectives, setObjectives] = useState<Objective[]>(propObjectives || []);
  const [loading, setLoading] = useState(!propObjectives);
  const [timeRange, setTimeRange] = useState({
    start: new Date(),
    end: new Date(new Date().setMonth(new Date().getMonth() + 3)),
  });

  useEffect(() => {
    if (propObjectives) return;
    setLoading(true);
    fetch(`/api/objectives?type=${type}`)
      .then(res => res.json())
      .then(data => {
        setObjectives(data);
        setLoading(false);
      })
      .catch(() => {
        toast.error("加载失败");
        setLoading(false);
      });
  }, [type, propObjectives]);

  // 时间范围调整
  const adjustTimeRange = (months: number) => {
    const newStart = new Date(timeRange.start);
    const newEnd = new Date(timeRange.end);
    newStart.setMonth(newStart.getMonth() + months);
    newEnd.setMonth(newEnd.getMonth() + months);
    setTimeRange({ start: newStart, end: newEnd });
  };

  // 格式化日期
  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' });
  };

  // 检查是否在当前时间范围内
  const isObjectiveInTimeRange = (obj: Objective) => {
    const startDate = obj.startDate ? new Date(obj.startDate) : null;
    const endDate = obj.endDate ? new Date(obj.endDate) : null;
    return (
      (startDate && startDate >= timeRange.start && startDate <= timeRange.end) ||
      (endDate && endDate >= timeRange.start && endDate <= timeRange.end)
    );
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>目标时间线</CardTitle>
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" onClick={() => adjustTimeRange(-3)}><ChevronLeft /></Button>
          <Button variant="ghost" size="icon" onClick={() => adjustTimeRange(3)}><ChevronRight /></Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-16 w-full" />
        ) : (
          <div className="space-y-2">
            {objectives.filter(isObjectiveInTimeRange).length === 0 && (
              <div className="text-gray-400">当前时间范围内暂无{type === "GOAL" ? "目标" : "任务"}</div>
            )}
            {objectives.filter(isObjectiveInTimeRange).map(obj => (
              <div key={obj.id} className="flex items-center gap-4 p-2 border rounded">
                <Calendar className="w-4 h-4 text-gray-400" />
                <div className="flex-1">
                  <div className="font-semibold">{obj.title}</div>
                  <div className="text-xs text-gray-500">{formatDate(obj.startDate)} ~ {formatDate(obj.endDate)}</div>
                </div>
                {type === "GOAL" && obj.level && objectiveLevelMap[obj.level] && (
                  <Badge className={objectiveLevelMap[obj.level].color}>{objectiveLevelMap[obj.level].label}</Badge>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
