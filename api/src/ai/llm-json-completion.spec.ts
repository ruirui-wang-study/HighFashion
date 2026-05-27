import { completeLlmJson, parseLlmJsonPayload } from "./llm-json-completion";

describe("llm-json-completion", () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it("prefers anthropic endpoint when anthropicBaseUrl is set", async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        stop_reason: "end_turn",
        content: [{ type: "text", text: '{"ok":true}' }],
      }),
    });
    global.fetch = fetchMock as typeof global.fetch;

    const result = await completeLlmJson({
      provider: "mimo",
      apiKey: "key",
      model: "mimo-v2.5-pro",
      systemPrompt: "json only",
      userPrompt: "{}",
      maxTokens: 64,
      temperature: 0,
      anthropicBaseUrl: "https://token-plan-cn.xiaomimimo.com/anthropic",
      openAiBaseUrl: "https://api.xiaomimimo.com/v1",
    });

    expect(fetchMock).toHaveBeenCalledWith(
      "https://token-plan-cn.xiaomimimo.com/anthropic/v1/messages",
      expect.any(Object),
    );
    expect(result?.rawContent).toContain('"ok":true');
  });

  it("parses fenced json payloads", () => {
    const parsed = parseLlmJsonPayload('```json\n{"items":[]}\n```');
    expect(parsed).toEqual({ items: [] });
  });
});
