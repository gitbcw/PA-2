import { VectorStore } from "@langchain/core/vectorstores";
import { Embeddings } from "@langchain/core/embeddings";
import { Document } from "@langchain/core/documents";
import { MilvusClient, DataType } from "@zilliz/milvus2-sdk-node";
import { getEnv } from "./env";
import { v4 as uuidv4 } from "uuid";

/**
 * Milvus向量数据库配置
 */
export interface MilvusVectorStoreConfig {
  /**
   * Milvus服务器地址
   * @default "localhost"
   */
  host?: string;

  /**
   * Milvus服务器端口
   * @default 19530
   */
  port?: number;

  /**
   * 是否使用SSL连接
   * @default false
   */
  ssl?: boolean;

  /**
   * Milvus用户名
   */
  username?: string;

  /**
   * Milvus密码
   */
  password?: string;

  /**
   * 集合名称
   * @default "langchain_store"
   */
  collectionName?: string;

  /**
   * 文本字段名称
   * @default "text"
   */
  textField?: string;

  /**
   * 向量字段名称
   * @default "vector"
   */
  vectorField?: string;

  /**
   * 主键字段名称
   * @default "id"
   */
  primaryField?: string;

  /**
   * 元数据字段名称
   * @default "metadata"
   */
  metadataField?: string;

  /**
   * 向量维度
   * @default 1536
   */
  dimension?: number;

  /**
   * 索引类型
   * @default "IVF_FLAT"
   */
  indexType?: string;

  /**
   * 索引参数
   * @default { nlist: 1024 }
   */
  indexParams?: Record<string, any>;

  /**
   * 搜索参数
   * @default { nprobe: 16 }
   */
  searchParams?: Record<string, any>;

  /**
   * 一致性级别
   * @default "Eventually"
   */
  consistencyLevel?: "Strong" | "Eventually" | "Session" | "Bounded";
}

/**
 * Milvus向量存储实现
 */
export class MilvusVectorStore extends VectorStore {
  private client: MilvusClient;
  private collectionName: string;
  private textField: string;
  private vectorField: string;
  private primaryField: string;
  private metadataField: string;
  private dimension: number;
  private indexType: string;
  private indexParams: Record<string, any>;
  private searchParams: Record<string, any>;
  private consistencyLevel: "Strong" | "Eventually" | "Session" | "Bounded";

  /**
   * 返回向量存储类型
   * @returns 向量存储类型名称
   */
  _vectorstoreType(): string {
    return "milvus";
  }

  constructor(embeddings: Embeddings, config: MilvusVectorStoreConfig = {}) {
    super(embeddings, config);

    // 初始化配置
    this.collectionName = config.collectionName || "langchain_store";
    this.textField = config.textField || "text";
    this.vectorField = config.vectorField || "vector";
    this.primaryField = config.primaryField || "id";
    this.metadataField = config.metadataField || "metadata";
    this.dimension = config.dimension || 1536;
    this.indexType = config.indexType || "IVF_FLAT";
    this.indexParams = config.indexParams || { nlist: 1024 };
    this.searchParams = config.searchParams || { nprobe: 16 };
    this.consistencyLevel = config.consistencyLevel || "Eventually";

    // 创建Milvus客户端
    const host = config.host || getEnv("MILVUS_HOST", "localhost");
    const port = config.port || parseInt(getEnv("MILVUS_PORT", "19530"));
    const ssl = config.ssl || getEnv("MILVUS_SSL", "false") === "true";
    const username = config.username || getEnv("MILVUS_USERNAME", "");
    const password = config.password || getEnv("MILVUS_PASSWORD", "");

    this.client = new MilvusClient({
      address: `${host}:${port}`,
      ssl,
      username: username || undefined,
      password: password || undefined,
      timeout: 30000, // 增加超时时间到 30 秒
    });
  }

  /**
   * 从文档创建Milvus向量存储
   * @param docs 文档数组
   * @param embeddings 嵌入模型
   * @param config Milvus配置
   * @returns Milvus向量存储实例
   */
  static async fromDocuments(
    docs: Document[],
    embeddings: Embeddings,
    config: MilvusVectorStoreConfig = {}
  ): Promise<MilvusVectorStore> {
    const store = new MilvusVectorStore(embeddings, config);
    await store.initialize();
    await store.addDocuments(docs);
    return store;
  }

