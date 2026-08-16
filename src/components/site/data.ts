import { Mic, Waves, Boxes, Database, Sparkles, ShieldCheck } from "lucide-react";

export const pipeline = [
  { icon: Mic, label: "Voice in", note: "Browser capture, 16kHz opus" },
  { icon: Waves, label: "Sarvam STT", note: "Streaming transcript, hi/en" },
  { icon: Boxes, label: "Hybrid chunking", note: "6 strategies, fused" },
  { icon: Database, label: "Vector recall", note: "HNSW + BM25 rerank" },
  { icon: Sparkles, label: "Grounded answer", note: "Cited, span-checked" },
  { icon: ShieldCheck, label: "Guardrail exit", note: "Abstain when unsure" },
];

export const strategies = [
  {
    tag: "01",
    name: "Semantic drift split",
    body: "Sentence embeddings walk the passage; a cut lands where cosine drift crosses threshold, so a chunk never straddles two ideas.",
  },
  {
    tag: "02",
    name: "Sliding overlap 128",
    body: "512-token windows with 128-token overlap keep answer spans from being sliced at the seam. Duplicate spans deduped at merge.",
  },
  {
    tag: "03",
    name: "Metadata-aware split",
    body: "MSMARCO-XI passage id, language tag and query-provenance ride along as payload filters, so retrieval can pre-narrow before ANN.",
  },
  {
    tag: "04",
    name: "Proposition atoms",
    body: "Long passages decomposed into standalone factual propositions — tiny, self-contained, brutally precise for pinpoint questions.",
  },
  {
    tag: "05",
    name: "Parent-child recall",
    body: "Search the small atoms, return the parent window. Precision of a sentence, context of a paragraph.",
  },
  {
    tag: "06",
    name: "Multilingual normalisation",
    body: "Indic script folding + transliteration keys so a Hindi voice query hits English passages without a translation hop.",
  },
];

export const latency = [
  { label: "P50", value: "118", note: "typical spoken query" },
  { label: "P70", value: "143", note: "cold cache, long query" },
  { label: "P100", value: "197", note: "worst run of 500" },
];

export const stages = [
  { name: "Chunk lookup", ms: 6, pct: 5 },
  { name: "Embed query", ms: 21, pct: 18 },
  { name: "ANN search", ms: 27, pct: 23 },
  { name: "Rerank + fuse", ms: 19, pct: 16 },
  { name: "Answer synth", ms: 38, pct: 32 },
  { name: "Guardrail pass", ms: 7, pct: 6 },
];

export const harness = [
  "Typed contracts: every hop validates a Zod schema in and out — malformed model output never leaves the box.",
  "Tool calls, not prompts: retrieve, rerank, cite and abstain are registered tools the planner selects between.",
  "Retries with budget: 2 fast retries on a 40ms budget, then a degraded-but-honest fallback answer.",
  "Traced runs: every stage emits a span, so the latency board is measured, not estimated.",
];

export const guardrails = [
  "Off-topic gate — query classified against the corpus manifold before any generation spend.",
  "Groundedness check — each claim must map to a retrieved span or it gets dropped.",
  "Abstention path — low support score returns 'I don't have that in the dataset' with the nearest passages.",
  "Safety filter — unsafe or PII-seeking inputs short-circuit before STT output reaches the model.",
];