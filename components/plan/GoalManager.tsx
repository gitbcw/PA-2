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

import AiAssistant from "@/components/plan/AiAssistant";

interface GoalDraft {
  title: string;
  description: string;
  level?: string;
  startDate?: string;
  endDate?: string;
  parentId?: string;
  metrics?: any[];
  resources?: any[];
  progress?: number;
}

import GoalList from "./GoalList";
import GoalFormDialog from "./GoalFormDialog";
import AiAssistantDialog from "./AiAssistantDialog";

export default function GoalManager() {
  const { userId } = useAuth();
  const [goals, setGoals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<any | null>(null);
  const [filter, setFilter] = useState("all");

  // AI 相关
  const [showAiAssistant, setShowAiAssistant] = useState(false);
  const [smartCheckResult, setSmartCheckResult] = useState<string>("");

  // 表单状态
  const [formData, setFormData] = useState<GoalDraft>({
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

  // 可用的父目标
  const [availableParentGoals, setAvailableParentGoals] = useState<any[]>([]);

  // AI 采纳生成目标
  const handleAdoptGoalFromAI = (goal: GoalDraft) => {
    setShowAiAssistant(false);
    setFormData({
      ...formData,
      ...goal,
      level: goal.level || "MONTHLY",
      startDate: goal.startDate || new Date().toISOString().split('T')[0],
      endDate: goal.endDate || new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      progress: 0,
    });
    setOpenDialog(true);
  };

  // SMART 原则校验（模拟AI，可替换为实际API调用）
  const handleSmartCheck = (title: string, description: string) => {
    if (!title && !description) {
      setSmartCheckResult("请填写目标标题或描述");
      return;
    }
    // 简单模拟：包含具体、可衡量等关键词则通过
    const text = (title + description).toLowerCase();
    if (["具体", "可衡量", "可实现", "相关", "时限"].every(k => text.includes(k))) {
      setSmartCheckResult("目标基本符合SMART原则");
    } else {
      setSmartCheckResult("建议补充SMART五要素：具体、可衡量、可实现、相关性、时限性");
    }
  };

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
      {/* 顶部筛选与操作栏 */}
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
        <div className="flex gap-2">
          <Button onClick={openCreateDialog}>
            <PlusCircle className="h-4 w-4 mr-2" />
            新建目标
          </Button>
          <Button variant="secondary" size="sm" onClick={() => setShowAiAssistant(true)}>
            <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            AI 生成目标
          </Button>
        </div>
      </div>
      <div className="flex gap-2">
        <Button onClick={openCreateDialog}>
          <PlusCircle className="h-4 w-4 mr-2" />
          新建目标
        </Button>
        <Button variant="secondary" size="sm" onClick={() => setShowAiAssistant(true)}>
          <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M9 9H9.01M15 9H15.01M9 15C9.81818 15.6364 10.8182 16 12 16C13.1818 16 14.1818 15.6364 15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          AI 生成目标
        </Button>
      </div>
      {/* 目标列表展示 */}
      <GoalList
        goals={filteredGoals()}
        goalLevelMap={goalLevelMap}
        goalStatusMap={goalStatusMap}
        onEdit={openEditDialog}
        onDelete={deleteGoal}
        loading={loading}
      />
      {/* 新建/编辑目标表单弹窗 */}
      <GoalFormDialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        onSubmit={selectedGoal ? updateGoal : createGoal}
        formData={formData}
        setFormData={setFormData}
        availableParentGoals={availableParentGoals}
        smartCheckResult={smartCheckResult}
        handleSmartCheck={handleSmartCheck}
        isEdit={!!selectedGoal}
        goalLevelMap={goalLevelMap}
      />
      {/* AI 辅助生成目标弹窗 */}
      <AiAssistantDialog
        open={showAiAssistant}
        onClose={() => setShowAiAssistant(false)}
        onAdoptGoal={handleAdoptGoalFromAI}
      />
    </div>
  );
};


