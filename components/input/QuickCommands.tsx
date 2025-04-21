"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2, Save } from "lucide-react";

// 预设的快捷指令模板
const QUICK_COMMAND_TEMPLATES = [
  {
    id: "daily-journal",
    name: "每日日记",
    template: `# 今日日记 - ${new Date().toLocaleDateString()}

## 今日完成
- 

## 今日感想
- 

## 明日计划
- 
`,
  },
  {
    id: "meeting-notes",
    name: "会议笔记",
    template: `# 会议笔记

## 会议信息
- 日期：${new Date().toLocaleDateString()}
- 时间：${new Date().toLocaleTimeString()}
- 参与者：

## 讨论内容
- 

## 决定事项
- 

## 后续行动
- 
`,
  },
  {
    id: "book-notes",
    name: "读书笔记",
    template: `# 读书笔记

## 书籍信息
- 书名：
- 作者：
- 阅读日期：${new Date().toLocaleDateString()}

## 主要内容
- 

## 重要观点
- 

## 个人感想
- 
`,
  },
  {
    id: "project-idea",
    name: "项目创意",
    template: `# 项目创意

## 项目名称
- 

## 问题背景
- 

## 解决方案
- 

## 关键功能
- 

## 下一步行动
- 
`,
  },
];

export default function QuickCommands() {
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleTemplateSelect = (templateId: string) => {
    const template = QUICK_COMMAND_TEMPLATES.find((t) => t.id === templateId);
    if (template) {
      setSelectedTemplate(templateId);
      setContent(template.template);
    }
  };

  const handleSubmit = async () => {
    if (!content.trim()) {
      toast.error("内容不能为空");
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await fetch("/api/input/text", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: content.split("\n")[0].replace("# ", ""),
          content,
          tags: [selectedTemplate],
        }),
      });
      
      if (!response.ok) {
        throw new Error("保存失败");
      }
      
      toast.success("内容已保存");
      setContent("");
      setSelectedTemplate("");
    } catch (error) {
      console.error("保存失败:", error);
      toast.error("保存失败，请重试");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {QUICK_COMMAND_TEMPLATES.map((template) => (
          <Card 
            key={template.id}
            className={`cursor-pointer hover:border-primary transition-colors ${
              selectedTemplate === template.id ? "border-primary bg-primary/5" : ""
            }`}
            onClick={() => handleTemplateSelect(template.id)}
          >
            <CardContent className="p-4 text-center">
              <p className="font-medium">{template.name}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <Textarea
        placeholder="选择一个模板或直接输入内容..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="min-h-[300px] resize-y"
      />
      
      <Button onClick={handleSubmit} disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            保存中...
          </>
        ) : (
          <>
            <Save className="mr-2 h-4 w-4" />
            保存
          </>
        )}
      </Button>
    </div>
  );
}
