"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart2, Target, Zap, Calendar, Download } from "lucide-react";
import DataAnalysis from "@/components/check/DataAnalysis";
import GoalEvaluation from "@/components/check/GoalEvaluation";
import EfficiencyAnalysis from "@/components/check/EfficiencyAnalysis";

// 旧版检查页面，仅供参考
// export default CheckPageLegacy;
// 新页面请参考 docs/design-pdca.md 重新构建
import CheckSummaryCharts from "@/components/check/CheckSummaryCharts";
import GoalCheckCardList from "@/components/check/GoalCheckCardList";

export default function CheckPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">检查 (Check)</h1>
        <p className="text-muted-foreground mt-2">
          AI 分析执行数据，评估目标进展与风险
        </p>
      </div>
      {/* 统计图表区 */}
      <div className="mb-8">
        <CheckSummaryCharts />
      </div>
      {/* 目标评估卡片列表区 */}
      <GoalCheckCardList />
    </div>
  );
}

