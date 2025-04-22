import { Objective, ObjectiveType } from "./ObjectiveManager";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

const levelOptions = [
  { value: "VISION", label: "愿景" },
  { value: "YEARLY", label: "年度" },
  { value: "QUARTERLY", label: "季度" },
  { value: "MONTHLY", label: "月度" },
  { value: "WEEKLY", label: "周" },
  { value: "DAILY", label: "日" },
];

interface ObjectiveFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  objective: Objective | null;
  type: ObjectiveType;
  onSuccess: () => void;
}

export default function ObjectiveFormDialog({ open, onOpenChange, objective, type, onSuccess }: ObjectiveFormDialogProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [level, setLevel] = useState<string>("MONTHLY");

  useEffect(() => {
    setTitle(objective?.title || "");
    setDescription(objective?.description || "");
    setLevel(objective?.level || "MONTHLY");
  }, [objective]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // TODO: 调用 create/updateObjective API，带上 level 字段（仅 type=GOAL 时）
    onSuccess();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{objective ? `编辑${type === "GOAL" ? "目标" : "任务"}` : `新建${type === "GOAL" ? "目标" : "任务"}`}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="标题" required />
          <Textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="描述" />
          {type === "GOAL" && (
            <div>
              <label className="block mb-1 text-sm font-medium">目标级别</label>
              <select value={level} onChange={e => setLevel(e.target.value)} className="w-full border rounded px-2 py-1">
                {levelOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          )}
          <DialogFooter>
            <Button type="submit">保存</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
