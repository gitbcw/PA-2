# Milvus向量数据库集成指南

本文档介绍如何在项目中使用Milvus向量数据库进行向量存储和检索。

## 什么是Milvus？

[Milvus](https://milvus.io/)是一个开源的向量数据库，专为嵌入相似性搜索和AI应用设计。它提供了高效的向量存储、索引和检索功能，适用于各种AI应用场景，如语义搜索、推荐系统、图像检索等。

## 前提条件

1. 已安装并运行Milvus服务（本地或远程）
2. 已配置相关环境变量

## 配置步骤

### 1. 安装依赖

项目已经包含了Milvus客户端库，如果需要手动安装，可以执行：

```bash
yarn add @zilliz/milvus2-sdk-node
```

### 2. 配置环境变量

在项目根目录的`.env.local`文件中添加以下配置：

```
# 向量存储类型
VECTOR_STORE_TYPE=milvus

# Milvus配置
MILVUS_HOST=your-milvus-server-address
MILVUS_PORT=19530
MILVUS_SSL=false
MILVUS_USERNAME=your-username  # 如果有
MILVUS_PASSWORD=your-password  # 如果有
MILVUS_COLLECTION=langchain_store
MILVUS_DIMENSION=1536
```

### 3. 使用Milvus向量存储

系统会根据环境变量自动初始化并使用Milvus向量存储。您可以通过以下方式使用：

```typescript
import { getVectorStore, addDocumentsToVectorStore, similaritySearch } from "../lib/vectorstore";
import { Document } from "@langchain/core/documents";

// 获取向量存储实例
const vectorStore = await getVectorStore();

// 添加文档
const documents = [
  new Document({
    pageContent: "这是一个测试文档",
    metadata: { source: "test" }
  })
];
await addDocumentsToVectorStore(documents);

// 相似度搜索
const results = await similaritySearch("查询文本", 3);
console.log(results);
```

## 测试Milvus连接

项目提供了一个测试脚本，用于验证Milvus连接是否正常：

```bash
# 设置环境变量
set MILVUS_HOST=your-milvus-server-address
set MILVUS_PORT=19530

# 运行测试脚本
node scripts/test-milvus.js
```

## 高级配置

### 自定义集合名称

您可以通过设置`MILVUS_COLLECTION`环境变量来自定义集合名称：

```
MILVUS_COLLECTION=my_custom_collection
```

### 配置向量维度

根据您使用的嵌入模型，设置适当的向量维度：

```
MILVUS_DIMENSION=1536  # OpenAI text-embedding-3-small
```

不同模型的向量维度：
- OpenAI text-embedding-3-small: 1536
- OpenAI text-embedding-3-large: 3072
- OpenAI text-embedding-ada-002: 1536

### 安全连接

如果您的Milvus服务需要SSL连接，可以设置：

```
MILVUS_SSL=true
```

## 故障排除

### 连接问题

如果无法连接到Milvus服务器，请检查：

1. Milvus服务是否正在运行
2. 主机名和端口是否正确
3. 网络连接是否正常（防火墙设置等）
4. 如果使用用户名和密码，请确保凭据正确

您可以使用网络连接测试脚本来验证基本的网络连接：

```bash
yarn test:milvus-ping
```

### 超时问题

如果遇到超时错误，可能是因为：

1. 网络延迟过高
2. Milvus服务器负载过重
3. 客户端超时设置过低

您可以尝试增加超时时间，在`MilvusVectorStore`类的构造函数中修改超时设置：

```typescript
this.client = new MilvusClient({
  address: `${host}:${port}`,
  ssl,
  username: username || undefined,
  password: password || undefined,
  timeout: 60000, // 增加超时时间到 60 秒
});
```

### 集合创建失败

如果集合创建失败，可能是因为：

1. 没有足够的权限
2. 集合名称已存在但结构不匹配
3. 服务器资源不足

## 参考资源

- [Milvus官方文档](https://milvus.io/docs)
- [Milvus Node.js SDK文档](https://github.com/milvus-io/milvus-sdk-node)
- [LangChain向量存储文档](https://js.langchain.com/docs/modules/data_connection/vectorstores/)
