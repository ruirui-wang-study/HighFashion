# Admin AI Agent 文档索引

PulseGear Admin 侧 AI 能力的设计与实施说明。当前仓库已实现**单次 JSON 补全**（选品生成、SEO 文案改写）；本文档描述计划中的 **Agent 多步编排** 体系。

## 文档列表

| 文档 | 内容 |
|------|------|
| [admin-ai-agent-design.md](./admin-ai-agent-design.md) | 总体设计：选型、多 Agent、架构、API、分阶段路线、业务影响 |
| [admin-ai-agent-technical-mitigations.md](./admin-ai-agent-technical-mitigations.md) | 技术痛点与优化方案：上下文、会话、幻觉、合规、测试等 |
| [admin-ai-capabilities.md](./admin-ai-capabilities.md) | **现状**：已上线的 AI 能力与未接入项 |
| [external-config.md](./external-config.md) | MiMo / DeepSeek 等环境变量 |
| [seo-automation-capabilities.md](./seo-automation-capabilities.md) | SEO 自动化模块能力边界 |

## 项目 README（中英切换）

| 语言 | 文件 |
|------|------|
| 入口 | [README.md](../README.md) |
| English | [README.en.md](../README.en.md) |
| 简体中文 | [README.zh-CN.md](../README.zh-CN.md) |

---

## 相关代码（现状）

| 路径 | 说明 |
|------|------|
| `api/src/ai/ai-config.service.ts` | Provider / 模型槽位解析 |
| `api/src/ai/llm-json-completion.ts` | 单次 JSON 补全（OpenAI 兼容 + MiMo Anthropic） |
| `api/src/product-research/product-research-runtime.service.ts` | 选品 AI 生成 + local fallback |
| `api/src/seo-automation/seo-ai-runtime.service.ts` | SEO 文案改写（mimo / deepseek） |
| `api/scripts/test-mimo.mjs` | MiMo 连通性测试（`npm run test:mimo`） |

## 计划代码（未实现）

| 路径 | 说明 |
|------|------|
| `api/src/ai/agent/` | AgentRunner、ToolRegistry、专家 Agent（待建） |

## 约束（与项目一致）

- Admin only；不自动发布商品、不自动下单。
- 无 Job 表；长任务使用进程内异步 + 可选 Redis 会话。
- 写库操作需人工 Apply / 决策确认。
