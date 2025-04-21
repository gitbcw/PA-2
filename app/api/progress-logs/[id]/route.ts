import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "../../../../app/generated/prisma";
import { z } from "zod";

// 创建 Prisma 客户端
const prisma = new PrismaClient();

// 进度日志更新验证模式
const progressLogUpdateSchema = z.object({
  progress: z.number().min(0).max(100).optional(),
  note: z.string().optional(),
});

// 获取单个进度日志
export async function GET(
  req: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const progressLogId = context.params.id;

    const progressLog = await prisma.progressLog.findUnique({
      where: { id: progressLogId },
      include: {
        task: {
          select: {
            id: true,
            title: true,
            status: true,
          },
        },
        goal: {
          select: {
            id: true,
            title: true,
            status: true,
          },
        },
      },
    });

    if (!progressLog) {
      return NextResponse.json(
        { error: "Progress log not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(progressLog);
  } catch (error) {
    console.error("Error fetching progress log:", error);
    return NextResponse.json(
      { error: "Failed to fetch progress log" },
      { status: 500 }
    );
  }
}

// 更新进度日志
export async function PUT(
  req: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const progressLogId = context.params.id;
    const body = await req.json();

    // 验证请求数据
    const validation = progressLogUpdateSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors },
        { status: 400 }
      );
    }

    // 检查进度日志是否存在
    const progressLog = await prisma.progressLog.findUnique({
      where: { id: progressLogId },
    });

    if (!progressLog) {
      return NextResponse.json(
        { error: "Progress log not found" },
        { status: 404 }
      );
    }

    const { progress, note } = validation.data;

    // 更新进度日志
    const updatedProgressLog = await prisma.progressLog.update({
      where: { id: progressLogId },
      data: {
        progress: progress !== undefined ? progress : undefined,
        note,
      },
      include: {
        task: progressLog.taskId ? {
          select: {
            id: true,
            title: true,
            status: true,
          },
        } : undefined,
        goal: progressLog.goalId ? {
          select: {
            id: true,
            title: true,
            status: true,
          },
        } : undefined,
      },
    });

    // 如果进度有变化且有关联任务，同时更新任务状态
    if (progress !== undefined && progressLog.taskId) {
      // 如果进度为100%，将任务状态更新为已完成
      if (progress === 100) {
        await prisma.task.update({
          where: { id: progressLog.taskId },
          data: {
            status: "COMPLETED",
          },
        });
      }
      // 如果进度大于0%但小于100%，将任务状态更新为进行中
      else if (progress > 0) {
        await prisma.task.update({
          where: { id: progressLog.taskId },
          data: {
            status: "IN_PROGRESS",
          },
        });
      }
    }

    // 如果进度有变化且有关联目标，同时更新目标进度
    if (progress !== undefined && progressLog.goalId) {
      await prisma.goal.update({
        where: { id: progressLog.goalId },
        data: {
          progress,
          // 如果进度为100%，将目标状态更新为已完成
          ...(progress === 100 ? { status: "COMPLETED" } : {}),
        },
      });
    }

    return NextResponse.json(updatedProgressLog);
  } catch (error) {
    console.error("Error updating progress log:", error);
    return NextResponse.json(
      { error: "Failed to update progress log" },
      { status: 500 }
    );
  }
}

// 删除进度日志
export async function DELETE(
  req: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const progressLogId = context.params.id;

    // 检查进度日志是否存在
    const progressLog = await prisma.progressLog.findUnique({
      where: { id: progressLogId },
    });

    if (!progressLog) {
      return NextResponse.json(
        { error: "Progress log not found" },
        { status: 404 }
      );
    }

    // 删除进度日志
    await prisma.progressLog.delete({
      where: { id: progressLogId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting progress log:", error);
    return NextResponse.json(
      { error: "Failed to delete progress log" },
      { status: 500 }
    );
  }
}
