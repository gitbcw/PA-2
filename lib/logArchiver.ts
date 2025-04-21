// 这个文件只能在服务器端使用
// 添加 'server-only' 包确保这个模块只在服务器端导入
import 'server-only';

import { promises as fs } from 'fs';
import path from 'path';
import prisma from '@/lib/prisma';

// 日志文件路径
const LOG_FILE_PATH = path.join(process.cwd(), 'docs', 'log.md');

// 日志条目接口
interface LogEntry {
  date: Date;
  content: string;
  year: number;
  month: number;
  day: number;
  tags: string[];
}

/**
 * 解析日志文件内容
 * @returns 解析后的日志条目数组
 */
export async function parseLogFile(): Promise<LogEntry[]> {
  try {
    // 读取日志文件
    const content = await fs.readFile(LOG_FILE_PATH, 'utf-8');

    // 跳过标题行
    const lines = content.split('\n').slice(2);

    const logEntries: LogEntry[] = [];
    let currentEntry: Partial<LogEntry> | null = null;

    // 解析每一行
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      // 如果是日期行（以年份开头）
      // 使用多种正则表达式和手动解析机制来处理不同格式的日期行

      const dateRegex = /^(\d{4}-\d{2}-\d{2})\s+(\d{2}:\d{2})\s*-\s*(.+)$/;
      let dateMatch = line.match(dateRegex);

      // 如果第一个正则表达式不匹配，尝试另一个更灵活的正则表达式
      if (!dateMatch && line.trim() !== '') {
        // 检查是否包含日期格式
        const altDateRegex = /(\d{4}-\d{2}-\d{2})\s+(\d{2}:\d{2})\s*-\s*(.+)/;
        dateMatch = line.match(altDateRegex);

        // 如果仍然不匹配，尝试手动解析
        if (!dateMatch && line.includes('-') && /\d{4}-\d{2}-\d{2}/.test(line)) {
          const datePartMatch = line.match(/(\d{4}-\d{2}-\d{2})/);
          const timePartMatch = line.match(/(\d{2}:\d{2})/);

          if (datePartMatch && timePartMatch) {
            const datePart = datePartMatch[1];
            const timePart = timePartMatch[1];
            const contentPart = line.split('-').slice(1).join('-').trim();

            // 创建一个人工的匹配结果
            dateMatch = [line, datePart, timePart, contentPart];
          }
        }
      }

      if (dateMatch) {
        // 如果有正在处理的条目，保存它
        if (currentEntry) {
          logEntries.push(currentEntry as LogEntry);
        }

        // 解析日期
        const [_, dateStr, timeStr, contentText] = dateMatch;
        const date = new Date(`${dateStr}T${timeStr}:00`);

        // 创建新条目
        currentEntry = {
          date,
          content: contentText,
          year: date.getFullYear(),
          month: date.getMonth() + 1, // JavaScript 月份从 0 开始
          day: date.getDate(),
          tags: extractTags(contentText),
        };
      } else if (currentEntry && line.trim() !== '') {
        // 如果不是日期行且不是空行，将其添加到当前条目的内容中
        currentEntry.content += '\n' + line;
      }
    }

    // 添加最后一个条目
    if (currentEntry) {
      logEntries.push(currentEntry as LogEntry);
    }

    return logEntries;
  } catch (error) {
    console.error('Error parsing log file:', error);
    return [];
  }
}

/**
 * 从内容中提取标签
 * @param content 日志内容
 * @returns 提取的标签数组
 */
function extractTags(content: string): string[] {
  // 简单的标签提取逻辑，可以根据需要调整
  const tags: string[] = [];

  // 提取常见的关键词作为标签
  const keywordMap: Record<string, string> = {
    '修复': 'bug-fix',
    '实现': 'implementation',
    '添加': 'feature',
    '更新': 'update',
    '改进': 'improvement',
    '优化': 'optimization',
    'PDCA': 'pdca',
    '目标': 'goal',
    '任务': 'task',
    '文件': 'file',
    '导入': 'import',
    '导出': 'export',
    'OSS': 'oss',
    '阿里云': 'aliyun',
  };

  // 检查内容中是否包含关键词
  for (const [keyword, tag] of Object.entries(keywordMap)) {
    if (content.includes(keyword)) {
      tags.push(tag);
    }
  }

  return tags;
}

