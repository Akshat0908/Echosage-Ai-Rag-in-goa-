import type { RetrievedChunk } from "./types";

type QdrantPoint = {
  id: string;
  score: number;
  payload?: Record<string, unknown>;
};

export class QdrantVectorStore {
  constructor(
    private readonly baseUrl = process.env.QDRANT_URL ?? "http://127.0.0.1:6333",
    private readonly collection = process.env.QDRANT_COLLECTION ?? "msmarco_xi_multilingual",
    private readonly apiKey = process.env.QDRANT_API_KEY,
  ) {}

  get configured(): boolean {
    return Boolean(this.baseUrl && this.collection);
  }

  async health(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/healthz`, {
        headers: this.apiKey ? { "api-key": this.apiKey } : undefined,
        signal: AbortSignal.timeout(800),
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  async search(vector: number[], limit = 6, corpusQuery?: string): Promise<RetrievedChunk[]> {
    const response = await fetch(`${this.baseUrl}/collections/${this.collection}/points/query`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        ...(this.apiKey ? { "api-key": this.apiKey } : {}),
      },
      body: JSON.stringify({
        query: vector,
        limit,
        with_payload: true,
        ...(corpusQuery
          ? { filter: { must: [{ key: "query", match: { value: corpusQuery } }] } }
          : {}),
      }),
      signal: AbortSignal.timeout(1_500),
    });
    if (!response.ok) throw new Error(`Qdrant search failed (${response.status})`);
    const body = (await response.json()) as { result?: { points?: QdrantPoint[] } };
    return (body.result?.points ?? []).flatMap((point) => {
      const payload = point.payload;
      if (!payload || typeof payload.text !== "string") return [];
      return [
        {
          id: point.id,
          parentId: String(payload.parentId ?? point.id),
          text: payload.text,
          strategy: String(payload.strategy ?? "semantic") as RetrievedChunk["strategy"],
          language: String(payload.language ?? "unknown"),
          queryType: String(payload.queryType ?? "unknown"),
          queryId: String(payload.queryId ?? "unknown"),
          query: String(payload.query ?? ""),
          source: "msmarco-xi",
          position: Number(payload.position ?? 0),
          selected: Boolean(payload.selected),
          sourcePassageIndex: Number(payload.sourcePassageIndex ?? 0),
          matchedTerms: [],
          lexicalScore: 0,
          vectorScore: point.score,
          fusedScore: point.score,
        },
      ];
    });
  }
}
