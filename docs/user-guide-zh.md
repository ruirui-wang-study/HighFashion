# PulseGear 中文使用说明

## 1. 项目说明

PulseGear 是一个面向运动护具、携带配件、补水装备、袜品、止汗与恢复类产品的 DTC 电商项目。  
系统由两部分组成：

- 前台：Next.js 商城站点
- 后台：NestJS + PostgreSQL + Prisma 管理与运营系统

本地默认地址：

- 前台：`http://localhost:3000`
- 后端 API：`http://localhost:4000`
- 健康检查：`http://localhost:4000/api/health`

## 2. 启动方式

首次安装依赖：

```bash
npm install
npm --prefix api install
```

初始化数据库：

```bash
npm --prefix api run prisma:generate
npm --prefix api run prisma:migrate
npm --prefix api run prisma:seed
```

启动前后端：

```bash
npm run dev:api
npm run dev
```

也可以一起启动：

```bash
npm run dev:all
```

如果在 Windows PowerShell 下直接执行 `npm` 被策略拦截，可改用：

```bash
cmd /c npm run dev:api
cmd /c npm run dev
cmd /c npm run dev:all
```

## 3. 前台使用说明

### 3.1 商城浏览

前台主要页面包括：

- 首页：`/`
- 商店页：`/shop`
- 商品详情页：`/products/{slug}`
- 集合页：`/collections/{slug}`
- 购物车：`/cart`
- 支付成功页：`/checkout/success`
- 指南列表：`/guides`
- 指南详情：`/guides/{slug}`
- FAQ：`/faq`
- 尺码/适配说明：`/fit-guide`
- 关于页：`/about`

### 3.2 商品与购物车

系统支持：

- 商品列表浏览
- 商品详情查看
- 规格变体选择
- 加入购物车
- 购物车数量调整
- 购物车自动校验失效 `variantId`

说明：

- 如果数据库重建或 seed 变化导致旧购物车里的 `variantId` 失效，系统会自动清理失效项
- 如果商品仍有效但库存或价格变化，购物车会自动同步并提示用户

### 3.3 下单与支付

结账链路如下：

1. 用户在购物车中选择商品
2. 前端调用 `POST /api/checkout/session`
3. 后端创建一笔 `PENDING` 订单
4. 后端创建 Stripe Checkout Session
5. 前端跳转到 Stripe 支付页
6. 支付完成后跳回 `/checkout/success?session_id=...`
7. 前端轮询订单状态
8. Stripe webhook 更新订单为 `PAID`、`PAYMENT_FAILED` 或 `EXPIRED`

当前已支持：

- Stripe Checkout 创建支付会话
- 支付成功后自动扣减库存
- 成功页按 `sessionId` 查询订单
- 公开订单接口返回支付状态与状态事件

### 3.4 订单状态

常见订单状态：

- `PENDING`：订单已创建，等待支付确认
- `PAID`：支付成功
- `PAYMENT_FAILED`：支付失败
- `EXPIRED`：支付会话过期
- `FULFILLED`：后台已标记发货/履约完成

## 4. 后台使用说明

### 4.1 后台入口

后台登录页：

- `http://localhost:3000/admin/login`

后台首页与模块入口：

- 仪表盘：`/admin/dashboard`
- 商品管理：`/admin/products`
- 订单管理：`/admin/orders`
- 库存管理：`/admin/inventory`
- 内容管理：`/admin/content`
- SEO 管理：`/admin/seo`
- 数据分析：`/admin/analytics`
- 营销 Feed：`/admin/marketing/merchant-feed`
- 系统设置：`/admin/settings`

### 4.2 角色权限

系统使用基于角色的后台权限。当前角色包括：

- `VIEWER`
- `OPERATOR`
- `CONTENT_EDITOR`
- `ANALYST`
- `ADMIN`
- `SUPER_ADMIN`

说明：

- `SUPER_ADMIN` 拥有最高权限
- 不同角色看到的左侧导航和可调用接口不同

### 4.3 仪表盘

后台仪表盘支持查看：

- KPI 汇总
- 销售相关数据概览
- 运营入口导航

### 4.4 商品管理

商品管理支持：

- 查看商品列表
- 查看商品详情
- 创建商品
- 编辑商品

相关页面：

- `/admin/products`
- `/admin/products/new`
- `/admin/products/{id}`

### 4.5 库存管理

库存管理支持：

- 查看库存列表
- 手动调整库存
- 记录库存变更流水

相关页面：

- `/admin/inventory`

### 4.6 订单管理

订单管理支持：

- 按订单号或邮箱搜索订单
- 按支付状态、履约状态筛选
- 查看订单详情
- 查看 Stripe 会话与支付 ID
- 查看商品快照、地址、备注、状态事件
- 添加内部备注
- 手动标记订单为已履约

相关页面：

