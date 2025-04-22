"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  Lightbulb,
  BarChart2,
  CheckCircle2,
  XCircle,
  PlusCircle,
  ArrowRight,
  Sparkles,
  Brain,
} from "lucide-react";

interface AiAnalysisProps {
  itemType: "task" | "goal";
  itemId: string;
  itemTitle: string;
  progress: number;
  note: string;
}

interface AiSuggestion {
  id: string;
  type: "task" | "improvement" | "insight";
  content: string;
  confidence: "high" | "medium" | "low";
}

export default function AiAnalysis({ itemType, itemId, itemTitle, progress, note }: AiAnalysisProps) {
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [suggestions, setSuggestions] = useState<AiSuggestion[]>([]);
  const [showAnalysis, setShowAnalysis] = useState(false);

  // 分析进度更新
  const analyzeProgress = async () => {
    if (!itemId) return;

    try {
      setAnalyzing(true);
      setShowAnalysis(true);
      
      // 模拟AI分析过程
      // 实际实现中，这里应该调用后端API进行AI分析
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // 模拟AI分析结果
      const mockSuggestions: AiSuggestion[] = [
        {
          id: "1",
          type: "insight",
          content: `根据您的进度报告，您在「${itemTitle}」上的进展${progress < 30 ? "较慢" : progress < 70 ? "正常" : "良好"}。`,
          confidence: "high",
        },
        {
          id: "2",
          type: "improvement",
          content: progress < 50 
            ? `建议将「${itemTitle}」拆分为更小的子任务，以便更容易跟踪和完成。` 
            : `您的进度良好，继续保持当前的工作节奏。`,
          confidence: "medium",
        },
        {
          id: "3",
          type: "task",
          content: note.length > 0 
            ? `根据您的备注，建议创建一个新任务：「${note.substring(0, 30)}${note.length > 30 ? "..." : ""}」` 
            : `考虑添加一个后续任务来巩固当前的进展。`,
          confidence: "medium",
        },
      ];
      
      setSuggestions(mockSuggestions);
    } catch (error) {
      console.error("Error analyzing progress:", error);
      toast.error("分析失败");
    } finally {
      setAnalyzing(false);
    }
  };

  // 接受建议
  const acceptSuggestion = async (suggestion: AiSuggestion) => {
    try {
      setLoading(true);
      
      // 模拟API调用
      // 实际实现中，这里应该调用后端API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (suggestion.type === "task") {
        // 创建新任务
        toast.success("已创建新任务");
      } else {
        // 保存洞察或改进建议
        toast.success("已保存建议");
      }
      
      // 从列表中移除已接受的建议
      setSuggestions(prev => prev.filter(s => s.id !== suggestion.id));
    } catch (error) {
      console.error("Error accepting suggestion:", error);
      toast.error("操作失败");
    } finally {
      setLoading(false);
    }
  };

  // 忽略建议
  const dismissSuggestion = (id: string) => {
    setSuggestions(prev => prev.filter(s => s.id !== id));
    toast.success("已忽略建议");
  };

  // 获取建议类型图标
  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case "task":
        return <PlusCircle className="h-5 w-5 text-green-500" />;
      case "improvement":
        return <BarChart2 className="h-5 w-5 text-blue-500" />;
      case "insight":
        return <Lightbulb className="h-5 w-5 text-yellow-500" />;
      default:
        return <Lightbulb className="h-5 w-5" />;
    }
  };

  // 获取建议置信度样式
  const getConfidenceBadge = (confidence: string) => {
    switch (confidence) {
      case "high":
        return <Badge variant="default">高置信度</Badge>;
      case "medium":
        return <Badge variant="secondary">中置信度</Badge>;
      case "low":
        return <Badge variant="outline">低置信度</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4 mt-6">
      {!showAnalysis ? (
        <Button 
          variant="outline" 
          className="w-full" 
          onClick={analyzeProgress}
        >
          <Sparkles className="h-4 w-4 mr-2" />
          AI分析进度
        </Button>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium flex items-center">
              <Brain className="h-5 w-5 mr-2 text-purple-500" />
              AI分析结果
            </h3>
            {suggestions.length === 0 && !analyzing && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowAnalysis(false)}
              >
                <XCircle className="h-4 w-4 mr-1" />
                关闭
              </Button>
            )}
          </div>
          
          {analyzing ? (
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col items-center justify-center py-4">
                  <Skeleton className="h-12 w-12 rounded-full mb-4" />
                  <Skeleton className="h-4 w-48 mb-2" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </CardContent>
            </Card>
          ) : suggestions.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground">分析完成，暂无建议</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {suggestions.map((suggestion) => (
                <Card key={suggestion.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="mt-1">
                        {getSuggestionIcon(suggestion.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <h4 className="font-medium">
                            {suggestion.type === "task" ? "建议任务" : 
                             suggestion.type === "improvement" ? "改进建议" : "洞察"}
                          </h4>
                          {getConfidenceBadge(suggestion.confidence)}
                        </div>
                        <p className="text-sm mt-1">{suggestion.content}</p>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="bg-muted/50 px-4 py-2">
                    <div className="flex justify-end gap-2 w-full">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => dismissSuggestion(suggestion.id)}
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        忽略
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => acceptSuggestion(suggestion)}
                        disabled={loading}
                      >
                        {suggestion.type === "task" ? (
                          <>
                            <PlusCircle className="h-4 w-4 mr-1" />
                            创建任务
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="h-4 w-4 mr-1" />
                            接受建议
                          </>
                        )}
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
