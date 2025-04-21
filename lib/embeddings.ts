import { Embeddings } from "@langchain/core/embeddings";
import { OpenAIEmbeddings } from "@langchain/openai";
import { GeekAIEmbeddings } from "./embeddings-geekai";
import { env } from "./env";

// 缓存嵌入模型实例
let embeddingsInstance: Embeddings | null = null;

/**
 * 获取嵌入模型实例
 * @returns 嵌入模型实例
 */
export async function getEmbeddings(): Promise<Embeddings> {
  if (!embeddingsInstance) {
    // 根据环境变量配置选择嵌入模型
    const embeddingProvider = env.EMBEDDING_PROVIDER || "openai";

    switch (embeddingProvider.toLowerCase()) {
      case "geekai":
        embeddingsInstance = new GeekAIEmbeddings({
          apiKey: env.GEEKAI_API_KEY,
          model: env.GEEKAI_EMBEDDING_MODEL as any,
        });
        break;

      case "openai":
      default:
        embeddingsInstance = new OpenAIEmbeddings({
          openAIApiKey: env.OPENAI_API_KEY,
        });
        break;
    }
  }

  return embeddingsInstance;
}

/**
 * 获取GeekAI嵌入模型实例
 * @returns GeekAI嵌入模型实例
 */
export function getGeekAIEmbeddings(): GeekAIEmbeddings {
  return new GeekAIEmbeddings({
    apiKey: env.GEEKAI_API_KEY,
    model: env.GEEKAI_EMBEDDING_MODEL as any,
  });
}
