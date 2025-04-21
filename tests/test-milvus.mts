/**
 * Milvus向量数据库测试脚本
 *
 * 使用方法：
 * 1. 确保已安装所有依赖：yarn install
 * 2. 设置环境变量：
 *    - VECTOR_STORE_TYPE=milvus
 *    - MILVUS_HOST=你的Milvus服务器地址
 *    - MILVUS_PORT=19530
 * 3. 运行脚本：npx tsx tests/test-milvus.mts
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

import { Document } from '@langchain/core/documents';
import { MilvusVectorStore } from '../lib/vectorstore-milvus.js';
import { GeekAIEmbeddings } from '../lib/embeddings-geekai.js';
import { env } from '../lib/env.js';

// 测试文档 - 只使用一个文档进行测试
const documents = [
  new Document({
    pageContent: "这是一个测试文档",
    metadata: { source: "测试", category: "测试" }
  }),
];

// 主函数
async function testMilvusConnection() {
  try {
    console.log("开始测试Milvus向量数据库...");

    // 输出环境变量加载情况
    console.log("环境变量加载情况:");
    console.log("process.env.MILVUS_HOST:", process.env.MILVUS_HOST);
    console.log("env.MILVUS_HOST:", env.MILVUS_HOST);
    console.log("process.env.VECTOR_STORE_TYPE:", process.env.VECTOR_STORE_TYPE);
    console.log("env.VECTOR_STORE_TYPE:", env.VECTOR_STORE_TYPE);

    // 获取Milvus配置
    const host = process.env.MILVUS_HOST || env.MILVUS_HOST;
    const port = parseInt(process.env.MILVUS_PORT || env.MILVUS_PORT);
    const collection = process.env.MILVUS_COLLECTION || env.MILVUS_COLLECTION || 'test_collection';

    console.log(`连接到Milvus服务器: ${host}:${port}`);
    console.log(`使用集合: ${collection}`);

    // 创建嵌入模型
    console.log("geekai key:", process.env.GEEKAI_API_KEY);
    const embeddings = new GeekAIEmbeddings({
      apiKey: process.env.GEEKAI_API_KEY || env.GEEKAI_API_KEY,
      model: process.env.GEEKAI_EMBEDDING_MODEL || env.GEEKAI_EMBEDDING_MODEL as any,
    });

    // 创建Milvus向量存储
    console.log("创建Milvus向量存储实例...");
    // 使用类型断言解决类型错误
    const vectorStore = new MilvusVectorStore(embeddings as any, {
      host,
      port,
      collectionName: collection,
      ssl: (process.env.MILVUS_SSL || env.MILVUS_SSL) === 'true',
      username: process.env.MILVUS_USERNAME || env.MILVUS_USERNAME,
      password: process.env.MILVUS_PASSWORD || env.MILVUS_PASSWORD,
    });

    // 初始化集合
    console.log("初始化Milvus集合...");
    try {
      await vectorStore.initialize();
      console.log("集合初始化成功");
    } catch (initError) {
      console.error("集合初始化失败:", initError);
      throw initError;
    }

    // 添加文档
    console.log("添加文档到Milvus...");
    await vectorStore.addDocuments(documents);
    console.log(`成功添加 ${documents.length} 个文档`);

    // 执行相似度搜索
    console.log("\n执行相似度搜索...");
    const query = "什么是向量数据库?";
    console.log(`查询: "${query}"`);

    const results = await vectorStore.similaritySearchWithScore(query, 3);

    console.log("\n搜索结果:");
    results.forEach(([doc, score], index) => {
      console.log(`\n结果 ${index + 1} (相似度分数: ${score}):`);
      console.log(`内容: ${doc.pageContent}`);
      console.log(`元数据: ${JSON.stringify(doc.metadata)}`);
    });

    // 关闭连接
    console.log("\n关闭Milvus连接...");
    await vectorStore.close();

    console.log("\n测试完成!");
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
