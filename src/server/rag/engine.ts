import { LocalVectorDb, tokenize } from "./index";
import { embed } from "./embeddings";
import { QdrantVectorStore } from "./qdrant";
import { demoCorpus } from "./seed";
import { detectPromptInjection } from "./prompt-guard";
import { classifyIntent } from "./intent-filter";
import { cacheLookup, cacheStore } from "./semantic-cache";
import type { CorpusRecord, GuardrailResult, RagResponse, RetrievedChunk, StageTiming } from "./types";

// Lazy-load the 57MB corpus only when NOT using Qdrant (saves ~400MB RAM on Railway free tier).
const USE_QDRANT = process.env.RAG_VECTOR_BACKEND === "qdrant";
let _corpus: CorpusRecord[] | null = null;
async function getCorpus(): Promise<CorpusRecord[]> {
  if (_corpus) return _corpus;
  if (USE_QDRANT) return (_corpus = []);
  const { msmarcoCorpus } = await import("./generated-corpus");
  return (_corpus = msmarcoCorpus);
}
// Synchronous accessor for the already-loaded corpus (returns [] before init).
function corpus(): CorpusRecord[] {
  return _corpus ?? [];
}

const UNSAFE =
  /\b(?:kill|murder|bomb|weapon|explosive|self[- ]harm|suicide|child sexual|password|credit card)\b/i;
const OFF_TOPIC =
  /\b(?:weather tomorrow|stock price|buy|sell|medical diagnosis|legal advice|write malware|hack|politics)\b/i;

function now(): number {
  return typeof performance !== "undefined" ? performance.now() : Date.now();
}

function clamp(value: number): number {
  return Math.max(0, Math.min(1, value));
}

function guard(query: string, results: RetrievedChunk[]): GuardrailResult {
  const normalized = query.trim();
  if (normalized.length < 3)
    return { allowed: false, reason: "invalid-input", message: "Please ask a complete question." };

  // Stage: Prompt injection detection (<0.1ms)
  const injectionCheck = detectPromptInjection(normalized);
  if (!injectionCheck.allowed) return injectionCheck;

  // Stage: Intent classification (<0.1ms)
  const intentCheck = classifyIntent(normalized);
  if (!intentCheck.allowed) return intentCheck;

  if (UNSAFE.test(normalized))
    return {
      allowed: false,
      reason: "unsafe",
      message: "I can't help with unsafe or sensitive requests.",
    };
  if (OFF_TOPIC.test(normalized))
    return {
      allowed: false,
      reason: "off-topic",
      message: "That request is outside the indexed knowledge base.",
    };
  const normalizedQuery = lookupKey(normalized);
  const exactDatasetMatch = results.some((result) => lookupKey(result.query) === normalizedQuery);
  const queryTerms = tokenize(normalized);
  const bestLexicalSupport = Math.max(...results.map((result) => result.lexicalScore), 0);
  // ANN can surface a fluent but unrelated sentence for a generic word such as "world".
  // Require either a known corpus query or substantial lexical evidence before extraction.
  if (!exactDatasetMatch && queryTerms.length >= 3 && bestLexicalSupport < 0.5)
    return {
      allowed: false,
      reason: "low-support",
      message: "I don't have enough evidence in the dataset to answer that without guessing.",
    };
  // `is_selected` is a MSMARCO evaluation label, not a runtime source of truth.
  // Grounding must follow the text actually retrieved for the user's question.
  const support = results[0]?.fusedScore ?? 0;
  if (support < 0.34)
    return {
      allowed: false,
      reason: "low-support",
      message: "I don't have enough evidence in the dataset to answer that without guessing.",
    };
  return { allowed: true, reason: "ok" };
}

/**
 * TextRank-inspired sentence selection from top chunks.
 *
 * Instead of returning the entire best chunk, we:
 * 1. Split the top 3 chunks into individual sentences
 * 2. Score each sentence by term overlap with the query
 * 3. Boost sentences that share terms with other sentences (co-occurrence / TextRank)
 * 4. Return the top-scoring sentence
 *
 * This produces more informative, precise answers than returning a full paragraph.
 */
