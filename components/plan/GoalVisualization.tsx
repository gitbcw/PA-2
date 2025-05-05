"use client";

import { useState, useEffect } from "react";
import NewObjectiveDialog from "./NewObjectiveDialog";
import EditObjectiveDialog from "./EditObjectiveDialog";
import type { Objective } from "@prisma/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Plus, Target, Calendar, LoaderCircle, Trash2 } from "lucide-react";
import Link from "next/link";
import { formatDate } from "@/utils/date";
import { toast } from "sonner";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";

interface ObjectiveVisualizationProps {
  userId: string;
  extractedObjective: Partial<Objective> | null;
}

type NewObjectiveFormProps = {
  objectives: Objective[];
  onSuccess: (o: Objective) => void;
  userId: string;
  mode?: "create" | "edit";
  initialData?: Partial<Objective>;
  onClose?: () => void;
};

import NewObjectiveForm from "./NewObjectiveForm";
// NewObjectiveForm 由 NewObjectiveDialog/EditObjectiveDialog 单独引入，不再在本文件实现。
export {};


export function ObjectiveVisualization({
  userId,
  extractedObjective,
}: ObjectiveVisualizationProps) {
  const [objectives, setObjectives] = useState<Objective[]>([]);
  const [loading, setLoading] = useState(true);
  const [highlightedObjectiveId, setHighlightedObjectiveId] = useState<string | null>(null);
  // 编辑相关状态
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingObjective, setEditingObjective] = useState<Objective | null>(null);

  // 加载用户的所有目标
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

  // 保存提取的目标
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
        const newObjective = await response.json();
        setObjectives([newObjective, ...objectives]);
        setHighlightedObjectiveId(newObjective.id);
        toast.success("目标已保存");
        setTimeout(() => setHighlightedObjectiveId(null), 3000);
      } else {
        throw new Error("保存失败");
      }
    } catch (error) {
      toast.error("保存目标失败");
    }
  }

  // 删除目标
  async function deleteObjective(objectiveId: string) {
    if (!confirm("确定要删除这个目标吗？此操作无法撤销。")) {
      return;
    }
    try {
      const response = await fetch(`/api/objectives/${objectiveId}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setObjectives(objectives.filter(objective => objective.id !== objectiveId));
        toast.success("目标已删除");
      } else {
        throw new Error("删除目标失败");
      }
    } catch (error) {
      toast.error("删除目标失败");
    }
  }

  function getTypeBadge(type: string) {
    switch (type) {
      case "VISION":
        return <Badge variant="outline">愿景</Badge>;
      case "YEARLY":
        return <Badge variant="outline">年度</Badge>;
      case "QUARTERLY":
        return <Badge variant="outline">季度</Badge>;
      case "MONTHLY":
        return <Badge variant="outline">月度</Badge>;
      case "WEEKLY":
        return <Badge variant="outline">周</Badge>;
      default:
        return null;
    }
  }

  function getStatusBadge(status: string) {
    switch (status) {
      case "COMPLETED":
        return <Badge variant="default">已完成</Badge>;
      case "ACTIVE":
        return <Badge>进行中</Badge>;
      case "CANCELLED":
        return <Badge variant="destructive">已取消</Badge>;
      case "ARCHIVED":
        return <Badge variant="secondary">已归档</Badge>;
      default:
        return null;
    }
  }

  return (
    <>
      <div className="p-4 space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">目标视图</h2>
          <NewObjectiveDialog
            objectives={objectives}
            onSuccess={newObjective => {
              setObjectives([newObjective, ...objectives]);
              toast.success("目标已创建");
            }}
            userId={userId}
            trigger={
              <Button>
                <Plus className="h-4 w-4 mr-2" />新建目标
              </Button>
            }
          />
        </div>
        {/* 提取的目标预览 */}
        {extractedObjective && (
          <Card className="border-2 border-primary">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">
                  {extractedObjective.title || "新目标"}
                </CardTitle>
                {extractedObjective.level && getTypeBadge(extractedObjective.level)}
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                {extractedObjective.description || "无描述"}
              </p>
              <div className="flex justify-between items-center">
                <div className="flex items-center text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4 mr-1" />
                  {extractedObjective.startDate
                    ? formatDate(new Date(extractedObjective.startDate))
                    : "未设置"} -
                  {extractedObjective.endDate
                    ? formatDate(new Date(extractedObjective.endDate))
                    : "未设置"}
                </div>
                <Button onClick={saveExtractedObjective}>
                  保存目标
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
        {/* 目标列表 */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">我的目标</h3>
          {loading ? (
            <div className="flex justify-center p-4">
              <LoaderCircle className="h-6 w-6 animate-spin" />
            </div>
          ) : objectives.length === 0 ? (
            <div className="text-center p-8 border rounded-lg">
              <Target className="h-12 w-12 mx-auto text-muted-foreground" />
              <p className="mt-2 text-muted-foreground">
                你还没有创建任何目标
              </p>
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="mt-4">
                    <Plus className="h-4 w-4 mr-2" />创建第一个目标
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>新建目标</DialogTitle>
                  </DialogHeader>
                  <NewObjectiveForm objectives={objectives} onSuccess={(newObjective) => {
                    setObjectives([newObjective, ...objectives]);
                    toast.success("目标已创建");
                  }} userId={userId}>
                    <DialogFooter className="gap-2 px-6 pb-6">
                      <Button type="submit" variant="default" size="sm">创建目标</Button>
                      <Button type="button" variant="outline" size="sm" data-close="true">取消</Button>
                    </DialogFooter>
                  </NewObjectiveForm>
                </DialogContent>
              </Dialog>
            </div>
          ) : (
            <div className="grid gap-4 grid-cols-1">
              {objectives.map((goal) => (
                <Card
                  key={goal.id}
                  className={`${highlightedObjectiveId === goal.id
                      ? "border-2 border-primary animate-pulse"
                      : ""
                    }`}
                >
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{goal.title}</CardTitle>
                      <div className="flex space-x-2">
                        {getTypeBadge(goal.type)}
                        {getStatusBadge(goal.status)}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      {goal.description || "无描述"}
                    </p>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4 mr-1" />
                        {formatDate(goal.startDate)} - {formatDate(goal.endDate)}
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/objectives/${goal.id}`}>
                            查看
                          </Link>
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => {
                          setEditingObjective(goal);
                          setEditDialogOpen(true);
                        }}>
                          <Edit className="h-4 w-4 mr-1" /> 编辑
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => deleteObjective(goal.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-1" /> 删除
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
        {/* 编辑目标 Dialog */}
        <EditObjectiveDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          editingObjective={editingObjective}
          objectives={objectives}
          userId={userId}
          onSuccess={updated => {
            setObjectives(objs => objs.map(obj => obj.id === updated.id ? updated : obj));
            toast.success("目标已更新");
          }}
        />
      </div>
    </>
  );
}