"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import {
  AlertTriangle,
  Search,
  Plus,
  Edit,
  Trash2,
  Filter,
  ArrowUpDown,
  CheckCircle2,
  XCircle,
  FileText,
  Target,
  Calendar,
  Clock,
} from "lucide-react";

// 问题类型
interface Problem {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  impact: string;
  rootCause: string;
  createdAt: string;
  relatedGoalId?: string;
  relatedTaskId?: string;
}

// 问题类别选项
const PROBLEM_CATEGORIES = [
  { value: "PROCESS", label: "流程问题" },
  { value: "RESOURCE", label: "资源问题" },
  { value: "SKILL", label: "技能问题" },
  { value: "TOOL", label: "工具问题" },
  { value: "COMMUNICATION", label: "沟通问题" },
  { value: "OTHER", label: "其他问题" },
];

// 优先级选项
const PRIORITY_OPTIONS = [
  { value: "HIGH", label: "高", color: "destructive" },
  { value: "MEDIUM", label: "中", color: "default" },
  { value: "LOW", label: "低", color: "secondary" },
];

// 状态选项
const STATUS_OPTIONS = [
  { value: "OPEN", label: "未解决", color: "destructive" },
  { value: "IN_PROGRESS", label: "处理中", color: "default" },
  { value: "RESOLVED", label: "已解决", color: "secondary" },
];

// 影响范围选项
const IMPACT_OPTIONS = [
  { value: "HIGH", label: "高影响", color: "destructive" },
  { value: "MEDIUM", label: "中等影响", color: "default" },
  { value: "LOW", label: "低影响", color: "secondary" },
];

