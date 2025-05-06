"use client";
import { format } from "date-fns";

export interface GoalRecord {
  id: string;
  content: string;
  createdAt: string;
}

interface GoalRecordListProps {
  records: GoalRecord[];
}

export default function GoalRecordList({ records }: GoalRecordListProps) {
  return (
    <div className="mt-2">
      {records.length === 0 ? (
        <div className="text-muted-foreground text-center py-4">暂无记录</div>
      ) : (
        <ul className="space-y-2">
          {records.map(record => (
            <li key={record.id} className="border rounded p-2 bg-muted">
              <div className="text-sm whitespace-pre-wrap">{record.content}</div>
              <div className="text-xs text-muted-foreground text-right mt-1">
                {format(new Date(record.createdAt), 'yyyy-MM-dd HH:mm')}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
