"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Goal {
  id: string;
  title: string;
  level: string;
  endDate: string;
}

export default function TodayGoals() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);

  // 加载今日目标
  const loadTodayGoals = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/goals/today");
      const data = await res.json();
      setGoals(data.goals || []);
    } catch (e) {
      setGoals([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTodayGoals();
  }, []);

  return (
    <div>
      {loading ? (
        <div className="text-center py-8 text-muted-foreground">加载中...</div>
      ) : goals.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">今日无目标</div>
      ) : (
        <ul className="space-y-4">
          {goals.map(goal => {
            const isOverdue = new Date() > new Date(goal.endDate);
            return (
              <li key={goal.id} className="border rounded p-4 bg-background flex flex-col md:flex-row md:items-center gap-2">
                <div className="flex-1">
                  <div className="text-lg font-bold flex items-center gap-2">
                    <span>{goal.title}</span>
                    <span className="text-xs px-2 py-0.5 rounded bg-muted-foreground/10 border border-muted-foreground/20">{goal.level}</span>
                    {isOverdue && <span className="ml-2 text-red-600 text-xs font-semibold">已逾期</span>}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    截止日期：{goal.endDate?.slice(0, 10)}
                  </div>
                </div>
                <Link href={`/goals/${goal.id}`} className="text-blue-600 text-sm underline ml-auto">详情</Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
