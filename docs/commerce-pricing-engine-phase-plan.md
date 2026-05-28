# 交易规则引擎方案（Phase 0 → Phase 2）

本文档定义 PulseGear 结算规则的演进方案：先满足生产可用，再扩展为可编排规则引擎。

## 1. 目标

- 结算金额可解释、可复算、可审计
- 规则发布可灰度、可回滚
- Quote 与 Session 双重校验，防篡改
- 多地区、多币种、多支付方式可扩展

## 2. 分阶段交付

### Phase 0（先上线）

- `CommerceRuleSet` + `TaxRule` + `ShippingRule` + `PaymentMethodRule`
- `POST /api/checkout/quote`
- `POST /api/checkout/session` 可选签名校验
- 订单落库冻结 `ruleSetVersion` 与 `pricingSnapshot`

### Phase 1（生产增强）

- 规则发布流：`draft -> staging -> active`
- 覆盖率检测与冲突预检
- Active 规则缓存与失效机制
- 指标与告警完善

### Phase 2（平台化）

- `PricingRule` + `Condition` + `Action`
- 规则模拟器 / 校验器
- 分阶段执行（pre-tax/shipping/post-tax/payment）
- 历史订单回放测试

## 3. 关键约束

- 规则计算统一在后端执行，前端仅展示
- 订单创建时冻结价格快照，不在 webhook 回调阶段重算
- 所有金额使用最小货币单位（分），禁止浮点计算
- 关键变更写审计日志

## 4. Phase 0 API（本轮实现）

### POST /api/checkout/quote

输入：items + country/region/postalCode + currency  
输出：价格拆分、规则命中上下文、可用支付方式、签名

### POST /api/checkout/session

在现有下单流程基础上，新增可选签名校验：

- 若请求携带 `quoteId/quoteExpiresAt/quoteSignature`，后端执行签名与过期校验
- 若未携带（兼容旧前端），按旧流程处理

## 5. 上线验收

- quote 与 session 金额一致率达到预期
- 规则未命中时有可解释 fallback（默认运费、税费为 0）
- 可通过订单快照复原结算过程
