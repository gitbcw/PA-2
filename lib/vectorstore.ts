import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { Document } from "@langchain/core/documents";
import { VectorStore } from "@langchain/core/vectorstores";
import { getEmbeddings } from "./embeddings";
import { env } from "./env";
import { MilvusVectorStore } from "./vectorstore-milvus";

// 向量存储实例
let vectorStore: VectorStore | null = null;

/**
 * 获取向量存储实例
 * @returns 向量存储实例
 */
export async function getVectorStore(): Promise<VectorStore> {
  if (!vectorStore) {
    const embeddings = await getEmbeddings();
    const storeType = env.VECTOR_STORE_TYPE.toLowerCase();

    switch (storeType) {
      case "milvus":
        // 使用Milvus向量数据库
        vectorStore = new MilvusVectorStore(embeddings, {
          host: env.MILVUS_HOST,
          port: parseInt(env.MILVUS_PORT),
          ssl: env.MILVUS_SSL === "true",
          username: env.MILVUS_USERNAME || undefined,
          password: env.MILVUS_PASSWORD || undefined,
          collectionName: env.MILVUS_COLLECTION,
          dimension: env.MILVUS_DIMENSION,
        });

        // 初始化Milvus集合
        await (vectorStore as MilvusVectorStore).initialize();
        break;

      case "memory":
      default:
        // 使用内存向量存储（开发环境）
        vectorStore = new MemoryVectorStore(embeddings);
        break;
    }
  }

  return vectorStore;
}

export async function addDocumentsToVectorStore(documents: Document[]) {
  const store = await getVectorStore();
  await store.addDocuments(documents);
  return store;
}

export async function similaritySearch(query: string, k = 4) {
  const store = await getVectorStore();
  return store.similaritySearch(query, k);
}
