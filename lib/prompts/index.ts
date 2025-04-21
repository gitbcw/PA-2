/**
 * 提示库索引文件
 *
 * 这个文件导出所有可用的提示模板，并提供一个方便的获取函数。
 * 基于LangChain的PromptTemplate实现。
 */

import { generalChatPrompt } from "./chat";
import { expertPrompt } from "./expert";
import { teachingPrompt } from "./combined";

// 导出已迁移到LangChain的提示
export const prompts = {
  generalChat: generalChatPrompt,
  expert: expertPrompt,
  teaching: teachingPrompt,
};

// TODO: 将以下提示迁移到LangChain
// summarize: summarizePrompt,
// creativeWriting: creativeWritingPrompt,
// goalPlanning: goalPlanningPrompt,
// taskBreakdown: taskBreakdownPrompt,

/**
 * 提示选择函数
 *
 * @param type 提示类型
 * @returns 对应的LangChain ChatPromptTemplate
 */
export function getPrompt(type: keyof typeof prompts) {
  return prompts[type];
}

// 导出所有提示类型
export type PromptType = keyof typeof prompts;

/**
 * 使用示例:
 *
 * ```typescript
 * import { ChatOpenAI } from "@langchain/openai";
 * import { getPrompt } from "@/lib/prompts";
 *
 * const llm = new ChatOpenAI({
 *   model: "gpt-4",
 *   temperature: 0.7,
 * });
 *
 * // 获取提示模板
 * const prompt = getPrompt("generalChat");
 *
 * // 使用提示模板调用LLM
 * const chain = prompt.pipe(llm);
 * const result = await chain.invoke({
 *   language: "中文",
 *   query: "什么是人工智能?"
 * });
 * ```
 */
