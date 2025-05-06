import React, { useState, useRef } from "react";

interface NewObjectiveFormProps {
  objectives: any[];
  onSuccess: (o: any) => void;
  userId: string;
  mode?: "create" | "edit";
  initialData?: Partial<any>;
  onClose?: () => void;
}

const NewObjectiveForm: React.FC<React.PropsWithChildren<NewObjectiveFormProps>> = ({ objectives, onSuccess, userId, mode = "create", initialData, onClose, children }) => {
  const today = new Date();
  const defaultStart = today.toISOString().slice(0, 10);
  const defaultEnd = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  const [form, setForm] = useState({
    title: initialData?.title || "",
    description: initialData?.description || "",
    type: initialData?.type || "GOAL",
    status: initialData?.status || "ACTIVE",
    startDate: initialData?.startDate ? initialData.startDate.slice(0, 10) : defaultStart,
    endDate: initialData?.endDate ? initialData.endDate.slice(0, 10) : defaultEnd,
    priority: initialData?.priority || 1,
    parentId: initialData?.parentId || ""
  });
  const [loading, setLoading] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      function toISODateString(dateStr: string) {
        if (!dateStr) return undefined;
        // 只允许 yyyy-MM-dd 格式
        if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
          return new Date(dateStr + "T00:00:00.000Z").toISOString();
        }
        // 已经是 ISO 字符串则直接返回
        return dateStr;
      }
      const payload: any = { ...form, userId, parentId: form.parentId || null };
      payload.startDate = toISODateString(form.startDate);
      payload.endDate = toISODateString(form.endDate);
      let res;
      if (mode === "edit" && initialData?.id) {
        res = await fetch(`/api/objectives/${initialData.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch("/api/objectives", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }
      if (res.ok) {
        const updatedObj = await res.json();
        onSuccess(updatedObj);
        if (onClose) onClose();
        closeRef.current?.click();
      } else {
        // @ts-ignore
        window.toast?.error(mode === "edit" ? "保存失败" : "创建失败");
      }
    } catch {
      // @ts-ignore
      window.toast?.error("网络错误");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input name="title" placeholder="目标标题" value={form.title} onChange={handleChange} required className="w-full border rounded px-2 py-1" />
      <textarea name="description" placeholder="目标描述" value={form.description} onChange={handleChange} className="w-full border rounded px-2 py-1" />
      <div className="flex gap-2">
        <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} className="border rounded px-2 py-1">
          <option value="GOAL">目标</option>
          <option value="TASK">任务</option>
          <option value="SUBGOAL">子目标</option>
          <option value="SUBTASK">子任务</option>
        </select>
        <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} className="border rounded px-2 py-1">
          <option value="ACTIVE">进行中</option>
          <option value="COMPLETED">已完成</option>
          <option value="ARCHIVED">已归档</option>
          <option value="TODO">待办</option>
          <option value="IN_PROGRESS">进行中</option>
          <option value="DONE">已完成</option>
        </select>
      </div>
      <div className="flex gap-2">
        <input name="startDate" type="date" value={form.startDate} onChange={handleChange} className="border rounded px-2 py-1 w-1/2" />
        <input name="endDate" type="date" value={form.endDate} onChange={handleChange} className="border rounded px-2 py-1 w-1/2" />
      </div>
      <input name="priority" type="number" min={1} max={10} value={form.priority} onChange={handleChange} className="border rounded px-2 py-1 w-24" placeholder="优先级" />
      <select value={form.parentId} onChange={e => setForm(f => ({ ...f, parentId: e.target.value }))} className="border rounded px-2 py-1 w-full">
        <option value="">无父目标</option>
        {objectives.map(obj => (
          <option key={obj.id} value={obj.id}>{obj.title}</option>
        ))}
      </select>
      {/* 如果有 children，则用作底部操作区，否则渲染默认按钮 */}
      {children ? (
        <>{children}</>
      ) : (
        <div className="flex justify-end gap-2">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? (mode === "edit" ? "保存中..." : "创建中...") : (mode === "edit" ? "保存修改" : "创建目标")}
          </button>
          <button type="button" ref={closeRef} data-close="true" className="btn btn-secondary" onClick={() => {}}>
            取消
          </button>
        </div>
      )}
    </form>
  );
};

export default NewObjectiveForm;
