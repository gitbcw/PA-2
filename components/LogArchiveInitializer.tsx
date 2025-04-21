'use client';

import { useEffect } from 'react';

export default function LogArchiveInitializer() {
  useEffect(() => {
    // 动态导入日志归档初始化函数
    // 这样可以避免在服务器端渲染时执行文件系统操作
    const initArchive = async () => {
      try {
        const { initLogArchive } = await import('@/lib/initLogArchive');
        await initLogArchive();
      } catch (error) {
        console.error('Failed to initialize log archive:', error);
      }
    };
    
    initArchive();
  }, []);
  
  // 这个组件不渲染任何内容
  return null;
}
