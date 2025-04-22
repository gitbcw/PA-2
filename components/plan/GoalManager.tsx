"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import {
  PlusCircle,
  Calendar,
  Target,
  CheckCircle2,
  XCircle,
  Clock,
  Edit,
  Trash2,
  ChevronRight,
  BarChart2
} from "lucide-react";

// 目标级别映射
const goalLevelMap = {
  VISION: { label: "愿景", color: "bg-purple-100 text-purple-800" },
  YEARLY: { label: "年度", color: "bg-blue-100 text-blue-800" },
  QUARTERLY: { label: "季度", color: "bg-cyan-100 text-cyan-800" },
  MONTHLY: { label: "月度", color: "bg-green-100 text-green-800" },
  WEEKLY: { label: "周", color: "bg-yellow-100 text-yellow-800" },
  DAILY: { label: "日", color: "bg-orange-100 text-orange-800" }
};

// 目标状态映射
const goalStatusMap = {
  ACTIVE: { label: "进行中", color: "bg-blue-100 text-blue-800" },
  COMPLETED: { label: "已完成", color: "bg-green-100 text-green-800" },
  CANCELLED: { label: "已取消", color: "bg-red-100 text-red-800" },
  ARCHIVED: { label: "已归档", color: "bg-gray-100 text-gray-800" }
};

