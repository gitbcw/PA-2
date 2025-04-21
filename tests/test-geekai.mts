import { GeekAIEmbeddings } from '../lib/embeddings-geekai.js';

async function testGeekAIAPI() {
    try {
        // 请替换为你的实际API Key
        const embeddings = new GeekAIEmbeddings({
            apiKey: "sk-qae1fh2j6IgaCZmB9oUkYXmxHwXuleuT0OGaU7GJK1vxIZWc",
        });

        // 测试文本嵌入
        const testText = "Hello, this is a test message.";
        console.log("Testing single text embedding...");
        const result = await embeddings.embedQuery(testText);

        console.log("API test successful!");
        console.log("Vector dimension:", result.length);
        console.log("First few values:", result.slice(0, 5));

    } catch (error) {
        console.error("API test failed:", error);
    }
}

// 运行测试
testGeekAIAPI();
