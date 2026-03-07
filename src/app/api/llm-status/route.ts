import { NextResponse } from "next/server";

interface StatusPageResponse {
  status?: {
    indicator?: string;
    description?: string;
  };
  components?: Array<{
    name: string;
    status: string;
    group_id?: string | null;
  }>;
}

interface ProviderStatus {
  indicator: string;
  description: string;
  components: { name: string; status: string }[];
  error?: string;
}

export async function GET() {
  const statusPages = [
    { key: "openai", url: "https://status.openai.com/api/v2/summary.json" },
    { key: "anthropic", url: "https://status.anthropic.com/api/v2/summary.json" },
    { key: "mistral", url: "https://status.mistral.ai/api/v2/summary.json" },
    { key: "groq", url: "https://status.groq.com/api/v2/summary.json" },
    { key: "cohere", url: "https://status.cohere.com/api/v2/summary.json" },
  ];

  const results: Record<string, ProviderStatus> = {};

  await Promise.all(
    statusPages.map(async ({ key, url }) => {
      try {
        const res = await fetch(url, {
          next: { revalidate: 120 },
          headers: { Accept: "application/json" },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: StatusPageResponse = await res.json();
        results[key] = {
          indicator: data.status?.indicator || "none",
          description: data.status?.description || "Operational",
          components: (data.components || [])
            .filter((c) => c.name !== "Visit our status page" && !c.group_id)
            .slice(0, 5)
            .map((c) => ({ name: c.name, status: c.status })),
        };
      } catch (err) {
        results[key] = {
          indicator: "unknown",
          description: "Unable to fetch status",
          components: [],
          error: err instanceof Error ? err.message : "Unknown error",
        };
      }
    })
  );

  // Defaults for providers without standard Statuspage APIs
  for (const key of ["google", "meta", "perplexity", "deepseek", "qwen", "zhipu", "baichuan", "minimax"]) {
    if (!results[key]) {
      results[key] = {
        indicator: "none",
        description: "Operational",
        components: [],
      };
    }
  }

  return NextResponse.json(results);
}
