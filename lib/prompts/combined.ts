/**
 * 组合提示
 *
 * 通过组合多个基础提示创建更复杂的提示。
 */

import { ChatPromptTemplate, SystemMessagePromptTemplate, HumanMessagePromptTemplate } from "@langchain/core/prompts";
import { getExpertSystemTemplate } from "./expert";

/**
 * 教学提示
 *
 * 结合通用聊天和专家提示，用于教学场景。
 *
 * @param domain 专业领域
 * @param level 教学水平，如"初级"、"中级"、"高级"
 * @param language 使用的语言，默认为中文
 * @returns LangChain ChatPromptTemplate
 */
export function teachingPrompt({ domain, level, language = "中文" }: { domain: string; level: string; language?: string }) {
  // 通用聊天提示的系统消息
  const generalSystemTemplate = `你是一个有用的AI助手。请用${language}回答问题。
  提供准确、有帮助且易于理解的回答。
  如果你不确定答案，请坦诚地说明，而不是提供可能不正确的信息。`;

  // 专家提示的系统消息
  const expertSystemTemplate = getExpertSystemTemplate({ domain, language });

  // 教学相关的指导
  const teachingGuidance = `你正在教授${level}水平的学生。
  请确保解释清晰，并提供适合该水平的例子。
  对于${level}水平的学生，你应该：
  - 使用适当的术语和概念
  - 提供足够的背景信息
  - 使用恰当的类比和例子
  - 循序渐进地解释复杂概念
  - 鼓励批判性思考和提问`;

  // 组合所有系统消息
  const combinedSystemTemplate = `${generalSystemTemplate}

${expertSystemTemplate}

${teachingGuidance}`;

  const systemMessagePrompt = SystemMessagePromptTemplate.fromTemplate(combinedSystemTemplate);
  const humanMessagePrompt = HumanMessagePromptTemplate.fromTemplate("{query}");

  return ChatPromptTemplate.fromMessages([
    systemMessagePrompt,
    humanMessagePrompt
  ]);
}
