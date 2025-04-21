/**
 * Milvus服务器网络连接测试脚本
 * 
 * 使用方法：
 * 1. 设置环境变量：
 *    - MILVUS_HOST=你的Milvus服务器地址
 *    - MILVUS_PORT=19530
 * 2. 运行脚本：npx tsx tests/test-milvus-ping.mts
 */

// 加载环境变量
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

import * as net from 'net';
import { env } from '../lib/env.js';

// 主函数
async function testMilvusNetworkConnection() {
  try {
    console.log("开始测试Milvus网络连接...");
    
    // 获取Milvus配置
    const host = process.env.MILVUS_HOST || env.MILVUS_HOST;
    const port = parseInt(process.env.MILVUS_PORT || env.MILVUS_PORT);
    
    console.log(`测试连接到: ${host}:${port}`);
    
    // 创建一个Promise来包装socket连接
    const connectPromise = new Promise<void>((resolve, reject) => {
      const socket = new net.Socket();
      
      // 设置超时
      socket.setTimeout(5000);
      
      // 连接事件
      socket.on('connect', () => {
        console.log(`成功连接到 ${host}:${port}`);
        socket.end();
        resolve();
      });
      
      // 错误事件
      socket.on('error', (err) => {
        console.error(`连接错误: ${err.message}`);
        reject(err);
      });
      
      // 超时事件
      socket.on('timeout', () => {
        console.error(`连接超时`);
        socket.destroy();
        reject(new Error('Connection timeout'));
      });
      
      // 尝试连接
      socket.connect(port, host);
    });
    
    await connectPromise;
    console.log("网络连接测试成功!");
    return true;
  } catch (error) {
    console.error("网络连接测试失败:", error);
    return false;
  }
}

// 运行测试
testMilvusNetworkConnection().then(success => {
  if (!success) {
    process.exit(1);
  }
});
