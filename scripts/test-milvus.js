/**
 * Milvus向量数据库测试脚本
 * 
 * 使用方法：
 * 1. 确保已安装所有依赖：yarn install
 * 2. 设置环境变量：
 *    - VECTOR_STORE_TYPE=milvus
 *    - MILVUS_HOST=你的Milvus服务器地址
 *    - MILVUS_PORT=19530
 *    - MILVUS_USERNAME=你的Milvus用户名（如果有）
 *    - MILVUS_PASSWORD=你的Milvus密码（如果有）
 * 3. 运行脚本：node scripts/test-milvus.js
 */

// 设置环境变量
process.env.VECTOR_STORE_TYPE = "milvus";
process.env.MILVUS_HOST = process.env.MILVUS_HOST || "localhost";
process.env.MILVUS_PORT = process.env.MILVUS_PORT || "19530";
process.env.MILVUS_COLLECTION = process.env.MILVUS_COLLECTION || "test_collection";

// 导入所需模块
const { Document } = require("@langchain/core/documents");
const { MilvusVectorStore } = require("../lib/vectorstore-milvus");
const { GeekAIEmbeddings } = require("../lib/embeddings-geekai");

// 测试文档
const documents = [
  new Document({
    pageContent: "这是一个关于人工智能的文档",
    metadata: { source: "AI教程", category: "技术" }
  }),
  new Document({
    pageContent: "向量数据库是存储和检索向量的专用数据库",
    metadata: { source: "数据库教程", category: "技术" }
  }),
  new Document({
    pageContent: "Milvus是一个开源的向量数据库，专为嵌入相似性搜索和AI应用设计",
    metadata: { source: "Milvus文档", category: "技术" }
  }),
  new Document({
    pageContent: "机器学习是人工智能的一个子领域",
    metadata: { source: "ML教程", category: "技术" }
  }),
  new Document({
    pageContent: "深度学习是机器学习的一种方法，基于人工神经网络",
    metadata: { source: "DL教程", category: "技术" }
  }),
];

// 主函数
async function main() {
  try {
    console.log("开始测试Milvus向量数据库...");
    console.log(`连接到Milvus服务器: ${process.env.MILVUS_HOST}:${process.env.MILVUS_PORT}`);
    console.log(`使用集合: ${process.env.MILVUS_COLLECTION}`);

    // 创建嵌入模型
    const embeddings = new GeekAIEmbeddings({
      apiKey: process.env.GEEKAI_API_KEY,
      model: "text-embedding-3-small",
    });

    // 创建Milvus向量存储
    console.log("创建Milvus向量存储实例...");
    const vectorStore = new MilvusVectorStore(embeddings, {
      host: process.env.MILVUS_HOST,
      port: parseInt(process.env.MILVUS_PORT),
      collectionName: process.env.MILVUS_COLLECTION,
    });

    // 初始化集合
    console.log("初始化Milvus集合...");
    await vectorStore.initialize();

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
  } catch (error) {
    console.error("测试失败:", error);
  }
}

// 运行主函数
main();
