import { chunkRecord } from "../src/server/rag/index";
import { msmarcoCorpus } from "../src/server/rag/generated-corpus";
import { embedMany, embeddingDimension, EMBEDDING_MODEL } from "../src/server/rag/embeddings";

const baseUrl = process.env.QDRANT_URL ?? "http://127.0.0.1:6333";
const collection = process.env.QDRANT_COLLECTION ?? "msmarco_xi_multilingual";
const apiKey = process.env.QDRANT_API_KEY;
const dimensions = await embeddingDimension();
const chunks = msmarcoCorpus.flatMap(chunkRecord);

function authHeaders(): Record<string, string> {
  return apiKey ? { "api-key": apiKey } : {};
}

async function request(path: string, init?: RequestInit): Promise<Response> {
  let lastError: unknown;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const response = await fetch(`${baseUrl}${path}`, {
        ...init,
        headers: { "content-type": "application/json", ...authHeaders(), ...(init?.headers ?? {}) },
        signal: AbortSignal.timeout(30_000),
      });
      if (response.ok) return response;
      lastError = new Error(`${path} failed (${response.status}): ${await response.text()}`);
    } catch (error) {
      lastError = error;
    }
    if (attempt < 2) await new Promise((resolve) => setTimeout(resolve, 400 * 2 ** attempt));
  }
  throw lastError instanceof Error ? lastError : new Error(`${path} failed after retries`);
}

await fetch(`${baseUrl}/collections/${collection}`, { method: "DELETE", headers: authHeaders() });
await request(`/collections/${collection}`, {
  method: "PUT",
  body: JSON.stringify({
    vectors: { size: dimensions, distance: "Cosine" },
    hnsw_config: { m: 16, ef_construct: 100 },
  }),
});
// The production path filters by source query after transcription correction. A keyword payload
// index makes that filter fast even as the multilingual collection grows.
await request(`/collections/${collection}/index`, {
  method: "PUT",
  body: JSON.stringify({ field_name: "query", field_schema: "keyword" }),
});

// Small batches keep local Qdrant responsive on laptop hardware. Larger writes can block its
// optimizer for minutes and make the terminal appear frozen.
const batchSize = 32;
const indexedAt = Date.now();
for (let start = 0; start < chunks.length; start += batchSize) {
  const batch = chunks.slice(start, start + batchSize);
  const vectors = await embedMany(batch.map((chunk) => chunk.text));
  await request(`/collections/${collection}/points?wait=true`, {
    method: "PUT",
    body: JSON.stringify({
      points: batch.map((chunk, index) => ({
        id: start + index + 1,
        vector: vectors[index],
        payload: chunk,
      })),
    }),
  });
  if ((start / batchSize) % 10 === 0 || start + batch.length >= chunks.length) {
    const completed = Math.min(start + batch.length, chunks.length);
    const elapsedSeconds = (Date.now() - indexedAt) / 1_000;
    const remainingSeconds = completed
      ? (elapsedSeconds / completed) * (chunks.length - completed)
      : 0;
    console.log(
      `Indexed ${completed}/${chunks.length} · elapsed ${elapsedSeconds.toFixed(0)}s · ETA ${Math.ceil(remainingSeconds / 60)}m`,
    );
  }
}

console.log(
  JSON.stringify({ collection, chunks: chunks.length, dimensions, model: EMBEDDING_MODEL }),
);
