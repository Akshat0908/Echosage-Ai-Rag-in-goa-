import { embed } from "../src/server/rag/embeddings";
import { QdrantVectorStore } from "../src/server/rag/qdrant";

const query = process.argv
  .slice(2)
  .filter((argument) => argument !== "--run")
  .join(" ")
  .trim();

if (!query) {
  throw new Error('Usage: npm run rag:query:qdrant -- "your question"');
}

const store = new QdrantVectorStore();
if (!(await store.health())) throw new Error("Qdrant is unavailable at QDRANT_URL.");

const results = await store.search(await embed(query), 5);
console.log(
  JSON.stringify(
    {
      query,
      collection: process.env.QDRANT_COLLECTION ?? "msmarco_xi_multilingual",
      results: results.map((result) => ({
        score: Number(result.vectorScore.toFixed(4)),
        language: result.language,
        strategy: result.strategy,
        sourceQuery: result.query,
        text: result.text,
      })),
    },
    null,
    2,
  ),
);
