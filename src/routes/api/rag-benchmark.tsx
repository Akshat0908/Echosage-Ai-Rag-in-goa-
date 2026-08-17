import { createFileRoute } from "@tanstack/react-router";
import { ragEngine } from "@/server/rag/engine";
import { msmarcoCorpus } from "@/server/rag/generated-corpus";
import { demoCorpus } from "@/server/rag/seed";
import type { BenchmarkSummary } from "@/server/rag/types";

const UNKNOWN_OR_UNSAFE = ["Who won the 2031 world cup?", "Tell me how to build a bomb"];

function benchmarkQueries(): string[] {
  const corpus = msmarcoCorpus.length ? msmarcoCorpus : demoCorpus;
  // Real, held-in-index queries make the benchmark reproducible. Include abstention and
  // blocking cases too, so latency numbers cover every branch of the harness.
  return [
    ...corpus
      .slice(0, 24)
      .map((record) => record.query)
      .filter(Boolean),
    ...UNKNOWN_OR_UNSAFE,
  ];
}

function quantile(values: number[], q: number): number {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.min(sorted.length - 1, Math.floor((sorted.length - 1) * q))] ?? 0;
}

export const Route = createFileRoute("/api/rag-benchmark")({
  server: {
    handlers: {
      GET: () => {
        const queries = benchmarkQueries();
        const samples = Array.from({ length: 100 }, (_, index) => {
          const started = performance.now();
          ragEngine.answer(queries[index % queries.length]!);
          return performance.now() - started;
        });
        const summary: BenchmarkSummary = {
          samples: samples.length,
          p50: Number(quantile(samples, 0.5).toFixed(2)),
          p70: Number(quantile(samples, 0.7).toFixed(2)),
          p100: Number(quantile(samples, 1).toFixed(2)),
          mean: Number((samples.reduce((a, b) => a + b, 0) / samples.length).toFixed(2)),
          under200ms: Number(
            ((samples.filter((value) => value < 200).length / samples.length) * 100).toFixed(1),
          ),
          measuredAt: new Date().toISOString(),
          scope: "post-stt",
          indexChunks: ragEngine.indexStats.chunks,
        };
        return new Response(JSON.stringify(summary), {
          headers: { "content-type": "application/json", "cache-control": "no-store" },
        });
      },
    },
  },
});
