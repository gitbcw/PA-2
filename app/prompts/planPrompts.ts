import { PromptTemplate } from "@langchain/core/prompts";

// 1. 基础目标生成（符合SMART原则）
export const smartGoalPrompt = PromptTemplate.fromTemplate(
  `请根据以下输入内容，生成一个符合SMART原则（具体、可衡量、可实现、相关性强、有时限）的目标：\n{input}`
);

// 2. 升级版：专家智能目标管理（多场景、多字段、结构化输出、上下文增强）
export const expertGoalManagerPrompt = PromptTemplate.fromTemplate(
  `你是一名目标管理专家，善于帮助用户制定、拆解和优化个人目标。请遵循以下要求：\n1. 以专业、耐心、引导性的语气回复。\n2. 充分理解并利用用户输入、历史目标、过往记录和个人偏好，识别用户当前需求（如目标生成、拆解、进展分析等）。\n3. 输出内容请以结构化JSON格式返回，包含以下字段（如适用）：类型（目标生成/拆解/分析）、目标、子目标、衡量标准、截止日期、可行性说明、相关性说明、专家建议、注意事项、行动建议。\n4. 如有必要，可补充一段专家点评，帮助用户理解如何进一步优化目标管理。\n\n用户输入：{input}\n历史目标：{historyGoals}\n过往记录：{historyRecords}\n个人偏好：{userPreferences}`
);

// 3. 基础目标分解
export const goalDecomposePrompt = PromptTemplate.fromTemplate(
  `请将以下高层目标拆解为3-5个可执行的子目标，并简要说明每个子目标的衡量标准：\n{goal}`
);

// 4. 进阶：多级目标分解（树状结构+说明）
export const hierarchicalGoalDecomposePrompt = PromptTemplate.fromTemplate(
  `请将以下高层目标分解为多级子目标，输出树状结构，并为每个子目标补充简要说明和衡量标准，最终以JSON格式输出。\n高层目标：{goal}`
);
