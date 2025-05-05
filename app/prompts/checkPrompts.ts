import { PromptTemplate } from "@langchain/core/prompts";

// 1. 基础进度评估
export const progressEvaluatePrompt = PromptTemplate.fromTemplate(
  `请根据以下进度和记录，评估目标的完成率、风险和偏差，并输出简要说明：\n{progress}\n{records}`
);

// 2. 进阶：多维度综合进度评估
export const comprehensiveProgressEvaluationPrompt = PromptTemplate.fromTemplate(
  `请根据以下目标、进度和历史记录，综合评估目标的完成率、主要风险、偏差原因，并给出1-2条具体改进建议。以结构化卡片JSON输出，字段包括：完成率、主要风险、偏差原因、改进建议。\n目标：{goal}\n进度：{progress}\n历史记录：{records}`
);

// 3. 基础风险与偏差分析
export const riskAnalysisPrompt = PromptTemplate.fromTemplate(
  `请分析以下信息，指出潜在风险、偏差原因及改进建议：\n{info}`
);
