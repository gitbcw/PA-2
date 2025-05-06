"use client";

import { useState, useEffect } from "react";
import { Objective } from "@prisma/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Plus, Target, Calendar, LoaderCircle, Trash2 } from "lucide-react";
import Link from "next/link";
import { formatDate } from "@/utils/date";
import { toast } from "sonner";

interface ObjectiveVisualizationProps {
  userId: string;
  extractedObjective: Partial<Objective> | null;
}

export function ObjectiveVisualization({
  userId,
  extractedObjective,
}: ObjectiveVisualizationProps) {
  const [objectives, setObjectives] = useState<Objective[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadObjectives() {
      try {
        const response = await fetch(`/api/objectives?userId=${userId}`);
        if (response.ok) {
          const data = await response.json();
          setObjectives(data);
        }
      } catch (error) {
        console.error("Failed to load objectives:", error);
      } finally {
        setLoading(false);
      }
    }
    loadObjectives();
  }, [userId]);

  const [highlightedObjectiveId, setHighlightedObjectiveId] = useState<string | null>(null);

  async function saveExtractedObjective() {
    if (!extractedObjective) return;
    try {
      const response = await fetch("/api/objectives", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...extractedObjective,
          userId,
          startDate: extractedObjective.startDate || new Date().toISOString(),
          endDate: extractedObjective.endDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        }),
      });
      if (response.ok) {
        const saved = await response.json();
        setObjectives((prev) => [saved, ...prev]);
        setHighlightedObjectiveId(saved.id);
        toast.success("Objective 已保存");
      } else {
        toast.error("保存 Objective 失败");
      }
    } catch (error) {
      toast.error("保存 Objective 失败");
    }
  }

  return (
    <Card className="mb-4">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Target className="w-5 h-5" />
          我的 Objective
        </CardTitle>
        {extractedObjective && (
          <Button size="sm" variant="outline" onClick={saveExtractedObjective}>
            <Plus className="w-4 h-4 mr-1" /> 保存提取 Objective
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <LoaderCircle className="animate-spin w-6 h-6 mr-2" /> 加载中...
          </div>
        ) : objectives.length === 0 ? (
          <div className="text-center text-gray-400">暂无 Objective</div>
        ) : (
          <div className="space-y-4">
            {objectives.map((obj) => (
              <div
                key={obj.id}
                className={`border rounded p-4 flex flex-col bg-white dark:bg-card ${highlightedObjectiveId === obj.id ? "border-primary bg-blue-50 dark:bg-blue-900/20" : "border-muted"}`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-lg">{obj.title}</span>
                  <Badge>{obj.type}</Badge>
                  <Badge variant="secondary">{obj.status}</Badge>
                </div>
                <div className="text-sm text-gray-700 mb-1">{obj.description}</div>
                <div className="flex gap-2 text-xs text-gray-500">
                  {obj.startDate && <span>开始: {formatDate(obj.startDate)}</span>}
                  {obj.endDate && <span>结束: {formatDate(obj.endDate)}</span>}
                </div>
                <div className="flex gap-2 mt-2">
                  <Button size="xs" variant="outline" asChild>
                    <Link href={`/plan/objective/${obj.id}`}><Edit className="w-4 h-4 mr-1" /> 编辑</Link>
                  </Button>
                  <Button size="xs" variant="destructive">
                    <Trash2 className="w-4 h-4 mr-1" /> 删除
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default ObjectiveVisualization;
