import { NextResponse } from "next/server";

interface LeaderboardModel {
    rank: number;
    name: string;
    creator: string;
    score: number;       // Arena ELO score
    votes: number;
    context_window: number | null;
    input_price: number | null;
    output_price: number | null;
}

interface CategoryData {
    models: LeaderboardModel[];
    updated: string; // e.g. "1 day ago"
}

// Infer the creator/company from the model name
function inferCreator(name: string): string {
    const n = name.toLowerCase();
    if (n.includes("claude") || n.includes("sonnet") || n.includes("opus") || n.includes("haiku")) return "Anthropic";
    if (n.includes("gpt") || n.startsWith("o1") || n.startsWith("o3") || n.startsWith("o4") || n.includes("chatgpt")) return "OpenAI";
    if (n.includes("gemini") || n.includes("gemma")) return "Google";
    if (n.includes("grok")) return "xAI";
    if (n.includes("deepseek")) return "DeepSeek";
    if (n.includes("llama")) return "Meta";
    if (n.includes("mistral") || n.includes("magistral")) return "Mistral";
    if (n.includes("qwen") || n.includes("qwq")) return "Alibaba";
    if (n.includes("command") || n.includes("aya")) return "Cohere";
    if (n.includes("phi-")) return "Microsoft";
    if (n.includes("glm")) return "Zhipu";
    if (n.includes("ernie")) return "Baidu";
    if (n.includes("nova-") || n.includes("amazon")) return "Amazon";
    if (n.includes("kimi")) return "Moonshot";
    if (n.includes("dola-seed")) return "ByteDance";
    if (n.includes("minimax")) return "MiniMax";
    if (n.includes("nemotron") || n.includes("nvidia")) return "NVIDIA";
    if (n.includes("step-")) return "StepFun";
    if (n.includes("hunyuan")) return "Tencent";
    return "Other";
}

// Categories to parse from the lmarena.ai overview page
const CATEGORIES = [
    { key: "text", label: "Text", mdLabel: "Text", slug: "text" },
    { key: "code", label: "Code", mdLabel: "Code", slug: "code" },
    { key: "vision", label: "Vision", mdLabel: "Vision", slug: "vision" },
    { key: "document", label: "Document", mdLabel: "Document", slug: "document" },
    { key: "text-to-image", label: "Txt→Img", mdLabel: "Text-to-Image", slug: "text-to-image" },
    { key: "image-edit", label: "Img Edit", mdLabel: "Image Edit", slug: "image-edit" },
    { key: "search", label: "Search", mdLabel: "Search", slug: "search" },
    { key: "text-to-video", label: "Txt→Vid", mdLabel: "Text-to-Video", slug: "text-to-video" },
    { key: "image-to-video", label: "Img→Vid", mdLabel: "Image-to-Video", slug: "image-to-video" },
];

// Parse a single category block from the markdown
function parseCategoryBlock(text: string, mdLabel: string, slug: string): { models: LeaderboardModel[]; updated: string } {
    // Each category block looks like:
    // [Text ---- 1 day ago View | Rank | ... | [View all](https://lmarena.ai/leaderboard/text) |](url)
    // or [Text-to-Image ---- 2 days ago View | ... |](url)
    const escapedLabel = mdLabel.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const blockRegex = new RegExp(
        "\\[" + escapedLabel + "\\s*-+([\\s\\S]*?)View all\\]\\(https:\\/\\/lmarena\\.ai\\/leaderboard\\/" + slug + "\\)\\s*\\|?\\]"
    );
    const blockMatch = text.match(blockRegex);
    if (!blockMatch) return { models: [], updated: "" };

    const block = blockMatch[0];

    // Extract the "X days ago" part
    const updatedMatch = block.match(/(\d+\s*(?:day|hour|minute|week)s?\s*ago)/i);
    const updated = updatedMatch ? updatedMatch[1] : "";

    const models: LeaderboardModel[] = [];
    const rowRegex = /\|\s*(\d{1,2})\s*\|\s*(?:!\[.*?\]\([^)]*\)\s*)?(?:\[([^\]]+)\]\([^)]*\))\s*\|\s*(\d{3,4})\s*\|\s*([\d,]+)\s*\|/g;

    let match;
    while ((match = rowRegex.exec(block)) !== null && models.length < 10) {
        const rank = parseInt(match[1]);
        const name = match[2];
        const score = parseInt(match[3]);
        const votes = parseInt(match[4].replace(/,/g, ""));

        if (name && score > 1000 && score < 2000) {
            models.push({
                rank,
                name,
                creator: inferCreator(name),
                score,
                votes,
                context_window: null,
                input_price: null,
                output_price: null,
            });
        }
    }

    return { models, updated };
}

// Fetch all leaderboard categories via Jina Reader
async function fetchArenaLeaderboards(): Promise<Record<string, CategoryData>> {
    const res = await fetch("https://r.jina.ai/https://lmarena.ai/leaderboard", {
        headers: { Accept: "text/plain" },
    });

    if (!res.ok) throw new Error(`Jina reader returned ${res.status}`);
    const text = await res.text();

    const categories: Record<string, CategoryData> = {};
    for (const cat of CATEGORIES) {
        const result = parseCategoryBlock(text, cat.mdLabel, cat.slug);
        if (result.models.length > 0) {
            categories[cat.key] = result;
        }
    }

    return categories;
}

// Enrich models with live pricing and context from OpenRouter
async function enrichAllWithOpenRouter(
    categories: Record<string, CategoryData>
): Promise<Record<string, CategoryData>> {
    try {
        const res = await fetch("https://openrouter.ai/api/v1/models", {
            headers: { Accept: "application/json" },
        });
        if (!res.ok) return categories;
        const raw = await res.json();
        if (!raw.data || !Array.isArray(raw.data)) return categories;

        const enrichModel = (model: LeaderboardModel): LeaderboardModel => {
            const lowerName = model.name.toLowerCase();
            const orMatch = raw.data.find((or: any) => {
                const orId = (or.id || "").toLowerCase();
                return orId.includes(lowerName) || lowerName.includes(orId.split("/").pop() || "");
            });

            if (orMatch) {
                return {
                    ...model,
                    context_window: orMatch.context_length || null,
                    input_price: orMatch.pricing?.prompt ? parseFloat(orMatch.pricing.prompt) * 1_000_000 : null,
                    output_price: orMatch.pricing?.completion ? parseFloat(orMatch.pricing.completion) * 1_000_000 : null,
                };
            }
            return model;
        };

        const enriched: Record<string, CategoryData> = {};
        for (const [key, data] of Object.entries(categories)) {
            enriched[key] = {
                ...data,
                models: data.models.map(enrichModel),
            };
        }
        return enriched;
    } catch {
        return categories;
    }
}

export async function GET() {
    try {
        const categories = await fetchArenaLeaderboards();

        if (Object.keys(categories).length > 0) {
            const enriched = await enrichAllWithOpenRouter(categories);
            return NextResponse.json({
                categories: enriched,
                categoryOrder: CATEGORIES.filter(c => c.key in enriched).map(c => ({
                    key: c.key,
                    label: c.label,
                })),
                source: "live-arena",
            });
        }
    } catch (err) {
        console.error("Failed to fetch arena leaderboard:", err);
    }

    return NextResponse.json({
        categories: {},
        categoryOrder: [],
        source: "error",
        error: "Could not fetch live leaderboard data",
    });
}
