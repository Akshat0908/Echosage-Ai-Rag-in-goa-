import { env, pipeline } from "@huggingface/transformers";

const MODEL = "Xenova/paraphrase-multilingual-MiniLM-L12-v2";

env.allowLocalModels = false;
env.useBrowserCache = false;

let extractorPromise: ReturnType<typeof pipeline> | undefined;

async function extractor() {
  extractorPromise ??= pipeline("feature-extraction", MODEL, {
    dtype: "q8",
  });
  return extractorPromise;
}

export async function embed(text: string): Promise<number[]> {
  return (await embedMany([text]))[0] ?? [];
}

export async function embedMany(texts: string[]): Promise<number[][]> {
  if (!texts.length) return [];
  const model = await extractor();
  const output = await model(texts, { pooling: "mean", normalize: true });
  const values = Array.from(output.data as Float32Array);
  const dimensions = output.dims.at(-1) ?? values.length / texts.length;
  return texts.map((_, index) => values.slice(index * dimensions, (index + 1) * dimensions));
}

export async function embeddingDimension(): Promise<number> {
  return (await embed("dimension probe")).length;
}

export { MODEL as EMBEDDING_MODEL };
