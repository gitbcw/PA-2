"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface GoalRecordInputProps {
  onAdd: (content: string) => void;
}

export default function GoalRecordInput({ onAdd }: GoalRecordInputProps) {
  const [content, setContent] = useState("");
  const handleAdd = () => {
    if (!content.trim()) return;
    onAdd(content.trim());
    setContent("");
  };
  return (
    <div className="flex gap-2 mt-2">
      <textarea
        className="flex-1 border rounded px-2 py-1 text-sm"
        rows={2}
        placeholder="输入执行记录..."
        value={content}
        onChange={e => setContent(e.target.value)}
      />
      <Button onClick={handleAdd} disabled={!content.trim()}>
        添加
      </Button>
    </div>
  );
}
