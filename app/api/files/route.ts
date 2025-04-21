import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    // 验证用户会话
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    // 获取查询参数
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // 获取用户的文件列表
    const files = await prisma.importedFile.findMany({
      where: {
        userId,
      },
      orderBy: {
        uploadedAt: 'desc',
      },
      take: limit,
      skip: offset,
    });

    // 获取总数
    const total = await prisma.importedFile.count({
      where: {
        userId,
      },
    });

    return NextResponse.json({
      files,
      total,
      limit,
      offset,
    });
  } catch (error) {
    console.error('Error fetching files:', error);
    return NextResponse.json(
      { error: 'Failed to fetch files' },
      { status: 500 }
    );
  }
}
