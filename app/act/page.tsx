"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Lightbulb, RefreshCw, Calendar, Save } from "lucide-react";
import ProblemAnalysis from "@/components/act/ProblemAnalysis";
import ImprovementPlan from "@/components/act/ImprovementPlan";
import NewCyclePlanning from "@/components/act/NewCyclePlanning";

export default function ActPage() {
  const [activeTab, setActiveTab] = useState("problems");

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">改进 (Act)</h1>
          <p className="text-muted-foreground mt-1">
            分析问题，制定改进方案，规划新周期
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Calendar className="h-4 w-4 mr-2" />
            选择周期
          </Button>
          <Button>
            <Save className="h-4 w-4 mr-2" />
            保存方案
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="problems">
            <AlertTriangle className="h-4 w-4 mr-2" />
            问题分析
          </TabsTrigger>
          <TabsTrigger value="improvements">
            <Lightbulb className="h-4 w-4 mr-2" />
            改进方案
          </TabsTrigger>
          <TabsTrigger value="planning">
            <RefreshCw className="h-4 w-4 mr-2" />
            新周期规划
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="problems">
          <Card>
            <CardHeader>
              <CardTitle>问题分析</CardTitle>
              <CardDescription>
                识别和分析当前周期中的问题和挑战
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ProblemAnalysis />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="improvements">
          <Card>
            <CardHeader>
              <CardTitle>改进方案</CardTitle>
              <CardDescription>
                制定针对性的改进措施和行动计划
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ImprovementPlan />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="planning">
          <Card>
            <CardHeader>
              <CardTitle>新周期规划</CardTitle>
              <CardDescription>
                基于改进方案规划下一个PDCA周期
              </CardDescription>
            </CardHeader>
            <CardContent>
              <NewCyclePlanning />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
