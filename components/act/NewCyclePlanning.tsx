"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
    RefreshCw,
    Calendar,
    Target,
    Clock,
    Save,
    ArrowRight,
    CheckCircle2
} from "lucide-react";

// 新周期类型
interface Cycle {
    id: string;
    title: string;
    description: string;
    startDate: string;
    endDate: string;
    goals: Goal[];
    createdAt: string;
    status: string;
}

// 目标类型
interface Goal {
    id: string;
    title: string;
    description?: string;
    startDate: string;
    endDate: string;
    progress: number;
    priority: string;
    status: string;
    parentId?: string;
}

export default function NewCyclePlanning() {
    const { userId } = useAuth();
    const [activeTab, setActiveTab] = useState("basic");
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [cycle, setCycle] = useState<Cycle>({
        id: Date.now().toString(),
        title: "",
        description: "",
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
        goals: [],
        createdAt: new Date().toISOString(),
        status: "DRAFT"
    });
    const [availableGoals, setAvailableGoals] = useState<Goal[]>([]);
    const [selectedGoalIds, setSelectedGoalIds] = useState<string[]>([]);
    const [importedPlans, setImportedPlans] = useState<any[]>([]);

    // 加载可用目标
    const loadAvailableGoals = async () => {
        if (!userId) return;

        try {
            setLoading(true);
            // 这里应该调用后端API获取目标数据
            // 目前使用模拟数据

            // 模拟目标数据
            const mockGoals: Goal[] = [
                {
                    id: "1",
                    title: "提高团队工作效率",
                    description: "通过优化工作流程和工具，提高团队整体工作效率",
                    startDate: new Date().toISOString().split('T')[0],
                    endDate: new Date(Date.now() + 90 * 86400000).toISOString().split('T')[0],
                    progress: 0,
                    priority: "HIGH",
                    status: "ACTIVE"
                },
                {
                    id: "2",
                    title: "改进产品质量",
                    description: "通过引入更严格的测试流程，减少产品缺陷",
                    startDate: new Date().toISOString().split('T')[0],
                    endDate: new Date(Date.now() + 60 * 86400000).toISOString().split('T')[0],
                    progress: 0,
                    priority: "HIGH",
                    status: "ACTIVE"
                },
                {
                    id: "3",
                    title: "优化客户体验",
                    description: "收集并分析客户反馈，优化产品体验",
                    startDate: new Date().toISOString().split('T')[0],
                    endDate: new Date(Date.now() + 45 * 86400000).toISOString().split('T')[0],
                    progress: 0,
                    priority: "MEDIUM",
                    status: "ACTIVE"
                },
                {
                    id: "4",
                    title: "扩展市场份额",
                    description: "开发新的市场渠道，扩大产品影响力",
                    startDate: new Date().toISOString().split('T')[0],
                    endDate: new Date(Date.now() + 120 * 86400000).toISOString().split('T')[0],
                    progress: 0,
                    priority: "MEDIUM",
                    status: "ACTIVE"
                },
                {
                    id: "5",
                    title: "提升团队技能",
                    description: "组织培训和学习活动，提升团队技术能力",
                    startDate: new Date().toISOString().split('T')[0],
                    endDate: new Date(Date.now() + 180 * 86400000).toISOString().split('T')[0],
                    progress: 0,
                    priority: "LOW",
                    status: "ACTIVE"
                }
            ];

            setAvailableGoals(mockGoals);
        } catch (error) {
            console.error("Error loading goals:", error);
            toast.error("加载目标数据失败");
        } finally {
            setLoading(false);
        }
    };

    // 加载改进方案
    const loadImprovementPlans = async () => {
        if (!userId) return;

        try {
            setLoading(true);
            // 这里应该调用后端API获取改进方案数据
            // 目前使用模拟数据

            // 模拟改进方案数据
            const mockPlans = [
                {
                    id: "1",
                    title: "优化任务分配流程",
                    description: "重新设计任务分配流程，确保任务难度与团队成员能力匹配",
                    category: "PROCESS",
                    priority: "HIGH",
                    status: "IN_PROGRESS",
                    expectedOutcome: "提高任务完成率至80%以上",
                },
                {
                    id: "2",
                    title: "引入自动化时间记录工具",
                    description: "调研并引入自动化时间记录工具，减少手动记录时间的需求",
                    category: "TOOL",
                    priority: "MEDIUM",
                    status: "PLANNED",
                    expectedOutcome: "提高时间记录准确率至95%",
                },
                {
                    id: "3",
                    title: "建立定期沟通机制",
                    description: "建立每周例会和日常沟通渠道，确保团队成员及时沟通",
                    category: "COMMUNICATION",
                    priority: "HIGH",
                    status: "COMPLETED",
                    expectedOutcome: "减少沟通不畅导致的工作重复，提高团队协作效率",
                }
            ];

            setImportedPlans(mockPlans);
        } catch (error) {
            console.error("Error loading improvement plans:", error);
            toast.error("加载改进方案数据失败");
        } finally {
            setLoading(false);
        }
    };

    // 更新周期基本信息
    const updateCycleBasicInfo = (data: Partial<Cycle>) => {
        setCycle(prev => ({
            ...prev,
            ...data
        }));
    };

    // 选择目标
    const toggleGoalSelection = (goalId: string) => {
        setSelectedGoalIds(prev => {
            if (prev.includes(goalId)) {
                return prev.filter(id => id !== goalId);
            } else {
                return [...prev, goalId];
            }
        });
    };

    // 添加选中的目标到周期
    const addSelectedGoalsToCycle = () => {
        const goalsToAdd = availableGoals.filter(goal => selectedGoalIds.includes(goal.id));
        setCycle(prev => ({
            ...prev,
            goals: [...prev.goals, ...goalsToAdd]
        }));
        setSelectedGoalIds([]);
        toast.success("已添加选中的目标到新周期");
    };

    // 从改进方案创建目标
    const createGoalFromPlan = (plan: any) => {
        const newGoal: Goal = {
            id: `new-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            title: plan.title,
            description: plan.description,
            startDate: cycle.startDate,
            endDate: cycle.endDate,
            progress: 0,
            priority: plan.priority,
            status: "ACTIVE"
        };

        setCycle(prev => ({
            ...prev,
            goals: [...prev.goals, newGoal]
        }));

        toast.success("已从改进方案创建新目标");
    };

    // 移除目标
    const removeGoalFromCycle = (goalId: string) => {
        setCycle(prev => ({
            ...prev,
            goals: prev.goals.filter(goal => goal.id !== goalId)
        }));
        toast.success("已从新周期中移除目标");
    };

    // 保存新周期
    const saveCycle = async () => {
        if (!cycle.title) {
            toast.error("请输入周期标题");
            return;
        }

        if (cycle.goals.length === 0) {
            toast.error("请至少添加一个目标");
            return;
        }

        try {
            setSaving(true);
            // 这里应该调用后端API保存周期数据
            // 目前只是模拟保存

            setTimeout(() => {
                toast.success("新周期已保存");
                setSaving(false);
            }, 1000);
        } catch (error) {
            console.error("Error saving cycle:", error);
            toast.error("保存周期失败");
            setSaving(false);
        }
    };

    // 初始加载
    useEffect(() => {
        if (userId) {
            loadAvailableGoals();
            loadImprovementPlans();
        }
    }, [userId]);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">新周期规划</h2>
                <Button onClick={saveCycle} disabled={saving}>
                    <Save className="h-4 w-4 mr-2" />
                    {saving ? "保存中..." : "保存周期"}
                </Button>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                <TabsList>
                    <TabsTrigger value="basic">
                        <Calendar className="h-4 w-4 mr-2" />
                        基本信息
                    </TabsTrigger>
                    <TabsTrigger value="goals">
                        <Target className="h-4 w-4 mr-2" />
                        目标设定
                    </TabsTrigger>
                    <TabsTrigger value="timeline">
                        <Clock className="h-4 w-4 mr-2" />
                        时间线
                    </TabsTrigger>
                    <TabsTrigger value="review">
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        最终确认
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="basic" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>周期基本信息</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center py-12">
                                <RefreshCw className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                                <p className="text-muted-foreground mb-4">周期基本信息表单正在开发中...</p>
                                <Button onClick={() => setActiveTab("goals")}>
                                    继续到目标设定
                                    <ArrowRight className="h-4 w-4 ml-2" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="goals" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>目标设定</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center py-12">
                                <Target className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                                <p className="text-muted-foreground mb-4">目标设定界面正在开发中...</p>
                                <Button onClick={() => setActiveTab("timeline")}>
                                    继续到时间线
                                    <ArrowRight className="h-4 w-4 ml-2" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="timeline" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>时间线规划</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center py-12">
                                <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                                <p className="text-muted-foreground mb-4">时间线规划界面正在开发中...</p>
                                <Button onClick={() => setActiveTab("review")}>
                                    继续到最终确认
                                    <ArrowRight className="h-4 w-4 ml-2" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="review" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>最终确认</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center py-12">
                                <CheckCircle2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                                <p className="text-muted-foreground mb-4">最终确认界面正在开发中...</p>
                                <Button onClick={saveCycle} disabled={saving}>
                                    <Save className="h-4 w-4 mr-2" />
                                    {saving ? "保存中..." : "保存新周期"}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}