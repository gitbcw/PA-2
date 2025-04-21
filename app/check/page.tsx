"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart2, Target, Zap, Calendar, Download } from "lucide-react";
import DataAnalysis from "@/components/check/DataAnalysis";
import GoalEvaluation from "@/components/check/GoalEvaluation";
import EfficiencyAnalysis from "@/components/check/EfficiencyAnalysis";

export default function CheckPage() {
  const [activeTab, setActiveTab] = useState("data");

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">检查 (Check)</h1>
          <p className="text-muted-foreground mt-1">
            分析数据，评估目标，检查效率
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Calendar className="h-4 w-4 mr-2" />
            选择时间范围
          </Button>
          <Button>
            <Download className="h-4 w-4 mr-2" />
            导出报告
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="data">
            <BarChart2 className="h-4 w-4 mr-2" />
            数据分析
          </TabsTrigger>
          <TabsTrigger value="goals">
            <Target className="h-4 w-4 mr-2" />
            目标评估
          </TabsTrigger>
          <TabsTrigger value="efficiency">
            <Zap className="h-4 w-4 mr-2" />
            效率分析
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="data">
          <Card>
            <CardHeader>
              <CardTitle>数据分析</CardTitle>
              <CardDescription>
                分析任务完成情况和时间使用情况
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataAnalysis />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="goals">
          <Card>
            <CardHeader>
              <CardTitle>目标评估</CardTitle>
              <CardDescription>
                评估目标完成度和进度趋势
              </CardDescription>
            </CardHeader>
            <CardContent>
              <GoalEvaluation />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="efficiency">
          <Card>
            <CardHeader>
              <CardTitle>效率分析</CardTitle>
              <CardDescription>
                分析时间利用率和任务完成效率
              </CardDescription>
            </CardHeader>
            <CardContent>
              <EfficiencyAnalysis />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
