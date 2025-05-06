import { PromptTemplate } from "@langchain/core/prompts";

// 1. 基础记录信息提取
export const extractKeyInfoPrompt = PromptTemplate.fromTemplate(
  `请从以下文本记录中提取关键事件、进展和重要信息，输出结构化摘要：\n{records}`
);

// 2. 进阶：分类结构化信息摘要
export const categorizedRecordSummaryPrompt = PromptTemplate.fromTemplate(
  `请对以下文本记录进行分类提取，分为：进展、遇到的问题、灵感、风险预警，并以结构化JSON输出。\n记录内容：{records}`
);

// 3. 基础进度主动汇报
export const progressReportPrompt = PromptTemplate.fromTemplate(
  `请根据以下内容，生成一条简明的进度汇报：\n{content}`
);

// 4. 进阶：进度+下步建议
export const progressAndNextStepPrompt = PromptTemplate.fromTemplate(
  `请根据以下内容，生成一条简明的进度汇报，并自动补充下一步建议。\n内容：{content}`
);
