import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Objective } from "./ObjectiveManager";

interface ObjectiveChatProps {
  userId: string;
  onObjectiveExtracted: (objective: Partial<Objective>) => void;
}

export function ObjectiveChat({ userId, onObjectiveExtracted }: ObjectiveChatProps) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [suggestedObjectives, setSuggestedObjectives] = useState<Partial<Objective>[]>([]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    // 模拟AI生成目标，实际可调用后端AI接口
    setTimeout(() => {
      const mock = [
        { title: "提升英语水平", description: "每天学习30分钟英语", type: "GOAL" },
        { title: "完成React项目", description: "独立开发一个小型React应用", type: "GOAL" }
      ];
      setSuggestedObjectives(mock);
      setLoading(false);
    }, 1200);
  }

  function handleAdopt(obj: Partial<Objective>) {
    onObjectiveExtracted(obj);
  }

  return (
    <div className="border rounded-lg p-4 bg-white">
      <form onSubmit={handleSubmit} className="space-y-2">
        <Textarea value={input} onChange={e => setInput(e.target.value)} placeholder="描述你的目标、计划或需求，AI 将帮你智能拆解..." rows={4} />
        <Button type="submit" disabled={loading || !input.trim()} className="w-full">{loading ? "生成中..." : "让 AI 生成目标"}</Button>
      </form>
      <div className="mt-4 space-y-2">
        {suggestedObjectives.map((obj, idx) => (
          <div key={idx} className="border rounded p-3 flex flex-col bg-gray-50">
            <span className="font-bold">{obj.title}</span>
            <span className="text-sm text-gray-600">{obj.description}</span>
            <Button variant="outline" size="sm" className="mt-2 self-end" onClick={() => handleAdopt(obj)}>
              采纳为目标
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