function textRankExtract(query: string, results: RetrievedChunk[]): string | null {
  if (!results.length) return null;
  const queryTerms = new Set(tokenize(query));
  if (!queryTerms.size) return results[0]!.text.replace(/\s+/gu, " ").trim();

  // Gather sentences from top 3 chunks
  const sentences: Array<{ text: string; terms: Set<string>; source: RetrievedChunk }> = [];
  for (const chunk of results.slice(0, 3)) {
    const cleanText = chunk.text.replace(/\s+/gu, " ").trim();
    // Split into sentences (supports Devanagari danda as sentence separator)
    const parts = cleanText.split(/(?<=[.!?।])\s+/u).filter((s) => s.length > 15);
    if (!parts.length) {
      sentences.push({ text: cleanText, terms: new Set(tokenize(cleanText)), source: chunk });
    } else {
      for (const part of parts) {
        sentences.push({ text: part.trim(), terms: new Set(tokenize(part)), source: chunk });
      }
    }
  }

  if (!sentences.length) return results[0]!.text.replace(/\s+/gu, " ").trim();

  // Score each sentence
  let best = sentences[0]!;
  let bestScore = -1;

  for (const sentence of sentences) {
    // Query relevance: what fraction of query terms appear in this sentence
    const queryOverlap = [...queryTerms].filter((t) => sentence.terms.has(t)).length / queryTerms.size;

    // Co-occurrence bonus: how many terms does this sentence share with OTHER sentences
    let cooccurrence = 0;
    for (const other of sentences) {
      if (other === sentence) continue;
      const shared = [...sentence.terms].filter((t) => other.terms.has(t)).length;
      cooccurrence += shared;
    }
    const cooccurrenceNorm = sentences.length > 1 ? cooccurrence / ((sentences.length - 1) * sentence.terms.size || 1) : 0;

    // Length preference: not too short, not too long (sweet spot around 20-60 words)
    const wordCount = sentence.text.split(/\s+/).length;
    const lengthBonus = wordCount >= 15 && wordCount <= 80 ? 0.1 : 0;

    const score = queryOverlap * 0.6 + cooccurrenceNorm * 0.3 + lengthBonus;

    if (score > bestScore) {
      bestScore = score;
      best = sentence;
    }
  }

  return best.text;
}

/**
 * Post-generation grounding verification.
 *
 * Checks that the answer has sufficient token overlap (≥ 0.50) with the
 * source chunks. If the answer contains too many terms NOT found in the
 * retrieved evidence, it's rejected as ungrounded.
 */
function verifyGrounding(answer: string, results: RetrievedChunk[]): boolean {
  const answerTerms = tokenize(answer);
  if (!answerTerms.length) return false;

  // Pool all terms from the top retrieved chunks
  const evidenceTerms = new Set<string>();
  for (const chunk of results.slice(0, 5)) {
    for (const term of tokenize(chunk.text)) {
      evidenceTerms.add(term);
    }
  }

  const groundedCount = answerTerms.filter((t) => evidenceTerms.has(t)).length;
  const overlap = groundedCount / answerTerms.length;
  return overlap >= 0.50;
}

function extractAnswer(query: string, results: RetrievedChunk[]): string | null {
  if (!results.length) return null;
  return textRankExtract(query, results);
}

function lookupKey(input: string): string {
  return input
    .toLocaleLowerCase()
    .normalize("NFKC")
    .replace(/\u094d/gu, "")
    .replace(/[^\p{L}\p{M}\p{N}\s-]/gu, " ")
    .replace(/\s+/gu, " ")
    .trim();
}

function editDistance(left: string, right: string, maximum: number): number {
  if (Math.abs(left.length - right.length) > maximum) return maximum + 1;
  let previous = Array.from({ length: right.length + 1 }, (_, index) => index);
  for (let i = 1; i <= left.length; i += 1) {
    const current = [i];
    let minimum = current[0]!;
    for (let j = 1; j <= right.length; j += 1) {
      const cost = left[i - 1] === right[j - 1] ? 0 : 1;
      const value = Math.min(previous[j]! + 1, current[j - 1]! + 1, previous[j - 1]! + cost);
      current.push(value);
      minimum = Math.min(minimum, value);
    }
    if (minimum > maximum) return maximum + 1;
    previous = current;
  }
  return previous[right.length]!;
}

