"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import TextInput from "@/components/input/TextInput";
import QuickCommands from "@/components/input/QuickCommands";
import WebScraper from "@/components/input/WebScraper";
import FileImport from "@/components/input/FileImport";

export default function InputPage() {
  const [activeTab, setActiveTab] = useState("text");

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">信息采集</h1>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>信息采集中心</CardTitle>
          <CardDescription>
            从多种来源收集信息，作为个人知识库的输入
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="text" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-4 mb-6">
              <TabsTrigger value="text">文本输入</TabsTrigger>
              <TabsTrigger value="quick">快捷指令</TabsTrigger>
              <TabsTrigger value="web">网页抓取</TabsTrigger>
              <TabsTrigger value="file">文件导入</TabsTrigger>
            </TabsList>
            
            <TabsContent value="text">
              <TextInput />
            </TabsContent>
            
            <TabsContent value="quick">
              <QuickCommands />
            </TabsContent>
            
            <TabsContent value="web">
              <WebScraper />
            </TabsContent>
            
            <TabsContent value="file">
              <FileImport />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
