# Prompt 管理系统

本文档描述了项目中使用的提示(Prompt)管理系统，基于LangChain实现。

## 概述

我们使用LangChain的`ChatPromptTemplate`和相关组件来创建和管理AI提示模板。这种方案允许我们：

- 创建结构化的提示模板
- 使用变量动态渲染提示
- 组合多个提示创建复杂的提示结构
- 与多种AI模型提供商集成
- 与LangChain的其他组件（如检索器、代理等）无缝集成

## 提示库结构

提示库位于`lib/prompts`目录下，组织如下：

```
lib/
  prompts/
    index.ts        # 导出所有提示
    chat.ts         # 聊天相关提示
    expert.ts       # 专家相关提示
    combined.ts     # 组合提示
    summarize.ts    # 摘要相关提示（待迁移）
    creative.ts     # 创意写作相关提示（待迁移）
    planning.ts     # 目标规划相关提示（待迁移）
    tasks.ts        # 任务分解相关提示（待迁移）
```

## 基本用法

### 创建提示

使用LangChain的`ChatPromptTemplate`和相关组件创建提示模板：

```typescript
// lib/prompts/chat.ts
import { ChatPromptTemplate, SystemMessagePromptTemplate, HumanMessagePromptTemplate } from "@langchain/core/prompts";

export function generalChatPrompt({ language = "中文" }: { language?: string } = {}) {
  // 系统消息模板
  const systemTemplate = `你是一个有用的AI助手。请用${language}回答问题。
  提供准确、有帮助且易于理解的回答。
  如果你不确定答案，请坦诚地说明，而不是提供可能不正确的信息。`;

  // 创建消息模板
  const systemMessagePrompt = SystemMessagePromptTemplate.fromTemplate(systemTemplate);
  const humanMessagePrompt = HumanMessagePromptTemplate.fromTemplate("{query}");

  // 组合成聊天提示模板
  return ChatPromptTemplate.fromMessages([
    systemMessagePrompt,
    humanMessagePrompt
  ]);
}
```

### 使用提示

在API路由中使用LangChain提示模板：

```typescript
// app/api/langchain/route.ts
import { NextRequest, NextResponse } from "next/server";
import { ChatOpenAI } from "@langchain/openai";
import { getPrompt } from "@/lib/prompts";

export async function POST(req: NextRequest) {
  const { promptType, params, model = "gpt-4o-mini" } = await req.json();

  // 获取提示模板
  const promptTemplate = getPrompt(promptType);

  // 创建LLM
  const llm = new ChatOpenAI({
    model,
    temperature: 0.7,
  });

  // 创建并执行链
  const chain = promptTemplate.pipe(llm);
  const result = await chain.invoke(params);

  return NextResponse.json({
    response: result.content,
    model,
    promptType
  });
}
```

## 提示模板库

以下是项目中已迁移到LangChain的主要提示模板：

### 通用聊天提示

```typescript
// lib/prompts/chat.ts
import { ChatPromptTemplate, SystemMessagePromptTemplate, HumanMessagePromptTemplate } from "@langchain/core/prompts";

export function generalChatPrompt({ language = "中文" }: { language?: string } = {}) {
  const systemTemplate = `你是一个有用的AI助手。请用${language}回答问题。
  提供准确、有帮助且易于理解的回答。
  如果你不确定答案，请坦诚地说明，而不是提供可能不正确的信息。`;

  const systemMessagePrompt = SystemMessagePromptTemplate.fromTemplate(systemTemplate);
  const humanMessagePrompt = HumanMessagePromptTemplate.fromTemplate("{query}");

  return ChatPromptTemplate.fromMessages([
    systemMessagePrompt,
    humanMessagePrompt
  ]);
}
```

### 专家提示

```typescript
// lib/prompts/expert.ts
import { ChatPromptTemplate, SystemMessagePromptTemplate, HumanMessagePromptTemplate } from "@langchain/core/prompts";

export function expertPrompt({ domain, language = "中文" }: { domain: string; language?: string }) {
  const systemTemplate = `你是${domain}领域的资深专家，拥有多年的实践和研究经验。
  请用专业且易于理解的${language}回答问题。
  在回答中引用相关的研究或最佳实践，但避免过于学术化的语言。
  如果问题超出你的专业范围，请明确指出。`;

  const systemMessagePrompt = SystemMessagePromptTemplate.fromTemplate(systemTemplate);
  const humanMessagePrompt = HumanMessagePromptTemplate.fromTemplate("{query}");

  return ChatPromptTemplate.fromMessages([
    systemMessagePrompt,
    humanMessagePrompt
  ]);
}
```

### 教学提示（组合提示示例）

```typescript
// lib/prompts/combined.ts
import { ChatPromptTemplate, SystemMessagePromptTemplate, HumanMessagePromptTemplate } from "@langchain/core/prompts";
import { getExpertSystemTemplate } from "./expert";

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
```

## 待迁移的提示模板

以下提示模板尚未迁移到LangChain，将在后续工作中完成迁移：

