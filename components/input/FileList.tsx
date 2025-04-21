"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toast } from 'sonner';
import { 
  Download, 
  Trash2, 
  Search, 
  FileText,
  Tag,
  Calendar,
  RefreshCw,
} from 'lucide-react';

interface ImportedFile {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  description: string | null;
  tags: string[];
  uploadedAt: string;
}

export default function FileList() {
  const [files, setFiles] = useState<ImportedFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // 加载文件列表
  const loadFiles = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/files');
      
      if (!response.ok) {
        throw new Error('Failed to load files');
      }
      
      const data = await response.json();
      setFiles(data.files);
    } catch (error) {
      console.error('Error loading files:', error);
      toast.error('加载文件列表失败');
    } finally {
      setLoading(false);
    }
  };
  
  // 下载文件
  const handleDownload = async (fileId: string) => {
    try {
      const response = await fetch(`/api/files/${fileId}/download`);
      
      if (!response.ok) {
        throw new Error('Failed to generate download link');
      }
      
      const data = await response.json();
      
      // 打开下载链接
      window.open(data.url, '_blank');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('文件下载失败');
    }
  };
  
  // 删除文件
  const handleDelete = async (fileId: string) => {
    if (!confirm('确定要删除这个文件吗？')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/files/${fileId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete file');
      }
      
      toast.success('文件已删除');
      loadFiles(); // 重新加载文件列表
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('文件删除失败');
    }
  };
  
  // 格式化文件大小
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };
  
  // 格式化日期
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };
  
  // 筛选文件
  const filteredFiles = files.filter(file => {
    const searchLower = searchTerm.toLowerCase();
    return (
      file.fileName.toLowerCase().includes(searchLower) ||
      (file.description && file.description.toLowerCase().includes(searchLower)) ||
      file.tags.some(tag => tag.toLowerCase().includes(searchLower))
    );
  });
  
  // 初始加载
  useEffect(() => {
    loadFiles();
  }, []);
  
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="搜索文件..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        <Button onClick={loadFiles} variant="outline" size="icon">
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>
      
      {loading ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">加载中...</p>
        </div>
      ) : filteredFiles.length === 0 ? (
        <div className="text-center py-8">
          <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">
            {searchTerm ? '没有找到匹配的文件' : '暂无上传的文件'}
          </p>
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[300px]">文件名</TableHead>
                <TableHead>类型</TableHead>
                <TableHead>大小</TableHead>
                <TableHead>标签</TableHead>
                <TableHead>上传时间</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredFiles.map((file) => (
                <TableRow key={file.id}>
                  <TableCell className="font-medium">
                    <div>
                      {file.fileName}
                      {file.description && (
                        <p className="text-sm text-muted-foreground truncate max-w-[280px]">
                          {file.description}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{file.fileType}</TableCell>
                  <TableCell>{formatFileSize(file.fileSize)}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {file.tags.map((tag, index) => (
                        <Badge key={index} variant="outline">
                          <Tag className="h-3 w-3 mr-1" />
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      {formatDate(file.uploadedAt)}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDownload(file.id)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(file.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
