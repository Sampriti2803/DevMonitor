import { NextResponse } from "next/server";

interface FeedItem {
  title: string;
  description: string;
  link: string;
  category: string;
  pubDate: string;
}

export async function GET() {
  try {
    const res = await fetch("https://openai.com/news/rss.xml", {
      next: { revalidate: 900 },
      headers: { "User-Agent": "DevMonitor-Dashboard" },
    });

    if (!res.ok) throw new Error(`OpenAI RSS returned ${res.status}`);

    const xml = await res.text();
    const items = parseRSS(xml);

    return NextResponse.json(items);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}

function parseRSS(xml: string): FeedItem[] {
  const items: FeedItem[] = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match;

  while ((match = itemRegex.exec(xml)) !== null && items.length < 10) {
    const entry = match[1];

    const title = extractCDATA(entry, "title") || extractTag(entry, "title") || "";
    const description = extractCDATA(entry, "description") || extractTag(entry, "description") || "";
    const link = extractTag(entry, "link") || "";
    const category = extractCDATA(entry, "category") || extractTag(entry, "category") || "Update";
    const pubDate = extractTag(entry, "pubDate") || "";

    if (title) {
      items.push({
        title: title.trim(),
        description: description.trim(),
        link: link.trim(),
        category: category.trim(),
        pubDate: pubDate ? new Date(pubDate).toISOString().split("T")[0] : "",
      });
    }
  }

  return items;
}

function extractCDATA(xml: string, tag: string): string | null {
  const match = xml.match(
    new RegExp(`<${tag}[^>]*>\\s*<!\\[CDATA\\[([\\s\\S]*?)\\]\\]>\\s*</${tag}>`, "i")
  );
  return match ? match[1] : null;
}

function extractTag(xml: string, tag: string): string | null {
  const match = xml.match(new RegExp(`<${tag}[^>]*>([^<]*)</${tag}>`, "i"));
  return match ? match[1] : null;
}
