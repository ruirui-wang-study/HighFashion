# SEO 自动化能力说明

本文档说明 PulseGear 当前在 `/admin/seo/automation` 可用的 SEO 自动化能力范围、边界和操作方式。

## 1. 总览看板

- 展示健康检查摘要：扫描页面数、开放问题数、平均健康分
- 展示数据连接状态：Google Search Console（GSC）与 GA4
- 展示机会与建议规模：Opportunities、Recommendations、Content Pipeline
- 展示最近变更记录：Recent SEO Changes

## 2. 站点健康检查（Health Check）

- 支持扫描页面类型：
- 产品页（`/products/{slug}`）
- 集合页与 SEO Landing 页（`/collections/{slug}`）
- 指南页（`/guides/{slug}`）
- FAQ 与关键静态页
- 检查项包含：
- `title` 与长度
- `meta description` 与长度
- `canonical`
- H1 数量
- 图片 `alt` 缺失
- 是否在 sitemap 中
- 是否可索引（indexable）
- 结构化数据存在性（如 Product/Breadcrumb）
- 输出结果：
- 页面健康分（health score）
- 问题列表（issues）

## 3. Google 数据同步（GSC / GA4）

- 支持手动触发：
- `Sync GSC`
- `Sync GA4`
- 当前为可运行的 mock-safe 流程：
- 在未配置凭据时显示 `Not Connected`
- 页面保持可访问，不因凭据缺失崩溃
- 已预留后续切换到真实数据源的接口形态

## 4. 机会生成（Opportunities）

- 支持 `Generate Opportunities`
- 输出内容包括：
- 机会类型（如高曝光低 CTR、8-20 位关键词等）
- 对应页面/关键词
- 建议动作
- 优先级与预期影响

## 5. SEO 建议生成与应用（Recommendations）

- 支持 `Generate Recommendations`
- 建议以 `AI Draft` 形式输出（例如：
- `seoTitle`
- `seoDescription`
- 支持人工动作：
- `Apply`（应用）
- `Reject`（拒绝）
- 应用时会记录：
- `AuditLog`
- `SeoChangeLog`

## 6. 内容管道（Content Pipeline）

- 支持从机会生成内容 Brief
- Brief 可进入内容生产流程并标记状态
- 发布策略为人工控制：
- 仅在手动 `Publish` 时发布
- 不存在自动发布

## 7. 内链建议（Internal Links）

- 支持生成页面间内链建议：
- 来源页（source）
- 目标页（target）
- 锚文本（anchor text）
- 建议理由与优先级
- 支持人工 `Apply`，并写入审计/变更记录

## 8. 审计与变更追踪

- 所有关键操作均可追踪：
- `AuditLog` 记录操作者与动作
- `SeoChangeLog` 记录资源变更前后

## 9. 当前策略与边界

- 当前定位是“半自动 SEO 运营”：
- 自动发现问题、自动生成建议与草稿
- 关键变更必须人工审核与确认
- 系统不会自动覆盖线上 SEO 字段或自动发布内容

## 10. 典型操作流程

1. 进入 `/admin/seo/automation`
2. 执行 `Run Health Check` 识别站点问题
3. 执行 `Sync GSC` / `Sync GA4` 更新数据基础
4. 执行 `Generate Opportunities` 与 `Generate Recommendations`
5. 在人工评审后对建议执行 `Apply` 或 `Reject`
6. 对内容 Brief 执行 `Publish`（如需要）
7. 在 Recent Changes 中核对变更记录

