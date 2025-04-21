"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2, Save, Upload } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export default function FileImport() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setTitle(e.target.files[0].name.split('.')[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error("请选择文件");
      return;
    }
    
    setIsUploading(true);
    setUploadProgress(0);
    
    const formData = new FormData();
    formData.append("file", file);
    
    try {
      const xhr = new XMLHttpRequest();
      
      xhr.upload.addEventListener("progress", (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          setUploadProgress(progress);
        }
      });
      
      xhr.addEventListener("load", async () => {
        if (xhr.status === 200) {
          const data = JSON.parse(xhr.responseText);
          setContent(data.content || "");
          toast.success("文件已解析");
        } else {
          throw new Error("上传失败");
        }
        setIsUploading(false);
      });
      
      xhr.addEventListener("error", () => {
        toast.error("上传失败，请重试");
        setIsUploading(false);
      });
      
      xhr.open("POST", "/api/input/file");
      xhr.send(formData);
    } catch (error) {
      console.error("上传失败:", error);
      toast.error("上传失败，请重试");
      setIsUploading(false);
    }
  };

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) {
      toast.error("标题和内容不能为空");
      return;
    }
    
    setIsSaving(true);
    
    try {
      const response = await fetch("/api/input/text", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          content,
          tags: tags.split(",").map(tag => tag.trim()).filter(tag => tag),
          source: file?.name,
        }),
      });
      
      if (!response.ok) {
        throw new Error("保存失败");
      }
      
      toast.success("内容已保存");
      setTitle("");
      setContent("");
      setTags("");
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("保存失败:", error);
      toast.error("保存失败，请重试");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="file">选择文件</Label>
            <div className="flex space-x-2">
              <Input
                ref={fileInputRef}
                id="file"
                type="file"
                onChange={handleFileChange}
                className="flex-1"
                accept=".txt,.md,.pdf,.docx,.doc,.csv,.json"
              />
              <Button onClick={handleUpload} disabled={isUploading || !file}>
                {isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    上传中...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    上传
                  </>
                )}
              </Button>
            </div>
          </div>
          
          {isUploading && (
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>上传进度</span>
                <span>{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} />
            </div>
          )}
          
          {file && (
            <div className="text-sm text-muted-foreground">
              文件名: {file.name}<br />
              大小: {(file.size / 1024).toFixed(2)} KB<br />
              类型: {file.type || "未知"}
            </div>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="title">标题</Label>
            <Input
              id="title"
              placeholder="文档标题"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="content">内容</Label>
            <Textarea
              id="content"
              placeholder="文档内容"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[300px] resize-y"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="tags">标签（用逗号分隔）</Label>
            <Input
              id="tags"
              placeholder="标签1, 标签2, 标签3..."
              value={tags}
              onChange={(e) => setTags(e.target.value)}
            />
          </div>
        </CardContent>
        
        <CardFooter>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                保存中...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                保存
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
