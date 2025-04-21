"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, BarChart2, PlusCircle } from "lucide-react";
import TodayTasks from "@/components/do/TodayTasks";
import TimeTracker from "@/components/do/TimeTracker";
import ProgressUpdater from "@/components/do/ProgressUpdater";

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
            今日任务
          </TabsTrigger>
          <TabsTrigger value="time">
            <Clock className="h-4 w-4 mr-2" />
            时间记录
          </TabsTrigger>
          <TabsTrigger value="progress">
            <BarChart2 className="h-4 w-4 mr-2" />
            进度更新
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="today">
          <Card>
            <CardHeader>
              <CardTitle>今日任务</CardTitle>
              <CardDescription>
                查看和管理今天需要完成的任务
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TodayTasks />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="time">
          <Card>
            <CardHeader>
              <CardTitle>时间记录</CardTitle>
              <CardDescription>
                跟踪任务执行时间，提高时间管理效率
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TimeTracker />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="progress">
          <Card>
            <CardHeader>
              <CardTitle>进度更新</CardTitle>
              <CardDescription>
                更新任务和目标的进度，记录执行过程中的反思
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ProgressUpdater />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
