# PulseGear 数据库 SQL 整理

本目录汇总 **建表 DDL** 与 **测试数据 DML**，便于在无法使用 Prisma CLI 的环境（纯 SQL 客户端、CI、手工初始化）中初始化数据库。

源真相（schema）仍以 `api/prisma/schema.prisma` 与 `api/prisma/migrations/` 为准。

---

## 目录结构

| 文件 / 目录 | 说明 |
|-------------|------|
| `00_drop_all.sql` | 删除所有业务表与枚举（仅本地/可丢弃库） |
| `01_full_schema.sql` | **当前完整建表 SQL**（由 Prisma schema 一次性生成） |
| `02_migrations_combined.sql` | 按迁移顺序拼接的增量 DDL |
| `migrations/` | 每条 Prisma 迁移单独一份 SQL（`01_0001_init.sql` …） |
| `03_test_data.sql` | 测试数据：角色、管理员、分类、商品、SKU、默认设置 |
| `scripts/build-sql-bundle.mjs` | 从 `prisma/migrations` 重新生成 `02_*` 与 `migrations/` |
| `scripts/generate-seed-sql.mjs` | 从 `prisma/seed.ts` 同源数据重新生成 `03_test_data.sql` |

---

## 推荐初始化方式

### 方式 A：空库一键建表 + 测试数据（推荐）

```bash
psql "$DATABASE_URL" -f api/prisma/sql/01_full_schema.sql
psql "$DATABASE_URL" -f api/prisma/sql/03_test_data.sql
# 可选：写入 Guides / FAQ 等 CMS 内容
cd api && npm run prisma:seed
```

### 方式 B：按历史迁移增量升级

适用于已有旧库、需对齐迁移链：

```bash
psql "$DATABASE_URL" -f api/prisma/sql/02_migrations_combined.sql
```

> 新环境请优先用 `01_full_schema.sql`，避免与已有对象冲突。

### 方式 C：Prisma 官方流程（开发日常）

```bash
cd api
npm run prisma:migrate
npm run prisma:seed
```

---

## 测试数据说明（`03_test_data.sql`）

| 内容 | 说明 |
|------|------|
| 管理员账号 | `admin@pulsegear.local` / `Admin1234!` |
| 商品 | 8 个 ACTIVE 商品 + 全部颜色/尺码变体 |
| 分类 Collection | support / carry / hydration / socks / sweat / recovery |
| `AdminSettings` | id = `default` 的默认运营配置 |
| `reservedStock` | 变体初始为 `0` |

**未包含在 SQL 中、需 `prisma:seed` 补充：**

- Guides（`data/guides.ts`）
- FAQ（`data/faq.ts`）
- SEO / Product Research 演示数据

---

## 重新生成 SQL 文件

在 `api` 目录执行：

```bash
# 根据 schema.prisma 刷新完整建表文件
npx prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma --script > prisma/sql/01_full_schema.sql

# 拼接迁移 + 复制到 migrations/
node prisma/sql/scripts/build-sql-bundle.mjs

# 刷新测试数据
node prisma/sql/scripts/generate-seed-sql.mjs
```

可在 `api/package.json` 中增加：

```json
"sql:schema": "prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma --script > prisma/sql/01_full_schema.sql",
"sql:bundle": "node prisma/sql/scripts/build-sql-bundle.mjs",
"sql:seed": "node prisma/sql/scripts/generate-seed-sql.mjs"
```

---

## 迁移顺序清单

1. `0001_init`
2. `0002_admin_inventory_fields`
3. `0003_product_seo_fields`
4. `0004_admin_auth_tables`
5. `0005_content_management_cms`
6. `0006_admin_order_management`
7. `0007_admin_settings`
8. `0008_seo_automation`
9. `0009_copy_config`
10. `0010_product_research`
11. `0011_product_bilingual_fields`
12. `0012_content_bilingual_fields`
13. `0013_collection_landing_bilingual_intro`
14. `0014_static_page_content`
15. `0015_product_research_risk_resolution`
16. `0016_inventory_reservation`
17. `20260525011718_product_research`

---

## 表清单（按域）

### 电商核心

- `Product`, `ProductVariant`, `ProductImage`, `Collection`, `ProductCollection`
- `Order`, `OrderItem`, `OrderNote`, `OrderStatusEvent`
- `PaymentEvent`, `InventoryMovement`

### 管理后台

- `AdminRole`, `AdminUser`, `AdminSettings`, `AuditLog`

### CMS 内容

- `ContentEntry`, `GuideContent`, `FaqContent`, `CollectionLandingContent`, `StaticPageContent`
- `SiteSetting`, `UiCopy`, `ContentTemplate`

### SEO 自动化

- `SeoPage`, `SeoIssue`, `SeoRecommendation`, `SeoChangeLog`
- `SearchConsoleQueryDaily`, `SearchConsolePageDaily`, `Ga4LandingPageDaily`
- `ContentOpportunity`, `ContentBrief`, `InternalLinkSuggestion`, `SeoAutomationRule`

### 选品研究

- `ProductCandidate`, `ProductCandidateScore`, `Supplier`, `ProductCandidateSupplier`
- `ProductResearchSignal`, `ProductTestLaunch`, `ProductResearchDecision`
- `ProductResearchImportBatch`, `ProductResearchRiskFlag`, `ScoringRule`

---

## 相关文档

- [order-payment-inventory.md](../../docs/order-payment-inventory.md) — 订单/库存字段说明
- [external-config.md](../../docs/external-config.md) — `DATABASE_URL` 等环境变量