- `/admin/orders`
- `/admin/orders/{id}`

### 4.7 内容管理

内容管理支持：

- 指南列表查看
- 指南新建与编辑
- 指南发布
- 指南归档
- 指南退回草稿
- FAQ 编辑

相关页面：

- `/admin/content`
- `/admin/content/guides`
- `/admin/content/guides/new`
- `/admin/content/guides/{id}`
- `/admin/content/faq`

### 4.8 SEO 管理

SEO 基础管理支持：

- SEO 总览
- 页面级 SEO 数据
- 查询词级 SEO 数据

相关页面：

- `/admin/seo`
- `/admin/seo/pages`
- `/admin/seo/queries`

### 4.9 SEO 自动化

SEO 自动化位于：

- `/admin/seo/automation`

当前支持：

- 自动化总览
- 健康检查手动运行
- SEO 问题列表与批量复核
- 手动触发 GSC 同步
- 手动触发 GA4 同步
- 机会项生成
- 推荐项生成
- 推荐项应用 / 拒绝
- 内容 brief 生成
- 内容管道发布
- 内链建议生成与应用
- 产品 SEO 草稿生成与手动应用
- 变更日志查看

相关页面：

- `/admin/seo/automation`
- `/admin/seo/issues`
- `/admin/seo/opportunities`
- `/admin/seo/recommendations`
- `/admin/seo/content-pipeline`
- `/admin/seo/internal-links`
- `/admin/seo/change-log`

说明：

- 当前这套能力是“半自动运营”
- 核心策略是“自动生成草稿 + 人工审核后应用”
- 未配置 GSC / GA4 凭据时，页面会显示 `Not Connected`

### 4.10 数据分析

分析模块支持：

- Dashboard 概览
- 销售分析
- 商品分析
- Funnel 分析

相关页面：

- `/admin/analytics`
- `/admin/analytics/sales`
- `/admin/analytics/products`
- `/admin/analytics/funnel`

说明：

- 订单与销售汇总依赖本地订单数据
- 部分行为分析指标在未接通真实外部数据时仍可能走 mock-safe fallback

### 4.11 营销 Feed

营销模块支持：

- Merchant Feed 概览
- Feed 导出

导出格式：

- `json`
- `xml`

相关页面：

- `/admin/marketing/merchant-feed`

### 4.12 系统设置

系统设置支持：

- 店铺设置查看与更新
- 前台公开设置读取
- Copy 配置查看与更新
- 前台公开文案快照读取

相关页面：

- `/admin/settings`

## 5. 常用接口说明

公开接口：

- `GET /api/health`
- `GET /api/products`
- `GET /api/products/{slug}`
- `GET /api/collections`
- `GET /api/collections/{slug}/products`
- `POST /api/checkout/session`
- `GET /api/orders/by-session/{sessionId}`
- `GET /api/orders/{orderNo}`
- `POST /api/webhooks/stripe`

后台接口按模块划分，包括：

- `admin/auth`
- `admin/products`
- `admin/orders`
- `admin/content`
- `admin/seo`
- `admin/analytics`
- `admin/marketing`
- `admin/settings`

统一响应格式：

```json
{ "success": true, "data": {} }
```

统一错误格式：

```json
{ "success": false, "error": { "code": "ERROR_CODE", "message": "Human readable message" } }
```

## 6. 常见问题

### 6.1 页面提示 `Failed to fetch`

通常表示后端 API 没有正常启动，或前端访问不到 `http://localhost:4000`。

处理方式：

1. 检查 `http://localhost:4000/api/health` 是否可访问
2. 确认 API 进程已启动
3. 确认前端环境变量指向正确的 API 地址

### 6.2 结账时报 `INVALID_VARIANT`

通常表示购物车里保存的是旧的 `variantId`，数据库里已不存在。

处理方式：

1. 刷新页面让购物车自动校验
2. 重新加入商品后再结账

### 6.3 后台 SEO 页面显示 `Not Connected`

表示 GSC 或 GA4 凭据未配置，或当前环境未接通真实外部服务。

处理方式：

1. 检查 `.env` 中的 `GSC_*` 与 `GA4_*`
2. 重启 API
3. 再进入 `/admin/seo/automation`

## 7. 当前限制

当前仍有这些限制：

- 指南和部分 SEO 内容仍以本地 seed 数据为主
- 未接入真实 CMS
- 未接入真实评论系统
- 未接入真实税费引擎
- 未完成按国家区分的运费矩阵
- 部分 analytics / SEO 外部数据仍保留 mock-safe fallback

## 8. 推荐排查顺序

如果本地运行异常，建议按这个顺序排查：

1. 先看 `GET /api/health`
2. 再看数据库迁移是否完成
3. 再看 `.env` 配置
4. 再看 API 启动日志
5. 最后再看前端页面报错
