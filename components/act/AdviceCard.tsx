// 单条建议卡片组件，包含标题、建议内容、采纳按钮
import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function AdviceCard({ title, advice }: { title: string; advice: string }) {
  const [adopted, setAdopted] = useState(false);
  return (
    <div className="bg-white dark:bg-card rounded-lg shadow p-6 flex flex-col gap-2 border border-muted">
      <div className="flex justify-between items-center">
        <span className="font-semibold text-lg">{title}</span>
        <span className="text-xs px-2 py-1 bg-blue-100 text-blue-600 rounded">AI建议</span>
      </div>
      <div className="text-muted-foreground text-sm mt-2">
        {advice}
      </div>
      <div className="flex gap-2 mt-4">
        {adopted ? (
          <span className="text-green-600 font-semibold">已采纳，已生成新目标</span>
        ) : (
          <Button onClick={() => setAdopted(true)}>采纳建议</Button>
        )}
      </div>
    </div>
  );
}
