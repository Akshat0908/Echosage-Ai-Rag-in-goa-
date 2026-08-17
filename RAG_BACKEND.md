# HH Goa Task 2 — Voice RAG backend

This repository now contains a real, inspectable voice-to-answer backend behind the existing frontend. The request contract is `POST /api/rag`. JSON requests accept `{ "transcript": "..." }` for deterministic harness tests. Multipart requests accept an `audio` file, send it to Sarvam Speech-to-Text, and then run the same retrieval, guardrail, and answer path. `GET /api/rag` returns service and index health. `GET /api/rag-benchmark` runs 100 mixed grounded, unknown, and unsafe queries and returns P50, P70, P100, mean, and the percentage under 200 ms.

The online index is deliberately bounded. The provided MSMARCO-XI repository is approximately 11.45 million rows and roughly 55.6 GB, so the service does not attempt to load the full dataset during a request. Run `pip install datasets pyarrow`, then `HF_HOME=.cache/huggingface python scripts/ingest-msmarco-xi.py --languages hin,ben,tel --split validation --rows-per-language 2000 --sampling reservoir`. Reservoir sampling scans the full selected split and retains a deterministic, diverse subset instead of a topic-biased first-N prefix. The job also creates an English projection from the Hindi source file, preserves query type, language, unique query id, selected-passage metadata, and answer provenance, and writes `src/server/rag/generated-corpus.ts`. The index expands every source passage independently into semantic sentence chunks, overlapping sliding windows, proposition atoms, and parent-child chunks; it never merges passages into one answer context.

Retrieval is a hybrid local vector/lexical index. It uses hashed n-gram vectors for cosine similarity, an inverted term map for candidate narrowing, lexical overlap, strategy diversity, and a fused score. This keeps the request path dependency-light and fast enough to benchmark in-process while retaining multiple retrieval strategies. The answer stage is intentionally extractive and citation-first: it selects only from a retrieved selected passage, never from a hidden dataset answer label. This is safer and much faster than adding a remote generative model inside a 200 ms post-STT budget.

The harness records structured stages and a trace such as `validate.input`, `tool.retrieve`, `tool.rerank.rrf`, `guardrail.pass`, `tool.cite`, and `output.schema.valid`. It returns a grounded answer only when support is sufficient. Unsafe requests are blocked; off-topic, invalid, and low-support requests abstain with an honest explanation. Errors return a recoverable JSON response rather than a silent failure.

## Local setup

Copy `.env.example` to `.env`, add a Sarvam API key for actual microphone transcription, and start the project with `npm install && npm run dev`. The browser microphone button in `DemoConsole` records `audio/webm` and posts it to `/api/rag`; it displays only the server-returned transcript, citations, verdict, and measured timings. For a true submission demo, configure `SARVAM_API_KEY` and show the live multipart path.

## Verification

Run `npm run rag:smoke` to exercise grounded Hindi, English, Bengali, and Telugu queries, plus unknown and unsafe inputs. Run `npm run rag:benchmark` for a reproducible 100-query post-STT report, including retrieval and answer-stage P50/P95/P99 figures. Add `-- --language eng_Latn` (or `hin_Deva`, `ben_Beng`, `tel_Telu`) to produce a language-specific report. Once Qdrant is indexed, run `npm run rag:benchmark:qdrant -- 50` to measure warm embedding plus Qdrant vector-search latency against the 50 ms retrieval budget; it accepts the same language argument. To inspect raw vector hits without the answer harness, run `npm run rag:query:qdrant -- "What is a corporation?"`. `/api/rag-benchmark` exposes the post-STT report over HTTP. The result is explicitly scoped to post-STT in-process work; report measured Sarvam time separately. A live network voice-to-answer request cannot honestly be guaranteed below 200 ms in every geography.

## References

1. [MSMARCO-XI dataset card](https://huggingface.co/datasets/ai4bharat/MSMARCO-XI)
2. [Sarvam Speech-to-Text REST API](https://docs.sarvam.ai/api-reference/speech-to-text/transcribe)
3. [HH Goa 2026 Task 2 brief](https://hhgoa.com)
