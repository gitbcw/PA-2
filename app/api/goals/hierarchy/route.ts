import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const goalId = searchParams.get("goalId");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // 获取用户的所有目标
    const goals = await prisma.goal.findMany({
      where: {
        userId: userId,
      },
      select: {
        id: true,
        title: true,
        level: true,
        status: true,
        parentId: true,
        progress: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // 如果指定了目标ID，则构建以该目标为中心的层次结构
    if (goalId) {
      // 查找目标
      const targetGoal = goals.find(g => g.id === goalId);
      if (!targetGoal) {
        return NextResponse.json(
          { error: "Goal not found" },
          { status: 404 }
        );
      }

      // 构建目标层次结构
      const hierarchy = buildGoalHierarchy(goals, goalId);
      return NextResponse.json(hierarchy);
    }

    // 如果没有指定目标ID，则构建完整的目标层次结构
    const rootGoals = goals.filter(g => !g.parentId);
    const hierarchies = rootGoals.map(rootGoal => 
      buildGoalHierarchy(goals, rootGoal.id)
    );

    return NextResponse.json(hierarchies);
  } catch (error) {
    console.error("Error fetching goal hierarchy:", error);
    return NextResponse.json(
      { error: "Failed to fetch goal hierarchy" },
      { status: 500 }
    );
  }
}

// 构建目标层次结构
function buildGoalHierarchy(goals: any[], rootId: string) {
  const rootGoal = goals.find(g => g.id === rootId);
  if (!rootGoal) return null;

  // 递归构建子目标
  const buildChildren = (parentId: string) => {
    const children = goals.filter(g => g.parentId === parentId);
    return children.map(child => ({
      ...child,
      children: buildChildren(child.id)
    }));
  };

  return {
    ...rootGoal,
    children: buildChildren(rootId)
  };
}
