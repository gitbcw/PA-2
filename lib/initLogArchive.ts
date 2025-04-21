// 归档标志，确保只执行一次
let hasArchived = false;

/**
 * 初始化日志归档
 * 通过调用API路由来归档当前日期之前的所有日志
 */
export async function initLogArchive() {
  // 如果已经执行过归档，则跳过
  if (hasArchived) {
    return;
  }

  try {
    console.log('Initializing log archive...');

    // 调用API路由来触发归档
    const response = await fetch('/api/logs/archive', {
      method: 'POST',
    });

    if (!response.ok) {
      throw new Error('Failed to trigger archive');
    }

    const data = await response.json();
    console.log(`Log archive initialized. Archived ${data.archivedCount} entries.`);

    // 设置归档标志
    hasArchived = true;
  } catch (error) {
    console.error('Error initializing log archive:', error);
  }
}
