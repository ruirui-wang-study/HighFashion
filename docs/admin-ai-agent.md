# Admin AI Agent 文档索引

PulseGear Admin 侧 AI 能力的设计与实施说明。当前仓库已实现**单次 JSON 补全**（选品生成、SEO 文案改写）；本文档描述计划中的 **Agent 多步编排** 体系。

## 文档列表

### 科普文章

| 文档 | 内容 |
|------|------|
| [03 PulseGear 从 0 到 1](./articles/03-pulsegear-从0到1搭建实录.md) | 搭建阶段、迁移节奏、今天与明天 |
| [01「AI+电商」：Multi-Agent 实战尝试](./articles/01-admin-ai-agent-场景与多Agent设计.md) | 为何 Multi-Agent、Agent 设计、痛点全景 |
| [02 痛点解决方案](./articles/02-admin-ai-agent-痛点解决方案.md) | 逐条对策、链路示意、Phase 0 清单 |

### 设计与实施

| 文档 | 内容 |
|------|------|
| [admin-ai-agent-design.md](./admin-ai-agent-design.md) | **主文档（v2）**：痛点矩阵、场景、双轨架构、Agent 规格、API、前端、SLO、分阶段 DoD |
| [admin-ai-agent-technical-mitigations.md](./admin-ai-agent-technical-mitigations.md) | Phase 0 **实施检查清单**：截断/Redis/测试/监控等实现细节 |
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
