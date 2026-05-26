"use client";

type CopyConfigItem = {
  key: string;
  value: string | number | boolean | null;
};

const AI_KEYS = {
  provider: "product_research.ai.provider",
  baseUrl: "product_research.ai.base_url",
  candidateModel: "product_research.ai.model_candidate_generation",
  scoringModel: "product_research.ai.model_scoring",
  copyModel: "product_research.ai.model_copy",
  fastModel: "product_research.ai.model_fast",
} as const;

export function AdminAiProviderConfigEditor({
  zh,
  items,
  onChange,
}: {
  zh: boolean;
  items: CopyConfigItem[];
  onChange: (items: CopyConfigItem[]) => void;
}) {
  const getValue = (key: string) => String(items.find((item) => item.key === key)?.value ?? "");
  const setValue = (key: string, value: string) => {
    onChange(items.map((item) => (item.key === key ? { ...item, value } : item)));
  };

  return (
    <section className="rounded-2xl bg-warm p-5">
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-signal">{zh ? "选品 AI Provider" : "Product Research AI Provider"}</p>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <label className="block">
          <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted">{zh ? "Provider" : "Provider"}</span>
          <select
            value={getValue(AI_KEYS.provider)}
            onChange={(event) => setValue(AI_KEYS.provider, event.target.value)}
            className="mt-2 w-full rounded-2xl border border-graphite/10 bg-white px-4 py-3 text-sm outline-none"
          >
            <option value="local">local</option>
            <option value="openai">openai</option>
            <option value="deepseek">deepseek</option>
            <option value="mimo">mimo</option>
          </select>
        </label>

        <LabeledInput zh={zh} label="Base URL" value={getValue(AI_KEYS.baseUrl)} onChange={(value) => setValue(AI_KEYS.baseUrl, value)} />
        <LabeledInput zh={zh} label={zh ? "候选品模型" : "Candidate model"} value={getValue(AI_KEYS.candidateModel)} onChange={(value) => setValue(AI_KEYS.candidateModel, value)} />
        <LabeledInput zh={zh} label={zh ? "评分模型" : "Scoring model"} value={getValue(AI_KEYS.scoringModel)} onChange={(value) => setValue(AI_KEYS.scoringModel, value)} />
        <LabeledInput zh={zh} label={zh ? "文案模型" : "Copy model"} value={getValue(AI_KEYS.copyModel)} onChange={(value) => setValue(AI_KEYS.copyModel, value)} />
        <LabeledInput zh={zh} label={zh ? "快速模型" : "Fast model"} value={getValue(AI_KEYS.fastModel)} onChange={(value) => setValue(AI_KEYS.fastModel, value)} />
      </div>
      <p className="mt-4 text-xs leading-6 text-muted">
        {zh
          ? "后台只保存 provider、base URL 和模型位。API key 仍然只从 .env 读取；若未配置有效 key，Product Research 会自动回退到本地 fallback provider。"
          : "Admin settings store provider, base URL, and model slots only. API keys remain in .env; if no valid key is configured, Product Research automatically falls back to the local provider."}
      </p>
    </section>
  );
}

function LabeledInput({
  label,
  value,
  onChange,
}: {
  zh: boolean;
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full rounded-2xl border border-graphite/10 bg-white px-4 py-3 text-sm outline-none"
      />
    </label>
  );
}
