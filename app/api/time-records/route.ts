import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "../../../app/generated/prisma";
import { z } from "zod";

// 创建 Prisma 客户端
const prisma = new PrismaClient();

// 时间记录创建验证模式
const timeRecordCreateSchema = z.object({
  startTime: z.string(),
  endTime: z.string().optional(),
  duration: z.number().optional(),
  note: z.string().optional(),
  userId: z.string(),
  taskId: z.string(),
});

// 获取时间记录
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const taskId = searchParams.get("taskId");
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

    if (date) {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
      
      where.startTime = {
        gte: startDate,
        lte: endDate,
      };
    }

    const timeRecords = await prisma.timeRecord.findMany({
      where,
      include: {
        task: {
          select: {
            id: true,
            title: true,
            status: true,
          },
        },
      },
      orderBy: {
        startTime: "desc",
      },
    });

    return NextResponse.json(timeRecords);
  } catch (error) {
    console.error("Error fetching time records:", error);
    return NextResponse.json(
      { error: "Failed to fetch time records" },
      { status: 500 }
    );
  }
}

// 创建时间记录
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // 验证请求数据
    const validation = timeRecordCreateSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors },
        { status: 400 }
      );
    }

    const {
      startTime,
      endTime,
      duration,
      note,
      userId,
      taskId,
    } = validation.data;

    // 创建时间记录
    const timeRecord = await prisma.timeRecord.create({
      data: {
        startTime: new Date(startTime),
        endTime: endTime ? new Date(endTime) : undefined,
        duration,
        note,
        userId,
        taskId,
      },
      include: {
        task: {
          select: {
            id: true,
            title: true,
            status: true,
            totalTime: true,
          },
        },
      },
    });

    // 如果有持续时间，更新任务的总时间
    if (duration) {
      await prisma.task.update({
        where: { id: taskId },
        data: {
          totalTime: {
            increment: duration,
          },
        },
      });
    }

    return NextResponse.json(timeRecord, { status: 201 });
  } catch (error) {
    console.error("Error creating time record:", error);
    return NextResponse.json(
      { error: "Failed to create time record" },
      { status: 500 }
    );
  }
}
