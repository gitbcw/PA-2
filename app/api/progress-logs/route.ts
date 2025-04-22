import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "../../../app/generated/prisma";
import { z } from "zod";

// 模拟AI分析功能
const analyzeProgress = async (taskId: string | undefined, goalId: string | undefined, progress: number, note: string) => {
  // 实际实现中，这里应该调用AI服务进行分析
  // 返回分析结果
  return {
    insights: [
      {
        type: "progress",
        content: progress < 30 ? "进度较慢，可能需要额外支持" :
          progress < 70 ? "进度正常，继续保持" :
            "进度良好，即将完成",
      },
      {
        type: "suggestion",
        content: note.length > 0 ?
          `根据备注内容，建议关注: ${note.substring(0, 50)}${note.length > 50 ? "..." : ""}` :
          "没有提供详细备注，建议添加更多信息以便更好地跟踪进度",
      }
    ],
    suggestedTasks: note.length > 0 ? [
      {
        title: `跟进: ${note.substring(0, 30)}${note.length > 30 ? "..." : ""}`,
        description: note,
        priority: "MEDIUM",
      }
    ] : [],
  };
};

// 创建 Prisma 客户端
const prisma = new PrismaClient();

// 进度日志创建验证模式
const progressLogCreateSchema = z.object({
  progress: z.number().min(0).max(100),
  note: z.string().optional(),
  userId: z.string(),
  taskId: z.string().optional(),
  goalId: z.string().optional(),
});

// 获取进度日志
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const taskId = searchParams.get("taskId");
    const goalId = searchParams.get("goalId");
    const date = searchParams.get("date");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // 构建查询条件
    const where: any = { userId };

    if (taskId) {
      where.taskId = taskId;
    }

    if (goalId) {
      where.goalId = goalId;
    }

    if (date) {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);

      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);

      where.createdAt = {
        gte: startDate,
        lte: endDate,
      };
    }

    const progressLogs = await prisma.progressLog.findMany({
      where,
      include: {
        task: taskId ? {
          select: {
            id: true,
            title: true,
            status: true,
          },
        } : undefined,
        goal: goalId ? {
          select: {
            id: true,
            title: true,
            status: true,
          },
        } : undefined,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(progressLogs);
  } catch (error) {
    console.error("Error fetching progress logs:", error);
    return NextResponse.json(
      { error: "Failed to fetch progress logs" },
      { status: 500 }
    );
  }
}

// 创建进度日志
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // 验证请求数据
    const validation = progressLogCreateSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors },
        { status: 400 }
      );
    }

    const {
      progress,
      note,
      userId,
      taskId,
      goalId,
    } = validation.data;

    // 至少需要提供 taskId 或 goalId 中的一个
    if (!taskId && !goalId) {
      return NextResponse.json(
        { error: "Either taskId or goalId must be provided" },
        { status: 400 }
      );
    }

    // 使用AI分析进度
    const analysisResult = await analyzeProgress(taskId, goalId, progress, note || "");

    // 创建进度日志
    const progressLog = await prisma.progressLog.create({
      data: {
        progress,
        note,
        userId,
        taskId,
        goalId,
        // 存储AI分析结果
        metadata: {
          aiAnalysis: analysisResult
        },
      },
      include: {
        task: taskId ? {
          select: {
            id: true,
            title: true,
            status: true,
          },
        } : undefined,
        goal: goalId ? {
          select: {
            id: true,
            title: true,
            status: true,
          },
        } : undefined,
      },
    });

    // 如果是任务进度更新，同时更新任务状态
    if (taskId) {
      // 如果进度为100%，将任务状态更新为已完成
      if (progress === 100) {
        await prisma.task.update({
          where: { id: taskId },
          data: {
            status: "COMPLETED",
          },
        });
      }
      // 如果进度大于0%但小于100%，将任务状态更新为进行中
      else if (progress > 0) {
        await prisma.task.update({
          where: { id: taskId },
          data: {
            status: "IN_PROGRESS",
          },
        });
      }
    }

    // 如果是目标进度更新，同时更新目标进度
    if (goalId) {
      await prisma.goal.update({
        where: { id: goalId },
        data: {
          progress,
          // 如果进度为100%，将目标状态更新为已完成
          ...(progress === 100 ? { status: "COMPLETED" } : {}),
        },
      });
    }

    // 如果AI分析建议创建新任务，自动创建
    if (analysisResult.suggestedTasks && analysisResult.suggestedTasks.length > 0) {
      // 在实际实现中，可以根据需要决定是否自动创建任务
      // 这里只是记录建议，不自动创建
      console.log("AI suggested tasks:", analysisResult.suggestedTasks);

      // 如果需要自动创建任务，可以取消下面的注释
      /*
      for (const taskSuggestion of analysisResult.suggestedTasks) {
        await prisma.task.create({
          data: {
            title: taskSuggestion.title,
            description: taskSuggestion.description,
            priority: taskSuggestion.priority,
            status: "TODO",
            userId,
            // 如果是任务的进度更新，将新任务关联到同一个目标
            goalId: taskId ? (await prisma.task.findUnique({ where: { id: taskId }, select: { goalId: true } }))?.goalId : goalId,
          }
        });
      }
      */
    }

    return NextResponse.json(progressLog, { status: 201 });
  } catch (error) {
    console.error("Error creating progress log:", error);
    return NextResponse.json(
      { error: "Failed to create progress log" },
      { status: 500 }
    );
  }
}
