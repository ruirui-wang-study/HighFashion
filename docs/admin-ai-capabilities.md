# Admin AI 能力现状（2026-05）

本文档描述**当前已上线**的 AI 相关能力，作为 [Agent 设计方案](./admin-ai-agent-design.md) 的基线。

## 基础设施

| 组件 | 路径 | 说明 |
|------|------|------|
| 配置解析 | `api/src/ai/ai-config.service.ts` | DB 站点设置 + `.env`；provider：`local` / `openai` / `deepseek` / `mimo` |
| JSON 补全 | `api/src/ai/llm-json-completion.ts` | 单次调用；MiMo 优先 `MIMO_ANTHROPIC_BASE_URL`（Anthropic Messages） |
| Admin 配置 UI | `components/admin/admin-ai-provider-config-editor.tsx` | 模型槽位；API Key 仅在 `.env` |
| OpenAPI | `api/openapi/admin-domains.json` | product-research + seo-automation 契约 |
| 连通测试 | `api/scripts/test-mimo.mjs` | `npm run test:mimo`（api 目录） |

### Provider 实际可用性

| Provider | 选品生成 | SEO 改写 | 备注 |
|----------|----------|----------|------|
| **mimo** | ✅ | ✅ | Token Plan Key 需走 `MIMO_ANTHROPIC_BASE_URL` |
| **deepseek** | ✅ | ✅ | OpenAI 兼容 + `response_format: json_object` |
| **openai** | ❌ | ❌ | 配置存在，无 Provider 实现 |
| **local** | ✅ 兜底 | ✅ 兜底 | 模板 / mock |

## 选品研究（Product Research）

| 能力 | LLM | 说明 |
|------|-----|------|
| AI 导入预览/提交（批量候选） | ✅ | `ProductResearchRuntimeService` → MiMo / DeepSeek |
| 候选评分 / 风险 / 状态 | ❌ | `product-research.engine` 规则 + 权重 |
| 市场信号 `collectSignals` | ❌ | 固定 local mock |
| 1688 `enrichAlibabaLinks` | ❌ | local 模板 |
| CSV / 供应商报价 / 手动 | ❌ | 结构化导入 |

配置模型槽位 `scoring` / `copy` / `fast` 在评分 `scoreReasonJson` 中仅作**元数据记录**，未调用 LLM 打分或文案生成。

后台能力：分页候选、导入批处理、评估队列（`enqueueCandidateAssessments`）、风险 resolve、`GET assessment-runtime`。

## SEO 自动化

在「生成/刷新」草稿时，若 provider 为 **mimo 或 deepseek** 且 Key 有效，对本地种子做 LLM 改写：

| 能力 | LLM 任务 |
|------|----------|
| 内容机会 | `rewriteOpportunityDrafts` |
| SEO 推荐 | `rewriteRecommendationDrafts` |
| 内链建议 | `rewriteInternalLinkDrafts` |
| 内容 Brief | `rewriteContentBrief` |
| 商品 SEO 草稿 | `rewriteProductSeoDraft` |

**非 LLM**：健康检查规则扫描、GSC/GA4 同步（当前 mock）、Apply/Publish（人工 API）。

## 未接入 AI 的 Admin 模块

- 商品 CRUD（描述、卖点）
- 内容管理（Guides / FAQ / 集合落地页）
- 订单 / 库存 / 分析看板
- Merchant Feed
- 前台商城

## 环境变量（MiMo Token Plan）

见 [external-config.md](./external-config.md)。生产推荐：

```env
PRODUCT_RESEARCH_AI_PROVIDER=mimo
MIMO_API_KEY=...
MIMO_ANTHROPIC_BASE_URL=https://token-plan-cn.xiaomimimo.com/anthropic
MIMO_BASE_URL=https://api.xiaomimimo.com/v1
```

官方 OpenAI 兼容端点与 Token Plan Key 通常不通用；以 `npm run test:mimo` 为准。
