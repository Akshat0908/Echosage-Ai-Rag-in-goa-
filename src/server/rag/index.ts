import type { ChunkStrategy, CorpusRecord, RagChunk, RetrievedChunk } from "./types";

const DIMENSIONS = 192;
const STOPWORDS = new Set(
  "a an the and or but if then than is are was were be been to of in on for from with by as at into about what which who why how does did do can could should would this that these those it its their his her our your i me we they them does keep keeps won winner है हैं था थे थी के का की को में पर से और या एक यह वह क्या कौन कब कहाँ क्यों कैसे मुझे हमें आपको तुम मैं हम वे भी ही तथा लेकिन जबकि यदि तो जो द्वारा लिए वाला वाली वाले".split(
    " ",
  ),
);

function hash(value: string): number {
  let h = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    h ^= value.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function tokenize(input: string): string[] {
  return (
    input
      .toLocaleLowerCase()
      .normalize("NFKC")
      // Sarvam may omit a Devanagari halant in conjuncts (for example र्प → रप).
      // Normalizing it for both corpus and query preserves retrieval without transliteration.
      .replace(/\u094d/gu, "")
      // Indic scripts use combining vowel marks. Keeping Unicode marks prevents a word like
      // "कॉर्पोरेशन" from collapsing into tiny, misleading fragments during retrieval.
      .replace(/[^\p{L}\p{M}\p{N}\s-]/gu, " ")
      .split(/\s+/)
      .map((term) => term.trim())
      .filter((term) => term.length > 1 && !STOPWORDS.has(term))
  );
}

function termPrefix(term: string): string {
  // Array.from keeps Indic combining characters intact while slicing.
  return Array.from(term).slice(0, 4).join("");
}

function queryLookupKey(input: string): string {
  return input
    .toLocaleLowerCase()
    .normalize("NFKC")
    .replace(/\u094d/gu, "")
    .replace(/[^\p{L}\p{M}\p{N}\s-]/gu, " ")
    .replace(/\s+/gu, " ")
    .trim();
}

function boundedEditDistance(left: string, right: string, maximum: number): number {
  if (Math.abs(left.length - right.length) > maximum) return maximum + 1;
  let previous = Array.from({ length: right.length + 1 }, (_, index) => index);
  for (let i = 1; i <= left.length; i += 1) {
    const current = [i];
    let rowMinimum = current[0]!;
    for (let j = 1; j <= right.length; j += 1) {
      const cost = left[i - 1] === right[j - 1] ? 0 : 1;
      const value = Math.min(previous[j]! + 1, current[j - 1]! + 1, previous[j - 1]! + cost);
      current.push(value);
      rowMinimum = Math.min(rowMinimum, value);
    }
    if (rowMinimum > maximum) return maximum + 1;
    previous = current;
  }
  return previous[right.length]!;
}

export function vectorize(input: string): number[] {
  const vector = new Array<number>(DIMENSIONS).fill(0);
  const terms = tokenize(input);
  for (const term of terms) {
    const index = hash(term) % DIMENSIONS;
    vector[index] += 1;
    if (term.length > 3) {
      vector[hash(term.slice(0, 4)) % DIMENSIONS] += 0.35;
    }
  }
  for (let i = 0; i < terms.length - 1; i += 1) {
    vector[hash(`${terms[i]}:${terms[i + 1]}`) % DIMENSIONS] += 0.65;
  }
  const norm = Math.sqrt(vector.reduce((sum, value) => sum + value * value, 0));
  return norm === 0 ? vector : vector.map((value) => value / norm);
}

function cosine(a: number[], b: number[]): number {
  let score = 0;
  for (let i = 0; i < DIMENSIONS; i += 1) score += (a[i] ?? 0) * (b[i] ?? 0);
  return Math.max(0, score);
}

function sentenceSplit(text: string): string[] {
  return text
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?।])\s+/u)
    .map((part) => part.trim())
    .filter((part) => part.length > 18);
}