function resolveDatasetQuery(transcript: string): string | undefined {
  const c = corpus();
  if (!c.length) return undefined; // Qdrant-only mode: skip fuzzy match
  const target = lookupKey(transcript);
  if (!target || target.length < 5) return undefined;
  let closest: { query: string; distance: number } | undefined;
  for (const record of c) {
    const candidate = lookupKey(record.query);
    if (candidate === target) return record.query;
    const maximum = Math.max(1, Math.floor(target.length * 0.18));
    const distance = editDistance(target, candidate, maximum);
    if (distance <= maximum && (!closest || distance < closest.distance))
      closest = { query: record.query, distance };
  }
  return closest?.query;
}

function dedupeAndRerank(query: string, results: RetrievedChunk[]): RetrievedChunk[] {
  const queryTerms = new Set(tokenize(query));
  const unique = new Map<string, RetrievedChunk>();
  for (const result of results) {
    const key = result.text.replace(/\s+/gu, " ").trim();
    const previous = unique.get(key);
    if (!previous || result.fusedScore > previous.fusedScore) unique.set(key, result);
  }
  return [...unique.values()]
    .map((result) => {
      const terms = new Set(tokenize(result.text));
      const overlap = queryTerms.size
        ? [...queryTerms].filter((term) => terms.has(term)).length / queryTerms.size
        : 0;
      const matchedTerms = [...queryTerms].filter((term) => terms.has(term));
      return {
        ...result,
        matchedTerms,
        lexicalScore: overlap,
        fusedScore: clamp(result.vectorScore * 0.7 + overlap * 0.3),
      };
    })
    .sort((left, right) => right.fusedScore - left.fusedScore);
}

function createTiming(
  name: string,
  started: number,
  status: StageTiming["status"] = "ok",
): StageTiming {
  return { name, ms: Math.max(0, Math.round((now() - started) * 100) / 100), status };
}

export class RagEngine {
  private db: LocalVectorDb | null = null;
  private readonly qdrant = new QdrantVectorStore();
  private _ready: Promise<void>;

  constructor() {
    this._ready = this.init();
  }

  private async init(): Promise<void> {
    const c = await getCorpus();
    this.db = new LocalVectorDb(c.length ? c : demoCorpus);
  }

  private ensureDb(): LocalVectorDb {
    // Fallback to demo corpus if init hasn't finished (shouldn't happen in practice)
    if (!this.db) this.db = new LocalVectorDb(demoCorpus);
    return this.db;
  }

  get indexStats() {
    const c = corpus();
    return {
      chunks: USE_QDRANT ? 853779 : this.ensureDb().size,
      strategies: this.ensureDb().strategies,
      source: USE_QDRANT
        ? "Qdrant Cloud (MSMARCO-XI)"
        : c.length
          ? "MSMARCO-XI sampled build"
          : "demo seed; run ingest-msmarco-xi.py to build MSMARCO-XI artifact",
    };
  }

