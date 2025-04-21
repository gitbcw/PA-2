import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { PrismaClient } from "@/app/generated/prisma";

// 创建 Prisma 客户端实例
const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "未授权访问" },
        { status: 401 }
      );
    }

    const { title, content, tags, source } = await req.json();

    if (!title || !content) {
      return NextResponse.json(
        { error: "标题和内容不能为空" },
        { status: 400 }
      );
    }

    // 获取用户ID
    const user = await prisma.user.findUnique({
      where: { email: session.user.email as string },
    });

    if (!user) {
      return NextResponse.json(
        { error: "用户不存在" },
        { status: 404 }
      );
    }

    // 创建消息
    const message = await prisma.message.create({
      data: {
        content,
        sourceType: "INPUT",
        sourceId: source || null,
        userId: user.id,
        metadata: {
          title,
          inputType: "text",
        },
      },
    });

    // 处理标签
    if (tags && tags.length > 0) {
      for (const tagName of tags) {
        try {
          // 先查找是否存在相同名称的标签
          let tag = await prisma.tag.findFirst({
            where: { name: tagName }
          });

          // 如果标签不存在，则创建新标签
          if (!tag) {
            tag = await prisma.tag.create({
              data: {
                name: tagName,
              },
            });
          }

          // 关联标签和消息
          await prisma.message.update({
            where: { id: message.id },
            data: {
              tags: {
                connect: { id: tag.id }
              }
            }
          });
        } catch (error) {
          console.error(`标签处理失败: ${error}`);
        }
      }
    }

    return NextResponse.json(
      { success: true, messageId: message.id },
      { status: 200 }
    );
  } catch (error) {
    console.error("保存文本失败:", error);
    return NextResponse.json(
      { error: "服务器错误" },
      { status: 500 }
    );
  }
}
