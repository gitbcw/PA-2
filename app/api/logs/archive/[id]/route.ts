import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// 删除指定的归档日志
export async function DELETE(
  req: NextRequest,
  context: { params: { id: string } }
) {
  try {
    // 验证用户会话
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const logId = context.params.id;

    // 检查日志是否存在
    const log = await prisma.logArchive.findUnique({
      where: { id: logId },
    });

    if (!log) {
      return NextResponse.json({ error: 'Log not found' }, { status: 404 });
    }

    // 删除日志
    await prisma.logArchive.delete({
      where: { id: logId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting archived log:', error);
    return NextResponse.json(
      { error: 'Failed to delete archived log' },
      { status: 500 }
    );
  }
}
