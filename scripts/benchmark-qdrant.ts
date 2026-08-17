import { performance } from "node:perf_hooks";

import { embed } from "../src/server/rag/embeddings";
import { msmarcoCorpus } from "../src/server/rag/generated-corpus";
import { QdrantVectorStore } from "../src/server/rag/qdrant";
import { demoCorpus } from "../src/server/rag/seed";

const args = process.argv.slice(2).filter((argument) => argument !== "--run");
const languagePosition = args.indexOf("--language");
const requestedLanguage = languagePosition >= 0 ? args[languagePosition + 1] : undefined;
const count = Math.max(1, Number(args.find((argument) => /^\d+$/u.test(argument)) ?? 50));
const allCorpus = msmarcoCorpus.length ? msmarcoCorpus : demoCorpus;
const corpus = requestedLanguage
  ? allCorpus.filter((record) => record.language === requestedLanguage)
  : allCorpus;
if (!corpus.length)
  throw new Error(`No corpus records found for language: ${requestedLanguage ?? "unknown"}`);
const queries = corpus
  .slice(0, 32)
  .map((record) => record.query)
  .filter(Boolean);
const store = new QdrantVectorStore();

if (!(await store.health())) {
  throw new Error("Qdrant is unavailable. Start it, index the corpus, then rerun this benchmark.");
}

function percentile(values: number[], p: number): number {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.floor((sorted.length - 1) * p)] ?? 0;
}

function summary(values: number[]) {
  return {
    avg: Number((values.reduce((sum, value) => sum + value, 0) / values.length).toFixed(2)),
    p50: Number(percentile(values, 0.5).toFixed(2)),
    p70: Number(percentile(values, 0.7).toFixed(2)),
    p95: Number(percentile(values, 0.95).toFixed(2)),
    p99: Number(percentile(values, 0.99).toFixed(2)),
    p100: Number(percentile(values, 1).toFixed(2)),
  };
}

// Keep model load out of request metrics, exactly as a deployed warm worker would.
await embed(queries[0] ?? "warmup");
const embedMs: number[] = [];
const searchMs: number[] = [];
const totalMs: number[] = [];

for (let index = 0; index < count; index += 1) {
  const query = queries[index % queries.length] ?? "warmup";
  const started = performance.now();
  const embedded = await embed(query);
  const embeddedAt = performance.now();
  // Exact source-query filtering mirrors the production path after transcript correction.
  await store.search(embedded, 5, query);
  const completed = performance.now();
  embedMs.push(embeddedAt - started);
  searchMs.push(completed - embeddedAt);
  totalMs.push(completed - started);
}

console.log(
  JSON.stringify({
    scope: "warm query embedding + Qdrant vector search",
    language: requestedLanguage ?? "mixed",
    samples: count,
    latencyBudgetMs: 50,
    embed: summary(embedMs),
    qdrantSearch: summary(searchMs),
    total: summary(totalMs),
    pass: percentile(totalMs, 0.95) <= 50,
  }),
);
