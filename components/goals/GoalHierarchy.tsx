"use client";

import { useState, useEffect } from "react";
import { Goal } from "@prisma/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronRight, Target, LoaderCircle } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface GoalWithRelations extends Goal {
  subGoals?: GoalWithRelations[];
}

interface GoalHierarchyProps {
  goalId: string;
  userId: string;
}

export function GoalHierarchy({ goalId, userId }: GoalHierarchyProps) {
  const [loading, setLoading] = useState(true);
  const [hierarchyData, setHierarchyData] = useState<GoalWithRelations | null>(null);
  const [expandedGoals, setExpandedGoals] = useState<Set<string>>(new Set([goalId]));

  // 加载目标层次结构数据
  useEffect(() => {
    async function loadHierarchyData() {
      try {
        setLoading(true);

        // 使用专门的API端点获取目标层次结构
        const response = await fetch(`/api/goals/hierarchy?userId=${userId}&goalId=${goalId}`);
        if (!response.ok) throw new Error("Failed to fetch goal hierarchy");
        const hierarchyData = await response.json();

        // 将API返回的层次结构转换为组件需要的格式
        const formattedData = formatHierarchyData(hierarchyData);
        setHierarchyData(formattedData);
      } catch (error) {
        console.error("Error loading goal hierarchy:", error);
      } finally {
        setLoading(false);
      }
    }

    if (goalId && userId) {
      loadHierarchyData();
    }
  }, [goalId, userId]);

  // 将API返回的层次结构转换为组件需要的格式
  function formatHierarchyData(apiData: any): GoalWithRelations {
    // 递归将children字段转换为subGoals字段
    const convertChildrenToSubGoals = (node: any): GoalWithRelations => {
      const { children, ...rest } = node;
      return {
        ...rest,
        subGoals: children ? children.map(convertChildrenToSubGoals) : []
      };
    };

    return convertChildrenToSubGoals(apiData);
  }

  // 切换目标展开/折叠状态
  function toggleExpand(goalId: string) {
    setExpandedGoals(prev => {
      const newSet = new Set(prev);
      if (newSet.has(goalId)) {
        newSet.delete(goalId);
      } else {
        newSet.add(goalId);
      }
      return newSet;
    });
  }

  // 获取目标级别徽章
  function getLevelBadge(level: string) {
    switch (level) {
      case "VISION":
        return <Badge variant="outline">愿景</Badge>;
      case "YEARLY":
        return <Badge variant="outline">年度</Badge>;
      case "QUARTERLY":
        return <Badge variant="outline">季度</Badge>;
      case "MONTHLY":
        return <Badge variant="outline">月度</Badge>;
      case "WEEKLY":
        return <Badge variant="outline">周</Badge>;
      default:
        return null;
    }
  }

  // 获取目标状态徽章
  function getStatusBadge(status: string) {
    switch (status) {
      case "COMPLETED":
        return <Badge variant="success">已完成</Badge>;
      case "ACTIVE":
        return <Badge>进行中</Badge>;
      case "CANCELLED":
        return <Badge variant="destructive">已取消</Badge>;
      case "ARCHIVED":
        return <Badge variant="secondary">已归档</Badge>;
      default:
        return null;
    }
  }

  // 渲染目标节点
  function renderGoalNode(goal: GoalWithRelations, depth: number = 0, isCurrentGoal: boolean = false) {
    const hasChildren = goal.subGoals && goal.subGoals.length > 0;
    const isExpanded = expandedGoals.has(goal.id);

    return (
      <div key={goal.id} className="mb-1">
        <div
          className={cn(
            "flex items-center py-2 px-2 rounded-md",
            isCurrentGoal ? "bg-accent" : "hover:bg-accent/50",
            { "ml-4": depth > 0 }
          )}
        >
          <div className="mr-2 flex-shrink-0">
            {hasChildren ? (
              <button
                onClick={() => toggleExpand(goal.id)}
                className="p-1 rounded-full hover:bg-muted"
              >
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </button>
            ) : (
              <span className="w-6 h-6 flex items-center justify-center">
                <Target className="h-4 w-4" />
              </span>
            )}
          </div>

          <div className="flex-grow">
            <Link
              href={`/goals/${goal.id}`}
              className={cn(
                "text-sm font-medium hover:underline",
                isCurrentGoal ? "font-bold" : ""
              )}
            >
              {goal.title}
            </Link>
          </div>

          <div className="flex items-center gap-2 ml-2">
            {getLevelBadge(goal.level)}
            {getStatusBadge(goal.status)}
          </div>
        </div>

        {hasChildren && isExpanded && (
          <div className="pl-4 border-l border-border ml-3 mt-1">
            {goal.subGoals!.map(subGoal =>
              renderGoalNode(subGoal, depth + 1, subGoal.id === goalId)
            )}
          </div>
        )}
      </div>
    );
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">目标层次结构</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center py-6">
          <LoaderCircle className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  if (!hierarchyData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">目标层次结构</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center">无法加载目标层次结构</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">目标层次结构</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-auto max-h-[400px]">
          {renderGoalNode(hierarchyData, 0, true)}
        </div>
      </CardContent>
    </Card>
  );
}
