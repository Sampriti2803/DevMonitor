import { NextResponse } from "next/server";

interface ReleaseResult {
  repo: string;
  name: string;
  tag_name: string;
  html_url: string;
  published_at: string | null;
  prerelease?: boolean;
}

interface GithubRelease {
  tag_name: string;
  html_url: string;
  published_at: string;
  prerelease: boolean;
}

interface GithubTag {
  name: string;
}

const REPOS = [
  "microsoft/vscode",
  "nodejs/node",
  "denoland/deno",
  "rust-lang/rust",
  "golang/go",
  "vercel/next.js",
  "python/cpython",
  "oven-sh/bun",
  "sveltejs/svelte",
  "docker/compose",
];

export async function GET() {
  const results: ReleaseResult[] = [];

  await Promise.all(
    REPOS.map(async (repo) => {
      try {
        const res = await fetch(
          `https://api.github.com/repos/${repo}/releases/latest`,
          {
            next: { revalidate: 900 },
            headers: {
              Accept: "application/vnd.github.v3+json",
              "User-Agent": "DevMonitor-Dashboard",
            },
          }
        );

        if (!res.ok) {
          const tagRes = await fetch(
            `https://api.github.com/repos/${repo}/tags?per_page=1`,
            {
              next: { revalidate: 900 },
              headers: {
                Accept: "application/vnd.github.v3+json",
                "User-Agent": "DevMonitor-Dashboard",
              },
            }
          );
          if (tagRes.ok) {
            const tags: GithubTag[] = await tagRes.json();
            if (tags.length > 0) {
              results.push({
                repo,
                name: repo.split("/")[1],
                tag_name: tags[0].name,
                html_url: `https://github.com/${repo}/releases/tag/${tags[0].name}`,
                published_at: null,
              });
            }
          }
          return;
        }

        const data: GithubRelease = await res.json();
        results.push({
          repo,
          name: repo.split("/")[1],
          tag_name: data.tag_name,
          html_url: data.html_url,
          published_at: data.published_at,
          prerelease: data.prerelease,
        });
      } catch {
        // Skip failed repos
      }
    })
  );

  results.sort((a, b) => {
    if (!a.published_at) return 1;
    if (!b.published_at) return -1;
    return new Date(b.published_at).getTime() - new Date(a.published_at).getTime();
  });

  return NextResponse.json(results);
}