function slidingWindows(text: string, size = 72, overlap = 18): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length <= size) return [text.trim()];
  const result: string[] = [];
  for (let start = 0; start < words.length; start += size - overlap) {
    const window = words.slice(start, start + size).join(" ");
    if (window) result.push(window);
    if (start + size >= words.length) break;
  }
  return result;
}

function propositionSplit(text: string): string[] {
  const sentences = sentenceSplit(text);
  return sentences.flatMap((sentence) =>
    sentence
      .split(/\s+(?:and|but|because|while|although|which)\s+/i)
      .map((part) => part.trim())
      .filter((part) => part.length > 18),
  );
}

export function chunkRecord(record: CorpusRecord): RagChunk[] {
  const chunks: RagChunk[] = [];
  record.passages.forEach((passage, sourcePassageIndex) => {
    // Query ids repeat across language projections. Include the language in the parent key so
    // diversity and citation grouping never merge unrelated multilingual passages.
    const parentId = `${record.language}:${record.queryId}:passage:${sourcePassageIndex}`;
    const selected = record.selected[sourcePassageIndex] === 1;
    const semantic = sentenceSplit(passage);
    const strategies: Array<[ChunkStrategy, string[]]> = [
      ["semantic", semantic.length ? semantic : [passage]],
      ["sliding", slidingWindows(passage)],
      ["proposition", propositionSplit(passage).length ? propositionSplit(passage) : [passage]],
    ];
    for (const [strategy, parts] of strategies) {
      parts.forEach((text, position) => {
        chunks.push({
          id: `${parentId}:${strategy}:${position}`,
          parentId,
          text,
          strategy,
          language: record.language,
          queryType: record.queryType,
          queryId: record.queryId,
          query: record.query,
          source: record.source,
          position,
          // The answer label is intentionally not copied into chunks: generation must be
          // supported by retrieved text, never by a hidden gold label.
          selected,
          sourcePassageIndex,
        });
      });
    }
    (semantic.length ? semantic : [passage]).slice(0, 6).forEach((text, position) => {
      chunks.push({
        id: `${parentId}:parent-child:${position}`,
        parentId,
        text,
        strategy: "parent-child",
        language: record.language,
        queryType: record.queryType,
        queryId: record.queryId,
        query: record.query,
        source: record.source,
        position,
        selected,
        sourcePassageIndex,
      });
    });
  });
  return chunks;
}

export class LocalVectorDb {
  private readonly chunks: RagChunk[];
  private readonly vectors: number[][];
  private readonly inverted = new Map<string, number[]>();
  private readonly queryInverted = new Map<string, number[]>();
  private readonly exactQueryInverted = new Map<string, number[]>();
  private readonly prefixInverted = new Map<string, number[]>();

  constructor(records: CorpusRecord[]) {
    this.chunks = records.flatMap(chunkRecord);
    this.vectors = this.chunks.map((chunk) => vectorize(chunk.text));
    this.chunks.forEach((chunk, index) => {
      for (const term of new Set(tokenize(chunk.text))) {
        const bucket = this.inverted.get(term) ?? [];
        bucket.push(index);
        this.inverted.set(term, bucket);
        if (term.length >= 4) {
          const prefix = termPrefix(term);
          const prefixBucket = this.prefixInverted.get(prefix) ?? [];
          prefixBucket.push(index);
          this.prefixInverted.set(prefix, prefixBucket);
        }
      }
      for (const term of new Set(tokenize(chunk.query))) {
        const bucket = this.queryInverted.get(term) ?? [];
        bucket.push(index);
        this.queryInverted.set(term, bucket);
      }
      const queryKey = queryLookupKey(chunk.query);
      const exactBucket = this.exactQueryInverted.get(queryKey) ?? [];
      exactBucket.push(index);
      this.exactQueryInverted.set(queryKey, exactBucket);
    });
  }

