import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// 允许的目标级别
const ALLOWED_LEVELS = ["DAILY", "WEEKLY", "MONTHLY"];

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  // 获取今天的起止时间
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
  const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

  // 查询今日目标
  const goals = await prisma.goal.findMany({
    where: {
      userId,
      level: { in: ALLOWED_LEVELS as any },
      startDate: { lte: endOfDay },
      endDate: { gte: startOfDay },
    },
    orderBy: [{ level: "asc" }, { endDate: "asc" }],
  });

  return NextResponse.json({ goals });
}
