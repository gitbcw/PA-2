import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";

interface GoalFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  formData: any;
  setFormData: (data: any) => void;
  availableParentGoals: any[];
  smartCheckResult: string;
  handleSmartCheck: (title: string, desc: string) => void;
  isEdit: boolean;
  goalLevelMap: any;
}

const GoalFormDialog: React.FC<GoalFormDialogProps> = ({
  open,
  onClose,
  onSubmit,
  formData,
  setFormData,
  availableParentGoals,
  smartCheckResult,
  handleSmartCheck,
  isEdit,
  goalLevelMap,
}) => {
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  const handleSelectChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };
  const handleProgressChange = (value: number[]) => {
    setFormData({ ...formData, progress: value[0] / 100 });
  };
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? "编辑目标" : "创建新目标"}</DialogTitle>
          <DialogDescription>
            {isEdit ? "修改目标信息和进度" : "设定一个明确、可衡量、有时限的目标"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit}>
          <div className="flex justify-end mb-2">
            <Button type="button" variant="ghost" size="sm" onClick={() => handleSmartCheck(formData.title, formData.description)}>
              SMART 原则校验
            </Button>
            {smartCheckResult && (
              <div className="ml-2 text-xs text-blue-600 max-w-xs truncate" title={smartCheckResult}>{smartCheckResult}</div>
            )}
          </div>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">目标标题</Label>
              <Input id="title" name="title" value={formData.title} onChange={handleFormChange} className="col-span-3" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="level" className="text-right">目标级别</Label>
              <Select value={formData.level} onValueChange={(value) => handleSelectChange("level", value)}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="选择目标级别" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="VISION">愿景</SelectItem>
                  <SelectItem value="YEARLY">年度目标</SelectItem>
                  <SelectItem value="QUARTERLY">季度目标</SelectItem>
                  <SelectItem value="MONTHLY">月度目标</SelectItem>
                  <SelectItem value="WEEKLY">周目标</SelectItem>
                  <SelectItem value="DAILY">日目标</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="startDate" className="text-right">开始日期</Label>
              <Input id="startDate" name="startDate" type="date" value={formData.startDate} onChange={handleFormChange} className="col-span-3" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="endDate" className="text-right">结束日期</Label>
              <Input id="endDate" name="endDate" type="date" value={formData.endDate} onChange={handleFormChange} className="col-span-3" required />
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="description" className="text-right pt-2">描述</Label>
              <Textarea id="description" name="description" value={formData.description} onChange={handleFormChange} className="col-span-3" rows={3} />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="parentId" className="text-right">父目标</Label>
              <Select value={formData.parentId || "none"} onValueChange={(value) => handleSelectChange("parentId", value === "none" ? "" : value)}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="选择父目标" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">无父目标</SelectItem>
                  {availableParentGoals.map((goal) => (
                    <SelectItem key={goal.id} value={goal.id}>
                      {goal.title} ({goalLevelMap[goal.level]?.label || goal.level})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">完成进度</Label>
              <div className="col-span-3 space-y-2">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>0%</span>
                  <span>{Math.round(formData.progress * 100)}%</span>
                  <span>100%</span>
                </div>
                <Slider value={[Math.round(formData.progress * 100)]} max={100} step={1} onValueChange={handleProgressChange} className="w-full" />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>取消</Button>
            <Button type="submit">{isEdit ? "更新目标" : "创建目标"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default GoalFormDialog;