export default function GoalManager() {
  const { userId } = useAuth();
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [filter, setFilter] = useState("all");

  // 表单状态
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    level: "MONTHLY",
    startDate: "",
    endDate: "",
    parentId: "",
    metrics: [],
    resources: [],
    progress: 0 // 添加进度字段
  });

  // 可用的父目标
  const [availableParentGoals, setAvailableParentGoals] = useState([]);

  // 加载目标
  const loadGoals = async () => {
    if (!userId) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/goals?userId=${userId}`);
      if (!response.ok) throw new Error("Failed to fetch goals");
      const data = await response.json();

      // 处理每个目标的 metrics 和 resources
      const processedGoals = data.map(goal => {
        let parsedMetrics = [];
        let parsedResources = [];

        try {
          if (goal.metrics) {
            parsedMetrics = typeof goal.metrics === 'string'
              ? JSON.parse(goal.metrics)
              : goal.metrics;
          }
        } catch (error) {
          console.error(`Error parsing metrics for goal ${goal.id}:`, error);
        }

        try {
          if (goal.resources) {
            parsedResources = typeof goal.resources === 'string'
              ? JSON.parse(goal.resources)
              : goal.resources;
          }
        } catch (error) {
          console.error(`Error parsing resources for goal ${goal.id}:`, error);
        }

        return {
          ...goal,
          metrics: parsedMetrics,
          resources: parsedResources
        };
      });

      setGoals(processedGoals);
    } catch (error) {
      console.error("Error loading goals:", error);
      toast.error("加载目标失败");
    } finally {
      setLoading(false);
    }
  };

  // 创建目标
  const createGoal = async (e) => {
    e.preventDefault();
    try {
      // 准备创建数据，确保 metrics 和 resources 是数组
      const createData = {
        ...formData,
        userId: userId, // 使用当前用户ID
        metrics: Array.isArray(formData.metrics) && formData.metrics.length > 0 ? formData.metrics : [],
        resources: Array.isArray(formData.resources) && formData.resources.length > 0 ? formData.resources : []
      };

      const response = await fetch("/api/goals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(createData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create goal");
      }

      const newGoal = await response.json();
      setGoals([newGoal, ...goals]);
      resetForm();
      setOpenDialog(false);
      toast.success("目标创建成功");
    } catch (error) {
      console.error("Error creating goal:", error);
      toast.error(error.message || "创建目标失败");
    }
  };

  // 更新目标
  const updateGoal = async (e) => {
    e.preventDefault();
    try {
      // 准备更新数据，确保 metrics 和 resources 是数组
      const updateData = {
        ...formData,
        metrics: Array.isArray(formData.metrics) ? formData.metrics : [],
        resources: Array.isArray(formData.resources) ? formData.resources : []
      };

      const response = await fetch(`/api/goals/${selectedGoal.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Update goal error data:", errorData);

        // 格式化错误消息
        let errorMessage = "Failed to update goal";
        if (errorData.error) {
          if (Array.isArray(errorData.error)) {
            errorMessage = errorData.error.map(err => `${err.path}: ${err.message}`).join(', ');
          } else if (typeof errorData.error === 'object') {
            errorMessage = JSON.stringify(errorData.error);
          } else {
            errorMessage = errorData.error;
          }
        }

        throw new Error(errorMessage);
      }

      const updatedGoal = await response.json();
      setGoals(goals.map(goal => goal.id === updatedGoal.id ? updatedGoal : goal));
      resetForm();
      setOpenDialog(false);
      toast.success("目标更新成功");
    } catch (error) {
      console.error("Error updating goal:", error);
      toast.error(error.message || "更新目标失败");
    }
  };

  // 删除目标
  const deleteGoal = async (id) => {
    if (!confirm("确定要删除这个目标吗？")) return;

    try {
      const response = await fetch(`/api/goals/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete goal");
      }

      setGoals(goals.filter(goal => goal.id !== id));
      toast.success("目标删除成功");
    } catch (error) {
      console.error("Error deleting goal:", error);
      toast.error(error.message || "删除目标失败");
    }
  };

  // 重置表单
  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      level: "MONTHLY",
      startDate: "",
      endDate: "",
      parentId: "",
      metrics: [],
      resources: [],
      progress: 0
    });
    setSelectedGoal(null);
  };

  // 打开编辑对话框
  const openEditDialog = (goal) => {
    setSelectedGoal(goal);

    // 加载可用的父目标（排除当前目标及其子目标）
    const filteredParentGoals = goals.filter(g =>
      g.id !== goal.id &&
      (!g.parentId || g.parentId !== goal.id)
    );
    setAvailableParentGoals(filteredParentGoals);

    // 解析 metrics 和 resources
    let parsedMetrics = [];
    let parsedResources = [];

    try {
      if (goal.metrics) {
        parsedMetrics = typeof goal.metrics === 'string'
          ? JSON.parse(goal.metrics)
          : goal.metrics;
      }
    } catch (error) {
      console.error('Error parsing metrics:', error);
    }

    try {
      if (goal.resources) {
        parsedResources = typeof goal.resources === 'string'
          ? JSON.parse(goal.resources)
          : goal.resources;
      }
    } catch (error) {
      console.error('Error parsing resources:', error);
    }

    setFormData({
      title: goal.title,
      description: goal.description || "",
      level: goal.level,
      startDate: new Date(goal.startDate).toISOString().split('T')[0],
      endDate: new Date(goal.endDate).toISOString().split('T')[0],
      parentId: goal.parentId || "",
      metrics: parsedMetrics,
      resources: parsedResources,
      progress: goal.progress || 0
    });
    setOpenDialog(true);
  };

  // 打开新建对话框
  const openCreateDialog = () => {
    resetForm();
    // 设置默认开始日期为今天，结束日期根据默认级别设置
    const today = new Date();
    const defaultEndDate = new Date();

    // 默认为月度目标，设置结束日期为30天后
    defaultEndDate.setDate(today.getDate() + 30);

    // 设置可用的父目标
    setAvailableParentGoals(goals);

    setFormData({
      ...formData,
      level: "MONTHLY", // 默认为月度目标
      startDate: today.toISOString().split('T')[0],
      endDate: defaultEndDate.toISOString().split('T')[0],
      progress: 0
    });

    setOpenDialog(true);
  };

  // 处理表单变化
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // 处理选择变化
  const handleSelectChange = (name, value) => {
    // 如果是目标级别变化，自动调整结束日期
    if (name === "level") {
      const startDate = formData.startDate ? new Date(formData.startDate) : new Date();
      const endDate = new Date(startDate);

      // 根据目标级别调整结束日期
      switch (value) {
        case "VISION":
          endDate.setFullYear(endDate.getFullYear() + 5); // 愿景目标默讥为5年
          break;
        case "YEARLY":
          endDate.setFullYear(endDate.getFullYear() + 1); // 年度目标为1年
          break;
        case "QUARTERLY":
          endDate.setMonth(endDate.getMonth() + 3); // 季度目标为3个月
          break;
        case "MONTHLY":
          endDate.setMonth(endDate.getMonth() + 1); // 月度目标为1个月
          break;
        case "WEEKLY":
          endDate.setDate(endDate.getDate() + 7); // 周目标为7天
          break;
        case "DAILY":
          endDate.setDate(endDate.getDate() + 1); // 日目标为1天
          break;
        default:
          endDate.setMonth(endDate.getMonth() + 1); // 默认为1个月
      }

      setFormData({
        ...formData,
        [name]: value,
        endDate: endDate.toISOString().split('T')[0]
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  // 处理进度条变化
  const handleProgressChange = (value) => {
    setFormData({
      ...formData,
      progress: value[0] / 100
    });
  };

  // 过滤目标
  const filteredGoals = () => {
    if (filter === "all") return goals;
    return goals.filter(goal => goal.level === filter);
  };

  // 初始加载
  useEffect(() => {
    if (userId) {
      loadGoals();
    }
  }, [userId]);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="筛选目标" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">所有目标</SelectItem>
              <SelectItem value="VISION">愿景</SelectItem>
              <SelectItem value="YEARLY">年度目标</SelectItem>
              <SelectItem value="QUARTERLY">季度目标</SelectItem>
              <SelectItem value="MONTHLY">月度目标</SelectItem>
              <SelectItem value="WEEKLY">周目标</SelectItem>
              <SelectItem value="DAILY">日目标</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={loadGoals}>
            刷新
          </Button>
        </div>
        <Button onClick={openCreateDialog}>
          <PlusCircle className="h-4 w-4 mr-2" />
          新建目标
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">加载中...</p>
        </div>
      ) : filteredGoals().length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">暂无目标</p>
          <Button onClick={openCreateDialog}>
            <PlusCircle className="h-4 w-4 mr-2" />
            创建第一个目标
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredGoals().map((goal) => (
            <Card key={goal.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{goal.title}</CardTitle>
                  <div className="flex gap-1">
                    <Badge className={goalLevelMap[goal.level]?.color || "bg-gray-100"}>
                      {goalLevelMap[goal.level]?.label || goal.level}
                    </Badge>
                    <Badge className={goalStatusMap[goal.status]?.color || "bg-gray-100"}>
                      {goalStatusMap[goal.status]?.label || goal.status}
                    </Badge>
                  </div>
                </div>
                {goal.description && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {goal.description}
                  </p>
                )}
              </CardHeader>
              <CardContent className="pb-2">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <div className="flex items-center">
                    <Calendar className="h-3 w-3 mr-1" />
                    <span>
                      {new Date(goal.startDate).toLocaleDateString()} - {new Date(goal.endDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Target className="h-3 w-3 mr-1" />
                    <span>{Math.round(goal.progress * 100)}%</span>
                  </div>
                </div>

                <div className="mt-2 pt-2">
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div
                      className="bg-blue-600 h-1.5 rounded-full"
                      style={{ width: `${goal.progress * 100}%` }}
                    ></div>
                  </div>
                </div>

                {goal.tasks && goal.tasks.length > 0 && (
                  <div className="mt-3 pt-3 border-t">
                    <p className="text-xs font-medium mb-1">相关任务 ({goal.tasks.length})</p>
                    <div className="space-y-1">
                      {goal.tasks.slice(0, 2).map((task) => (
                        <div key={task.id} className="flex items-center text-xs">
                          {task.status === "COMPLETED" ? (
                            <CheckCircle2 className="h-3 w-3 mr-1 text-green-500" />
                          ) : task.status === "IN_PROGRESS" ? (
                            <Clock className="h-3 w-3 mr-1 text-blue-500" />
                          ) : task.status === "CANCELLED" ? (
                            <XCircle className="h-3 w-3 mr-1 text-red-500" />
                          ) : (
                            <Target className="h-3 w-3 mr-1 text-gray-500" />
                          )}
                          <span className="truncate">{task.title}</span>
                        </div>
                      ))}
                      {goal.tasks.length > 2 && (
                        <div className="text-xs text-muted-foreground flex items-center">
                          <span>还有 {goal.tasks.length - 2} 个任务</span>
                          <ChevronRight className="h-3 w-3 ml-1" />
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter className="pt-2 flex justify-between">
                <Button variant="outline" size="sm" onClick={() => openEditDialog(goal)}>
                  <Edit className="h-3 w-3 mr-1" />
                  编辑
                </Button>
                <div className="flex gap-1">
                  <Button variant="outline" size="sm">
                    <BarChart2 className="h-3 w-3 mr-1" />
                    详情
                  </Button>
                  <Button variant="outline" size="sm" className="text-red-500" onClick={() => deleteGoal(goal.id)}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{selectedGoal ? "编辑目标" : "创建新目标"}</DialogTitle>
            <DialogDescription>
              {selectedGoal
                ? "修改目标信息和进度"
                : "设定一个明确、可衡量、有时限的目标"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={selectedGoal ? updateGoal : createGoal}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="title" className="text-right">
                  目标标题
                </Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleFormChange}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="level" className="text-right">
                  目标级别
                </Label>
                <Select
                  value={formData.level}
                  onValueChange={(value) => handleSelectChange("level", value)}
                >
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
                <Label htmlFor="startDate" className="text-right">
                  开始日期
                </Label>
                <Input
                  id="startDate"
                  name="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={handleFormChange}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="endDate" className="text-right">
                  结束日期
                </Label>
                <Input
                  id="endDate"
                  name="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={handleFormChange}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="description" className="text-right pt-2">
                  描述
                </Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleFormChange}
                  className="col-span-3"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="parentId" className="text-right">
                  父目标
                </Label>
                <Select
                  value={formData.parentId || "none"}
                  onValueChange={(value) => handleSelectChange("parentId", value === "none" ? "" : value)}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="选择父目标" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">无父目标</SelectItem>
                    {availableParentGoals
                      .filter(g => !selectedGoal || g.id !== selectedGoal.id)
                      .map((goal) => (
                        <SelectItem key={goal.id} value={goal.id}>
                          {goal.title} ({goalLevelMap[goal.level]?.label || goal.level})
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              {/* 进度条，新建和编辑模式下都显示 */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">
                  完成进度
                </Label>
                <div className="col-span-3 space-y-2">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>0%</span>
                    <span>{Math.round(formData.progress * 100)}%</span>
                    <span>100%</span>
                  </div>
                  <Slider
                    value={[Math.round(formData.progress * 100)]}
                    max={100}
                    step={1}
                    onValueChange={handleProgressChange}
                    className="w-full"
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpenDialog(false)}>
                取消
              </Button>
              <Button type="submit">
                {selectedGoal ? "更新目标" : "创建目标"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
