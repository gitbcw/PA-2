"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { PlusCircle, Calendar, Clock, CheckCircle2, XCircle, Edit, Trash2 } from "lucide-react";
import ObjectiveList from "./ObjectiveList";
import ObjectiveFormDialog from "./ObjectiveFormDialog";

// Objective 类型定义示例
export type ObjectiveType = "GOAL" | "TASK";
export interface Objective {
  id: string;
  title: string;
  description?: string;
  type: ObjectiveType;
  status: string;
  priority: number;
  startDate?: string;
  endDate?: string;
  progress?: number;
  parentId?: string;
  userId: string;
  tags?: any[];
  createdAt: string;
  updatedAt: string;
  // 仅 type=GOAL 时有意义
  level?: "VISION" | "YEARLY" | "QUARTERLY" | "MONTHLY" | "WEEKLY" | "DAILY";
}

interface ObjectiveManagerProps {
  type: ObjectiveType;
}

export default function ObjectiveManager({ type }: ObjectiveManagerProps) {
  const { userId } = useAuth();
  const [objectives, setObjectives] = useState<Objective[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedObjective, setSelectedObjective] = useState<Objective | null>(null);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    setLoading(true);
    // TODO: 替换为统一的 fetchObjectives API
    fetch(`/api/objectives?type=${type}`)
      .then(res => res.json())
      .then(data => {
        setObjectives(data);
        setLoading(false);
      });
  }, [type]);

  // 新建/编辑/删除等逻辑（略）

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">{type === "GOAL" ? "目标管理" : "任务管理"}</h2>
        <Button onClick={() => setOpenDialog(true)} size="sm">
          <PlusCircle className="w-4 h-4 mr-1" /> 新建{type === "GOAL" ? "目标" : "任务"}
        </Button>
      </div>
      <ObjectiveList objectives={objectives} loading={loading} type={type} />
      <ObjectiveFormDialog
        open={openDialog}
        onOpenChange={setOpenDialog}
        objective={selectedObjective}
        type={type}
        onSuccess={() => {
          setOpenDialog(false);
          // TODO: 刷新列表
        }}
      />
    </div>
  );
}
