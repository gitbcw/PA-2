"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { toast } from "sonner";

const OBJECTIVE_TYPES = [
  { value: "GOAL", label: "目标" },
  { value: "TASK", label: "任务" },
  { value: "SUBGOAL", label: "子目标" },
  { value: "SUBTASK", label: "子任务" },
];

const OBJECTIVE_STATUS = [
  { value: "ACTIVE", label: "进行中" },
  { value: "COMPLETED", label: "已完成" },
  { value: "ARCHIVED", label: "已归档" },
  { value: "TODO", label: "待办" },
  { value: "IN_PROGRESS", label: "进行中" },
  { value: "DONE", label: "已完成" },
];

export default function NewObjectivePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    type: "GOAL",
    status: "ACTIVE",
    startDate: "",
    endDate: "",
    priority: 1,
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/objectives", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        toast.success("目标创建成功");
        router.push("/plan");
      } else {
        toast.error("创建失败");
      }
    } catch {
      toast.error("网络错误");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container mx-auto py-8 max-w-lg">
      <Card>
        <CardHeader>
          <CardTitle>新建目标</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              name="title"
              placeholder="目标标题"
              value={form.title}
              onChange={handleChange}
              required
            />
            <Textarea
              name="description"
              placeholder="目标描述"
              value={form.description}
              onChange={handleChange}
            />
            <div className="flex gap-2">
              <Select
                value={form.type}
                onValueChange={(value) => setForm((f) => ({ ...f, type: value }))}
              >
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="类型" />
                </SelectTrigger>
                <SelectContent>
                  {OBJECTIVE_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={form.status}
                onValueChange={(value) => setForm((f) => ({ ...f, status: value }))}
              >
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="状态" />
                </SelectTrigger>
                <SelectContent>
                  {OBJECTIVE_STATUS.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Input
                name="startDate"
                type="date"
                value={form.startDate}
                onChange={handleChange}
                className="w-1/2"
              />
              <Input
                name="endDate"
                type="date"
                value={form.endDate}
                onChange={handleChange}
                className="w-1/2"
              />
            </div>
            <Input
              name="priority"
              type="number"
              min={1}
              max={10}
              value={form.priority}
              onChange={handleChange}
              className="w-24"
              placeholder="优先级"
            />
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "创建中..." : "创建目标"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
