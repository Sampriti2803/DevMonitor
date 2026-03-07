import { NextRequest, NextResponse } from "next/server";

interface ArxivPaper {
  id: string;
  title: string;
  authors: string;
  summary?: string;
  published: string;
  category: string;
  link: string;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category") || "cs.AI";

  try {
    const url = `http://export.arxiv.org/api/query?search_query=cat:${category}&sortBy=submittedDate&sortOrder=descending&start=0&max_results=15`;
    const res = await fetch(url, { next: { revalidate: 900 } });
    if (!res.ok) throw new Error(`arXiv API returned ${res.status}`);

    const xml = await res.text();
    const papers = parseArxivXML(xml);

    return NextResponse.json(papers);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}

function parseArxivXML(xml: string): ArxivPaper[] {
  const papers: ArxivPaper[] = [];
  const entryRegex = /<entry>([\s\S]*?)<\/entry>/g;
  let match;

  while ((match = entryRegex.exec(xml)) !== null) {
    const entry = match[1];

    const id = extractTag(entry, "id") || "";
    const title = extractTag(entry, "title")?.replace(/\s+/g, " ").trim() || "";
    const summary = extractTag(entry, "summary")?.replace(/\s+/g, " ").trim();
    const published = extractTag(entry, "published")?.split("T")[0] || "";

    const authorRegex = /<author>\s*<name>(.*?)<\/name>/g;
    const authors: string[] = [];
    let authorMatch;
    while ((authorMatch = authorRegex.exec(entry)) !== null) {
      authors.push(authorMatch[1]);
    }

    const catMatch = entry.match(/arxiv:primary_category[^>]*term="([^"]+)"/);
    const cat = catMatch ? catMatch[1] : "";

    const linkMatch = entry.match(
      /<link[^>]*href="(https:\/\/arxiv\.org\/abs\/[^"]+)"/
    );
    const link = linkMatch ? linkMatch[1] : id;

    if (title) {
      papers.push({
        id,
        title,
        authors:
          authors.slice(0, 3).join(", ") +
          (authors.length > 3 ? ` +${authors.length - 3}` : ""),
        summary: summary?.slice(0, 200),
        published,
        category: cat,
        link,
      });
    }
  }

  return papers;
}

function extractTag(xml: string, tag: string): string | null {
  const match = xml.match(new RegExp(`<${tag}[^>]*>(.*?)</${tag}>`, "s"));
  return match ? match[1] : null;
}
