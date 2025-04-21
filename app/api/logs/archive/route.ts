import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getArchivedLogs, archiveLogsBeforeDate } from '@/lib/logArchiver';

// 获取归档日志
export async function GET(req: NextRequest) {
  try {
    // 验证用户会话
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 获取查询参数
    const { searchParams } = new URL(req.url);
    const year = searchParams.get('year') ? parseInt(searchParams.get('year')!) : undefined;
    const month = searchParams.get('month') ? parseInt(searchParams.get('month')!) : undefined;
    const day = searchParams.get('day') ? parseInt(searchParams.get('day')!) : undefined;

    // 获取归档日志
    const logs = await getArchivedLogs(year, month, day);

    return NextResponse.json({ logs });
  } catch (error) {
    console.error('Error fetching archived logs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch archived logs' },
      { status: 500 }
    );
  }
}

// 手动触发归档
export async function POST(req: NextRequest) {
  try {
    // 验证用户会话
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 获取当前日期
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 归档今天之前的所有日志，忽略年份
    const archivedCount = await archiveLogsBeforeDate(today, true);

    return NextResponse.json({ success: true, archivedCount });
  } catch (error) {
    console.error('Error triggering log archive:', error);
    return NextResponse.json(
      { error: 'Failed to trigger log archive' },
      { status: 500 }
    );
  }
}
