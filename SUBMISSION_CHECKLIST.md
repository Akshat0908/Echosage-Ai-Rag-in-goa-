# HH Goa Task 2: final submission checklist

## Completed in this repository

- Voice capture in the browser, converted to 16 kHz WAV and posted to `POST /api/rag`.
- Sarvam STT adapter with validation, retry handling, timeouts and an actionable failure response.
- A checked-in 8,000-record multilingual MSMARCO-XI validation sample: 2,000 each in Hindi, English, Bengali, and Telugu, producing 853,779 multi-view chunks.
- Sentence, overlapping-window, proposition, and parent-child chunking; metadata-aware candidate routing and diversified hybrid reranking.
- Structured harness traces, stable JSON responses, safety/off-topic/low-support abstention, citations, and extractive grounding.
- Runnable smoke and benchmark commands, plus the optional Qdrant indexing path.

## Latest local benchmark

Command: `npm run rag:benchmark`  
Scope: warm in-process transcript → retrieval → grounded extractive answer; Sarvam network STT excluded and returned separately per live request.

| Samples | Chunks | P50 | P70 | P100 | Under 200 ms |
| --- | ---: | ---: | ---: | ---: | ---: |
| 100 mixed queries | 853,779 | 1.49 ms | 2.44 ms | 147.95 ms | 100% |

## Latest warm Qdrant benchmark

Command: `npm run rag:benchmark:qdrant -- 50`  
Scope: warm query embedding plus Qdrant vector search; Sarvam STT and answer extraction excluded.

| Samples | Chunks | Total P50 | Total P70 | Total P95 | Total P100 |
| --- | ---: | ---: | ---: | ---: | ---: |
| 50 queries | 853,779 | 55.10 ms | 60.40 ms | 70.90 ms | 103.38 ms |

Re-run this command in the deployment environment immediately before recording/submitting; percentile results depend on machine load and index size.

## Still required before form submission

- Set `SARVAM_API_KEY` in the deployment secret store and complete one real microphone-to-answer check. Never commit the key.
- Deploy the production build and paste its public URL and the GitHub repository URL into the submission form.
- If the judging environment requires an external vector database, start Qdrant, run `npm run rag:warm:embeddings`, then `npm run rag:index:qdrant` and set `RAG_VECTOR_BACKEND=qdrant`. This command recreates the configured collection.
- Record the 90-second process video and the end-to-end demo video. Upload both to Instagram, X, and LinkedIn from every team member, with `#RAGInGoa`; keep at least one Instagram account public.
- Re-run smoke, benchmark, lint, and build against the exact deployed configuration. Do not claim a sub-200 ms end-to-end voice latency unless the Sarvam-inclusive measurements prove it.
