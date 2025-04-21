/**
 * 摘要提示
 * 
 * 用于生成文本摘要。
 */

import { createPrompt } from "ai/prompts";

/**
 * 摘要提示
 * 
 * @param length 摘要长度，如"简短"、"中等"、"详细"
 * @param style 摘要风格，如"客观"、"分析性"、"简明"
 * @param text 需要摘要的原文
 */
export const summarizePrompt = createPrompt({
  system: ({ length = "简短", style = "客观" }: { length?: string; style?: string }) => 
    `请提供一个${length}且${style}的摘要。
     保留原文的关键信息和主要观点。
     避免添加原文中不存在的信息或个人观点。
     摘要应该是连贯的，而不仅仅是要点列表。`,
  
  human: ({ text }: { text: string }) => `请总结以下内容：\n\n${text}`,
});
