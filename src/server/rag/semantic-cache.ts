import type { RagResponse } from "./types";

/**
 * Semantic Query Cache — LRU cache that stores previous query embeddings
 * and their responses. If a new query has cosine similarity ≥ THRESHOLD
 * to a cached query, returns the cached response in <0.5ms.
 *
 * - Max 200 entries (bounded memory)
 * - Uses the 384-dimensional HuggingFace embeddings already computed
 * - Cleared on server restart (in-memory only)
 */

const MAX_ENTRIES = 200;
const THRESHOLD = 0.93;

interface CacheEntry {
  embedding: number[];
  response: RagResponse;
  accessedAt: number;
}

const cache: CacheEntry[] = [];

function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0;
  let normA = 0;
  let normB = 0;
  const len = Math.min(a.length, b.length);
  for (let i = 0; i < len; i++) {
    dot += (a[i] ?? 0) * (b[i] ?? 0);
    normA += (a[i] ?? 0) ** 2;
    normB += (b[i] ?? 0) ** 2;
  }
  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  return denom === 0 ? 0 : dot / denom;
}

/**
 * Look up the cache for a semantically similar query.
 * Returns the cached RagResponse if similarity ≥ 0.93, otherwise null.
 */
export function cacheLookup(queryEmbedding: number[]): RagResponse | null {
  let bestMatch: CacheEntry | null = null;
  let bestSimilarity = 0;

  for (const entry of cache) {
    const similarity = cosineSimilarity(queryEmbedding, entry.embedding);
    if (similarity >= THRESHOLD && similarity > bestSimilarity) {
      bestSimilarity = similarity;
      bestMatch = entry;
    }
  }

  if (bestMatch) {
    bestMatch.accessedAt = Date.now();
    return {
      ...bestMatch.response,
      // Mark as cache hit so the caller can add a timing entry
      cacheHit: true,
    };
  }
  return null;
}

/**
 * Store a query embedding and its response in the cache.
 * Evicts the least-recently-accessed entry if the cache is full.
 */
export function cacheStore(queryEmbedding: number[], response: RagResponse): void {
  // Don't cache blocked or abstained responses
  if (response.verdict !== "grounded") return;

  if (cache.length >= MAX_ENTRIES) {
    // Evict the oldest entry
    let oldestIndex = 0;
    let oldestTime = Infinity;
    for (let i = 0; i < cache.length; i++) {
      if (cache[i]!.accessedAt < oldestTime) {
        oldestTime = cache[i]!.accessedAt;
        oldestIndex = i;
      }
    }
    cache.splice(oldestIndex, 1);
  }

  cache.push({
    embedding: queryEmbedding,
    response,
    accessedAt: Date.now(),
  });
}

/** Returns current cache size (for telemetry). */
export function cacheSize(): number {
  return cache.length;
}
