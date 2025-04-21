"use client";

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Upload, File, X } from 'lucide-react';

export default function FileUploader({ onUploadSuccess }: { onUploadSuccess?: () => void }) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error('请选择要上传的文件');
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('description', description);
      formData.append('tags', tags);

      const response = await fetch('/api/files/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || '上传失败');
      }

      toast.success('文件上传成功');

      // 重置表单
      setSelectedFile(null);
      setDescription('');
      setTags('');

      // 重置文件输入控件
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      // 通知父组件刷新文件列表
      if (onUploadSuccess) {
        onUploadSuccess();
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('文件上传失败');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg">
      <div className="space-y-2">
        <Label htmlFor="file">选择文件</Label>
        <div className="flex items-center gap-2">
          <Input
            id="file"
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="flex-1"
          />
          {selectedFile && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSelectedFile(null)}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        {selectedFile && (
          <p className="text-sm text-muted-foreground">
            已选择: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(2)} KB)
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">文件描述 (可选)</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="添加文件描述..."
          rows={2}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="tags">标签 (可选，用逗号分隔)</Label>
        <Input
          id="tags"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="标签1, 标签2, 标签3..."
        />
      </div>

      <Button
        onClick={handleUpload}
        disabled={!selectedFile || isUploading}
        className="w-full"
      >
        {isUploading ? (
          <span>上传中...</span>
        ) : (
          <>
            <Upload className="h-4 w-4 mr-2" />
            上传文件
          </>
        )}
      </Button>
    </div>
  );
}
