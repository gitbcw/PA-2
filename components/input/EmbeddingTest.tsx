"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, FileText, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export default function EmbeddingTest() {
  const [activeTab, setActiveTab] = useState("text");
  const [textInput, setTextInput] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [inputMode, setInputMode] = useState<"single" | "multiple">("single");
  const [multipleTexts, setMultipleTexts] = useState("");

  const handleGenerateEmbedding = async () => {
    setIsProcessing(true);
    setResult(null);

    try {
      let input;
      let type = "text";

      if (activeTab === "text") {
        if (inputMode === "single") {
          input = textInput;
        } else {
          // 多行文本，按行分割
          input = multipleTexts.split("\n").filter(line => line.trim());
        }
      } else if (activeTab === "multimodal") {
        type = "multimodal";
        const inputs = [];

        if (textInput.trim()) {
          inputs.push({
            type: "text",
            text: textInput
          });
        }

        if (imageUrl.trim()) {
          inputs.push({
            type: "image_url",
            image_url: {
              url: imageUrl
            }
          });
        }

        if (videoUrl.trim()) {
          inputs.push({
            type: "video_url",
            video_url: {
              url: videoUrl
            }
          });
        }

        if (inputs.length === 0) {
          throw new Error("请至少提供一种输入（文本、图片或视频）");
        }

        input = inputs;
      }

      const response = await fetch("/api/embeddings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          input,
          type
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "生成嵌入向量失败");
      }

      const data = await response.json();
      setResult(data);
      toast.success("嵌入向量生成成功");
    } catch (error) {
      console.error("嵌入向量生成错误:", error);
      toast.error(error instanceof Error ? error.message : "生成嵌入向量失败");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>嵌入向量生成测试</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="text">
                <FileText className="h-4 w-4 mr-2" />
                文本嵌入
              </TabsTrigger>
              <TabsTrigger value="multimodal">
                <ImageIcon className="h-4 w-4 mr-2" />
                多模态嵌入
              </TabsTrigger>
            </TabsList>

            <TabsContent value="text" className="space-y-4">
              <div className="space-y-2">
                <Label>输入模式</Label>
                <RadioGroup
                  value={inputMode}
                  onValueChange={(value) => setInputMode(value as "single" | "multiple")}
                  className="flex space-x-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="single" id="single" />
                    <Label htmlFor="single">单行文本</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="multiple" id="multiple" />
                    <Label htmlFor="multiple">多行文本</Label>
                  </div>
                </RadioGroup>
              </div>

              {inputMode === "single" ? (
                <div className="space-y-2">
                  <Label htmlFor="text-input">文本内容</Label>
                  <Input
                    id="text-input"
                    placeholder="输入要生成嵌入向量的文本"
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                  />
                </div>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="multiple-texts">多行文本（每行一个文本）</Label>
                  <Textarea
                    id="multiple-texts"
                    placeholder="输入多行文本，每行将生成一个嵌入向量"
                    value={multipleTexts}
                    onChange={(e) => setMultipleTexts(e.target.value)}
                    className="min-h-[150px]"
                  />
                </div>
              )}
            </TabsContent>

            <TabsContent value="multimodal" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="multimodal-text">文本内容（可选）</Label>
                <Input
                  id="multimodal-text"
                  placeholder="输入文本内容"
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="image-url">图片URL（可选）</Label>
                <Input
                  id="image-url"
                  placeholder="输入图片URL"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="video-url">视频URL（可选，仅multimodal-embedding-v1模型支持）</Label>
                <Input
                  id="video-url"
                  placeholder="输入视频URL"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                />
              </div>
            </TabsContent>
          </Tabs>

          <div className="mt-4">
            <Button
              onClick={handleGenerateEmbedding}
              disabled={isProcessing}
              className="w-full"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  处理中...
                </>
              ) : (
                "生成嵌入向量"
              )}
            </Button>
          </div>

          {result && (
            <div className="mt-4 space-y-2">
              <div className="text-sm font-medium">嵌入向量维度: {result.dimensions}</div>
              <div className="text-sm">
                {Array.isArray(result.embeddings) ? (
                  <div>生成了 {result.embeddings.length} 个嵌入向量</div>
                ) : (
                  <div>生成了 1 个嵌入向量</div>
                )}
              </div>
              <div className="max-h-[200px] overflow-auto p-2 bg-muted rounded-md">
                <pre className="text-xs">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
