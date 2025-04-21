/**
 * AI生成API
 * 
 * 使用提示库生成AI回复的通用API端点。
 */

import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";
import { getPrompt, PromptType } from "@/lib/prompts";
import { NextResponse } from "next/server";

export const runtime = "edge"; // 使用Edge运行时提高性能

export async function POST(req: Request) {
  try {
    const { promptType, params, model = "gpt-4" } = await req.json();
    
    // 验证提示类型
    if (!promptType || typeof promptType !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid promptType" },
        { status: 400 }
      );
    }
    
    // 获取提示模板
    const promptTemplate = getPrompt(promptType as PromptType);
    if (!promptTemplate) {
      return NextResponse.json(
        { error: `Invalid prompt type: ${promptType}` },
        { status: 400 }
      );
    }
    
    // 验证参数
    if (!params || typeof params !== "object") {
      return NextResponse.json(
        { error: "Missing or invalid params" },
        { status: 400 }
      );
    }
    
    // 生成文本
    const { text } = await generateText({
      model: openai(model),
      prompt: promptTemplate(params),
      temperature: 0.7, // 可以根据需要调整
      maxTokens: 1000, // 可以根据需要调整
    });
    
    return NextResponse.json({ response: text });
  } catch (error) {
    console.error("Error generating text:", error);
    return NextResponse.json(
      { error: "Failed to generate text" },
      { status: 500 }
    );
  }
}
