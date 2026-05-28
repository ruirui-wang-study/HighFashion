# PulseGear Storefront + API

<p align="center">
  <strong>English</strong> · <a href="README.en.md">README.en.md</a>
  &nbsp;|&nbsp;
  <strong>简体中文</strong> · <a href="README.zh-CN.md">README.zh-CN.md</a>
</p>

PulseGear is a **mobile-first DTC ecommerce** monorepo: **Next.js** storefront + **NestJS** API, **PostgreSQL** (Prisma), **Stripe Checkout**.

PulseGear 是 **移动优先的 DTC 电商** 单仓项目：**Next.js** 前台 + **NestJS** API、**PostgreSQL**（Prisma）、**Stripe Checkout**。

---

## Quick start / 快速开始

```bash
cp .env.example .env
npm install && npm --prefix api install
docker compose up -d postgres   # optional
npm --prefix api run prisma:generate
npm --prefix api run prisma:migrate
npm --prefix api run prisma:seed
npm run dev:all
```

| Service | URL |
|---------|-----|
| Storefront | http://localhost:3000 |
| API health | http://localhost:4000/api/health |

Full setup, environment variables, Stripe webhooks, and verification: see **[English](README.en.md)** or **[简体中文](README.zh-CN.md)**.

---

## Documentation map / 文档索引

| Topic | English doc | 中文说明 |
|-------|-------------|----------|
| **Full README** | [README.en.md](README.en.md) | [README.zh-CN.md](README.zh-CN.md) |
| External config | [docs/external-config.md](docs/external-config.md) | 第三方与环境变量 |
| SEO automation | [docs/seo-automation-capabilities.md](docs/seo-automation-capabilities.md) | SEO 自动化能力 |
| Admin AI (current + Agent design) | [docs/admin-ai-agent.md](docs/admin-ai-agent.md) | Admin AI 索引 |
| Orders & inventory | [docs/order-payment-inventory.md](docs/order-payment-inventory.md) | 订单、支付、库存 |
| Database SQL bundle | [api/prisma/sql/README.md](api/prisma/sql/README.md) | 建表 + 测试数据 SQL |
| User guide (ZH) | [docs/user-guide-zh.md](docs/user-guide-zh.md) | 中文使用说明 |
| PulseGear 0→1（ZH） | [docs/articles/03-pulsegear-从0到1搭建实录.md](docs/articles/03-pulsegear-从0到1搭建实录.md) | 搭建阶段实录 |
| Agent instructions | [AGENTS.md](AGENTS.md) | 品牌与 SEO 规则（开发） |

---

## Repository layout / 仓库结构

```text
app/              Next.js App Router
components/       Storefront & admin UI
lib/              Shared frontend utilities
data/             Local SEO / content seeds
api/              NestJS API + Prisma
docs/             Operational & design docs
```

---

## Highlights / 要点

- **Commerce**: cart → Stripe Checkout → webhook fulfillment → inventory
- **Admin**: products, orders, content (EN/ZH), SEO, analytics, product research
- **Product research**: import, scoring, risk, decisions, convert-to-`DRAFT` only
- **SEO automation**: health check, GSC/GA4 hooks, AI-assisted drafts (manual Apply/Publish)
- **GEO foundation**: `robots` crawler controls, `llms.txt`, AI-citable content templates, and `/admin/geo` monitoring workflows
- **AI**: MiMo (Token Plan Anthropic) / DeepSeek / local fallback — see [docs/admin-ai-capabilities.md](docs/admin-ai-capabilities.md)

---

<p align="center">
  <a href="README.en.md">Read full documentation (English)</a>
  &nbsp;·&nbsp;
  <a href="README.zh-CN.md">阅读完整文档（简体中文）</a>
</p>
