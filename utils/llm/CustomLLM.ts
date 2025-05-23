import { LLM, type BaseLLMParams } from "@langchain/core/language_models/llms";
import type { CallbackManagerForLLMRun } from "@langchain/core/callbacks/manager";
import { GenerationChunk } from "@langchain/core/outputs";

/**
 * 自定义LLM接口参数
 */
export interface CustomLLMParams extends BaseLLMParams {
  /** API密钥 */
  apiKey: string;
  /** API基础URL */
  baseUrl: string;
  /** 模型名称 */
  model?: string;
  /** 温度参数 */
  temperature?: number;
  /** 最大令牌数 */
  maxTokens?: number;
  /** 请求超时时间(毫秒) */
  timeout?: number;
  /** 请求头 */
  headers?: Record<string, string>;
  /** 是否启用流式输出 */
  streaming?: boolean;
}

/**
 * 自定义LLM类，支持连接到任何兼容的LLM API
 */
export class CustomLLM extends LLM {
  apiKey: string;
  baseUrl: string;
  model: string;
  temperature: number;
  maxTokens?: number;
  timeout?: number;
  headers: Record<string, string>;
  streaming: boolean;

  constructor(fields: CustomLLMParams) {
    super(fields);
    this.apiKey = fields.apiKey;
    this.baseUrl = fields.baseUrl;
    this.model = fields.model || "deepseek-chat";
    this.temperature = fields.temperature || 0.7;
    this.maxTokens = fields.maxTokens;
    this.timeout = fields.timeout;
    this.headers = fields.headers || {};
    this.streaming = fields.streaming || false;
  }

  _llmType() {
    return "custom";
  }

