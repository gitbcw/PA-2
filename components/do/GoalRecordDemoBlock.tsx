"use client";
import { useState } from "react";
import GoalInfoCard from "./GoalInfoCard";
import GoalRecordInput from "./GoalRecordInput";
import GoalRecordList, { GoalRecord } from "./GoalRecordList";

// 仅用于演示，后续可替换为真实数据和接口
const MOCK_GOAL = {
  id: "goal-1",
  title: "完成 Cascade Do 页重构设计",
  endDate: "2025-04-21T23:59:59+08:00",
};

const MOCK_RECORDS: GoalRecord[] = [
  { id: "r1", content: "今天完成了页面结构分析。", createdAt: "2025-04-20T10:15:00+08:00" },
  { id: "r2", content: "梳理了设计需求。", createdAt: "2025-04-19T21:00:00+08:00" },
];

export default function GoalRecordDemoBlock() {
  const [records, setRecords] = useState<GoalRecord[]>(MOCK_RECORDS);
  // 新增记录
  const handleAdd = (content: string) => {
    setRecords([
      { id: `r${Date.now()}`, content, createdAt: new Date().toISOString() },
      ...records,
    ]);
  };
  return (
    <div className="my-6 max-w-xl mx-auto">
      <GoalInfoCard title={MOCK_GOAL.title} endDate={MOCK_GOAL.endDate} />
      <GoalRecordInput onAdd={handleAdd} />
      <GoalRecordList records={records} />
    </div>
  );
}