  get size(): number {
    return this.chunks.length;
  }

  get strategies(): ChunkStrategy[] {
    return ["semantic", "sliding", "proposition", "parent-child"];
  }

  search(query: string, limit = 5): RetrievedChunk[] {
    const queryTerms = new Set(tokenize(query));
    const queryVector = vectorize(query);
    const lookupKey = queryLookupKey(query);
    let routedQueryCandidates = this.exactQueryInverted.get(lookupKey);
    if (!routedQueryCandidates && lookupKey.length >= 6) {
      const maximumDistance = Math.max(1, Math.floor(lookupKey.length * 0.12));
      let closest: { ids: number[]; distance: number } | undefined;
      for (const [indexedQuery, ids] of this.exactQueryInverted) {
        const distance = boundedEditDistance(lookupKey, indexedQuery, maximumDistance);
        if (distance <= maximumDistance && (!closest || distance < closest.distance)) {
          closest = { ids, distance };
          if (distance === 0) break;
        }
      }
      routedQueryCandidates = closest?.ids;
    }
    const candidateIds = new Set<number>(routedQueryCandidates ?? []);
    if (!routedQueryCandidates?.length) {
      for (const term of queryTerms) {
        for (const index of this.inverted.get(term) ?? []) candidateIds.add(index);
        // Metadata-aware route: MSMARCO groups each query with its candidate passages.
        // It widens recall for transcription variants; the answer still comes only from text.
        for (const index of this.queryInverted.get(term) ?? []) candidateIds.add(index);
      }
    }
    // Sarvam can produce small Indic spelling variations (for example, a conjunct moved
    // inside a word). Only when exact matching finds nothing, admit prefix candidates.
    // This is bounded by the inverted index and avoids an O(N) fallback scan.
    if (!candidateIds.size) {
      for (const term of queryTerms) {
        if (term.length < 4) continue;
        for (const index of this.prefixInverted.get(termPrefix(term)) ?? [])
          candidateIds.add(index);
      }
    }
    // With no exact or safe prefix match, abstain instead of scanning unrelated passages.
    if (!candidateIds.size) return [];
    const candidates = [...candidateIds].map((index) => {
      const chunk = this.chunks[index]!;
      const chunkTerms = new Set(tokenize(chunk.text));
      const matchedTerms = [...queryTerms].filter((term) => chunkTerms.has(term));
      const lexicalScore = queryTerms.size ? matchedTerms.length / queryTerms.size : 0;
      const sourceQueryTerms = new Set(tokenize(chunk.query));
      const queryMetadataScore = queryTerms.size
        ? [...queryTerms].filter((term) => sourceQueryTerms.has(term)).length / queryTerms.size
        : 0;
      const vectorScore = cosine(queryVector, this.vectors[index]!);
      return {
        ...chunk,
        matchedTerms,
        lexicalScore,
        vectorScore,
        fusedScore: 0.42 * vectorScore + 0.33 * lexicalScore + 0.25 * queryMetadataScore,
      };
    });
    const byScore = candidates.sort((a, b) => b.fusedScore - a.fusedScore);
    const selected: RetrievedChunk[] = [];
    const parents = new Set<string>();
    const strategies = new Set<ChunkStrategy>();
    for (const item of byScore) {
      // MMR-lite: favour a first result from a new source passage and chunking strategy.
      // This avoids returning four nearly identical windows from one passage.
      if (parents.has(item.parentId) && selected.length < 3) continue;
      const diversityBonus =
        (parents.has(item.parentId) ? 0 : 0.04) + (strategies.has(item.strategy) ? 0 : 0.03);
      selected.push({ ...item, fusedScore: Math.min(1, item.fusedScore + diversityBonus) });
      parents.add(item.parentId);
      strategies.add(item.strategy);
      if (selected.length >= limit) break;
    }
    return selected.sort((a, b) => b.fusedScore - a.fusedScore);
  }
}
