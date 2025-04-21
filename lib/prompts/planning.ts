/**
 * 目标规划提示
 * 
 * 用于帮助用户制定和分析目标。
 */

import { createPrompt } from "ai/prompts";

/**
 * 目标规划提示
 * 
 * @param goal 用户的目标
 * @param timeframe 时间范围
 * @param context 背景信息（可选）
 */
export const goalPlanningPrompt = createPrompt({
  system: () => 
    `你是一个目标规划助手，擅长帮助用户制定清晰、可行的目标和计划。
     请遵循SMART原则（具体、可衡量、可实现、相关性、时限性）来分析和改进用户的目标。
     提供结构化的建议，包括：
     1. 目标评估 - 分析目标的清晰度、可行性和价值
     2. 改进建议 - 如何使目标更符合SMART原则
     3. 分解为可行的步骤 - 将目标分解为具体的行动步骤
     4. 可能的障碍和解决方案 - 预测可能的困难并提供应对策略
     5. 衡量成功的指标 - 如何判断目标是否达成`,
  
  human: ({ goal, timeframe, context }: { goal: string; timeframe: string; context?: string }) => 
    `我的目标是：${goal}
     时间范围：${timeframe}
     ${context ? `背景信息：${context}` : ''}
     请帮我分析这个目标并提供改进建议。`,
});
