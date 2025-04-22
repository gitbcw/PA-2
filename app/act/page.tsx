"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Lightbulb, RefreshCw, Calendar, Save } from "lucide-react";
import AdviceCardList from "@/components/act/AdviceCardList";

export default function ActPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">行动 (Act)</h1>
        <p className="text-muted-foreground mt-2">
          AI 个性化建议，助力目标持续改进
        </p>
      </div>
      <Tabs defaultValue="goal" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="goal">目标建议</TabsTrigger>
          <TabsTrigger value="overall">整体方向</TabsTrigger>
          <TabsTrigger value="inspiration">灵感触发</TabsTrigger>
        </TabsList>
        <TabsContent value="goal">
          <AdviceCardList type="goal" />
        </TabsContent>
        <TabsContent value="overall">
          <AdviceCardList type="overall" />
        </TabsContent>
        <TabsContent value="inspiration">
          <AdviceCardList type="inspiration" />
        </TabsContent>
      </Tabs>
    </div>
  );
}