  /**
   * 调用LLM API获取完成结果
   */
  async _call(
    prompt: string,
    options: this["ParsedCallOptions"],
    runManager?: CallbackManagerForLLMRun
  ): Promise<string> {
    const { stop } = options;

    try {
      console.log(`[CustomLLM] 开始调用LLM API, baseUrl: ${this.baseUrl}, model: ${this.model}`);

      // 动态拼接 endpoint，默认 chat/completions，可扩展更多用途
      let endpoint = "/chat/completions";
      if (this.headers && this.headers["x-llm-purpose"]) {
        // 支持通过 header 传递用途（如 audio, image）
        switch (this.headers["x-llm-purpose"]) {
          case "audio":
            endpoint = "/audio/speech";
            break;
          case "image":
            endpoint = "/images/generations";
            break;
          case "completions":
            endpoint = "/completions";
            break;
          // 其他用途可按需扩展
          default:
            endpoint = "/chat/completions";
        }
      }

      // 动态构造请求体，chat/completions 走 messages，completions 走 prompt
      let requestBody: Record<string, any>;
      if (endpoint === "/chat/completions") {
        requestBody = {
          model: this.model,
          messages: [{ role: "user", content: prompt }],
          temperature: this.temperature,
        };
      } else {
        requestBody = {
          prompt,
          model: this.model,
          temperature: this.temperature,
        };
      }

      // 添加可选参数
      if (this.maxTokens) {
        requestBody.max_tokens = this.maxTokens;
      }

      if (stop && stop.length) {
        requestBody.stop = stop;
      }

      console.log(`[CustomLLM] 请求体: ${JSON.stringify(requestBody, null, 2)}`);

      // 构建请求头
      const headers = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${this.apiKey}`,
        ...this.headers
      };

      console.log(`[CustomLLM] 请求头: ${JSON.stringify(Object.keys(headers), null, 2)}`);

      // 设置请求选项
      const fetchOptions: RequestInit = {
        method: "POST",
        headers,
        body: JSON.stringify(requestBody),
      };

      let response: Response;
      let data: any;

      const apiUrl = `${this.baseUrl}${endpoint}`;
      console.log(`[CustomLLM] 发送请求到: ${apiUrl}`);

      if (this.timeout) {
        console.log(`[CustomLLM] 使用超时设置: ${this.timeout}ms`);
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);
        fetchOptions.signal = controller.signal;

        try {
          response = await fetch(apiUrl, fetchOptions);
          clearTimeout(timeoutId);

          console.log(`[CustomLLM] 收到响应, 状态码: ${response.status}`);

          if (!response.ok) {
            const errorText = await response.text();
            console.error(`[CustomLLM] 响应错误: ${errorText}`);

            let error;
            try {
              error = JSON.parse(errorText);
            } catch {
              error = { error: { message: `HTTP error ${response.status}` } };
            }
            throw new Error(`API请求失败: ${error.error?.message || response.statusText}`);
          }

          const responseText = await response.text();
          console.log(`[CustomLLM] 响应数据: ${responseText.substring(0, 200)}${responseText.length > 200 ? '...' : ''}`);

          data = JSON.parse(responseText);
          const result = this.extractTextFromResponse(data);
          console.log(`[CustomLLM] 提取的文本: ${result.substring(0, 100)}${result.length > 100 ? '...' : ''}`);
          return result;
        } catch (error) {
          clearTimeout(timeoutId);
          console.error(`[CustomLLM] 请求出错: ${error instanceof Error ? error.stack : String(error)}`);
          throw error;
        }
      } else {
        try {
          response = await fetch(apiUrl, fetchOptions);

          console.log(`[CustomLLM] 收到响应, 状态码: ${response.status}`);

          if (!response.ok) {
            const errorText = await response.text();
            console.error(`[CustomLLM] 响应错误: ${errorText}`);

            try {
              const error = JSON.parse(errorText);
              throw new Error(`API请求失败: ${error.error?.message || response.statusText}`);
            } catch (e) {
              throw new Error(`API请求失败: HTTP ${response.status} - ${response.statusText}`);
            }
          }

          const responseText = await response.text();
          console.log(`[CustomLLM] 响应数据: ${responseText.substring(0, 200)}${responseText.length > 200 ? '...' : ''}`);

          try {
            data = JSON.parse(responseText);
          } catch (e) {
            console.error(`[CustomLLM] JSON解析错误: ${e instanceof Error ? e.message : String(e)}`);
            console.log(`[CustomLLM] 原始响应: ${responseText}`);
            throw new Error(`解析API响应失败: ${e instanceof Error ? e.message : String(e)}`);
          }

          const result = this.extractTextFromResponse(data);
          console.log(`[CustomLLM] 提取的文本: ${result.substring(0, 100)}${result.length > 100 ? '...' : ''}`);
          return result;
        } catch (error) {
          console.error(`[CustomLLM] 请求出错: ${error instanceof Error ? error.stack : String(error)}`);
          throw error;
        }
      }
    } catch (error: any) {
      console.error(`[CustomLLM] 调用失败: ${error instanceof Error ? error.stack : String(error)}`);
      throw new Error(`调用自定义LLM API失败: ${error.message}`);
    }
  }

  /**
   * 从API响应中提取文本
   * 支持不同格式的API响应
   */
  private extractTextFromResponse(data: any): string {
    console.log(`[CustomLLM] 开始从响应中提取文本: ${JSON.stringify(data).substring(0, 200)}`);

    // 支持OpenAI格式
    if (data.choices && data.choices.length > 0) {
      console.log(`[CustomLLM] 检测到OpenAI格式响应`);
      if (data.choices[0].text) {
        console.log(`[CustomLLM] 使用choices[0].text: ${data.choices[0].text.substring(0, 50)}...`);
        return data.choices[0].text;
      }
      if (data.choices[0].message && data.choices[0].message.content) {
        console.log(`[CustomLLM] 使用choices[0].message.content: ${data.choices[0].message.content.substring(0, 50)}...`);
        return data.choices[0].message.content;
      }
    }

    // 支持Anthropic格式
    if (data.completion) {
      console.log(`[CustomLLM] 检测到Anthropic格式响应: ${data.completion.substring(0, 50)}...`);
      return data.completion;
    }

    // 支持通用格式
    if (data.result || data.output || data.generated_text || data.response) {
      const result = data.result || data.output || data.generated_text || data.response;
      console.log(`[CustomLLM] 检测到通用格式响应: ${result.substring(0, 50)}...`);
      return result;
    }

    // 如果找不到已知格式，尝试返回整个响应
    if (typeof data === 'string') {
      console.log(`[CustomLLM] 响应是字符串格式，直接返回: ${data.substring(0, 50)}...`);
      return data;
    }

    console.error(`[CustomLLM] 无法从响应中提取文本: ${JSON.stringify(data)}`);
    throw new Error("无法从API响应中提取文本");
  }

  /**
   * 流式输出实现
   */
  async *_streamResponseChunks(
    prompt: string,
    options: this["ParsedCallOptions"],
    runManager?: CallbackManagerForLLMRun
  ): AsyncGenerator<GenerationChunk> {
    if (!this.streaming) {
      // 如果不支持流式输出，则退回到普通调用并一次性返回结果
      console.log(`[CustomLLM] 流式输出未启用，使用普通调用`);
      const text = await this._call(prompt, options, runManager);
      yield new GenerationChunk({
        text,
      });
      return;
    }

    const { stop } = options;

    try {
      console.log(`[CustomLLM] 开始流式调用LLM API, baseUrl: ${this.baseUrl}, model: ${this.model}`);

      // 构建请求体
      const requestBody: Record<string, any> = {
        prompt,
        model: this.model,
        temperature: this.temperature,
        stream: true,
      };

      // 添加可选参数
      if (this.maxTokens) {
        requestBody.max_tokens = this.maxTokens;
      }

      if (stop && stop.length) {
        requestBody.stop = stop;
      }

      console.log(`[CustomLLM] 流式请求体: ${JSON.stringify(requestBody, null, 2)}`);

      // 构建请求头
      const headers = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${this.apiKey}`,
        ...this.headers
      };

      console.log(`[CustomLLM] 流式请求头: ${JSON.stringify(Object.keys(headers), null, 2)}`);

      // 发送请求
      const apiUrl = `${this.baseUrl}/completions`;
      console.log(`[CustomLLM] 发送流式请求到: ${apiUrl}`);

      const response = await fetch(apiUrl, {
        method: "POST",
        headers,
        body: JSON.stringify(requestBody),
      });

      console.log(`[CustomLLM] 收到流式响应, 状态码: ${response.status}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[CustomLLM] 流式响应错误: ${errorText}`);

        let error;
        try {
          error = JSON.parse(errorText);
        } catch {
          error = { error: { message: `HTTP error ${response.status}` } };
        }
        throw new Error(`API请求失败: ${error.error?.message || response.statusText}`);
      }