export default function ProblemAnalysis() {
  const { userId } = useAuth();
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [priorityFilter, setPriorityFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sortField, setSortField] = useState("createdAt");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [openDialog, setOpenDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentProblem, setCurrentProblem] = useState<Problem | null>(null);
  
  // 表单状态
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [priority, setPriority] = useState("MEDIUM");
  const [status, setStatus] = useState("OPEN");
  const [impact, setImpact] = useState("MEDIUM");
  const [rootCause, setRootCause] = useState("");
  const [relatedGoalId, setRelatedGoalId] = useState("");
  const [relatedTaskId, setRelatedTaskId] = useState("");
  
  // 加载问题数据
  const loadProblems = async () => {
    if (!userId) return;

    try {
      setLoading(true);
      // 这里应该调用后端API获取问题数据
      // 目前使用模拟数据
      
      // 模拟问题数据
      const mockProblems: Problem[] = [
        {
          id: "1",
          title: "任务完成率低",
          description: "本周期内任务完成率仅为60%，低于预期的80%",
          category: "PROCESS",
          priority: "HIGH",
          status: "OPEN",
          impact: "HIGH",
          rootCause: "任务分配不合理，部分任务难度过高",
          createdAt: new Date().toISOString(),
          relatedGoalId: "goal1",
        },
        {
          id: "2",
          title: "时间记录不准确",
          description: "团队成员经常忘记记录工作时间，导致数据不准确",
          category: "TOOL",
          priority: "MEDIUM",
          status: "IN_PROGRESS",
          impact: "MEDIUM",
          rootCause: "缺乏便捷的时间记录工具和提醒机制",
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          relatedTaskId: "task1",
        },
        {
          id: "3",
          title: "沟通不畅",
          description: "团队成员之间沟通不畅，导致工作重复和效率低下",
          category: "COMMUNICATION",
          priority: "HIGH",
          status: "OPEN",
          impact: "HIGH",
          rootCause: "缺乏有效的沟通渠道和定期会议机制",
          createdAt: new Date(Date.now() - 172800000).toISOString(),
        },
        {
          id: "4",
          title: "资源不足",
          description: "项目资源不足，特别是专业技术人员短缺",
          category: "RESOURCE",
          priority: "HIGH",
          status: "OPEN",
          impact: "HIGH",
          rootCause: "预算限制和人才市场竞争激烈",
          createdAt: new Date(Date.now() - 259200000).toISOString(),
          relatedGoalId: "goal2",
        },
        {
          id: "5",
          title: "技能缺口",
          description: "团队在新技术方面存在技能缺口",
          category: "SKILL",
          priority: "MEDIUM",
          status: "IN_PROGRESS",
          impact: "MEDIUM",
          rootCause: "缺乏培训计划和学习时间",
          createdAt: new Date(Date.now() - 345600000).toISOString(),
        },
      ];
      
      setProblems(mockProblems);
    } catch (error) {
      console.error("Error loading problems:", error);
      toast.error("加载问题数据失败");
    } finally {
      setLoading(false);
    }
  };

  // 添加或更新问题
  const handleSaveProblem = async () => {
    if (!title) {
      toast.error("请输入问题标题");
      return;
    }

    try {
      // 构建问题对象
      const problemData = {
        id: editMode && currentProblem ? currentProblem.id : Date.now().toString(),
        title,
        description,
        category,
        priority,
        status,
        impact,
        rootCause,
        createdAt: editMode && currentProblem ? currentProblem.createdAt : new Date().toISOString(),
        relatedGoalId: relatedGoalId || undefined,
        relatedTaskId: relatedTaskId || undefined,
      };

      if (editMode && currentProblem) {
        // 更新现有问题
        setProblems(problems.map(p => p.id === currentProblem.id ? problemData : p));
        toast.success("问题已更新");
      } else {
        // 添加新问题
        setProblems([problemData, ...problems]);
        toast.success("问题已添加");
      }

      // 重置表单
      resetForm();
      setOpenDialog(false);
    } catch (error) {
      console.error("Error saving problem:", error);
      toast.error("保存问题失败");
    }
  };

  // 删除问题
  const handleDeleteProblem = (id: string) => {
    try {
      setProblems(problems.filter(p => p.id !== id));
      toast.success("问题已删除");
    } catch (error) {
      console.error("Error deleting problem:", error);
      toast.error("删除问题失败");
    }
  };

  // 编辑问题
  const handleEditProblem = (problem: Problem) => {
    setCurrentProblem(problem);
    setTitle(problem.title);
    setDescription(problem.description);
    setCategory(problem.category);
    setPriority(problem.priority);
    setStatus(problem.status);
    setImpact(problem.impact);
    setRootCause(problem.rootCause);
    setRelatedGoalId(problem.relatedGoalId || "");
    setRelatedTaskId(problem.relatedTaskId || "");
    setEditMode(true);
    setOpenDialog(true);
  };

  // 添加新问题
  const handleAddProblem = () => {
    resetForm();
    setEditMode(false);
    setOpenDialog(true);
  };

  // 重置表单
  const resetForm = () => {
    setTitle("");
    setDescription("");
    setCategory("");
    setPriority("MEDIUM");
    setStatus("OPEN");
    setImpact("MEDIUM");
    setRootCause("");
    setRelatedGoalId("");
    setRelatedTaskId("");
    setCurrentProblem(null);
  };

  // 处理排序
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // 获取筛选和排序后的问题列表
  const getFilteredProblems = () => {
    return problems
      .filter(problem => {
        // 搜索过滤
        const searchMatch = 
          searchTerm === "" || 
          problem.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          problem.description.toLowerCase().includes(searchTerm.toLowerCase());
        
        // 类别过滤
        const categoryMatch = 
          categoryFilter === "ALL" || 
          problem.category === categoryFilter;
        
        // 优先级过滤
        const priorityMatch = 
          priorityFilter === "ALL" || 
          problem.priority === priorityFilter;
        
        // 状态过滤
        const statusMatch = 
          statusFilter === "ALL" || 
          problem.status === statusFilter;
        
        return searchMatch && categoryMatch && priorityMatch && statusMatch;
      })
      .sort((a, b) => {
        // 排序
        if (sortField === "createdAt") {
          return sortDirection === "asc" 
            ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
            : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        } else if (sortField === "priority") {
          const priorityOrder = { HIGH: 3, MEDIUM: 2, LOW: 1 };
          return sortDirection === "asc" 
            ? priorityOrder[a.priority as keyof typeof priorityOrder] - priorityOrder[b.priority as keyof typeof priorityOrder]
            : priorityOrder[b.priority as keyof typeof priorityOrder] - priorityOrder[a.priority as keyof typeof priorityOrder];
        } else {
          // 默认按标题排序
          return sortDirection === "asc" 
            ? a.title.localeCompare(b.title)
            : b.title.localeCompare(a.title);
        }
      });
  };

  // 获取优先级徽章
  const getPriorityBadge = (priority: string) => {
    const option = PRIORITY_OPTIONS.find(opt => opt.value === priority);
    return option ? (
      <Badge variant={option.color as any}>{option.label}</Badge>
    ) : null;
  };

  // 获取状态徽章
  const getStatusBadge = (status: string) => {
    const option = STATUS_OPTIONS.find(opt => opt.value === status);
    return option ? (
      <Badge variant={option.color as any}>{option.label}</Badge>
    ) : null;
  };

  // 获取类别标签
  const getCategoryLabel = (category: string) => {
    const option = PROBLEM_CATEGORIES.find(opt => opt.value === category);
    return option ? option.label : category;
  };

  // 获取影响范围标签
  const getImpactLabel = (impact: string) => {
    const option = IMPACT_OPTIONS.find(opt => opt.value === impact);
    return option ? option.label : impact;
  };

  // 格式化日期
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  // 初始加载
  useEffect(() => {
    if (userId) {
      loadProblems();
    }
  }, [userId]);

  return (
    <div className="space-y-6">
      {/* 搜索和筛选 */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="搜索问题..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="问题类别" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">所有类别</SelectItem>
              {PROBLEM_CATEGORIES.map((category) => (
                <SelectItem key={category.value} value={category.value}>
                  {category.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="优先级" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">所有优先级</SelectItem>
              {PRIORITY_OPTIONS.map((priority) => (
                <SelectItem key={priority.value} value={priority.value}>
                  {priority.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="状态" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">所有状态</SelectItem>
              {STATUS_OPTIONS.map((status) => (
                <SelectItem key={status.value} value={status.value}>
                  {status.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button onClick={handleAddProblem}>
            <Plus className="h-4 w-4 mr-2" />
            添加问题
          </Button>
        </div>
      </div>

      {/* 问题列表 */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">加载中...</p>
        </div>
      ) : getFilteredProblems().length === 0 ? (
        <div className="text-center py-12">
          <AlertTriangle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground mb-4">暂无问题数据</p>
          <Button onClick={handleAddProblem}>
            <Plus className="h-4 w-4 mr-2" />
            添加第一个问题
          </Button>
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[300px]">
                  <Button 
                    variant="ghost" 
                    className="p-0 font-medium"
                    onClick={() => handleSort("title")}
                  >
                    问题
                    {sortField === "title" && (
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    )}
                  </Button>
                </TableHead>
                <TableHead>类别</TableHead>
                <TableHead>
                  <Button 
                    variant="ghost" 
                    className="p-0 font-medium"
                    onClick={() => handleSort("priority")}
                  >
                    优先级
                    {sortField === "priority" && (
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    )}
                  </Button>
                </TableHead>
                <TableHead>状态</TableHead>
                <TableHead>
                  <Button 
                    variant="ghost" 
                    className="p-0 font-medium"
                    onClick={() => handleSort("createdAt")}
                  >
                    创建日期
                    {sortField === "createdAt" && (
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    )}
                  </Button>
                </TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {getFilteredProblems().map((problem) => (
                <TableRow key={problem.id}>
                  <TableCell className="font-medium">
                    <div>
                      {problem.title}
                      {problem.description && (
                        <p className="text-sm text-muted-foreground truncate max-w-[280px]">
                          {problem.description}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{getCategoryLabel(problem.category)}</TableCell>
                  <TableCell>{getPriorityBadge(problem.priority)}</TableCell>
                  <TableCell>{getStatusBadge(problem.status)}</TableCell>
                  <TableCell>{formatDate(problem.createdAt)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditProblem(problem)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteProblem(problem.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* 添加/编辑问题对话框 */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{editMode ? "编辑问题" : "添加问题"}</DialogTitle>
            <DialogDescription>
              {editMode ? "修改问题信息" : "添加新的问题记录"}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">问题标题</label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="输入问题标题"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">问题描述</label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="详细描述问题"
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">问题类别</label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="选择问题类别" />
                  </SelectTrigger>
                  <SelectContent>
                    {PROBLEM_CATEGORIES.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">优先级</label>
                <Select value={priority} onValueChange={setPriority}>
                  <SelectTrigger>
                    <SelectValue placeholder="选择优先级" />
                  </SelectTrigger>
                  <SelectContent>
                    {PRIORITY_OPTIONS.map((priority) => (
                      <SelectItem key={priority.value} value={priority.value}>
                        {priority.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">状态</label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="选择状态" />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">影响范围</label>
                <Select value={impact} onValueChange={setImpact}>
                  <SelectTrigger>
                    <SelectValue placeholder="选择影响范围" />
                  </SelectTrigger>
                  <SelectContent>
                    {IMPACT_OPTIONS.map((impact) => (
                      <SelectItem key={impact.value} value={impact.value}>
                        {impact.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">根本原因分析</label>
              <Textarea
                value={rootCause}
                onChange={(e) => setRootCause(e.target.value)}
                placeholder="分析问题的根本原因"
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">相关目标</label>
                <Input
                  value={relatedGoalId}
                  onChange={(e) => setRelatedGoalId(e.target.value)}
                  placeholder="输入相关目标ID"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">相关任务</label>
                <Input
                  value={relatedTaskId}
                  onChange={(e) => setRelatedTaskId(e.target.value)}
                  placeholder="输入相关任务ID"
                />
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenDialog(false)}>
              取消
            </Button>
            <Button onClick={handleSaveProblem}>
              {editMode ? "更新" : "添加"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
