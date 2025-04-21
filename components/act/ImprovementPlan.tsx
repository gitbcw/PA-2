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
    Lightbulb,
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
    AlertTriangle,
    Link,
} from "lucide-react";

// 改进方案类型
interface ImprovementPlan {
    id: string;
    title: string;
    description: string;
    category: string;
    priority: string;
    status: string;
    expectedOutcome: string;
    deadline: string;
    createdAt: string;
    relatedProblemId?: string;
    assignee?: string;
    resources?: string;
}

// 改进方案类别选项
const PLAN_CATEGORIES = [
    { value: "PROCESS", label: "流程改进" },
    { value: "RESOURCE", label: "资源优化" },
    { value: "SKILL", label: "技能提升" },
    { value: "TOOL", label: "工具改进" },
    { value: "COMMUNICATION", label: "沟通优化" },
    { value: "OTHER", label: "其他改进" },
];

// 优先级选项
const PRIORITY_OPTIONS = [
    { value: "HIGH", label: "高", color: "destructive" },
    { value: "MEDIUM", label: "中", color: "default" },
    { value: "LOW", label: "低", color: "secondary" },
];

// 状态选项
const STATUS_OPTIONS = [
    { value: "PLANNED", label: "计划中", color: "secondary" },
    { value: "IN_PROGRESS", label: "进行中", color: "default" },
    { value: "COMPLETED", label: "已完成", color: "success" },
    { value: "CANCELLED", label: "已取消", color: "destructive" },
];