      if (!response.body) {
        console.error(`[CustomLLM] 流式响应没有可读流`);
        throw new Error("响应没有可读流");
      }

      console.log(`[CustomLLM] 开始读取流式数据`);
      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let buffer = "";
      let chunkCounter = 0;

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          console.log(`[CustomLLM] 流式读取完成`);
          break;
        }

        // 解码收到的数据
        const chunk = decoder.decode(value, { stream: true });
        buffer += chunk;
        console.log(`[CustomLLM] 收到原始数据块: ${chunk.substring(0, 100)}${chunk.length > 100 ? '...' : ''}`);

        // 处理SSE格式的数据
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            console.log(`[CustomLLM] 解析SSE数据行: ${data.substring(0, 100)}${data.length > 100 ? '...' : ''}`);

            // 处理SSE结束标记
            if (data === "[DONE]") {
              console.log(`[CustomLLM] 收到流式结束标记 [DONE]`);
              return;
            }

            try {
              const parsedData = JSON.parse(data);
              const text = this.extractStreamChunk(parsedData);

              if (text) {
                chunkCounter++;
                console.log(`[CustomLLM] 提取的文本块 #${chunkCounter}: ${text}`);

                const generationChunk = new GenerationChunk({
                  text,
                });

                // 触发回调
                if (runManager) {
                  await runManager.handleLLMNewToken(text);
                }

                yield generationChunk;
              } else {
                console.log(`[CustomLLM] 从数据中提取的文本为空`);
              }
            } catch (e) {
              // 忽略解析错误，继续处理下一行
              console.warn(`[CustomLLM] 解析流数据时出错: ${e instanceof Error ? e.message : String(e)}`);
              console.log(`[CustomLLM] 出错的原始数据: ${data}`);
            }
          }
        }
      }
    } catch (error: any) {
      console.error(`[CustomLLM] 流式调用失败: ${error instanceof Error ? error.stack : String(error)}`);
      throw new Error(`流式调用自定义LLM API失败: ${error.message}`);
    }
  }

  /**
   * 从流式响应中提取文本块
   */
  private extractStreamChunk(data: any): string {
    console.log(`[CustomLLM] 开始从流式数据中提取文本: ${JSON.stringify(data).substring(0, 200)}`);

    // 支持OpenAI格式
    if (data.choices && data.choices.length > 0) {
      console.log(`[CustomLLM] 检测到OpenAI格式数据`);
      if (data.choices[0].text) {
        console.log(`[CustomLLM] 使用choices[0].text: ${data.choices[0].text}`);
        return data.choices[0].text;
      }
      if (data.choices[0].delta && data.choices[0].delta.content) {
        console.log(`[CustomLLM] 使用choices[0].delta.content: ${data.choices[0].delta.content}`);
        return data.choices[0].delta.content;
      }
    }

    // 支持Anthropic格式
    if (data.completion) {
      console.log(`[CustomLLM] 检测到Anthropic格式数据: ${data.completion}`);
      return data.completion;
    }

    // 支持通用格式
    if (data.chunk || data.text || data.content) {
      const result = data.chunk || data.text || data.content;
      console.log(`[CustomLLM] 检测到通用格式数据: ${result}`);
      return result;
    }

    console.log(`[CustomLLM] 无法从数据中提取文本: ${JSON.stringify(data)}`);
    return "";
  }
}
