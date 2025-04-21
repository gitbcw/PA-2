'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Calendar, Search, Archive, RefreshCw, Trash2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface LogArchive {
  id: string;
  content: string;
  logDate: string;
  archiveDate: string;
  year: number;
  month: number;
  day: number;
  tags: string[];
}

export default function LogArchivePage() {
  const [logs, setLogs] = useState<LogArchive[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [year, setYear] = useState<string>('');
  const [month, setMonth] = useState<string>('');

  // 删除归档日志
  const deleteLog = async (logId: string) => {
    try {
      const response = await fetch(`/api/logs/archive/${logId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete log');
      }

      toast.success('日志已删除');

      // 从列表中移除已删除的日志
      setLogs(prevLogs => prevLogs.filter(log => log.id !== logId));
    } catch (error) {
      console.error('Error deleting log:', error);
      toast.error('删除日志失败');
    }
  };

  // 加载归档日志
  const loadLogs = async () => {
    try {
      setLoading(true);

      let url = '/api/logs/archive';
      const params = new URLSearchParams();

      if (year) {
        params.append('year', year);
        if (month) {
          params.append('month', month);
        }
      }

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error('Failed to load archived logs');
      }

      const data = await response.json();
      setLogs(data.logs);
    } catch (error) {
      console.error('Error loading logs:', error);
      toast.error('加载归档日志失败');
    } finally {
      setLoading(false);
    }
  };

  // 手动触发归档
  const triggerArchive = async () => {
    try {
      const response = await fetch('/api/logs/archive', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to trigger archive');
      }

      const data = await response.json();
      toast.success(`已归档 ${data.archivedCount} 条日志`);

      // 重新加载日志
      loadLogs();
    } catch (error) {
      console.error('Error triggering archive:', error);
      toast.error('触发归档失败');
    }
  };

  // 格式化日期
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // 筛选日志
  const filteredLogs = logs.filter(log => {
    return (
      log.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });

  // 初始加载
  useEffect(() => {
    loadLogs();
  }, [year, month]);

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">日志归档管理</h1>
        <div className="flex gap-2">
          <Button onClick={triggerArchive} variant="outline">
            <Archive className="h-4 w-4 mr-2" />
            归档当前日志
          </Button>
          <Button onClick={loadLogs} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            刷新
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>归档日志查询</CardTitle>
          <CardDescription>查询和筛选已归档的日志</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 space-y-2">
              <Label htmlFor="search">搜索内容或标签</Label>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="搜索日志内容或标签..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-32 space-y-2">
                <Label htmlFor="year">年份</Label>
                <Input
                  id="year"
                  placeholder="年份"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                />
              </div>

              <div className="w-24 space-y-2">
                <Label htmlFor="month">月份</Label>
                <Input
                  id="month"
                  placeholder="月份"
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                />
              </div>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">加载中...</p>
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">没有找到匹配的日志</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredLogs.map((log) => (
                <Card key={log.id} className="overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3 mr-1" />
                        <span>日志日期: {formatDate(log.logDate)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-sm text-muted-foreground">
                          归档于: {formatDate(log.archiveDate)}
                        </div>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>确认删除日志</AlertDialogTitle>
                              <AlertDialogDescription>
                                您确定要删除这条归档日志吗？此操作无法撤销。
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>取消</AlertDialogCancel>
                              <AlertDialogAction onClick={() => deleteLog(log.id)}>
                                删除
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>

                    <p className="mb-2">{log.content}</p>

                    <div className="flex flex-wrap gap-1 mt-2">
                      {log.tags.map((tag, index) => (
                        <Badge key={index} variant="outline">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
