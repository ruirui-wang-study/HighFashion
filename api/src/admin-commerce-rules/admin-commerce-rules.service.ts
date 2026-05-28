import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import type { Prisma } from "@prisma/client";
import { PrismaService } from "../common/prisma.service";
import { UpsertCommerceRuleSetDto } from "./dto/upsert-commerce-ruleset.dto";
import { SimulateCommerceQuoteDto } from "./dto/simulate-commerce-quote.dto";
import { CheckoutService } from "../checkout/checkout.service";

type Actor = { adminId: string; adminEmail: string };

@Injectable()
export class AdminCommerceRulesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly checkoutService: CheckoutService,
  ) {}

  async getActiveRuleSet() {
    return this.prisma.commerceRuleSet.findFirst({
      where: { status: "ACTIVE" },
      orderBy: { version: "desc" },
      include: { taxRules: true, shippingRules: true, paymentRules: true },
    });
  }

  async listRuleSets() {
    return this.prisma.commerceRuleSet.findMany({
      orderBy: [{ version: "desc" }, { createdAt: "desc" }],
      select: {
        id: true,
        name: true,
        version: true,
        status: true,
        description: true,
        effectiveFrom: true,
        effectiveTo: true,
        createdAt: true,
        updatedAt: true,
        publishedAt: true,
      },
    });
  }

  async upsertDraft(actor: Actor, body: UpsertCommerceRuleSetDto) {
    if (body.ruleSetId) {
      const existing = await this.prisma.commerceRuleSet.findUnique({ where: { id: body.ruleSetId } });
      if (!existing) throw new NotFoundException("Rule set not found");
      if (existing.status !== "DRAFT") throw new BadRequestException("Only DRAFT rule set can be edited");

      const updated = await this.prisma.$transaction(async (tx) => {
        await tx.taxRule.deleteMany({ where: { ruleSetId: existing.id } });
        await tx.shippingRule.deleteMany({ where: { ruleSetId: existing.id } });
        await tx.paymentMethodRule.deleteMany({ where: { ruleSetId: existing.id } });
        return tx.commerceRuleSet.update({
          where: { id: existing.id },
          data: {
            name: body.name,
            description: body.description,
            taxRules: { create: body.taxRules },
            shippingRules: { create: body.shippingRules },
            paymentRules: { create: body.paymentRules },
          },
          include: { taxRules: true, shippingRules: true, paymentRules: true },
        });
      });
      await this.writeAudit(actor.adminId, "COMMERCE_RULESET_UPDATED", updated.id, { version: updated.version });
      return updated;
    }

    const nextVersion = ((await this.prisma.commerceRuleSet.aggregate({ _max: { version: true } }))._max.version ?? 0) + 1;
    const created = await this.prisma.commerceRuleSet.create({
      data: {
        name: body.name,
        description: body.description,
        version: nextVersion,
        status: "DRAFT",
        createdByAdminId: actor.adminId,
        taxRules: { create: body.taxRules },
        shippingRules: { create: body.shippingRules },
        paymentRules: { create: body.paymentRules },
      },
      include: { taxRules: true, shippingRules: true, paymentRules: true },
    });
    await this.writeAudit(actor.adminId, "COMMERCE_RULESET_CREATED", created.id, { version: created.version });
    return created;
  }

  async validateDraft(body: UpsertCommerceRuleSetDto) {
    const errors: string[] = [];
    const warnings: string[] = [];
    const coverage = {
      taxCountries: new Set<string>(),
      shippingCountries: new Set<string>(),
      paymentCountries: new Set<string>(),
    };

    const shippingCountries = new Set((await this.prisma.adminSettings.findUnique({ where: { id: "default" } }))?.shippingCountries ?? ["US", "GB"]);

    for (const rule of body.taxRules) coverage.taxCountries.add(rule.countryCode.toUpperCase());
    for (const rule of body.shippingRules) coverage.shippingCountries.add(rule.countryCode.toUpperCase());
    for (const rule of body.paymentRules) coverage.paymentCountries.add(rule.countryCode.toUpperCase());

    for (const country of shippingCountries) {
      if (!coverage.taxCountries.has(country)) errors.push(`Missing tax rule coverage for country: ${country}`);
      if (!coverage.shippingCountries.has(country)) errors.push(`Missing shipping rule coverage for country: ${country}`);
      if (!coverage.paymentCountries.has(country)) warnings.push(`Missing payment rule coverage for country: ${country}`);
    }

    const dupKey = new Set<string>();
    for (const rule of body.shippingRules) {
      const key = `${rule.countryCode}|${rule.regionCode ?? ""}|${rule.currency}`;
      if (dupKey.has(key)) warnings.push(`Duplicate shipping rule scope detected: ${key}`);
      dupKey.add(key);
      if (rule.feeMode === "FREE_OVER_THRESHOLD" && rule.freeOverMinor == null) {
        errors.push(`FREE_OVER_THRESHOLD shipping rule requires freeOverMinor: ${key}`);
      }
      if (rule.feeMode === "FLAT" && rule.flatFeeMinor == null) {
        errors.push(`FLAT shipping rule requires flatFeeMinor: ${key}`);
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      coverage: {
        requiredShippingCountries: [...shippingCountries].sort(),
        taxCountries: [...coverage.taxCountries].sort(),
        shippingCountries: [...coverage.shippingCountries].sort(),
        paymentCountries: [...coverage.paymentCountries].sort(),
      },
    };
  }

  async validateRuleSet(id: string) {
    const ruleSet = await this.prisma.commerceRuleSet.findUnique({
      where: { id },
      include: { taxRules: true, shippingRules: true, paymentRules: true },
    });
    if (!ruleSet) throw new NotFoundException("Rule set not found");
    return this.validateDraft({
      ruleSetId: ruleSet.id,
      name: ruleSet.name,
      description: ruleSet.description ?? undefined,
      taxRules: ruleSet.taxRules.map((x) => ({
        countryCode: x.countryCode,
        regionCode: x.regionCode ?? undefined,
        postalCodePattern: x.postalCodePattern ?? undefined,
        currency: x.currency,
        taxMode: x.taxMode,
        rateBps: x.rateBps,
        priority: x.priority,
        enabled: x.enabled,
      })),
      shippingRules: ruleSet.shippingRules.map((x) => ({
        countryCode: x.countryCode,
        regionCode: x.regionCode ?? undefined,
        currency: x.currency,
        feeMode: x.feeMode,
        flatFeeMinor: x.flatFeeMinor ?? undefined,
        freeOverMinor: x.freeOverMinor ?? undefined,
        priority: x.priority,
        enabled: x.enabled,
        etaMinDays: x.etaMinDays ?? undefined,
        etaMaxDays: x.etaMaxDays ?? undefined,
      })),
      paymentRules: ruleSet.paymentRules.map((x) => ({
        countryCode: x.countryCode,
        currency: x.currency,
        method: x.method,
        minAmountMinor: x.minAmountMinor ?? undefined,
        maxAmountMinor: x.maxAmountMinor ?? undefined,
        priority: x.priority,
        enabled: x.enabled,
      })),
    });
  }

  async publishRuleSet(actor: Actor, ruleSetId: string) {
    const target = await this.prisma.commerceRuleSet.findUnique({
      where: { id: ruleSetId },
      include: { taxRules: true, shippingRules: true, paymentRules: true },
    });
    if (!target) throw new NotFoundException("Rule set not found");
    if (!target.taxRules.length || !target.shippingRules.length || !target.paymentRules.length) {
      throw new BadRequestException("Rule set must include tax, shipping and payment rules");
    }

    const published = await this.prisma.$transaction(async (tx) => {
      await tx.commerceRuleSet.updateMany({
        where: { status: "ACTIVE", id: { not: target.id } },
        data: { status: "ARCHIVED" },
      });
      return tx.commerceRuleSet.update({
        where: { id: target.id },
        data: {
          status: "ACTIVE",
          publishedAt: new Date(),
          publishedByAdminId: actor.adminId,
        },
        include: { taxRules: true, shippingRules: true, paymentRules: true },
      });
    });
    await this.writeAudit(actor.adminId, "COMMERCE_RULESET_PUBLISHED", published.id, { version: published.version });
    return published;
  }

  async simulateQuote(input: SimulateCommerceQuoteDto) {
    return this.checkoutService.createQuote(input);
  }

  private async writeAudit(actorId: string, action: string, resourceId: string, details: Record<string, unknown>) {
    await this.prisma.auditLog.create({
      data: {
        actorId,
        action,
        resource: "COMMERCE_RULESET",
        resourceId,
        details: details as Prisma.InputJsonValue,
      },
    });
  }
}
