/**
 * LangChain API路由
 * 
 * 使用LangChain提示模板生成AI回复的API端点。
 */

import { NextRequest, NextResponse } from "next/server";
import { ChatOpenAI } from "@langchain/openai";
import { getPrompt } from "@/lib/prompts";

export const runtime = "edge"; // 使用Edge运行时提高性能

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { promptType, params, model = "gpt-4o-mini", temperature = 0.7 } = body;
    
    // 验证提示类型
    if (!promptType || typeof promptType !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid promptType" },
        { status: 400 }
      );
    }
    
    // 获取提示模板
    const promptTemplate = getPrompt(promptType);
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
    
    // 创建LLM
    const llm = new ChatOpenAI({
      model,
      temperature,
    });
    
    // 创建并执行链
    const chain = promptTemplate.pipe(llm);
    const result = await chain.invoke(params);
    
    return NextResponse.json({ 
      response: result.content,
      model,
      promptType
    });
    
  } catch (error) {
    console.error("Error generating text:", error);
    return NextResponse.json(
      { error: "Failed to generate text", details: (error as Error).message },
      { status: 500 }
    );
  }
}
