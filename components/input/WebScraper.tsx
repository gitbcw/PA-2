"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2, Save, Download } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";

export default function WebScraper() {
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [extractImages, setExtractImages] = useState(false);
  const [extractLinks, setExtractLinks] = useState(false);

  const handleFetch = async () => {
    if (!url.trim()) {
      toast.error("请输入有效的URL");
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await fetch("/api/input/scrape", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url,
          extractImages,
          extractLinks,
        }),
      });
      
      if (!response.ok) {
        throw new Error("抓取失败");
      }
      
      const data = await response.json();
      
      setTitle(data.title || "");
      setContent(data.content || "");
      
      toast.success("网页内容已抓取");
    } catch (error) {
      console.error("抓取失败:", error);
      toast.error("抓取失败，请检查URL是否有效");
    } finally {
      setIsLoading(false);
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
          source: url,
        }),
      });
      
      if (!response.ok) {
        throw new Error("保存失败");
      }
      
      toast.success("内容已保存");
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
            <Label htmlFor="url">网页URL</Label>
            <div className="flex space-x-2">
              <Input
                id="url"
                placeholder="https://example.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="flex-1"
              />
              <Button onClick={handleFetch} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    抓取中...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    抓取
                  </>
                )}
              </Button>
            </div>
          </div>
          
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="extractImages" 
                checked={extractImages}
                onCheckedChange={(checked) => setExtractImages(!!checked)}
              />
              <Label htmlFor="extractImages">提取图片</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="extractLinks" 
                checked={extractLinks}
                onCheckedChange={(checked) => setExtractLinks(!!checked)}
              />
              <Label htmlFor="extractLinks">保留链接</Label>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="title">标题</Label>
            <Input
              id="title"
              placeholder="网页标题"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="content">内容</Label>
            <Textarea
              id="content"
              placeholder="网页内容"
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
