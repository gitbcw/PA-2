import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/objectives?type=GOAL|TASK
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");
  const where = type ? { type } : {};
  const objectives = await prisma.objective.findMany({ where });
  return NextResponse.json(objectives);
}

// POST /api/objectives
export async function POST(req: NextRequest) {
  const data = await req.json();
  const objective = await prisma.objective.create({ data });
  return NextResponse.json(objective);
}
