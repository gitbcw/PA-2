/**
 * Milvus向量数据库连接测试脚本
 *
 * 使用方法：
 * 1. 确保已安装所有依赖：yarn install
 * 2. 设置环境变量：
 *    - VECTOR_STORE_TYPE=milvus
 *    - MILVUS_HOST=你的Milvus服务器地址
 *    - MILVUS_PORT=19530
 * 3. 运行脚本：npx tsx tests/test-milvus-connection.mts
 */

// 加载环境变量
import dotenv from 'dotenv';
// 先尝试加载.env.local
dotenv.config({ path: '.env.local' });
// 如果没有，尝试加载.env
dotenv.config({ path: '.env' });

// 可以直接在脚本中设置环境变量
// 如果这里设置了，会覆盖.env文件中的设置
// 取消下面的注释并填写您的服务器地址
// process.env.MILVUS_HOST = "your-server-ip-or-domain";
// process.env.MILVUS_PORT = "19530";
// process.env.VECTOR_STORE_TYPE = "milvus";

import { MilvusClient } from '@zilliz/milvus2-sdk-node';
import { env } from '../lib/env.js';

// 主函数
async function testMilvusConnection() {
  try {
    console.log("开始测试Milvus连接...");

    // 输出环境变量加载情况
    console.log("环境变量加载情况:");
    console.log("process.env.MILVUS_HOST:", process.env.MILVUS_HOST);
    console.log("env.MILVUS_HOST:", env.MILVUS_HOST);
    console.log("process.env.VECTOR_STORE_TYPE:", process.env.VECTOR_STORE_TYPE);
    console.log("env.VECTOR_STORE_TYPE:", env.VECTOR_STORE_TYPE);

    // 获取Milvus配置
    const host = process.env.MILVUS_HOST || env.MILVUS_HOST;
    const port = parseInt(process.env.MILVUS_PORT || env.MILVUS_PORT);
    const ssl = (process.env.MILVUS_SSL || env.MILVUS_SSL) === 'true';
    const username = process.env.MILVUS_USERNAME || env.MILVUS_USERNAME;
    const password = process.env.MILVUS_PASSWORD || env.MILVUS_PASSWORD;

    console.log(`连接到Milvus服务器: ${host}:${port}`);
    console.log(`SSL: ${ssl}`);
    console.log(`用户名: ${username || '无'}`);

    // 创建Milvus客户端
    console.log("创建Milvus客户端...");
    const client = new MilvusClient({
      address: `${host}:${port}`,
      ssl,
      username: username || undefined,
      password: password || undefined,
      timeout: 10000, // 10秒超时
    });

    // 测试连接
    console.log("测试连接...");
    // 使用listDatabases方法测试连接
    const dbResponse = await client.listDatabases();
    console.log("数据库列表:", dbResponse);

    // 列出所有集合
    console.log("列出所有集合...");
    const collections = await client.listCollections();
    console.log("集合列表:", collections);

    // 关闭连接
    console.log("关闭连接...");
    await client.closeConnection();

    console.log("测试完成!");
    return true;
  } catch (error) {
    console.error("测试失败:", error);
    return false;
  }
}

// 运行测试
testMilvusConnection().then(success => {
  if (!success) {
    process.exit(1);
  }
});
