/**
 * GeekAI嵌入API测试脚本
 * 
 * 使用方法：
 * 1. 确保已安装所有依赖：yarn install
 * 2. 运行脚本：node scripts/test-embeddings.js
 */

// 模拟fetch API
global.fetch = async (url, options) => {
  console.log(`[MOCK FETCH] Request to: ${url}`);
  console.log(`[MOCK FETCH] Method: ${options.method}`);
  console.log(`[MOCK FETCH] Headers:`, options.headers);
  
  const body = JSON.parse(options.body);
  console.log(`[MOCK FETCH] Body:`, body);
  
  // 生成随机向量
  const generateRandomVector = (dimension = 1536) => {
    const vector = [];
    for (let i = 0; i < dimension; i++) {
      vector.push((Math.random() * 2 - 1) * 0.1);
    }
    return vector;
  };
  
  // 模拟响应
  let data = [];
  
  if (typeof body.input === "string") {
    // 单行文本
    data = [{
      object: "embedding",
      embedding: generateRandomVector(),
      index: 0
    }];
  } else if (Array.isArray(body.input)) {
    // 多行文本或多模态
    data = body.input.map((_, index) => ({
      object: "embedding",
      embedding: generateRandomVector(),
      index
    }));
  }
  
  const response = {
    object: "list",
    data,
    model: body.model,
    usage: {
      prompt_tokens: 8,
      total_tokens: 8
    }
  };
  
  return {
    ok: true,
    json: async () => response
  };
};

// 模拟环境变量
process.env.GEEKAI_API_KEY = "mock-api-key";
process.env.GEEKAI_EMBEDDING_MODEL = "text-embedding-3-small";

// 导入GeekAI嵌入模型
const { GeekAIEmbeddings } = require("../lib/embeddings-geekai");

// 测试函数
async function runTests() {
  console.log("=== GeekAI嵌入API测试 ===");
  
  // 创建嵌入模型实例
  const embeddings = new GeekAIEmbeddings({
    apiKey: process.env.GEEKAI_API_KEY,
    model: process.env.GEEKAI_EMBEDDING_MODEL,
  });
  
  // 测试1：单行文本嵌入
  console.log("\n测试1：单行文本嵌入");
  const singleText = "这是一个测试文本";
  const singleEmbedding = await embeddings.embedQuery(singleText);
  console.log(`文本: "${singleText}"`);
  console.log(`向量维度: ${singleEmbedding.length}`);
  console.log(`向量前5个值: [${singleEmbedding.slice(0, 5).join(", ")}]`);
  
  // 测试2：多行文本嵌入
  console.log("\n测试2：多行文本嵌入");
  const multipleTexts = ["第一行文本", "第二行文本", "第三行文本"];
  const multipleEmbeddings = await embeddings.embedDocuments(multipleTexts);
  console.log(`文本数量: ${multipleTexts.length}`);
  console.log(`生成向量数量: ${multipleEmbeddings.length}`);
  console.log(`每个向量维度: ${multipleEmbeddings[0].length}`);
  
  // 测试3：多模态嵌入
  console.log("\n测试3：多模态嵌入");
  const multiModalInputs = [
    { type: "text", text: "这是文本描述" },
    { type: "image_url", image_url: { url: "https://example.com/image.jpg" } }
  ];
  const multiModalEmbeddings = await embeddings.embedMultiModal(multiModalInputs);
  console.log(`输入数量: ${multiModalInputs.length}`);
  console.log(`生成向量数量: ${multiModalEmbeddings.length}`);
  console.log(`每个向量维度: ${multiModalEmbeddings[0].length}`);
  
  console.log("\n=== 测试完成 ===");
}

// 运行测试
runTests().catch(error => {
  console.error("测试失败:", error);
  process.exit(1);
});
