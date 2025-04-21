/**
 * 专家提示
 *
 * 用于特定领域的专业问答。
 */

import { ChatPromptTemplate, SystemMessagePromptTemplate, HumanMessagePromptTemplate } from "@langchain/core/prompts";

/**
 * 专家提示模板
 *
 * @param domain 专业领域，如"人工智能"、"心理学"等
 * @param language 回复使用的语言，默认为中文
 * @returns LangChain ChatPromptTemplate
 */
export function expertPrompt({ domain, language = "中文" }: { domain: string; language?: string }) {
  const systemTemplate = `你是${domain}领域的资深专家，拥有多年的实践和研究经验。
  请用专业且易于理解的${language}回答问题。
  在回答中引用相关的研究或最佳实践，但避免过于学术化的语言。
  如果问题超出你的专业范围，请明确指出。`;

  const systemMessagePrompt = SystemMessagePromptTemplate.fromTemplate(systemTemplate);
  const humanMessagePrompt = HumanMessagePromptTemplate.fromTemplate("{query}");

  return ChatPromptTemplate.fromMessages([
    systemMessagePrompt,
    humanMessagePrompt
  ]);
}

/**
 * 获取专家提示的系统消息模板
 *
 * @param domain 专业领域
 * @param language 语言
 * @returns 系统消息模板
 */
export function getExpertSystemTemplate({ domain, language = "中文" }: { domain: string; language?: string }) {
  return `你是${domain}领域的资深专家，拥有多年的实践和研究经验。
  请用专业且易于理解的${language}回答问题。
  在回答中引用相关的研究或最佳实践，但避免过于学术化的语言。
  如果问题超出你的专业范围，请明确指出。`;
}