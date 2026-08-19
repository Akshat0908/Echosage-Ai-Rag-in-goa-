export type ChunkStrategy = "semantic" | "sliding" | "proposition" | "parent-child";

export type CorpusRecord = {
  queryId: string;
  query: string;
  language: string;
  queryType: string;
  query: string;
  answer: string;
  passages: string[];
  selected: number[];
  source: "msmarco-xi" | "demo-seed";
};

export type RagChunk = {
  id: string;
  parentId: string;
  text: string;
  strategy: ChunkStrategy;
  language: string;
  queryType: string;
  queryId: string;
  source: CorpusRecord["source"];
  position: number;
  answer?: string;
  selected: boolean;
  sourcePassageIndex: number;
};

export type RetrievedChunk = RagChunk & {
  vectorScore: number;
  lexicalScore: number;
  fusedScore: number;
  matchedTerms: string[];
};

export type GuardrailResult = {
  allowed: boolean;
  reason: "ok" | "unsafe" | "off-topic" | "low-support" | "invalid-input" | "prompt-injection";
  message?: string;
};

export type StageTiming = {
  name: string;
  ms: number;
  status: "ok" | "fallback" | "blocked";
};

export type RagResponse = {
  requestId: string;
  transcript: string;
  answer: string;
  verdict: "grounded" | "abstained" | "blocked";
  support: number;
  citations: Array<{
    id: string;
    score: number;
    snippet: string;
    strategy: ChunkStrategy;
    language: string;
  }>;
  timings: StageTiming[];
  totalMs: number;
  postSttMs: number;
  harness: { attempts: number; recovered: boolean; trace: string[] };
  guardrail: GuardrailResult;
  index: { chunks: number; strategies: ChunkStrategy[]; source: string };
  cacheHit?: boolean;
};

export type BenchmarkSummary = {
  samples: number;
  p50: number;
  p70: number;
  p100: number;
  mean: number;
  under200ms: number;
  measuredAt: string;
  scope: "post-stt" | "end-to-end";
  indexChunks: number;
};