- 摘要提示 (summarizePrompt)
- 创意写作提示 (creativeWritingPrompt)
- 目标规划提示 (goalPlanningPrompt)
- 任务分解提示 (taskBreakdownPrompt)

## 提示索引

为了方便管理和使用所有提示，我们创建了一个中央索引文件：

```typescript
// lib/prompts/index.ts
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
```

## 使用示例

### API路由中使用

```typescript
// app/api/langchain/route.ts
import { NextRequest, NextResponse } from "next/server";
import { ChatOpenAI } from "@langchain/openai";
import { getPrompt } from "@/lib/prompts";

export async function POST(req: NextRequest) {
  try {
    const { promptType, params, model = "gpt-4o-mini", temperature = 0.7 } = await req.json();

    // 获取提示模板
    const promptTemplate = getPrompt(promptType);
    if (!promptTemplate) {
      return NextResponse.json(
        { error: `Invalid prompt type: ${promptType}` },
        { status: 400 }
      );
    }

    // 创建LLM
    const llm = new ChatOpenAI({
      model,
      temperature,
    });

    // 创建并执行链
    const chain = promptTemplate.pipe(llm);
    const result = await chain.invoke(params);

    return NextResponse.json({
      response: result.content,
      model,
      promptType
    });
  } catch (error) {
    console.error("Error generating text:", error);
    return NextResponse.json(
      { error: "Failed to generate text", details: (error as Error).message },
      { status: 500 }
    );
  }
}
```

### 服务器组件中使用

```tsx
// app/expert/page.tsx
import { ChatOpenAI } from "@langchain/openai";
import { expertPrompt } from "@/lib/prompts/expert";

export default async function ExpertPage({
  searchParams,
}: {
  searchParams: { domain?: string; query?: string; language?: string };
}) {
  const { domain, query, language = "中文" } = searchParams;

  let response = null;

  if (domain && query) {
    // 创建LLM
    const llm = new ChatOpenAI({
      model: "gpt-4o-mini",
      temperature: 0.7,
    });

    // 获取专家提示模板
    const prompt = expertPrompt({ domain, language });

    // 创建并执行链
    const chain = prompt.pipe(llm);
    const result = await chain.invoke({ query });

    response = result.content;
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">专家咨询</h1>

      <form className="mb-8">
        <div className="mb-4">
          <label className="block mb-2">专业领域：</label>
          <input
            type="text"
            name="domain"
            defaultValue={domain}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block mb-2">问题：</label>
          <textarea
            name="query"
            defaultValue={query}
            className="w-full p-2 border rounded h-32"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block mb-2">语言：</label>
          <select
            name="language"
            defaultValue={language}
            className="w-full p-2 border rounded"
          >
            <option value="中文">中文</option>
            <option value="English">English</option>
          </select>
        </div>

        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          提交问题
        </button>
      </form>

      {response && (
        <div className="p-4 border rounded bg-gray-50 whitespace-pre-wrap">
          {response}
        </div>
      )}
    </div>
  );
}
```

## 最佳实践

1. **模块化组织提示**：按功能或领域将提示分组到不同文件中
2. **使用类型**：为提示参数定义明确的TypeScript类型
3. **提供默认值**：为可选参数提供合理的默认值
4. **文档化提示**：为每个提示添加注释，说明其用途和参数
5. **重用提示组件**：通过组合现有提示创建新提示
6. **使用LangChain的链式操作**：利用`pipe`方法创建处理链
7. **版本控制**：在代码注释中记录提示的版本和更改历史

## 维护和更新

当需要修改提示时，只需更新相应的提示文件。由于所有提示都集中管理，这使得维护和更新变得简单。

例如，要改进专家提示：

```typescript
// lib/prompts/expert.ts
import { ChatPromptTemplate, SystemMessagePromptTemplate, HumanMessagePromptTemplate } from "@langchain/core/prompts";

// 更新于2023-05-15: 增加了更多专业性指导
export function expertPrompt({ domain, language = "中文" }: { domain: string; language?: string }) {
  const systemTemplate = `你是${domain}领域的资深专家，拥有多年的实践和研究经验。
  请用专业且易于理解的${language}回答问题。
  在回答中引用相关的研究或最佳实践，但避免过于学术化的语言。
  如果问题超出你的专业范围，请明确指出。
  对于复杂的问题，请提供渐进式的解释，从基础概念开始，然后过渡到更复杂的内容。`;

  const systemMessagePrompt = SystemMessagePromptTemplate.fromTemplate(systemTemplate);
  const humanMessagePrompt = HumanMessagePromptTemplate.fromTemplate("{query}");

  return ChatPromptTemplate.fromMessages([
    systemMessagePrompt,
    humanMessagePrompt
  ]);
}
```

## 结论

这个基于Vercel AI SDK的轻量级提示管理系统为我们提供了一种简单而强大的方式来组织和使用AI提示。它易于维护，便于扩展，并且与我们的Next.js项目无缝集成。

通过集中管理提示，我们可以确保一致性，并且可以轻松地优化和改进AI交互，而无需在代码库中搜索和替换硬编码的提示。
