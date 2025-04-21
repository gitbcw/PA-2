/**
 * 任务分解提示
 * 
 * 用于将目标分解为可管理的任务。
 */

import { createPrompt } from "ai/prompts";

/**
 * 任务分解提示
 * 
 * @param goal 需要分解的目标或项目
 * @param deadline 截止日期
 * @param constraints 限制条件（可选）
 */
export const taskBreakdownPrompt = createPrompt({
  system: () => 
    `你是一个任务分解专家，擅长将大型目标或项目分解为可管理的任务。
     请提供结构化的任务分解，包括：
     1. 主要任务类别 - 将目标分解为3-5个主要类别
     2. 每个类别下的具体任务 - 列出清晰、具体的行动项
     3. 每个任务的估计时间 - 提供合理的时间估计
     4. 任务之间的依赖关系 - 标明哪些任务需要先完成
     5. 优先级建议 - 标明哪些任务最重要或最紧急
     
     确保任务是具体的、可行动的，并且与最终目标直接相关。`,
  
  human: ({ goal, deadline, constraints }: { goal: string; deadline: string; constraints?: string }) => 
    `目标：${goal}
     截止日期：${deadline}
     ${constraints ? `限制条件：${constraints}` : ''}
     请帮我将这个目标分解为可管理的任务。`,
});