  /**
   * 从文本创建Milvus向量存储
   * @param texts 文本数组
   * @param metadatas 元数据数组
   * @param embeddings 嵌入模型
   * @param config Milvus配置
   * @returns Milvus向量存储实例
   */
  static async fromTexts(
    texts: string[],
    metadatas: Record<string, any>[],
    embeddings: Embeddings,
    config: MilvusVectorStoreConfig = {}
  ): Promise<MilvusVectorStore> {
    const docs = texts.map(
      (text, i) => new Document({ pageContent: text, metadata: metadatas[i] || {} })
    );
    return await this.fromDocuments(docs, embeddings, config);
  }

  /**
   * 初始化Milvus集合
   */
  async initialize(): Promise<void> {
    try {
      console.log(`Checking if collection ${this.collectionName} exists...`);

      // 检查集合是否存在
      const hasCollectionResponse = await this.client.hasCollection({
        collection_name: this.collectionName,
      });

      console.log(`Has collection response:`, hasCollectionResponse);
      const hasCollection = hasCollectionResponse.value === true;
      console.log(`Collection exists: ${hasCollection}`);

      // 如果集合不存在，创建集合
      if (!hasCollection) {
        console.log(`Creating collection: ${this.collectionName}`);

        // 创建集合
        try {
          await this.client.createCollection({
            collection_name: this.collectionName,
            fields: [
              {
                name: this.primaryField,
                description: "Primary key",
                data_type: DataType.VarChar,
                is_primary_key: true,
                max_length: 36,
              },
              {
                name: this.textField,
                description: "Text content",
                data_type: DataType.VarChar,
                max_length: 65535,
              },
              {
                name: this.vectorField,
                description: "Vector embedding",
                data_type: DataType.FloatVector,
                dim: this.dimension,
              },
              {
                name: this.metadataField,
                description: "Metadata JSON",
                data_type: DataType.JSON,
              },
            ],
          });
          console.log(`Collection ${this.collectionName} created successfully`);
        } catch (createError) {
          console.error(`Failed to create collection ${this.collectionName}:`, createError);
          throw createError;
        }

        // 创建索引
        try {
          console.log(`Creating index on field ${this.vectorField}...`);
          await this.client.createIndex({
            collection_name: this.collectionName,
            field_name: this.vectorField,
            index_type: this.indexType,
            metric_type: "L2",
            params: this.indexParams,
          });
          console.log(`Index created successfully`);
        } catch (indexError) {
          console.error(`Failed to create index:`, indexError);
          throw indexError;
        }
      }

      // 加载集合到内存
      try {
        console.log(`Loading collection ${this.collectionName} into memory...`);
        await this.client.loadCollection({
          collection_name: this.collectionName,
        });
        console.log(`Collection loaded successfully`);
      } catch (loadError) {
        console.error(`Failed to load collection:`, loadError);
        throw loadError;
      }
    } catch (error) {
      console.error("Failed to initialize Milvus collection:", error);
      throw error;
    }
  }

  /**
   * 添加文档到向量存储
   * @param documents 文档数组
   * @returns 文档ID数组
   */
  async addDocuments(documents: Document[]): Promise<string[]> {
    const texts = documents.map((doc) => doc.pageContent);
    return await this.addVectors(
      await this.embeddings.embedDocuments(texts),
      documents
    );
  }

  /**
   * 添加向量到向量存储
   * @param vectors 向量数组
   * @param documents 文档数组
   * @returns 文档ID数组
   */
  async addVectors(vectors: number[][], documents: Document[]): Promise<string[]> {
    if (vectors.length === 0) {
      return [];
    }

    try {
      // 确保集合已初始化
      await this.initialize();

      // 确保集合已加载
      try {
        await this.client.loadCollection({
          collection_name: this.collectionName,
        });
      } catch (loadError) {
        console.log(`Collection ${this.collectionName} already loaded or error:`, loadError);
      }

      // 生成UUID作为主键
      const ids = documents.map(() => uuidv4());

      // 准备插入数据
      const insertData = {
        collection_name: this.collectionName,
        fields_data: vectors.map((vector, idx) => ({
          [this.primaryField]: ids[idx],
          [this.textField]: documents[idx].pageContent,
          [this.vectorField]: vector,
          [this.metadataField]: documents[idx].metadata,
        })),
      };

      // 插入数据
      await this.client.insert(insertData);

      // 刷新集合以确保数据可见
      await this.client.flushSync({ collection_names: [this.collectionName] });

      return ids;
    } catch (error) {
      console.error("Failed to add vectors to Milvus:", error);
      throw error;
    }
  }

