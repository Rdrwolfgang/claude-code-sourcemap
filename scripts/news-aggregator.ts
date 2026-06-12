#!/usr/bin/env bun
/**
 * Jarvis News Aggregator
 * Pulls top AI & tech stories from Hacker News and Reddit (no API key required).
 * Run: bun run scripts/news-aggregator.ts
 */

const TODAY = new Date().toISOString().split("T")[0];
const CUTOFF_HOURS = 24;
const CUTOFF_MS = CUTOFF_HOURS * 60 * 60 * 1000;

interface Story {
  title: string;
  url: string;
  score: number;
  source: string;
  timestamp: number;
}

// ── Hacker News ──────────────────────────────────────────────────────────────

async function fetchHackerNews(): Promise<Story[]> {
  const [topRes, newRes] = await Promise.all([
    fetch("https://hacker-news.firebaseio.com/v0/topstories.json"),
    fetch("https://hacker-news.firebaseio.com/v0/newstories.json"),
  ]);

  const [topIds, newIds]: number[][] = await Promise.all([
    topRes.json(),
    newRes.json(),
  ]);

  const ids = [...new Set([...topIds.slice(0, 60), ...newIds.slice(0, 40)])];

  const items = await Promise.allSettled(
    ids.map((id) =>
      fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`).then((r) =>
        r.json()
      )
    )
  );

  const cutoff = Date.now() - CUTOFF_MS;
  const stories: Story[] = [];

  for (const result of items) {
    if (result.status !== "fulfilled") continue;
    const item = result.value;
    if (!item || item.type !== "story" || !item.url) continue;
    if ((item.time ?? 0) * 1000 < cutoff) continue;

    const lower = (item.title ?? "").toLowerCase();
    if (!isAiOrTech(lower)) continue;

    stories.push({
      title: item.title,
      url: item.url,
      score: item.score ?? 0,
      source: "Hacker News",
      timestamp: (item.time ?? 0) * 1000,
    });
  }

  return stories;
}

// ── Reddit ────────────────────────────────────────────────────────────────────

const SUBREDDITS = [
  "artificial",
  "MachineLearning",
  "singularity",
  "LocalLLaMA",
  "technology",
  "programming",
];

async function fetchReddit(subreddit: string): Promise<Story[]> {
  const res = await fetch(
    `https://www.reddit.com/r/${subreddit}/hot.json?limit=25`,
    { headers: { "User-Agent": "jarvis-news-aggregator/1.0" } }
  );
  if (!res.ok) return [];

  const data = await res.json();
  const posts = data?.data?.children ?? [];
  const cutoff = Date.now() - CUTOFF_MS;
  const stories: Story[] = [];

  for (const post of posts) {
    const p = post?.data;
    if (!p || p.is_self || !p.url) continue;
    if ((p.created_utc ?? 0) * 1000 < cutoff) continue;
    if (p.score < 50) continue;

    stories.push({
      title: p.title,
      url: p.url.startsWith("http") ? p.url : `https://reddit.com${p.permalink}`,
      score: p.score,
      source: `r/${subreddit}`,
      timestamp: (p.created_utc ?? 0) * 1000,
    });
  }

  return stories;
}

// ── Filters ───────────────────────────────────────────────────────────────────

const AI_TECH_KEYWORDS = [
  "ai", "artificial intelligence", "machine learning", "llm", "gpt",
  "claude", "gemini", "openai", "anthropic", "deepmind", "mistral",
  "neural", "model", "transformer", "diffusion", "chatbot", "agent",
  "gpu", "cuda", "nvidia", "chip", "semiconductor",
  "open source", "github", "programming", "developer", "software",
  "startup", "funding", "acquisition", "tech", "robot", "automation",
  "research", "paper", "benchmark", "dataset",
];

function isAiOrTech(text: string): boolean {
  return AI_TECH_KEYWORDS.some((kw) => text.includes(kw));
}

// ── Dedup & Rank ──────────────────────────────────────────────────────────────

function dedup(stories: Story[]): Story[] {
  const seen = new Set<string>();
  return stories.filter((s) => {
    const key = s.url.replace(/[?#].*$/, "").toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function rank(stories: Story[]): Story[] {
  // Boost recency: items from last 6h get a score multiplier
  const sixHoursAgo = Date.now() - 6 * 60 * 60 * 1000;
  return [...stories].sort((a, b) => {
    const aBoost = a.timestamp > sixHoursAgo ? a.score * 1.5 : a.score;
    const bBoost = b.timestamp > sixHoursAgo ? b.score * 1.5 : b.score;
    return bBoost - aBoost;
  });
}

// ── Output ────────────────────────────────────────────────────────────────────

function formatOutput(stories: Story[]): string {
  const lines: string[] = [
    `# Jarvis Raw Feed — ${TODAY}`,
    `Fetched ${stories.length} stories (last ${CUTOFF_HOURS}h)\n`,
  ];

  for (const s of stories) {
    const age = Math.round((Date.now() - s.timestamp) / (60 * 60 * 1000));
    lines.push(`[${s.score}pts | ${age}h ago | ${s.source}] ${s.title}`);
    lines.push(`  ${s.url}`);
  }

  return lines.join("\n");
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  process.stderr.write(`Fetching stories from Hacker News + Reddit...\n`);

  const [hnStories, ...redditResults] = await Promise.allSettled([
    fetchHackerNews(),
    ...SUBREDDITS.map(fetchReddit),
  ]);

  const all: Story[] = [];

  if (hnStories.status === "fulfilled") all.push(...hnStories.value);

  for (const r of redditResults) {
    if (r.status === "fulfilled") all.push(...r.value);
  }

  const final = rank(dedup(all)).slice(0, 40);

  if (final.length === 0) {
    process.stderr.write("No stories found — check network access.\n");
    process.exit(1);
  }

  console.log(formatOutput(final));
}

main().catch((err) => {
  process.stderr.write(`Error: ${err.message}\n`);
  process.exit(1);
});