export default function ImprovementPlan() {
    const { userId } = useAuth();
    const [plans, setPlans] = useState<ImprovementPlan[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("ALL");
    const [priorityFilter, setPriorityFilter] = useState("ALL");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [sortField, setSortField] = useState("createdAt");
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
    const [openDialog, setOpenDialog] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [currentPlan, setCurrentPlan] = useState<ImprovementPlan | null>(null);

    // 表单状态
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState("");
    const [priority, setPriority] = useState("MEDIUM");
    const [status, setStatus] = useState("PLANNED");
    const [expectedOutcome, setExpectedOutcome] = useState("");
    const [deadline, setDeadline] = useState("");
    const [relatedProblemId, setRelatedProblemId] = useState("");
    const [assignee, setAssignee] = useState("");
    const [resources, setResources] = useState("");

    // 加载改进方案数据
    const loadPlans = async () => {
        if (!userId) return;

        try {
            setLoading(true);
            // 这里应该调用后端API获取改进方案数据
            // 目前使用模拟数据

            // 模拟改进方案数据
            const mockPlans: ImprovementPlan[] = [
                {
                    id: "1",
                    title: "优化任务分配流程",
                    description: "重新设计任务分配流程，确保任务难度与团队成员能力匹配",
                    category: "PROCESS",
                    priority: "HIGH",
                    status: "IN_PROGRESS",
                    expectedOutcome: "提高任务完成率至80%以上",
                    deadline: new Date(Date.now() + 14 * 86400000).toISOString(),
                    createdAt: new Date().toISOString(),
                    relatedProblemId: "1",
                    assignee: "张三",
                },
                {
                    id: "2",
                    title: "引入自动化时间记录工具",
                    description: "调研并引入自动化时间记录工具，减少手动记录时间的需求",
                    category: "TOOL",
                    priority: "MEDIUM",
                    status: "PLANNED",
                    expectedOutcome: "提高时间记录准确率至95%",
                    deadline: new Date(Date.now() + 30 * 86400000).toISOString(),
                    createdAt: new Date(Date.now() - 86400000).toISOString(),
                    relatedProblemId: "2",
                    assignee: "李四",
                    resources: "预算：5000元",
                },
                {
                    id: "3",
                    title: "建立定期沟通机制",
                    description: "建立每周例会和日常沟通渠道，确保团队成员及时沟通",
                    category: "COMMUNICATION",
                    priority: "HIGH",
                    status: "COMPLETED",
                    expectedOutcome: "减少沟通不畅导致的工作重复，提高团队协作效率",
                    deadline: new Date(Date.now() - 5 * 86400000).toISOString(),
                    createdAt: new Date(Date.now() - 15 * 86400000).toISOString(),
                    relatedProblemId: "3",
                    assignee: "团队负责人",
                },
                {
                    id: "4",
                    title: "优化资源分配策略",
                    description: "重新评估项目资源需求，优化资源分配策略",
                    category: "RESOURCE",
                    priority: "HIGH",
                    status: "IN_PROGRESS",
                    expectedOutcome: "解决关键资源短缺问题，确保项目顺利进行",
                    deadline: new Date(Date.now() + 21 * 86400000).toISOString(),
                    createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
                    relatedProblemId: "4",
                    assignee: "王五",
                    resources: "需要管理层支持",
                },
                {
                    id: "5",
                    title: "制定技能培训计划",
                    description: "针对团队技能缺口，制定有针对性的培训计划",
                    category: "SKILL",
                    priority: "MEDIUM",
                    status: "PLANNED",
                    expectedOutcome: "提升团队在新技术领域的能力",
                    deadline: new Date(Date.now() + 60 * 86400000).toISOString(),
                    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
                    relatedProblemId: "5",
                    assignee: "HR部门",
                    resources: "培训预算：20000元",
                },
            ];

            setPlans(mockPlans);
        } catch (error) {
            console.error("Error loading improvement plans:", error);
            toast.error("加载改进方案数据失败");
        } finally {
            setLoading(false);
        }
    };

    // 添加或更新改进方案
    const handleSavePlan = async () => {
        if (!title) {
            toast.error("请输入改进方案标题");
            return;
        }

        if (!deadline) {
            toast.error("请设置截止日期");
            return;
        }

        try {
            // 构建改进方案对象
            const planData = {
                id: editMode && currentPlan ? currentPlan.id : Date.now().toString(),
                title,
                description,
                category,
                priority,
                status,
                expectedOutcome,
                deadline,
                createdAt: editMode && currentPlan ? currentPlan.createdAt : new Date().toISOString(),
                relatedProblemId: relatedProblemId || undefined,
                assignee: assignee || undefined,
                resources: resources || undefined,
            };

            if (editMode && currentPlan) {
                // 更新现有改进方案
                setPlans(plans.map(p => p.id === currentPlan.id ? planData : p));
                toast.success("改进方案已更新");
            } else {
                // 添加新改进方案
                setPlans([planData, ...plans]);
                toast.success("改进方案已添加");
            }

            // 重置表单
            resetForm();
            setOpenDialog(false);
        } catch (error) {
            console.error("Error saving improvement plan:", error);
            toast.error("保存改进方案失败");
        }
    };

    // 删除改进方案
    const handleDeletePlan = (id: string) => {
        try {
            setPlans(plans.filter(p => p.id !== id));
            toast.success("改进方案已删除");
        } catch (error) {
            console.error("Error deleting improvement plan:", error);
            toast.error("删除改进方案失败");
        }
    };

    // 编辑改进方案
    const handleEditPlan = (plan: ImprovementPlan) => {
        setCurrentPlan(plan);
        setTitle(plan.title);
        setDescription(plan.description);
        setCategory(plan.category);
        setPriority(plan.priority);
        setStatus(plan.status);
        setExpectedOutcome(plan.expectedOutcome);
        setDeadline(new Date(plan.deadline).toISOString().split('T')[0]);
        setRelatedProblemId(plan.relatedProblemId || "");
        setAssignee(plan.assignee || "");
        setResources(plan.resources || "");
        setEditMode(true);
        setOpenDialog(true);
    };

    // 添加新改进方案
    const handleAddPlan = () => {
        resetForm();
        // 设置默认截止日期为30天后
        const thirtyDaysLater = new Date();
        thirtyDaysLater.setDate(thirtyDaysLater.getDate() + 30);
        setDeadline(thirtyDaysLater.toISOString().split('T')[0]);

        setEditMode(false);
        setOpenDialog(true);
    };

    // 重置表单
    const resetForm = () => {
        setTitle("");
        setDescription("");
        setCategory("");
        setPriority("MEDIUM");
        setStatus("PLANNED");
        setExpectedOutcome("");
        setDeadline("");
        setRelatedProblemId("");
        setAssignee("");
        setResources("");
        setCurrentPlan(null);
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

    // 获取筛选和排序后的改进方案列表
    const getFilteredPlans = () => {
        return plans
            .filter(plan => {
                // 搜索过滤
                const searchMatch =
                    searchTerm === "" ||
                    plan.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    plan.description.toLowerCase().includes(searchTerm.toLowerCase());

                // 类别过滤
                const categoryMatch =
                    categoryFilter === "ALL" ||
                    plan.category === categoryFilter;

                // 优先级过滤
                const priorityMatch =
                    priorityFilter === "ALL" ||
                    plan.priority === priorityFilter;

                // 状态过滤
                const statusMatch =
                    statusFilter === "ALL" ||
                    plan.status === statusFilter;

                return searchMatch && categoryMatch && priorityMatch && statusMatch;
            })
            .sort((a, b) => {
                // 排序
                if (sortField === "deadline") {
                    return sortDirection === "asc"
                        ? new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
                        : new Date(b.deadline).getTime() - new Date(a.deadline).getTime();
                } else if (sortField === "createdAt") {
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
        const option = PLAN_CATEGORIES.find(opt => opt.value === category);
        return option ? option.label : category;
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

    // 计算截止日期状态
    const getDeadlineStatus = (deadline: string) => {
        const now = new Date();
        const deadlineDate = new Date(deadline);
        const diffDays = Math.ceil((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

        if (diffDays < 0) {
            return { label: "已逸期", color: "destructive" };
        } else if (diffDays <= 7) {
            return { label: "即将到期", color: "warning" };
        } else {
            return { label: `${diffDays}天`, color: "default" };
        }
    };

    // 初始加载
    useEffect(() => {
        if (userId) {
            loadPlans();
        }
    }, [userId]);

    return (
        <div className="space-y-6">
            {/* 搜索和筛选 */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="搜索改进方案..."
                        className="pl-8"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="flex flex-wrap gap-2">
                    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                        <SelectTrigger className="w-[130px]">
                            <SelectValue placeholder="方案类别" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">所有类别</SelectItem>
                            {PLAN_CATEGORIES.map((category) => (
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

                    <Button onClick={handleAddPlan}>
                        <Plus className="h-4 w-4 mr-2" />
                        添加方案
                    </Button>
                </div>
            </div>

            {/* 改进方案列表 */}
            {loading ? (
                <div className="text-center py-12">
                    <p className="text-muted-foreground">加载中...</p>
                </div>
            ) : getFilteredPlans().length === 0 ? (
                <div className="text-center py-12">
                    <Lightbulb className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground mb-4">暂无改进方案数据</p>
                    <Button onClick={handleAddPlan}>
                        <Plus className="h-4 w-4 mr-2" />
                        添加第一个改进方案
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
                                        改进方案
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
                                        onClick={() => handleSort("deadline")}
                                    >
                                        截止日期
                                        {sortField === "deadline" && (
                                            <ArrowUpDown className="ml-2 h-4 w-4" />
                                        )}
                                    </Button>
                                </TableHead>
                                <TableHead>负责人</TableHead>
                                <TableHead className="text-right">操作</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {getFilteredPlans().map((plan) => {
                                const deadlineStatus = getDeadlineStatus(plan.deadline);
                                return (
                                    <TableRow key={plan.id}>
                                        <TableCell className="font-medium">
                                            <div>
                                                {plan.title}
                                                {plan.description && (
                                                    <p className="text-sm text-muted-foreground truncate max-w-[280px]">
                                                        {plan.description}
                                                    </p>
                                                )}
                                                {plan.relatedProblemId && (
                                                    <div className="flex items-center mt-1 text-xs text-muted-foreground">
                                                        <Link className="h-3 w-3 mr-1" />
                                                        关联问题: #{plan.relatedProblemId}
                                                    </div>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>{getCategoryLabel(plan.category)}</TableCell>
                                        <TableCell>{getPriorityBadge(plan.priority)}</TableCell>
                                        <TableCell>{getStatusBadge(plan.status)}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center">
                                                <Calendar className="h-3 w-3 mr-1" />
                                                <span>{formatDate(plan.deadline)}</span>
                                                <Badge
                                                    variant={deadlineStatus.color as any}
                                                    className="ml-2 text-xs"
                                                >
                                                    {deadlineStatus.label}
                                                </Badge>
                                            </div>
                                        </TableCell>
                                        <TableCell>{plan.assignee || "-"}</TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleEditPlan(plan)}
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDeletePlan(plan.id)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </div>
            )}

            {/* 添加/编辑改进方案对话框 */}
            <Dialog open={openDialog} onOpenChange={setOpenDialog}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>{editMode ? "编辑改进方案" : "添加改进方案"}</DialogTitle>
                        <DialogDescription>
                            {editMode ? "修改改进方案信息" : "添加新的改进方案"}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">方案标题</label>
                            <Input
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="输入改进方案标题"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">方案描述</label>
                            <Textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="详细描述改进方案"
                                rows={3}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">方案类别</label>
                                <Select value={category} onValueChange={setCategory}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="选择方案类别" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {PLAN_CATEGORIES.map((category) => (
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
                                <label className="text-sm font-medium">截止日期</label>
                                <Input
                                    type="date"
                                    value={deadline}
                                    onChange={(e) => setDeadline(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">预期成果</label>
                            <Textarea
                                value={expectedOutcome}
                                onChange={(e) => setExpectedOutcome(e.target.value)}
                                placeholder="描述实施该方案的预期成果"
                                rows={2}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">负责人</label>
                                <Input
                                    value={assignee}
                                    onChange={(e) => setAssignee(e.target.value)}
                                    placeholder="输入负责人姓名"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">关联问题ID</label>
                                <Input
                                    value={relatedProblemId}
                                    onChange={(e) => setRelatedProblemId(e.target.value)}
                                    placeholder="输入关联问题ID"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">所需资源</label>
                            <Textarea
                                value={resources}
                                onChange={(e) => setResources(e.target.value)}
                                placeholder="描述实施该方案所需的资源"
                                rows={2}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setOpenDialog(false)}>
                            取消
                        </Button>
                        <Button onClick={handleSavePlan}>
                            {editMode ? "更新" : "添加"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}