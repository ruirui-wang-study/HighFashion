# De-Mock Roadmap

本文档用于梳理 PulseGear 当前系统中仍然依赖 mock、占位数据、假连接状态或本地 seed 的模块，并给出建议改造顺序。

目标不是一次性“全量去 mock”，而是按业务价值、风险和实施成本分阶段推进。

## P0

### 1. 接通真实 GSC 数据源

- 目标：
- 用真实 Google Search Console 数据替换当前 SEO 后台中的 mock provider
- 让 `overview`、`queries`、`pages`、SEO 自动化判断基于真实搜索数据
- 主要范围：
- `api/src/admin-seo/search-console-sync.service.ts`
- `api/src/admin-seo/search-console-mock.provider.ts`
- `api/src/seo-automation/seo-automation.service.ts`
- 验收标准：
- 可以通过配置的服务账号成功拉取指定 property 数据
- 后台页面不再显示纯 mock 查询样例
- GSC 凭据无效时页面仍安全降级，不崩溃

### 2. 接通真实 GA4 行为数据

- 目标：
- 替换 admin analytics 中的 mock fallback
- 让 sessions、product views、add to cart、funnel 等行为指标来自真实 GA4
- 主要范围：
- `api/src/admin-analytics/admin-analytics.service.ts`
- `api/src/admin-analytics/admin-analytics.mock-provider.ts`
- 验收标准：
- Dashboard / Product Analytics / Funnel 页面展示真实行为数据
- 指标时间范围切换后能返回对应区间数据
- 与本地订单数据并存时口径说明清晰

### 3. 让 SEO Automation 变为真实数据驱动

- 目标：
- 当前 recommendation / opportunity / internal link / content pipeline 已持久化
- 下一步将生成逻辑从硬编码草稿切换为真实数据驱动
- 依赖输入：
- GSC 查询与页面数据
- GA4 落地页与行为数据
- 本地 health check 结果
- 主要范围：
- `api/src/seo-automation/seo-automation.service.ts`
- 验收标准：
- Recommendations 基于真实页面问题或搜索表现生成
- Opportunities 基于真实查询/曝光/CTR/转化信号生成
- Internal Links 不再只返回固定 2 条样例

## P1

### 4. 去掉商品页假 UGC / 假评论

- 目标：
- 移除商品页中的“Mock customer image”与假评价模块
- 接真实评论系统，或在无真实数据时先隐藏该模块
- 主要范围：
- `app/products/[slug]/page.tsx`
- `app/product/[slug]/page.tsx`
- 验收标准：
- 页面上不再出现 mock customer image 文案
- 不展示虚构评论、评分、图片

### 5. 接真实运费 / 包邮规则

- 目标：
- 把当前 FAQ 和前台中提到的包邮门槛从 mock 逻辑切为真实可配置规则
- 主要范围：
- `data/faq.ts`
- `app/faq/page.tsx`
- cart / checkout 相关逻辑
- 验收标准：
- FAQ 中的包邮描述与结算实际逻辑一致
- 可按国家、币种、门槛进行配置

### 6. 接真实 Merchant Feed / Merchant Center 状态

- 目标：
- 让营销后台中的 Merchant Feed 管理不再是占位连接状态
- 主要范围：
- `api/src/admin-marketing/admin-merchant-feed.service.ts`
- `api/src/admin-marketing/merchant-center-sync.service.ts`
- 验收标准：
- 能展示真实连接状态
- 能执行真实导出或同步
- 同步失败时有明确错误反馈

## P2

### 7. 商品与集合数据切换到真实主数据源

- 目标：
- 前台商品、集合、变体、价格等不再主要依赖本地 seed 文件
- 主要范围：
- `data/products.ts`
- 商品页、集合页、sitemap、相关 SEO 逻辑
- 目标数据源：
- PostgreSQL
- 或 Shopify Storefront API
- 验收标准：
- 商品详情、集合页、SEO 路径与实际商品数据一致
- 前后台使用统一商品主数据

### 8. 指南 / FAQ / SEO 落地页切换到 CMS

- 目标：
- 把当前写死在代码里的 guide / faq / collection landing 内容迁移到 CMS 或现有内容管理流
- 主要范围：
- `data/guides.ts`
- `data/faq.ts`
- `ContentEntry` 及相关内容读取逻辑
- 验收标准：
- 内容更新不需要改代码发版
- metadata、JSON-LD、canonical 行为保持不回退

### 9. 清理系统中的 mock 文案

- 目标：
- 删除前台和后台中显式说明“mock fallback”或“mock data”的提示文案
- 主要范围：
- `app/page.tsx`
- `app/about/page.tsx`
- admin analytics / seo / settings 页面文案
- 验收标准：
- 上线后页面中不再暴露 mock 占位说明
- 仅在真实能力就绪后再移除，避免误导

## 建议执行顺序

1. GSC 接入
2. GA4 接入
3. SEO Automation 规则真实化
4. 去掉商品页假 UGC / 假评论
5. 运费 / 包邮规则真实化
6. Merchant Feed / Merchant Center 真实化
7. 商品主数据源统一
8. 内容 CMS 化
9. 清理 mock 文案

## 当前推进原则

- 不做“一次性大重构”
- 每一阶段都要求：
- 可验证
- 可回退
- 不破坏现有 URL、SEO 输出和结算核心链路