  /**
   * 相似度搜索
   * @param query 查询文本
   * @param k 返回结果数量
   * @param filter 过滤条件
   * @returns 文档数组及其相似度分数
   */
  async similaritySearch(
    query: string,
    k = 4,
    filter?: Record<string, any>
  ): Promise<Document[]> {
    const results = await this.similaritySearchWithScore(query, k, filter);
    return results.map((result) => result[0]);
  }

  /**
   * 相似度搜索（带分数）
   * @param query 查询文本
   * @param k 返回结果数量
   * @param filter 过滤条件
   * @returns 文档数组及其相似度分数
   */
  async similaritySearchWithScore(
    query: string,
    k = 4,
    filter?: Record<string, any>
  ): Promise<[Document, number][]> {
    const embedding = await this.embeddings.embedQuery(query);
    return await this.similaritySearchVectorWithScore(embedding, k, filter);
  }

  /**
   * 向量相似度搜索（带分数）
   * @param embedding 查询向量
   * @param k 返回结果数量
   * @param filter 过滤条件
   * @returns 文档数组及其相似度分数
   */
  async similaritySearchVectorWithScore(
    embedding: number[],
    k = 4,
    filter?: Record<string, any>
  ): Promise<[Document, number][]> {
    try {
      // 准备搜索参数
      const searchParams: any = {
        collection_name: this.collectionName,
        vector: embedding,
        output_fields: [this.primaryField, this.textField, this.metadataField],
        limit: k,
        params: this.searchParams,
      };

      // 添加向量字段
      searchParams.vector_field = this.vectorField;

      // 添加过滤条件
      if (filter) {
        searchParams.filter = this.buildFilterExpression(filter);
      }

      // 添加一致性级别
      searchParams.consistency_level = this.consistencyLevel;

      // 执行搜索
      const searchResult = await this.client.search(searchParams);

      // 处理搜索结果
      return searchResult.results.map((result: any) => {
        const doc = new Document({
          pageContent: result[this.textField],
          metadata: result[this.metadataField],
        });
        return [doc, result.score];
      });
    } catch (error) {
      console.error("Failed to search vectors in Milvus:", error);
      throw error;
    }
  }

  /**
   * 构建过滤表达式
   * @param filter 过滤条件
   * @returns 过滤表达式
   */
  private buildFilterExpression(filter: Record<string, any>): string {
    // 简单实现，将过滤条件转换为Milvus表达式
    // 实际应用中可能需要更复杂的逻辑
    const expressions = Object.entries(filter).map(([key, value]) => {
      if (typeof value === "string") {
        return `${this.metadataField}["${key}"] == "${value}"`;
      } else if (typeof value === "number") {
        return `${this.metadataField}["${key}"] == ${value}`;
      } else if (typeof value === "boolean") {
        return `${this.metadataField}["${key}"] == ${value}`;
      }
      return "";
    });

    return expressions.filter(Boolean).join(" && ");
  }

  /**
   * 删除集合
   */
  async delete(): Promise<void> {
    try {
      await this.client.dropCollection({
        collection_name: this.collectionName,
      });
    } catch (error) {
      console.error("Failed to delete Milvus collection:", error);
      throw error;
    }
  }

  /**
   * 关闭连接
   */
  async close(): Promise<void> {
    try {
      await this.client.closeConnection();
    } catch (error) {
      console.error("Failed to close Milvus connection:", error);
    }
  }

  /**
   * 创建检索器
   * @param k 默认返回结果数量
   * @returns 检索器
   */
  asRetriever(k?: number) {
    return super.asRetriever(k);
  }
}
