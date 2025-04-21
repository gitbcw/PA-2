/**
 * 创意写作提示
 * 
 * 用于生成创意内容，如故事、文案等。
 */

import { createPrompt } from "ai/prompts";

/**
 * 创意写作提示
 * 
 * @param style 写作风格，如"叙事"、"诗歌"、"广告"等
 * @param tone 语调，如"幽默"、"严肃"、"温暖"等
 * @param length 内容长度，默认为"中等"
 * @param topic 写作主题
 * @param keywords 需要包含的关键词列表
 */
export const creativeWritingPrompt = createPrompt({
  system: ({ style, tone, length = "中等" }: { style: string; tone: string; length?: string }) => 
    `你是一个创意写作助手。请使用${style}风格和${tone}语调，创作一篇${length}长度的内容。
     确保内容原创、引人入胜且符合指定的风格和语调。
     如果提供了关键词，请自然地将它们融入内容中。`,
  
  human: ({ topic, keywords = [] }: { topic: string; keywords?: string[] }) => 
    `主题：${topic}
     ${keywords.length > 0 ? `关键词：${keywords.join(', ')}` : ''}`,
});
