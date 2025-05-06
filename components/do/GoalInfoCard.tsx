"use client";
import { Calendar, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { formatLocalDate } from "@/utils/date";

interface GoalInfoCardProps {
  title: string;
  endDate: string;
}

export default function GoalInfoCard({ title, endDate }: GoalInfoCardProps) {
  const isOverdue = new Date() > new Date(endDate);
  return (
    <Card className="mb-2">
      <CardContent className="flex items-center gap-3 py-4">
        <div className="flex-1">
          <div className="text-lg font-bold">{title}</div>
          <div className="flex items-center text-sm text-muted-foreground">
            <Calendar className="h-4 w-4 mr-1" />
            截止日期：{formatLocalDate(endDate)}
          </div>
        </div>
        {isOverdue && (
          <div className="flex items-center text-red-600 font-medium">
            <AlertCircle className="h-5 w-5 mr-1" />已逾期
          </div>
        )}
      </CardContent>
    </Card>
  );
}
