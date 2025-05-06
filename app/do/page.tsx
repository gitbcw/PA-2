"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, BarChart2, PlusCircle, Bell } from "lucide-react";
import TodayGoals from "@/components/do/TodayTasks";
import GoalRecordDemoBlock from "@/components/do/GoalRecordDemoBlock";
import TimeTracker from "@/components/do/TimeTracker";
import Notifications from "@/components/do/Notifications";

export default function DoPage() {
  const [activeTab, setActiveTab] = useState("today");

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">执行 (Do)</h1>
          <p className="text-muted-foreground mt-1">
            执行计划，跟踪进度，记录时间
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Calendar className="h-4 w-4 mr-2" />
            日历视图
          </Button>
          <Button>
            <PlusCircle className="h-4 w-4 mr-2" />
            快速添加
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="today">
            <Calendar className="h-4 w-4 mr-2" />
            今日目标
          </TabsTrigger>
          <TabsTrigger value="records">
            <Clock className="h-4 w-4 mr-2" />
            任务记录
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="h-4 w-4 mr-2" />
            提醒中心
          </TabsTrigger>
        </TabsList>

        <TabsContent value="today">
          <Card>
            <CardHeader>
              <CardTitle>今日目标</CardTitle>
              <CardDescription>
                查看和管理今天需要完成的目标
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TodayGoals />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="records">
          <Card>
            <CardHeader>
              <CardTitle>任务记录</CardTitle>
              <CardDescription>
                极简执行记录，支持多条自由文本输入与逾期高亮
              </CardDescription>
            </CardHeader>
            <CardContent>
              <GoalRecordDemoBlock />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>提醒中心</CardTitle>
              <CardDescription>
                查看任务期限提醒、进度更新建议和AI分析结果
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Notifications />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
