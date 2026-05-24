"use client";

import type { AnalyticsRangeDays } from "@/lib/admin-analytics-types";

const ranges: AnalyticsRangeDays[] = [7, 30, 90];

export function AdminRangeSwitcher({
  value,
  onChange,
}: {
  value: AnalyticsRangeDays;
  onChange: (value: AnalyticsRangeDays) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {ranges.map((range) => (
        <button
          key={range}
          type="button"
          onClick={() => onChange(range)}
          className={`rounded-full px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] ${
            value === range ? "bg-graphite text-white" : "bg-warm text-muted"
          }`}
        >
          {range}d
        </button>
      ))}
    </div>
  );
}
