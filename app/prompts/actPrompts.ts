import { PromptTemplate } from "@langchain/core/prompts";

// 1. 基础个性化建议生成
export const personalizedAdvicePrompt = PromptTemplate.fromTemplate(
  `请针对以下目标或问题，生成3条可行的个性化改进建议：\n{context}`
);

// 2. 进阶：多场景/多类型建议卡片（行动清单格式）
export const multiTypeAdvicePrompt = PromptTemplate.fromTemplate(
  `请针对以下场景（单目标/整体方向/灵感触发），生成3条具体、可执行的建议，并以行动清单JSON格式输出，每条建议包括：建议内容、预期收益、执行步骤。\n场景类型：{type}\n上下文：{context}`
);

// 3. 基础灵感触发建议
export const inspirationPrompt = PromptTemplate.fromTemplate(
  `请基于以下信息，生成1-2条创新性或发散性的灵感建议：\n{info}`
);

// 4. 进阶：灵感清单卡片
export const inspirationListPrompt = PromptTemplate.fromTemplate(
  `请基于以下信息，生成一个灵感清单卡片，包含2-3条创新性建议，并以JSON格式输出，每条建议包括：创意内容、潜在价值、可行性分析。\n信息：{info}`
);
