import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "../../../app/generated/prisma";
import { z } from "zod";
import { getServerSession } from "next-auth";

// 直接在 API 路由中创建 Prisma 客户端
const prisma = new PrismaClient();

// 添加调试日志
console.log("Created new PrismaClient instance in goals API with correct import path");

// 目标创建验证模式
const goalCreateSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  level: z.enum(["VISION", "YEARLY", "QUARTERLY", "MONTHLY", "WEEKLY", "DAILY"]).optional(),
  status: z.enum(["ACTIVE", "COMPLETED", "CANCELLED", "ARCHIVED"]).optional(),
  startDate: z.string(),
  endDate: z.string(),
  userId: z.string(),
  parentId: z.string().optional().nullable(),
  tags: z.array(z.string()).optional(),
  metrics: z.array(z.any()).optional(),
  resources: z.array(z.any()).optional(),
  priority: z.number().int().min(1).max(10).optional(),
  weight: z.number().min(0).max(1).optional(),
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // 获取当前用户的会话信息
    const session = await getServerSession(req);

    // 如果用户未登录或者请求的用户ID与当前用户不匹配，返回错误
    // 注意：在个人使用版本中，可以暂时注释这个检查
    /*
    if (!session?.user || session.user.id !== userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }
    */

    const goals = await prisma.goal.findMany({
      where: {
        userId: userId,
      },
      include: {
        tags: true,
        parent: {
          select: {
            id: true,
            title: true,
          },
        },
        tasks: {
          select: {
            id: true,
            title: true,
            status: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(goals);
  } catch (error) {
    console.error("Error fetching goals:", error);
    return NextResponse.json(
      { error: "Failed to fetch goals" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // 验证请求数据
    const validation = goalCreateSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors },
        { status: 400 }
      );
    }

    const {
      title,
      description,
      level,
      status,
      startDate,
      endDate,
      userId,
      parentId,
      tags: tagIds,
      metrics,
      resources,
      priority,
      weight
    } = validation.data;

    // 验证用户是否存在
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // 如果提供了父目标ID，验证父目标是否存在
    // 确保 parentId 不是空字符串
    const validParentId = parentId && parentId.trim() !== '' ? parentId : null;

    if (validParentId) {
      const parentGoal = await prisma.goal.findUnique({
        where: { id: validParentId },
      });

      if (!parentGoal) {
        return NextResponse.json(
          { error: "Parent goal not found" },
          { status: 404 }
        );
      }
    }

    // 如果提供了标签，验证标签是否存在
    if (tagIds && tagIds.length > 0) {
      const tags = await prisma.tag.findMany({
        where: {
          id: { in: tagIds }
        },
        select: { id: true }
      });

      // 检查是否所有标签都存在
      const foundTagIds = tags.map(tag => tag.id);
      const missingTagIds = tagIds.filter(id => !foundTagIds.includes(id));

      if (missingTagIds.length > 0) {
        return NextResponse.json(
          { error: `Tags not found: ${missingTagIds.join(', ')}` },
          { status: 404 }
        );
      }
    }

    // 创建目标
    const goal = await prisma.goal.create({
      data: {
        title,
        description,
        level: level || "MONTHLY",
        status: status || "ACTIVE",
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        userId,
        // 只在提供了有效的父目标ID时才包含该字段
        ...(validParentId ? { parentId: validParentId } : {}),
        metrics: metrics ? JSON.stringify(metrics) : undefined,
        resources: resources ? JSON.stringify(resources) : undefined,
        priority: priority || 1,
        weight: weight || 1.0,
        ...(tagIds && tagIds.length > 0
          ? {
            tags: {
              connect: tagIds.map((id) => ({ id })),
            },
          }
          : {}),
      },
      include: {
        tags: true,
      },
    });

    return NextResponse.json(goal, { status: 201 });
  } catch (error) {
    console.error("Error creating goal:", error);
    // 返回更详细的错误信息
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      {
        error: "Failed to create goal",
        details: errorMessage,
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