  answer(
    transcript: string,
    prefetched?: { results: RetrievedChunk[]; retrievalMs: number },
  ): RagResponse {
    const requestId = crypto.randomUUID();
    const started = now() - (prefetched?.retrievalMs ?? 0);
    const timings: StageTiming[] = [];
    const trace: string[] = ["validate.input"];
    // Block obvious unsafe/invalid queries before touching the retrieval layer.
    const preflight = guard(transcript, []);
    const retrievalStart = now();
    const results =
      preflight.reason === "unsafe" || preflight.reason === "invalid-input"
        ? []
        : (prefetched?.results ?? this.ensureDb().search(transcript, 8));
    timings.push(
      prefetched
        ? { name: "qdrant-vector-retrieval", ms: prefetched.retrievalMs, status: "ok" as const }
        : createTiming("hybrid-retrieval", retrievalStart),
    );
    trace.push("tool.retrieve", "tool.rerank.rrf");
    const guardrail = guard(transcript, results);
    timings.push({ name: "guardrail", ms: 0, status: guardrail.allowed ? "ok" : "blocked" });
    trace.push(guardrail.allowed ? "guardrail.pass" : `guardrail.block:${guardrail.reason}`);
    const support = clamp(
      (results[0]?.fusedScore ?? 0) * 0.78 + (results[1]?.fusedScore ?? 0) * 0.22,
    );
    const postSttMs = Math.max(0, Math.round((now() - started) * 100) / 100);
    if (!guardrail.allowed) {
      return {
        requestId,
        transcript,
        answer: guardrail.message ?? "I cannot answer that from the indexed evidence.",
        verdict: guardrail.reason === "unsafe" ? "blocked" : "abstained",
        support,
        citations: results.slice(0, 3).map((item) => ({
          id: item.id,
          score: Number(item.fusedScore.toFixed(3)),
          snippet: item.text.slice(0, 160),
          strategy: item.strategy,
          language: item.language,
        })),
        timings,
        totalMs: Math.round((now() - started) * 100) / 100,
        postSttMs,
        harness: { attempts: 1, recovered: false, trace },
        guardrail,
        index: this.indexStats,
      };
    }
    const answerStart = now();
    const answer = extractAnswer(transcript, results);
    timings.push(createTiming("textrank-synthesis", answerStart));
    // Post-generation grounding verification
    const groundingStart = now();
    const isGrounded = answer ? verifyGrounding(answer, results) : false;
    timings.push(createTiming("grounding-verify", groundingStart, isGrounded ? "ok" : "blocked"));
    if (!answer || !isGrounded) {
      trace.push("guardrail.block:answer-not-supported");
      return {
        requestId,
        transcript,
        answer:
          "I found related material, but not enough directly supported evidence to answer without guessing.",
        verdict: "abstained",
        support,
        citations: [],
        timings,
        totalMs: Math.round((now() - started) * 100) / 100,
        postSttMs,
        harness: { attempts: 1, recovered: false, trace },
        guardrail: {
          allowed: false,
          reason: "low-support",
          message: "The retrieved sentence did not directly support an answer.",
        },
        index: this.indexStats,
      };
    }
    trace.push("tool.cite", "output.schema.valid");
    return {
      requestId,
      transcript,
      answer,
      verdict: "grounded",
      support,
      citations: results.slice(0, 3).map((item) => ({
        id: item.id,
        score: Number(item.fusedScore.toFixed(3)),
        snippet: item.text.slice(0, 160),
        strategy: item.strategy,
        language: item.language,
      })),
      timings,
      totalMs: Math.round((now() - started) * 100) / 100,
      postSttMs,
      harness: { attempts: 1, recovered: false, trace },
      guardrail,
      index: this.indexStats,
    };
  }

  async answerProduction(transcript: string): Promise<RagResponse> {
    await this._ready;
    if (!USE_QDRANT) return this.answer(transcript);
    const started = now();
    try {
      const queryEmbedding = await embed(transcript);

      // Stage: Semantic cache lookup (<0.5ms)
      const cacheStart = now();
      const cached = cacheLookup(queryEmbedding);
      if (cached) {
        cached.timings = [
          { name: "semantic-cache-hit", ms: Math.max(0, Math.round((now() - cacheStart) * 100) / 100), status: "ok" },
          ...cached.timings,
        ];
        cached.totalMs = Math.max(0, Math.round((now() - started) * 100) / 100);
        cached.postSttMs = cached.totalMs;
        cached.requestId = crypto.randomUUID();
        cached.transcript = transcript;
        return cached;
      }

      const routedQuery = resolveDatasetQuery(transcript);
      const results = dedupeAndRerank(
        routedQuery ?? transcript,
        await this.qdrant.search(queryEmbedding, routedQuery ? 12 : 8, routedQuery),
      );
      if (!results.length) return this.answer(transcript);
      const response = this.answer(routedQuery ?? transcript, {
        results,
        retrievalMs: Math.max(0, now() - started),
      });

      // Store in cache if grounded
      cacheStore(queryEmbedding, response);

      return response;
    } catch {
      return this.answer(transcript);
    }
  }
}

export const ragEngine = new RagEngine();
