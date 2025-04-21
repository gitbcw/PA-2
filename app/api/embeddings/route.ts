import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getGeekAIEmbeddings } from "@/lib/embeddings";
import { GeekAIEmbeddings, MultiModalInput } from "@/lib/embeddings-geekai";
import { env } from "@/lib/env";

export async function POST(req: NextRequest) {
  try {
    // 验证用户会话
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { input, type = "text" } = body;

    if (!input) {
      return NextResponse.json(
        { error: "Input is required" },
        { status: 400 }
      );
    }

    // 获取嵌入模型实例
    const embeddings = getGeekAIEmbeddings();
    let result;

    if (type === "text") {
      // 文本嵌入
      if (Array.isArray(input)) {
        // 多行文本
        result = await embeddings.embedDocuments(input);
      } else {
        // 单行文本
        result = await embeddings.embedQuery(input);
      }
    } else if (type === "multimodal") {
      // 多模态嵌入
      if (!Array.isArray(input)) {
        return NextResponse.json(
          { error: "Multimodal input must be an array" },
          { status: 400 }
        );
      }

      result = await embeddings.embedMultiModal(input as MultiModalInput[]);
    } else {
      return NextResponse.json(
        { error: "Invalid input type" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      embeddings: result,
      dimensions: Array.isArray(result)
        ? (result[0]?.length || 0)
        : (result?.length || 0)
    });
  } catch (error) {
    console.error("Embedding error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
