import { Mic, Waves, Boxes, Database, Sparkles, ShieldCheck } from "lucide-react";

export const pipeline = [
  { icon: Mic, label: "Voice in", note: "Browser capture, converted to 16kHz WAV. Because we respect bandwidth." },
  { icon: Waves, label: "Sarvam STT", note: "Live transcription, hi/en. Understands our panic-breathing." },
  {
    icon: Boxes,
    label: "Multi-view chunking",
    note: "Sentence, window, proposition, parent-child. Chunking is an art, not a character count.",
  },
  { icon: Database, label: "Hybrid recall", note: "Local vector + lexical. Qdrant Cloud does the heavy lifting." },
  { icon: Sparkles, label: "Grounded answer", note: "Cited, span-checked. We don't hallucinate here." },
  { icon: ShieldCheck, label: "Guardrail exit", note: "Abstains when unsure. A rare trait in AI and politicians." },
];

export const strategies = [
  {
    tag: "01",
    name: "Sentence-aware splits",
    body: "Passages split on sentence boundaries, preserving complete facts. Because cutting a fact in ha... is just terrible UX.",
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
  "Typed boundary: the API validates JSON transcript input with Zod. Bad inputs bounce faster than a club bouncer.",
  "Explicit stages: validation, retrieval, reranking, grounding, and citation are traceable steps — not one opaque 'please answer this' prompt.",
  "Recoverable voice path: Sarvam retries transient failures. Because networks flake, but the demo must go on.",
  "Measured runs: every response includes per-stage timings in milliseconds. We don't hide latency; we flaunt it.",
];

export const guardrails = [
  "Off-topic gate — known non-corpus requests are refused before extraction. Don't ask for biryani recipes.",
  "Groundedness check — the answer is an extracted retrieved sentence, never a generated claim. LLM creativity belongs in poetry, not RAG.",
  "Abstention path — low support score returns 'I don't have that in the dataset'. Because silence is better than a confident lie.",
  "Safety filter — unsafe inputs short-circuit immediately. Don't even try it.",
];
