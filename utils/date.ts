import { formatDistanceToNow as _formatDistanceToNow } from 'date-fns';
import zhCN from 'date-fns/locale/zh-CN';

/**
 * 距离现在的友好时间（如“3天前”）
 * @param date 日期对象或字符串
 * @returns 距离现在的友好时间字符串
 */
export function formatDistanceToNow(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return _formatDistanceToNow(d, { addSuffix: true, locale: zhCN });
}

/**
 * 格式化日期为 YYYY-MM-DD 格式
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toISOString().split('T')[0];
}

/**
 * 格式化日期为本地化格式（YYYY年MM月DD日）
 */
export function formatLocalDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * 获取当前日期的ISO字符串（不含时间部分）
 */
export function getCurrentDateISOString(): string {
  return new Date().toISOString().split('T')[0] + 'T00:00:00.000Z';
}

/**
 * 获取未来指定天数的日期的ISO字符串
 * @param days 天数
 * @returns 未来日期的ISO字符串
 */
export function getFutureDateISOString(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0] + 'T00:00:00.000Z';
}

/**
 * 格式化时间为 HH:MM 格式
 * @param dateTime 日期时间字符串
 * @returns 格式化后的时间字符串
 */
export function formatTime(dateTime: string): string {
  const date = new Date(dateTime);
  return date.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}
