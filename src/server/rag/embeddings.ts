import { env, pipeline } from "@huggingface/transformers";
import { InferenceClient } from "@huggingface/inference";

const LOCAL_MODEL = "Xenova/paraphrase-multilingual-MiniLM-L12-v2";
const REMOTE_MODEL =
  process.env.HF_EMBEDDING_MODEL ?? "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2";
const useHuggingFace =
  process.env.RAG_EMBEDDING_BACKEND === "huggingface" && Boolean(process.env.HF_TOKEN);

env.allowLocalModels = false;
env.useBrowserCache = false;

let extractorPromise: ReturnType<typeof pipeline> | undefined;

async function extractor() {
  extractorPromise ??= pipeline("feature-extraction", LOCAL_MODEL, {
    dtype: "q8",
  });
  return extractorPromise;
}

async function embedWithHuggingFace(texts: string[]): Promise<number[][]> {
  const client = new InferenceClient(process.env.HF_TOKEN);
  const output = await client.featureExtraction({
    provider: "hf-inference",
    model: REMOTE_MODEL,
    inputs: texts,
    normalize: true,
  });
  if (!Array.isArray(output) || !output.every((row) => Array.isArray(row))) {
    throw new Error("Hugging Face returned an invalid embedding response.");
  }
  const vectors = output.map((row) => row.map(Number));
  if (vectors.length !== texts.length || vectors.some((vector) => vector.length !== 384)) {
    throw new Error("Hugging Face embedding dimensions do not match the 384-dimension Qdrant index.");
  }
  return vectors;
}

export async function embed(text: string): Promise<number[]> {
  return (await embedMany([text]))[0] ?? [];
}

export async function embedMany(texts: string[]): Promise<number[][]> {
  if (!texts.length) return [];
  if (useHuggingFace) {
    try {
      return await embedWithHuggingFace(texts);
    } catch (error) {
      // Keep the voice path live during a provider outage or rate-limit event. The local model
      // is slower on a small cloud CPU, but uses the identical vector space as the index.
      console.warn("Hugging Face embeddings unavailable; using local fallback.", error);
    }
  }
  const model = await extractor();
  const output = await model(texts, { pooling: "mean", normalize: true });
  const values = Array.from(output.data as Float32Array);
  const dimensions = output.dims.at(-1) ?? values.length / texts.length;
  return texts.map((_, index) => values.slice(index * dimensions, (index + 1) * dimensions));
}

export async function embeddingDimension(): Promise<number> {
  return (await embed("dimension probe")).length;
}

export const EMBEDDING_MODEL = useHuggingFace ? REMOTE_MODEL : LOCAL_MODEL;
export const EMBEDDING_BACKEND = useHuggingFace ? "huggingface" : "local";