/**
 * 归档指定日期之前的日志
 * @param beforeDate 归档此日期之前的日志
 * @param ignoreYear 是否忽略年份，只比较月份和日期
 * @returns 归档的日志条目数量
 */
export async function archiveLogsBeforeDate(beforeDate: Date, ignoreYear: boolean = true): Promise<number> {
  try {
    // 解析日志文件
    const logEntries = await parseLogFile();

    // 筛选需要归档的日志
    const entriesToArchive = logEntries.filter(entry => {
      if (ignoreYear) {
        // 如果忽略年份，只比较月份和日期
        const entryMonth = entry.month;
        const entryDay = entry.day;
        const beforeMonth = beforeDate.getMonth() + 1; // JavaScript 月份从 0 开始
        const beforeDay = beforeDate.getDate();

        // 先比较月份，如果月份相同则比较日期
        return entryMonth < beforeMonth || (entryMonth === beforeMonth && entryDay < beforeDay);
      } else {
        // 如果不忽略年份，直接比较日期对象
        return entry.date < beforeDate;
      }
    });

    const entriesToKeep = logEntries.filter(entry => {
      if (ignoreYear) {
        // 如果忽略年份，只比较月份和日期
        const entryMonth = entry.month;
        const entryDay = entry.day;
        const beforeMonth = beforeDate.getMonth() + 1; // JavaScript 月份从 0 开始
        const beforeDay = beforeDate.getDate();

        // 先比较月份，如果月份相同则比较日期
        return entryMonth > beforeMonth || (entryMonth === beforeMonth && entryDay >= beforeDay);
      } else {
        // 如果不忽略年份，直接比较日期对象
        return entry.date >= beforeDate;
      }
    });

    if (entriesToArchive.length === 0) {
      console.log('No logs to archive');
      return 0;
    }

    // 将日志保存到数据库
    for (const entry of entriesToArchive) {
      await prisma.logArchive.create({
        data: {
          content: entry.content,
          logDate: entry.date,
          year: entry.year,
          month: entry.month,
          day: entry.day,
          tags: entry.tags,
        },
      });
    }

    // 更新日志文件，只保留未归档的日志
    // 添加日志条目之间的空行
    const logLines = [];

    // 添加标题
    logLines.push('# 项目日志');
    logLines.push('');

    // 添加日志条目，每个条目后面添加一个空行
    for (let i = 0; i < entriesToKeep.length; i++) {
      const entry = entriesToKeep[i];
      const dateStr = entry.date.toISOString().split('T')[0];
      const timeStr = entry.date.toTimeString().substring(0, 5);
      logLines.push(`${dateStr} ${timeStr} - ${entry.content}`);

      // 如果不是最后一个条目，添加空行
      if (i < entriesToKeep.length - 1) {
        logLines.push('');
      }
    }

    const newContent = logLines.join('\n');

    await fs.writeFile(LOG_FILE_PATH, newContent);

    console.log(`Archived ${entriesToArchive.length} log entries to database and updated log file`);
    return entriesToArchive.length;
  } catch (error) {
    console.error('Error archiving logs:', error);
    return 0;
  }
}

/**
 * 获取归档的日志
 * @param year 年份
 * @param month 月份
 * @param day 日期
 * @returns 归档的日志条目
 */
export async function getArchivedLogs(year?: number, month?: number, day?: number) {
  const where: any = {};

  if (year !== undefined) {
    where.year = year;

    if (month !== undefined) {
      where.month = month;

      if (day !== undefined) {
        where.day = day;
      }
    }
  }

  return prisma.logArchive.findMany({
    where,
    orderBy: {
      logDate: 'desc',
    },
  });
}
