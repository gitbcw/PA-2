import { Embeddings } from "@langchain/core/embeddings";
import { getEnv } from "./env";

/**
 * GeekAI支持的嵌入模型类型
 */
export type GeekAIEmbeddingModelType =
  | "text-embedding-3-small"
  | "text-embedding-3-large"
  | "text-embedding-004"
  | "doubao-embedding-vision"
  | "multimodal-embedding-v1"
  | "embed-english-v3.0"
  | "embed-multilingual-v3.0";

/**
 * 多模态输入类型
 */
export type MultiModalInput =
  | { type: "text"; text: string }
  | { type: "image_url"; image_url: { url: string } }
  | { type: "video_url"; video_url: { url: string } };

/**
 * GeekAI嵌入模型配置
 */
export interface GeekAIEmbeddingsParams {
  /**
   * GeekAI API密钥
   */
  apiKey?: string;

  /**
   * 嵌入模型名称
   * @default "text-embedding-3-small"
   */
  model?: GeekAIEmbeddingModelType;

  /**
   * API基础URL
   * @default "https://geekai.co/api/v1"
   */
  baseUrl?: string;

  /**
   * 请求超时时间（毫秒）
   * @default 30000
   */
  timeout?: number;


}

/**
 * GeekAI嵌入模型实现
 */
export class GeekAIEmbeddings implements Embeddings {
  private apiKey: string;
  private model: GeekAIEmbeddingModelType;
  private baseUrl: string;
  private timeout: number;


  constructor(params: GeekAIEmbeddingsParams = {}) {
    this.apiKey = params.apiKey || getEnv("GEEKAI_API_KEY", "");
    if (!this.apiKey) {
      throw new Error("GeekAI API key is required");
    }

    this.model = params.model || "text-embedding-3-small";
    this.baseUrl = params.baseUrl || "https://geekai.co/api/v1";
    this.timeout = params.timeout || 30000;
  }

  /**
   * 获取文本嵌入向量
   * @param texts 文本数组
   * @returns 嵌入向量数组
   */
  async embedDocuments(texts: string[]): Promise<number[][]> {
    if (texts.length === 0) {
      return [];
    }

    const response = await this.callEmbeddingAPI(texts);
    return response.data.map((item: any) => item.embedding);
  }

  /**
   * 获取单个文本的嵌入向量
   * @param text 文本
   * @returns 嵌入向量
   */
  async embedQuery(text: string): Promise<number[]> {
    const response = await this.callEmbeddingAPI(text);
    return response.data[0].embedding;
  }

  /**
   * 获取多模态内容的嵌入向量
   * @param inputs 多模态输入数组
   * @returns 嵌入向量数组
   */
  async embedMultiModal(inputs: MultiModalInput[]): Promise<number[][]> {
    if (inputs.length === 0) {
      return [];
    }

    // 检查模型是否支持多模态
    const supportedModels = [
      "doubao-embedding-vision",
      "multimodal-embedding-v1",
      "embed-english-v3.0",
      "embed-multilingual-v3.0"
    ];

    if (!supportedModels.includes(this.model)) {
      throw new Error(`Model ${this.model} does not support multimodal embeddings`);
    }

    const response = await this.callEmbeddingAPI(inputs);
    return response.data.map((item: any) => item.embedding);
  }

  /**
   * 调用GeekAI嵌入API
   * @param input 输入内容（文本或多模态）
   * @returns API响应
   */
  private async callEmbeddingAPI(input: string | string[] | MultiModalInput[]): Promise<any> {

    const url = `${this.baseUrl}/embeddings`;

    const headers = {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${this.apiKey}`
    };

    const body = {
      input,
      model: this.model
    };

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(
          `GeekAI API returned an error: ${response.status} ${response.statusText} - ${error.error?.message || JSON.stringify(error)
          }`
        );
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === "AbortError") {
          throw new Error(`Request timed out after ${this.timeout}ms`);
        }
        throw error;
      }
      throw new Error(`Unknown error: ${error}`);
    }
  }


}
