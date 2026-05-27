# PulseGear 前台 + API

<p align="center">
  <a href="README.md">首页</a>
  &nbsp;|&nbsp;
  <a href="README.en.md">English</a>
  &nbsp;|&nbsp;
  <strong>简体中文</strong>
</p>

PulseGear 是面向跑步、训练、球场与恢复场景的 **移动优先 DTC 电商** 项目，主打轻量支撑、携带、水合、防汗与恢复类配件。本仓库包含 **Next.js** 前台与 **NestJS** API，数据层为 **PostgreSQL + Prisma**，支付使用 **Stripe Checkout**。

**状态快照：** `2026-05-27`

---

## 目录

1. [架构](#1-架构)
2. [项目状态](#2-项目状态)
3. [功能概览](#3-功能概览)
4. [选品研究](#4-选品研究)
5. [SEO](#5-seo)
6. [Admin AI](#6-admin-ai)
7. [数据模型](#7-数据模型)
8. [配置与本地开发](#8-配置与本地开发)
9. [Stripe 结账](#9-stripe-结账)
10. [前台 API](#10-前台-api)
11. [验证](#11-验证)
12. [缺口与上线清单](#12-缺口与上线清单)
13. [相关文档](#13-相关文档)

---

## 1. 架构

```text
app/                         Next.js App Router 页面与元数据路由
components/                  前台 UI、购物车、SEO 组件
data/                        本地内容与 SEO 种子数据
lib/                         前台工具、类型、SEO 构建
api/                         NestJS API
api/prisma/                  Prisma 模型、迁移、种子
docs/                        运维与设计文档
```

### 前台

| 区域 | 技术 / 说明 |
|------|-------------|
| 框架 | Next.js App Router、TypeScript、Tailwind CSS |
| 购物车 | `components/cart-provider.tsx`，按 `variantId` |
| API | `lib/api-client.ts` |
| SEO | `app/sitemap.ts`、`app/robots.ts`、`lib/seo.ts`、`lib/structured-data.ts` |

**主要前台路由：** `/`、`/shop`、`/products/[slug]`、`/collections/[...segments]`、`/cart`、`/checkout/success`、`/guides`、`/guides/[slug]`、`/faq`、`/fit-guide`、`/about`

**主要 Admin 路由：** `/admin/login`、`/admin/dashboard`、`/admin/products`、`/admin/orders`、`/admin/inventory`、`/admin/content`、`/admin/seo`、`/admin/product-research/*`、`/admin/analytics`、`/admin/marketing/merchant-feed`、`/admin/settings`

### 后端

| 区域 | 技术 / 说明 |
|------|-------------|
| 框架 | NestJS |
| 数据库 | PostgreSQL + Prisma |
| 支付 | Stripe Checkout + Webhook |

**API 模块：** `health`、`products`、`collections`、`checkout`、`orders`、`payments`、`webhooks`、`admin-auth`、`admin-products`、`admin-orders`、`admin-content`、`admin-seo`、`product-research`、`seo-automation`、`admin-analytics`、`admin-marketing`、`admin-settings`

---

## 2. 项目状态

### 各域成熟度

| 领域 | 成熟度 |
|------|--------|
| 交易核心 | 稳定 MVP |
| Admin 运营 | 稳定 MVP |
| 选品研究 | 可用内部 Alpha |
| SEO 自动化 | 可用内部 Alpha（AI 辅助草稿） |
| 外部集成 | 部分完成 — 缺凭据时 mock-safe |

### 近期能力

- 前台 + Admin 端到端：浏览、购物车、Stripe、订单、库存、内容、SEO、分析、设置
- **选品：** 持久化候选、多源导入、评分、风险、测款、决策、转商品安全规则
- **SEO 自动化：** AI 辅助推荐、内链、机会、Brief、商品 SEO 草稿（须手动 Apply/Publish）
- **统一 AI 配置：** 站点 `ai.*`，兼容旧键 `product_research.ai.*`
- **中英双语内容：** 商品、FAQ、指南、集合落地页、静态页、首页文案块
- **服务拆分：** 选品与 SEO 已拆分为领域服务，避免单文件膨胀

---

## 3. 功能概览

### 3.1 前台

- 商品列表、集合、PDP；移动端 sticky 加购与信任/配送信息
- Stripe Checkout；跳转前创建订单；成功页按 session 轮询
- 按订单号或 checkout session 查询订单
- Webhook 状态：`PENDING`、`PAID`、`PAYMENT_FAILED`、`EXPIRED`
- 支付成功扣库存；结账前购物车校验
- 场景导航：**Run**、**Train**、**Court**、**Recover**
- 公开设置与文案快照接口

### 3.2 内容与指南

- `/guides`、`/guides/[slug]`（`data/guides.ts`）
- Article JSON-LD、目录、FAQ、相关商品/集合/指南

### 3.3 集合 SEO

- 路由：`app/collections/[...segments]/page.tsx`
- 可索引基础类：`support`、`carry`、`hydration`、`socks`、`sweat`、`recovery`
- 白名单 SEO 落地页（如 `/collections/running/knee-support`）
- 筛选/排序/价格/尺码/颜色参数页：`noindex, follow`，canonical 回基础页或落地页
- 配置：`data/collection-pages.ts`

### 3.4 Admin 与运营

| 域 | 能力 |
|----|------|
| 认证 | Cookie 会话；角色：`VIEWER`、`OPERATOR`、`CONTENT_EDITOR`、`ANALYST`、`ADMIN`、`SUPER_ADMIN` |
| 商品与库存 | CRUD、库存调整、流水 |
| 订单 | 搜索、筛选、备注、发货、Stripe 信息 |
| 内容 | 指南、FAQ、中英编辑、发布流 |
| SEO 报表 | 概览、页面/查询表现 |
| SEO 自动化 | 健康检查、GSC/GA4 同步、机会、推荐、Brief、内链、商品 SEO、变更日志 |
| 选品研究 | 看板、候选、导入、评分规则、风险复核、测款、决策、批量重算 |
| 分析 | 看板、销售、商品、漏斗 |
| 营销 | Merchant Feed 导出（JSON/XML） |
| 设置 | 站点设置、文案配置、AI Provider 槽位 |

---

## 4. 选品研究

### 评分模型

**综合分** 默认权重：

- 市场需求 15%、趋势季节 10%、竞争缺口 10%、毛利潜力 15%
- 物流适配 10%、品牌契合 15%、供应商质量 10%、风险逆分 10%、可测性 5%
- `风险逆分 = 100 - 风险分`

**测款后校验分：** `初评 × 0.6 + 测款分 × 0.4`

**风险门槛：** 风险分 ≥ 70 → `HIGH_RISK_REVIEW`；`BLOCKING` 风险禁止转商品。

**安全规则：** AI 可生成候选与草稿；**不可**自动上架或自动下单；转商品始终为 `Product.status = DRAFT`。

### 导入模板

- [候选 CSV 模板](docs/product-research-import-template-candidates.csv)
- [供应商报价 CSV 模板](docs/product-research-import-template-supplier-quotes.csv)

**候选列：** `product_name`、`chinese_name`、`category`、`target_market`、`target_audience`、`use_case`、`alibaba_keywords`、`notes`

**供应商报价列：** `product_name`、`supplier_name`、`supplier_url`、`platform`、`moq`、`sample_price`、`unit_price`、`shipping_to_us`、`shipping_to_uk`、`lead_time_days`、`custom_logo_moq`、`custom_packaging_moq`、`trade_assurance`、`verified_supplier`、`certifications`、`notes`

### 工作流

1. 导入或新建候选 → 2. 去重预览 → 3. 信号与供应商 → 4. 评分与风险 → 5. 决策（`SAMPLE` / `TEST` / `WATCH` / `APPROVE` / `REJECT`）→ 6. 测款与校验分 → 7. 仅对已批准且无 BLOCKING 风险转商品草稿

### 实现状态

| 已完成 | 待完善 / 部分 |
|--------|----------------|
| AI / CSV / 供应商 / 1688 导入 | 去重合并 UX |
| 确定性评分与风险 | 供应商报价历史 UI |
| 测款与校验分 | 评分可解释性 UI |
| 转商品护栏与审计 | 真实外部信号（GSC/Trends 等） |
| 领域服务拆分 | 计划中的多 Agent 层（见 AI 文档） |

---

## 5. SEO

### 前台技术 SEO

- 各路由 `generateMetadata`、canonical、Open Graph
- `/sitemap.xml`、`/robots.txt`
- JSON-LD：Product、BreadcrumbList、FAQPage、Article
- `/product/[slug]` canonical 到 `/products/[slug]`；购物车、结账、Admin、筛选组合 `noindex`
- Sitemap `lastModified` 取自内容时间（非构建时间）

### SEO 自动化（`/admin/seo/automation`）

- 扫描首页、商品、集合、指南、FAQ、已批准落地页
- 手动 GSC / GA4 同步（可接 cron）；无凭据显示 `Not Connected`
- 机会、推荐、内链、Brief、商品 SEO 均为草稿
- **Apply** / **Publish** 须人工操作；写入 `AuditLog` + `SeoChangeLog`

**建议生产 cron（仅生成草稿，禁止自动发布）：**

```text
0 3 * * *   SEO 健康检查
15 3 * * *  GSC 同步
30 3 * * *  GA4 同步
45 3 * * *  机会 + 推荐生成
```

详见 [docs/seo-automation-capabilities.md](docs/seo-automation-capabilities.md)

---

## 6. Admin AI

### 当前（已上线）

| 模块 | LLM 用途 |
|------|----------|
| 选品研究 | AI 生成候选（MiMo / DeepSeek）；评分为 **规则引擎** |
| SEO 自动化 | 草稿润色（MiMo / DeepSeek） |
| 降级 | Provider 失败时用 local 模板 |

**MiMo Token Plan：** 配置 `MIMO_ANTHROPIC_BASE_URL`（如 `https://token-plan-cn.xiaomimimo.com/anthropic`）。连通测试：`cd api && npm run test:mimo`

### 计划（已文档化，未实现）

Admin 多 Agent（Research / SeoOps / Copy + Guard）：见 [docs/admin-ai-agent.md](docs/admin-ai-agent.md)

| 文档 | 说明 |
|------|------|
| [admin-ai-capabilities.md](docs/admin-ai-capabilities.md) | 当前能力 |
| [admin-ai-agent-design.md](docs/admin-ai-agent-design.md) | 架构与路线 |
| [admin-ai-agent-technical-mitigations.md](docs/admin-ai-agent-technical-mitigations.md) | 技术坑与对策 |

---

## 7. 数据模型

### 本地种子（`data/`）

- `products.ts` — 目录与 sitemap 关系
- `guides.ts`、`collection-pages.ts`、`faq.ts`

### Prisma 主要实体

`Product`、`ProductVariant`、`ProductImage`、`Collection`、`Order`、`OrderItem`、`PaymentEvent`、`InventoryMovement`、`ProductCandidate`、`ProductCandidateScore`、`Supplier`、`ProductCandidateSupplier`、`ProductResearchSignal`、`ProductTestLaunch`、`ProductResearchDecision`、`ProductResearchImportBatch`、`ProductResearchRiskFlag`、`ScoringRule`

模型文件：`api/prisma/schema.prisma`

---

## 8. 配置与本地开发

复制 `.env.example` → `.env`。完整变量见 [docs/external-config.md](docs/external-config.md)。

**最低配置：**

```text
DATABASE_URL=postgresql://...
FRONTEND_URL=http://localhost:3000
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

**可选：** `GSC_*`、`GA4_*`、`MIMO_*`、`DEEPSEEK_*`、`PRODUCT_RESEARCH_AI_PROVIDER`

### 数据库

```bash
docker compose up -d postgres          # 可选
npm --prefix api run prisma:generate
npm --prefix api run prisma:migrate
npm --prefix api run prisma:seed
# 或：npx --prefix api prisma migrate deploy
```

### 开发服务

```bash
npm install && npm --prefix api install
npm run dev:api      # API :4000
npm run dev          # 前台 :3000
npm run dev:all      # 同时启动
```

**日志：** `npm run dev` / `dev:api` 写入 `logs/`（`scripts/run-with-log.mjs`）

**OpenAPI（Admin 域）：**

```bash
npm run openapi:types
npm run openapi:check
```

---

## 9. Stripe 结账

详见 [docs/order-payment-inventory.md](docs/order-payment-inventory.md)

**流程：** 购物车 → `POST /api/checkout/session` → 预占库存 + `PENDING` 订单 → Stripe 跳转 → Webhook → `PAID` / 失败 / 过期 → 成功后清空购物车

**Webhook 事件：** `checkout.session.completed`、`async_payment_succeeded`、`async_payment_failed`、`expired`

**本地测试：**

```bash
stripe listen --forward-to localhost:4000/api/webhooks/stripe
# 将 whsec_... 写入 STRIPE_WEBHOOK_SECRET 后重启 API
```

测试卡：`4242 4242 4242 4242`

---

## 10. 前台 API

```text
GET  /api/health
GET  /api/products
GET  /api/products/:slug
GET  /api/collections
GET  /api/collections/:slug/products
POST /api/checkout/session
GET  /api/orders/by-session/:sessionId
GET  /api/orders/:orderNo
POST /api/webhooks/stripe
```

**成功：**

```json
{ "success": true, "data": {} }
```

**失败：**

```json
{ "success": false, "error": { "code": "ERROR_CODE", "message": "..." } }
```

Admin 接口在 `/api/admin/*`（需 Admin Cookie）。

---

## 11. 验证

```bash
# 前台
npm run lint && npm run build

# API
npm --prefix api run lint
npm --prefix api test
npm --prefix api run build

# OpenAPI 契约
npm run openapi:check
```

**SEO 自动化冒烟：** 打开 `/admin/seo/automation` → 健康检查、同步按钮、草稿 Apply/Publish、sitemap/robots。

---

## 12. 缺口与上线清单

### 当前缺口

- 非完整 CMS，部分内容仍由应用层管理
- 无真实评价、税费引擎、分国家运费矩阵
- 分析 / SEO 连接器在无凭据时可能为 mock
- 选品：去重 UX、外部信号、评分可解释性
- 尚无生产级可观测性栈

### 上线 TODO

- [ ] 生产 PostgreSQL 与备份
- [ ] Stripe 正式密钥与 Webhook URL
- [ ] Apple Pay 域验证；BNPL/PayPal 市场规则
- [ ] 税费与配送规则
- [ ] 限流、结构化日志、监控
- [ ] SEO 定时任务（cron 禁止自动发布）

---

## 13. 相关文档

| 文档 | 说明 |
|------|------|
| [README.md](README.md) | 语言入口 |
| [README.en.md](README.en.md) | English full doc |
| [docs/external-config.md](docs/external-config.md) | 环境变量 |
| [docs/seo-automation-capabilities.md](docs/seo-automation-capabilities.md) | SEO 自动化范围 |
| [docs/admin-ai-agent.md](docs/admin-ai-agent.md) | Admin AI 索引 |
| [docs/order-payment-inventory.md](docs/order-payment-inventory.md) | 支付与库存 |
| [docs/user-guide-zh.md](docs/user-guide-zh.md) | 中文使用指南 |
| [AGENTS.md](AGENTS.md) | 品牌、SEO 与开发约定 |

---

<p align="center">
  <a href="README.md">首页</a>
  &nbsp;|&nbsp;
  <a href="README.en.md">English</a>
  &nbsp;|&nbsp;
  <strong>简体中文</strong>
</p>
