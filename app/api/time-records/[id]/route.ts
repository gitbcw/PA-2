import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "../../../../app/generated/prisma";
import { z } from "zod";

// 创建 Prisma 客户端
const prisma = new PrismaClient();

// 时间记录更新验证模式
const timeRecordUpdateSchema = z.object({
  endTime: z.string().optional(),
  duration: z.number().optional(),
  note: z.string().optional(),
});

// 获取单个时间记录
export async function GET(
  req: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const timeRecordId = context.params.id;

    const timeRecord = await prisma.timeRecord.findUnique({
      where: { id: timeRecordId },
      include: {
        task: {
          select: {
            id: true,
            title: true,
            status: true,
          },
        },
      },
    });

    if (!timeRecord) {
      return NextResponse.json(
        { error: "Time record not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(timeRecord);
  } catch (error) {
    console.error("Error fetching time record:", error);
    return NextResponse.json(
      { error: "Failed to fetch time record" },
      { status: 500 }
    );
  }
}

// 更新时间记录
export async function PUT(
  req: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const timeRecordId = context.params.id;
    const body = await req.json();

    // 验证请求数据
    const validation = timeRecordUpdateSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors },
        { status: 400 }
      );
    }

    // 检查时间记录是否存在
    const timeRecord = await prisma.timeRecord.findUnique({
      where: { id: timeRecordId },
    });

    if (!timeRecord) {
      return NextResponse.json(
        { error: "Time record not found" },
        { status: 404 }
      );
    }

    const { endTime, duration, note } = validation.data;

    // 更新时间记录
    const updatedTimeRecord = await prisma.timeRecord.update({
      where: { id: timeRecordId },
      data: {
        endTime: endTime ? new Date(endTime) : undefined,
        duration,
        note,
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

    // 如果持续时间有变化，更新任务的总时间
    if (duration !== undefined && duration !== timeRecord.duration) {
      const oldDuration = timeRecord.duration || 0;
      const durationDiff = duration - oldDuration;

      await prisma.task.update({
        where: { id: timeRecord.taskId },
        data: {
          totalTime: {
            increment: durationDiff,
          },
        },
      });
    }

    return NextResponse.json(updatedTimeRecord);
  } catch (error) {
    console.error("Error updating time record:", error);
    return NextResponse.json(
      { error: "Failed to update time record" },
      { status: 500 }
    );
  }
}

// 删除时间记录
export async function DELETE(
  req: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const timeRecordId = context.params.id;

    // 检查时间记录是否存在
    const timeRecord = await prisma.timeRecord.findUnique({
      where: { id: timeRecordId },
    });

    if (!timeRecord) {
      return NextResponse.json(
        { error: "Time record not found" },
        { status: 404 }
      );
    }

    // 删除时间记录
    await prisma.timeRecord.delete({
      where: { id: timeRecordId },
    });

    // 如果有持续时间，更新任务的总时间
    if (timeRecord.duration) {
      await prisma.task.update({
        where: { id: timeRecord.taskId },
        data: {
          totalTime: {
            decrement: timeRecord.duration,
          },
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting time record:", error);
    return NextResponse.json(
      { error: "Failed to delete time record" },
      { status: 500 }
    );
  }
}
