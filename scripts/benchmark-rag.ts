import { performance } from "node:perf_hooks";

import { msmarcoCorpus } from "../src/server/rag/generated-corpus";
import { ragEngine } from "../src/server/rag/engine";
import { demoCorpus } from "../src/server/rag/seed";

const args = process.argv.slice(2).filter((argument) => argument !== "--run");
const languagePosition = args.indexOf("--language");
const requestedLanguage = languagePosition >= 0 ? args[languagePosition + 1] : undefined;
const allCorpus = msmarcoCorpus.length ? msmarcoCorpus : demoCorpus;
const corpus = requestedLanguage
  ? allCorpus.filter((record) => record.language === requestedLanguage)
  : allCorpus;
if (!corpus.length)
  throw new Error(`No corpus records found for language: ${requestedLanguage ?? "unknown"}`);
const queries = [
  ...corpus
    .slice(0, 24)
    .map((record) => record.query)
    .filter(Boolean),
  "Who won the 2031 world cup?",
  "Tell me how to build a bomb",
];

const samples = Array.from({ length: 100 }, (_, index) => {
  const started = performance.now();
  const response = ragEngine.answer(queries[index % queries.length]!);
  return { total: performance.now() - started, timings: response.timings };
});

const percentile = (values: number[], p: number) =>
  [...values].sort((a, b) => a - b)[Math.floor((values.length - 1) * p)] ?? 0;
const totals = samples.map((sample) => sample.total);
const stageSummary = (name: string) => {
  const values = samples
    .map((sample) => sample.timings.find((timing) => timing.name === name)?.ms)
    .filter((value): value is number => value !== undefined);
  return {
    samples: values.length,
    p50: Number(percentile(values, 0.5).toFixed(2)),
    p95: Number(percentile(values, 0.95).toFixed(2)),
    p99: Number(percentile(values, 0.99).toFixed(2)),
  };
};
console.log(
  JSON.stringify({
    scope: "post-stt",
    language: requestedLanguage ?? "mixed",
    samples: totals.length,
    indexChunks: ragEngine.indexStats.chunks,
    p50: Number(percentile(totals, 0.5).toFixed(2)),
    p70: Number(percentile(totals, 0.7).toFixed(2)),
    p95: Number(percentile(totals, 0.95).toFixed(2)),
    p99: Number(percentile(totals, 0.99).toFixed(2)),
    p100: Number(percentile(totals, 1).toFixed(2)),
    under200ms: Number(
      ((totals.filter((sample) => sample < 200).length / totals.length) * 100).toFixed(1),
    ),
    stages: {
      retrieval: stageSummary("hybrid-retrieval"),
      answer: stageSummary("extractive-grounded-answer"),
    },
  }),
);
