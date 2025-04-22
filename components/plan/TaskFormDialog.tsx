import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import React from "react";

interface TaskFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formData: any;
  goals: any[];
  tasks: any[];
  selectedTask: any;
  onFormChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onSelectChange: (name: string, value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

export default function TaskFormDialog({
  open,
  onOpenChange,
  formData,
  goals,
  tasks,
  selectedTask,
  onFormChange,
  onSelectChange,
  onSubmit,
  onCancel
}: TaskFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{selectedTask ? "编辑任务" : "创建新任务"}</DialogTitle>
          <DialogDescription>
            {selectedTask ? "修改任务信息和状态" : "创建一个新的任务，设置优先级和截止日期"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">任务标题</Label>
              <Input id="title" name="title" value={formData.title} onChange={onFormChange} className="col-span-3" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">状态</Label>
              <Select value={formData.status} onValueChange={value => onSelectChange("status", value)}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="选择任务状态" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TODO">待办</SelectItem>
                  <SelectItem value="IN_PROGRESS">进行中</SelectItem>
                  <SelectItem value="COMPLETED">已完成</SelectItem>
                  <SelectItem value="CANCELLED">已取消</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="priority" className="text-right">优先级</Label>
              <Select value={formData.priority} onValueChange={value => onSelectChange("priority", value)}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="选择任务优先级" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LOW">低</SelectItem>
                  <SelectItem value="MEDIUM">中</SelectItem>
                  <SelectItem value="HIGH">高</SelectItem>
                  <SelectItem value="URGENT">紧急</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="dueDate" className="text-right">截止日期</Label>
              <Input id="dueDate" name="dueDate" type="date" value={formData.dueDate} onChange={onFormChange} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="goalId" className="text-right">关联目标</Label>
              <Select value={formData.goalId} onValueChange={value => onSelectChange("goalId", value)}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="选择关联目标" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">无关联目标</SelectItem>
                  {goals.map(goal => (
                    <SelectItem key={goal.id} value={goal.id}>{goal.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="parentId" className="text-right">父任务</Label>
              <Select value={formData.parentId} onValueChange={value => onSelectChange("parentId", value)}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="选择父任务" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">无父任务</SelectItem>
                  {tasks.filter(task => !selectedTask || task.id !== selectedTask.id).map(task => (
                    <SelectItem key={task.id} value={task.id}>{task.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="description" className="text-right pt-2">描述</Label>
              <Textarea id="description" name="description" value={formData.description} onChange={onFormChange} className="col-span-3" rows={3} />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onCancel}>取消</Button>
            <Button type="submit">{selectedTask ? "更新任务" : "创建任务"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
