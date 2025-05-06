import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// PATCH /api/objectives/[id]
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const data = await req.json();
  try {
    const updated = await prisma.objective.update({
      where: { id },
      data,
    });
    return NextResponse.json(updated);
  } catch (e) {
    return NextResponse.json({ error: "更新失败" }, { status: 500 });
  }
}

// DELETE /api/objectives/[id]
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  try {
    await prisma.objective.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
