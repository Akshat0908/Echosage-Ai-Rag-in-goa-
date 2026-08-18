import { Mic, Waves, Boxes, Database, Sparkles, ShieldCheck } from "lucide-react";

export const pipeline = [
  { icon: Mic, label: "Voice in", note: "Browser capture, converted to 16kHz WAV" },
  { icon: Waves, label: "Sarvam STT", note: "Live transcription, hi/en" },
  {
    icon: Boxes,
    label: "Multi-view chunking",
    note: "Sentence, window, proposition, parent-child",
  },
  { icon: Database, label: "Hybrid recall", note: "Local vector + lexical; Qdrant optional" },
  { icon: Sparkles, label: "Grounded answer", note: "Cited, span-checked" },
  { icon: ShieldCheck, label: "Guardrail exit", note: "Abstain when unsure" },
];

export const strategies = [
  {
    tag: "01",
    name: "Sentence-aware splits",
    body: "Passages split on sentence boundaries, preserving complete facts instead of cutting through a sentence at an arbitrary character count.",
  },
  {
    tag: "02",
    name: "Overlapping windows",
    body: "72-word windows overlap by 18 words, keeping evidence around a boundary available to retrieval. Duplicate spans are removed before ranking.",
  },
  {
    tag: "03",
    name: "Metadata-aware routing",
    body: "Language, query type, source passage and query provenance travel with each chunk. Exact and tolerant query routes narrow candidates before scoring.",
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
    name: "Indic transcript normalisation",
    body: "Unicode normalisation and bounded spelling tolerance handle common Devanagari transcription variations without widening into unrelated passages.",
  },
];

export const latency = [
  { label: "P50", value: "1.49", note: "local · 100 post-STT runs · 853K chunks" },
  { label: "P75", value: "2.44", note: "local · warm multilingual hybrid index" },
  { label: "P100", value: "147.95", note: "local · 100% under 200ms · STT separate" },
];

export const cloudLatency = [
  { label: "P50", value: "84", note: "deployed · Railway + Qdrant Cloud + HF API" },
  { label: "P75", value: "92", note: "deployed · 50-query benchmark · US East" },
  { label: "P95", value: "125", note: "deployed · 96% under 200ms" },
];

export const harness = [
  "Typed boundary: the API validates JSON transcript input with Zod and returns a stable, structured response.",
  "Explicit stages: validation, retrieval, reranking, grounding, citation and output validation are traceable steps — not one opaque prompt.",
  "Recoverable voice path: Sarvam retries transient failures up to twice; missing keys and failed transcription return actionable errors.",
  "Measured runs: each response returns stage timings and the benchmark records percentile latency over 100 mixed queries.",
];

export const guardrails = [
  "Off-topic gate — known non-corpus requests are refused before answer extraction.",
  "Groundedness check — the answer is an extracted retrieved sentence with query-term support, never an ungrounded generated claim.",
  "Abstention path — low support score returns 'I don't have that in the dataset' with the nearest passages.",
  "Safety filter — unsafe or PII-seeking inputs short-circuit before STT output reaches the model.",
];
