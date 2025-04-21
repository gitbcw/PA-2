/**
 * 通用聊天提示
 *
 * 用于一般性的对话和问答交互。
 */

import { ChatPromptTemplate, SystemMessagePromptTemplate, HumanMessagePromptTemplate } from "@langchain/core/prompts";

/**
 * 通用聊天提示模板
 *
 * @param language 回复使用的语言，默认为中文
 * @returns LangChain ChatPromptTemplate
 */
export function generalChatPrompt({ language = "中文" }: { language?: string } = {}) {
  const systemTemplate = `你是一个有用的AI助手。请用${language}回答问题。
  提供准确、有帮助且易于理解的回答。
  如果你不确定答案，请坦诚地说明，而不是提供可能不正确的信息。`;

  const systemMessagePrompt = SystemMessagePromptTemplate.fromTemplate(systemTemplate);
  const humanMessagePrompt = HumanMessagePromptTemplate.fromTemplate("{query}");

  return ChatPromptTemplate.fromMessages([
    systemMessagePrompt,
    humanMessagePrompt
  ]);
}

/**
 * 构建完整的聊天消息数组 (兼容旧版API)
 *
 * @param query 用户的问题或请求
 * @param language 回复使用的语言，默认为中文
 */
export function buildChatMessages(query: string, language: string = "中文") {
  return [
    {
      role: 'system', content: `你是一个有用的AI助手。请用${language}回答问题。
  提供准确、有帮助且易于理解的回答。
  如果你不确定答案，请坦诚地说明，而不是提供可能不正确的信息。` },
    { role: 'user', content: query }
  ];
}
