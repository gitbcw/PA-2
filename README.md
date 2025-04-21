# PDCA 个人助手系统

## 项目概述

PDCA 个人助手系统是一个基于 AI 的个人生产力工具，集成任务管理、信息收集、智能分析和游戏化元素。系统采用前后端分离架构，前端使用 React + TypeScript，后端使用 Python + FastAPI + PostgreSQL。

## 核心功能

### 目标管理 (Goal)
- 多层级目标设定（愿景、年度、季度、月度、周目标）
- 基于 LLM 的对话式目标设定
- 目标分解与追踪

### 任务管理 (Task)
- 任务创建、编辑、删除、分类
- 优先级设置
- 多视图展示（列表、看板、日历）

### 信息采集 (Collect)
- 多源信息采集
- 自动分类与标签
- 定时采集任务

### 信息整理 (Summary)
- AI 摘要生成
- 知识图谱
- 报告生成

### 智能分析 (Analysis)
- 任务复杂度评估
- 时间估算
- 依赖关系分析

### 智能代理 (Agent)
- 自动化工作流
- 定时任务执行
- 外部服务集成

## 技术栈

- **前端**：React + TypeScript + TailwindCSS
- **后端**：Python + FastAPI
- **数据库**：PostgreSQL
- **AI 集成**：OpenAI API

## 开发环境

- Windows（无 WSL）
- Node >= 16

## 配置项

### 环境变量配置

在项目根目录创建 `.env.local` 文件，配置以下环境变量：

```
# LLM提供商选择 (openai, anthropic, custom)
LLM_PROVIDER="openai"

# OpenAI配置
OPENAI_API_KEY="你的OpenAI API密钥"

# Anthropic配置
# ANTHROPIC_API_KEY="你的Anthropic密钥"

# 自定义LLM API配置
# CUSTOM_LLM_API_KEY="你的自定义LLM API密钥"
# CUSTOM_LLM_BASE_URL="https://your-custom-llm-api.com/v1"
# CUSTOM_LLM_MODEL="你的模型名称"
# CUSTOM_LLM_HEADERS="{\"X-Custom-Header\":\"custom-value\"}"

# 向量存储配置
# VECTOR_STORE_TYPE="memory"  # 可选值: memory, milvus

# Milvus向量数据库配置
# MILVUS_HOST="your-milvus-server-address"
# MILVUS_PORT="19530"
# MILVUS_SSL="false"
# MILVUS_USERNAME=""
# MILVUS_PASSWORD=""
# MILVUS_COLLECTION="langchain_store"

# 通用LLM配置
# LLM_MODEL="模型名称"  # 如果未指定，将使用提供商的默认模型
# LLM_TEMPERATURE="0.7"  # 默认为0.7
# LLM_MAX_TOKENS="1000"  # 如果未指定，将使用提供商的默认值
# LLM_STREAMING="true"   # 是否启用流式输出，默认为false

# 必需 - 回调设置
LANGCHAIN_CALLBACKS_BACKGROUND=false

# 可选 - 代理功能需要
# SERPAPI_API_KEY="你的SERPAPI密钥"

# 可选 - 检索功能需要
# SUPABASE_PRIVATE_KEY="你的Supabase私钥"
# SUPABASE_URL="你的Supabase URL"

# 可选 - LangSmith追踪
# LANGCHAIN_TRACING_V2=true
# LANGCHAIN_API_KEY=你的LangChain API密钥
# LANGCHAIN_PROJECT=项目名称

# 可选 - 演示模式
# NEXT_PUBLIC_DEMO="true"
```

### LLM配置

系统支持多种LLM提供商，包括：

1. **OpenAI**
   - 默认支持，使用OpenAI的API
   - 需要配置OPENAI_API_KEY

2. **Anthropic**
   - 支持Claude系列模型
   - 需要配置ANTHROPIC_API_KEY

3. **智谱AI GLM-4**
   - 支持智谱AI的GLM-4模型
   - 需要配置GLM_API_KEY
   - 详细文档请参考[docs/glm-api.md](docs/glm-api.md)

4. **自定义LLM API**
   - 支持连接到任何兼容的LLM API
   - 需要配置CUSTOM_LLM_API_KEY和CUSTOM_LLM_BASE_URL
   - 可以配置自定义请求头和其他参数
   - 支持各种兼容OpenAI API格式的服务，如私有部署的LLM、开源模型等
   - 详细文档请参考[docs/custom-llm-api.md](docs/custom-llm-api.md)

使用方式：

1. 在`.env.local`中设置`LLM_PROVIDER`为您想使用的提供商
2. 配置相应的API密钥和其他参数
3. 可选配置通用LLM参数，如模型名称、温度等

### 模块配置

系统各模块有特定配置项，主要包括：

1. **上下文模块配置**
   - 更新间隔设置
   - 数据保留期设置
   - 工作时间设置

2. **用户记忆模块配置**
   - 记忆衰减率
   - 置信度阈值
   - 数据保留期

3. **信息采集模块配置**
   - 信息源设置
   - 采集频率设置
   - 数据处理规则

## 快速开始

1. 克隆仓库
```bash
git clone https://github.com/your-username/PDCA-3.git
cd PDCA-3
```

2. 安装依赖
```bash
yarn install
```

3. 配置环境变量（创建 .env.local 文件）

4. 启动开发服务器
```bash
yarn dev
```

5. 在浏览器中访问 http://localhost:3000

## 项目结构

- `/app` - 前端应用代码
- `/docs` - 项目文档
- `/api` - 后端 API 接口
- `/lib` - 共享库代码
  - `/lib/prompts` - AI提示管理库
- `/scripts` - 实用脚本

## 向量数据库支持

系统支持多种向量数据库，包括：

1. **内存向量存储**
   - 默认支持，适用于开发和测试
   - 不需要额外配置

2. **Milvus向量数据库**
   - 支持连接到远程或本地的Milvus服务
   - 需要配置相关环境变量
   - 使用方式：
     1. 在`.env.local`中设置`VECTOR_STORE_TYPE="milvus"`
     2. 配置相应的Milvus连接参数
     3. 可以使用`scripts/test-milvus.js`脚本测试连接

使用方式：

1. 在`.env.local`中设置`VECTOR_STORE_TYPE`为您想使用的向量存储类型
2. 配置相应的连接参数
3. 系统会自动初始化并使用指定的向量存储

## Prompt管理系统

系统集成了基于Vercel AI SDK的轻量级Prompt管理系统，用于管理和使用AI提示模板。

### 主要功能

- **结构化提示模板**：使用`createPrompt`创建结构化的提示模板
- **变量渲染**：支持使用变量动态渲染提示
- **提示组合**：可以组合多个提示创建复杂的提示结构
- **多模型支持**：与多种AI模型提供商集成

### 提示库结构

提示库位于`lib/prompts`目录下，包含以下文件：

- `index.ts` - 导出所有提示
- `chat.ts` - 聊天相关提示
- `expert.ts` - 专家提示
- `summarize.ts` - 摘要相关提示
- `creative.ts` - 创意写作提示
- `planning.ts` - 目标规划提示
- `tasks.ts` - 任务分解提示
- `combined.ts` - 组合提示

### 使用方式

1. 在API路由或服务器组件中导入所需的提示
2. 使用`getPrompt`函数获取提示模板
3. 传入参数渲染提示
4. 使用渲染后的提示调用AI模型

详细文档请参考[docs/prompt-management.md](docs/prompt-management.md)

## 贡献指南

欢迎提交 Issue 和 Pull Request 来帮助改进项目。
