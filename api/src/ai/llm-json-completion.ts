import type { AiProviderKind } from "./ai-config.types";

export type LlmJsonCompletionInput = {
  provider: Exclude<AiProviderKind, "local">;
  apiKey: string;
  model: string;
  systemPrompt: string;
  userPrompt: string;
  maxTokens: number;
  temperature: number;
  /** Anthropic-compatible root, e.g. https://token-plan-cn.xiaomimimo.com/anthropic */
  anthropicBaseUrl?: string | null;
  /** OpenAI-compatible root, e.g. https://api.deepseek.com or https://api.xiaomimimo.com/v1 */
  openAiBaseUrl?: string | null;
};

export type LlmJsonCompletionResult = {
  rawContent: string;
  truncated: boolean;
};

export async function completeLlmJson(input: LlmJsonCompletionInput): Promise<LlmJsonCompletionResult | null> {
  if (input.anthropicBaseUrl?.trim()) {
    return completeAnthropic(input);
  }
  if (!input.openAiBaseUrl?.trim()) {
    return null;
  }
  return completeOpenAi(input);
}

async function completeAnthropic(input: LlmJsonCompletionInput): Promise<LlmJsonCompletionResult | null> {
  const url = `${input.anthropicBaseUrl!.replace(/\/+$/, "")}/v1/messages`;
  const response = await fetch(url, {
    method: "POST",
    headers: buildHeaders(input.provider, input.apiKey),
    body: JSON.stringify({
      model: input.model,
      max_tokens: input.maxTokens,
      system: input.systemPrompt,
      messages: [
        {
          role: "user",
          content: [{ type: "text", text: input.userPrompt }],
        },
      ],
      stream: false,
      temperature: input.temperature,
      thinking: { type: "disabled" },
    }),
  });

  if (!response.ok) {
    return null;
  }

  const payload = (await response.json()) as {
    content?: Array<{ type?: string; text?: string }>;
    stop_reason?: string | null;
  };
  const rawContent = payload.content?.find((block) => block.type === "text")?.text ?? "";
  return {
    rawContent,
    truncated: payload.stop_reason === "max_tokens",
  };
}

async function completeOpenAi(input: LlmJsonCompletionInput): Promise<LlmJsonCompletionResult | null> {
  const url = `${input.openAiBaseUrl!.replace(/\/+$/, "")}/chat/completions`;
  const useMaxCompletionTokens = input.provider === "mimo" || input.provider === "openai";
  const body: Record<string, unknown> = {
    model: input.model,
    messages: [
      { role: "system", content: input.systemPrompt },
      { role: "user", content: input.userPrompt },
    ],
    temperature: input.temperature,
    thinking: { type: "disabled" },
    ...(input.provider === "deepseek" ? { response_format: { type: "json_object" } } : {}),
    ...(useMaxCompletionTokens
      ? { max_completion_tokens: input.maxTokens }
      : { max_tokens: input.maxTokens }),
  };

  const response = await fetch(url, {
    method: "POST",
    headers: buildHeaders(input.provider, input.apiKey),
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    return null;
  }

  const payload = (await response.json()) as {
    choices?: Array<{ message?: { content?: string | null }; finish_reason?: string | null }>;
  };
  const rawContent = payload.choices?.[0]?.message?.content ?? "";
  const finishReason = payload.choices?.[0]?.finish_reason ?? null;
  return {
    rawContent,
    truncated: finishReason === "length",
  };
}

function buildHeaders(provider: Exclude<AiProviderKind, "local">, apiKey: string): Record<string, string> {
  if (provider === "mimo") {
    return {
      "Content-Type": "application/json",
      "api-key": apiKey,
    };
  }

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${apiKey}`,
  };
}

export function parseLlmJsonPayload(raw: string) {
  if (!raw) return null;
  const trimmed = raw.trim();
  try {
    return JSON.parse(trimmed) as unknown;
  } catch {
    const fenceMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
    if (!fenceMatch?.[1]) return null;
    try {
      return JSON.parse(fenceMatch[1].trim()) as unknown;
    } catch {
      return null;
    }
  }
}
