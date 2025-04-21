/**
 * GeekAI嵌入API真实测试脚本
 * 
 * 使用方法：
 * 1. 确保已安装所有依赖：yarn install
 * 2. 设置环境变量：
 *    - GEEKAI_API_KEY=你的GeekAI API密钥
 *    - GEEKAI_EMBEDDING_MODEL=text-embedding-3-small
 * 3. 运行脚本：node scripts/test-embeddings-real.js
 */

// 设置环境变量（如果未通过命令行设置）
if (!process.env.GEEKAI_API_KEY) {
  console.error("错误: 未设置GEEKAI_API_KEY环境变量");
  console.log("请设置GEEKAI_API_KEY环境变量后再运行脚本");
  console.log("例如: set GEEKAI_API_KEY=your-api-key && node scripts/test-embeddings-real.js");
  process.exit(1);
}

process.env.GEEKAI_EMBEDDING_MODEL = process.env.GEEKAI_EMBEDDING_MODEL || "text-embedding-3-small";

// 导入GeekAI嵌入模型
const { GeekAIEmbeddings } = require("../lib/embeddings-geekai");

// 测试函数
async function runTests() {
  console.log("=== GeekAI嵌入API真实测试 ===");
  console.log(`使用模型: ${process.env.GEEKAI_EMBEDDING_MODEL}`);
  
  // 创建嵌入模型实例
  const embeddings = new GeekAIEmbeddings({
    apiKey: process.env.GEEKAI_API_KEY,
    model: process.env.GEEKAI_EMBEDDING_MODEL,
  });
  
  // 测试1：单行文本嵌入
  console.log("\n测试1：单行文本嵌入");
  const singleText = "这是一个测试文本";
  console.log(`文本: "${singleText}"`);
  
  try {
    const singleEmbedding = await embeddings.embedQuery(singleText);
    console.log(`向量维度: ${singleEmbedding.length}`);
    console.log(`向量前5个值: [${singleEmbedding.slice(0, 5).join(", ")}]`);
    console.log("✅ 测试通过");
  } catch (error) {
    console.error("❌ 测试失败:", error);
  }
  
  // 测试2：多行文本嵌入
  console.log("\n测试2：多行文本嵌入");
  const multipleTexts = ["第一行文本", "第二行文本", "第三行文本"];
  console.log(`文本: ${JSON.stringify(multipleTexts)}`);
  
  try {
    const multipleEmbeddings = await embeddings.embedDocuments(multipleTexts);
    console.log(`文本数量: ${multipleTexts.length}`);
    console.log(`生成向量数量: ${multipleEmbeddings.length}`);
    console.log(`每个向量维度: ${multipleEmbeddings[0].length}`);
    console.log("✅ 测试通过");
  } catch (error) {
    console.error("❌ 测试失败:", error);
  }
  
  // 测试3：多模态嵌入（如果模型支持）
  if (["doubao-embedding-vision", "multimodal-embedding-v1", "embed-english-v3.0", "embed-multilingual-v3.0"].includes(process.env.GEEKAI_EMBEDDING_MODEL)) {
    console.log("\n测试3：多模态嵌入");
    const multiModalInputs = [
      { type: "text", text: "这是文本描述" },
      { type: "image_url", image_url: { url: "https://geekai.co/favicon.ico" } }
    ];
    console.log(`输入: ${JSON.stringify(multiModalInputs)}`);
    
    try {
      const multiModalEmbeddings = await embeddings.embedMultiModal(multiModalInputs);
      console.log(`输入数量: ${multiModalInputs.length}`);
      console.log(`生成向量数量: ${multiModalEmbeddings.length}`);
      console.log(`每个向量维度: ${multiModalEmbeddings[0].length}`);
      console.log("✅ 测试通过");
    } catch (error) {
      console.error("❌ 测试失败:", error);
    }
  } else {
    console.log("\n测试3：多模态嵌入 (跳过 - 当前模型不支持多模态)");
  }
  
  console.log("\n=== 测试完成 ===");
}

// 运行测试
runTests().catch(error => {
  console.error("测试执行失败:", error);
  process.exit(1);
});
