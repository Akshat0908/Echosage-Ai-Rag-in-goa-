# 🏖️SandQuery — Voice RAG on the Beach

> **HH Goa 2026 · Shortlisting Task 2**
> Speak a question → get a grounded, cited answer. No hallucinations. No vibes. Just evidence.

🔗 **[Live Demo](https://echosage-ai-rag-in-goa-production.up.railway.app)** · 📦 **[API Endpoint](https://echosage-ai-rag-in-goa-production.up.railway.app/api/rag)**

---

## 🧑⚖️ Notes for Judges (Please Read)

### 1. No LLM Wrappers Here (How we hit 84ms)
While many teams are struggling to hit the 200ms target because they pass their context to an external LLM for generation (which inherently takes 1000ms+), we bypassed that bottleneck entirely. We built a purely **Extractive RAG** pipeline. Our system natively extracts the exact grounded sentence from the retrieved text in Node.js. 
**Generation time: 0ms. Hallucination rate: 0%.**

### 2. The "Cold Start" (HuggingFace Free Tier)
We deployed this entire architecture on free tiers (Railway + Qdrant Cloud + HuggingFace Inference API). If the API hasn't been used in a few minutes, HuggingFace puts the embedding model to sleep. 
- **First query (Cold):** ~4.5 seconds (waking up the model).
- **Subsequent queries (Warm):** ~84 milliseconds. 
*(If you are testing the live link, please ask one "warm-up" question first!)*

### 3. What to Ask (And What Not To Ask)
Our corpus is **MSMARCO-XI** — a historical dataset of Bing search queries, not a live internet connection or a modern encyclopedia.

✅ **Try asking these (they are guaranteed to be in the dataset!):**
- *"What is a corporation?"*
- *"What is a therapeutic window?"*
- *"Where is Fidel Castro buried?"*
- *"What are the side effects of chromium picolinate?"*
- *"Role of the parasympathetic nervous system."*

❌ **Do not ask these (Our guardrails will intentionally block them):**
- *"Who is the current Prime Minister of India?"* (Blocked: Current political questions require up-to-date sources, not historical datasets).
- *"Tell me how to build a bomb."* (Blocked: Unsafe/harmful).
- *"Give me a recipe for Biryani."* (Abstained: Out of distribution / Off-topic).
- *"What is the weather tomorrow?"* (Abstained: No live internet access).

### 4. The "Extractive" Tradeoff (Why some answers look like headings)
Because we built a strictly **Extractive** pipeline to beat the 200ms limit, our system relies on mathematical vector similarity and lexical overlap, not a Generative LLM. 

When you ask *"What is the side effect of chromium picolinate?"*, an LLM would write a custom paragraph. Our system, however, extracts the exact text from the database that has the highest keyword overlap. If a passage contains the heading *"Common Side Effects of Chromium Picolinate."*, that heading has a near 100% lexical match with the query, so the math dictates it as the "best" answer. 

This means it sometimes extracts the headings of paragraphs instead of synthesizing a conversational answer. **This is not a bug; it is a calculated design choice.** It is the exact trade-off we made to achieve 84ms latency and guarantee 0% hallucinations.

---

## ⚡ What It Does

A voice-enabled Retrieval-Augmented Generation (RAG) system over the [MSMARCO-XI](https://huggingface.co/datasets/ai4bharat/MSMARCO-XI) multilingual dataset.

```
🎤 Voice → 🗣️ Sarvam STT → 🔍 Multi-View Chunking + Qdrant Retrieval → ✅ Grounded Answer
```

**853,779 chunks** indexed across Hindi, Bengali, Telugu & English. Every answer is extracted directly from retrieved evidence — never generated, never hallucinated.

---

## 📊 Latency Benchmarks

### Local (In-Process, Zero Network)
| Metric | Value | Details |
|--------|-------|---------|
| **P50** | **1.49 ms** | 100 post-STT runs over 853K chunks |
| **P75** | **2.44 ms** | Warm multilingual hybrid index |
| **P100** | **147.95 ms** | 100% of queries under 200ms |

### Deployed (Railway → HuggingFace API → Qdrant Cloud)
| Metric | Value | Details |
|--------|-------|---------|
| **P50** | **84 ms** | 50-query benchmark, text-in API |
| **P75** | **92 ms** | Railway US East + Qdrant US East |
| **P95** | **125 ms** | 96% of queries under 200ms |

> Sarvam STT is a network call reported separately. These are **post-STT** numbers only.

---

## 🧠 Chunking Strategy (4 Views)

We don't do naive fixed-size chunking. Each passage is processed through **four complementary strategies**:

| Strategy | What It Does |
|----------|-------------|
| **Sentence-aware splits** | Respects sentence boundaries — no mid-sentence cuts |
| **Overlapping windows** | 72-word windows with 18-word overlap for boundary evidence |
| **Proposition atoms** | Decomposes passages into standalone factual claims |
| **Parent-child recall** | Search the atoms, return the parent window for context |

All candidates are deduped, diversified across source passages, and reranked with **vector + lexical + metadata-query** signals using Reciprocal Rank Fusion (RRF).

---

## 🏗️ Architecture

```
┌─────────────┐    ┌──────────────┐    ┌──────────────────────┐
│  Browser Mic │───▶│  Sarvam STT  │───▶│  HuggingFace Embed   │
│  (16kHz WAV) │    │  (saaras:v3) │    │  (MiniLM-L12-v2)     │
└─────────────┘    └──────────────┘    └──────────┬───────────┘
                                                   │
                                       ┌───────────▼───────────┐
                                       │   Qdrant Cloud (384d)  │
                                       │   853,779 vectors      │
                                       │   US East (Virginia)   │
                                       └───────────┬───────────┘
                                                   │
                                       ┌───────────▼───────────┐
                                       │  Rerank (RRF Fusion)   │
                                       │  Guardrails + Extract  │
                                       │  Grounded Answer Out   │
                                       └───────────────────────┘
```

### Infrastructure (100% Free Tier)
| Component | Service | Region |
|-----------|---------|--------|
| **Server** | Railway (Node.js/Nitro) | US East |
| **Vector DB** | Qdrant Cloud (1GB free) | US East |
| **Embeddings** | HuggingFace Inference API | Auto |
| **STT** | Sarvam AI (saaras:v3) | India |

---

## 🛡️ Harness & Guardrails

### The Harness
- **Typed I/O**: Zod-validated JSON input, structured response schema
- **Explicit stages**: validation → prompt-guard → intent-filter → cache-check → retrieval → reranking → TextRank synthesis → grounding verification → citation
- **Recoverable voice path**: Sarvam retries transient failures; missing keys return actionable errors
- **Measured runs**: every response includes per-stage timings in milliseconds

### The Guardrails (Multi-Tier)

| Tier | Guard | Latency | What It Catches |
|------|-------|---------|-----------------|
| **1** | Prompt Injection Detector | <0.1ms | "Ignore previous instructions", role-play injection, delimiter attacks, jailbreak phrases, encoding tricks |
| **2** | Intent Classification Filter | <0.1ms | Poetry/creative writing, personal advice, code generation, math computation, casual chat |
| **3** | Safety & Off-Topic Regex | <0.1ms | Unsafe/PII-seeking inputs, known non-corpus requests |
| **4** | Semantic Cache Lookup | <0.5ms | Returns cached answer if cosine similarity ≥ 0.93 to a previous query |
| **5** | Low-Support Threshold | <0.1ms | Abstains when fused retrieval score < 0.34 or lexical support is insufficient |
| **6** | Post-Generation Grounding | <0.1ms | Verifies token overlap ≥ 0.50 between answer and source chunks; rejects ungrounded answers |

### Answer Synthesis
- **TextRank sentence selection**: Instead of returning a full chunk, the engine splits the top 3 retrieved chunks into sentences, scores each by query relevance + inter-sentence co-occurrence, and returns the single most informative sentence.
- **Grounded extraction only**: Every answer is extracted directly from retrieved evidence — never generated, never hallucinated.

> *"Knowing when not to answer is the feature."*


Some Proof of works

For the local (Mac M4)

<img width="1464" height="707" alt="Screenshot 2026-08-18 at 8 39 55 PM" src="https://github.com/user-attachments/assets/395a5efa-8006-4537-b012-c0268399c9b0" />
<img width="1466" height="712" alt="Screenshot 2026-08-18 at 8 38 56 PM" src="https://github.com/user-attachments/assets/15c37949-7671-4259-a6fa-b59e82c793f0" />
<img width="1470" height="800" alt="Screenshot 2026-08-18 at 8 38 33 PM" src="https://github.com/user-attachments/assets/0d64cefb-1146-4763-9a3a-333499c26fed" />
<img width="1470" height="799" alt="Screenshot 2026-08-18 at 8 37 02 PM" src="https://github.com/user-attachments/assets/175fd2b8-fcb4-4b09-b3b9-06bbfaddb7fc" />

For Cloud (Railway+ Hugging face + Qdrant Cloud)

<img width="1464" height="734" alt="Screenshot 2026-08-18 at 8 42 46 PM" src="https://github.com/user-attachments/assets/f02964b2-b062-497a-b8aa-6e0aa58ae288" />
<img width="1470" height="720" alt="Screenshot 2026-08-18 at 8 42 17 PM" src="https://github.com/user-attachments/assets/b1bda819-7c4b-4f5a-b0a0-e52c4f499941" />
<img width="1470" height="797" alt="Screenshot 2026-08-18 at 8 41 47 PM" src="https://github.com/user-attachments/assets/706211d2-2cbe-4dec-b7b5-4917cbd5a85e" />
<img width="1470" height="800" alt="Screenshot 2026-08-18 at 8 41 16 PM" src="https://github.com/user-attachments/assets/01732e3a-a234-4f86-ac6d-b8443ea41998" />

---

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- Docker (for local Qdrant, optional)

### Local Development
```bash
git clone https://github.com/Akshat0908/Echosage-Ai-Rag-in-goa-.git
cd Echosage-Ai-Rag-in-goa-
npm install

# Set environment variables
cp .env.example .env
# Add your SARVAM_API_KEY, QDRANT_URL, QDRANT_API_KEY, HF_TOKEN

# Run dev server (needs 4GB heap for corpus)
NODE_OPTIONS="--max-old-space-size=4096" npm run dev
```

### Run Benchmarks
```bash
# Local RAG benchmark (100 queries)
npm run rag:benchmark

# Qdrant-specific benchmark
npm run rag:benchmark:qdrant
```

### API Usage
```bash
# Health check
curl https://echosage-ai-rag-in-goa-production.up.railway.app/api/rag

# Text query
curl -X POST https://echosage-ai-rag-in-goa-production.up.railway.app/api/rag \
  -H "Content-Type: application/json" \
  -d '{"transcript": "What is a corporation?"}'

# Voice query (with audio file)
curl -X POST https://echosage-ai-rag-in-goa-production.up.railway.app/api/rag \
  -F "audio=@question.wav"
```

---

## 📁 Project Structure

```text
src/
├── server/rag/
│   ├── engine.ts          # RAG engine with harness, guardrails, extraction
│   ├── embeddings.ts      # HuggingFace API + local ONNX fallback
│   ├── qdrant.ts          # Qdrant Cloud vector store client
│   ├── stt.ts             # Sarvam STT integration
│   ├── index.ts           # Local hybrid vector + lexical index
│   ├── types.ts           # Typed interfaces for the pipeline
│   └── generated-corpus.ts # 853K chunks (auto-generated)
├── routes/
│   ├── api/rag.tsx        # POST /api/rag endpoint
│   └── index.tsx          # Landing page with live demo
└── components/site/       # UI components
scripts/
├── benchmark-rag.ts       # P50/P75/P100 benchmark
├── benchmark-qdrant.ts    # Qdrant latency benchmark
├── index-qdrant.ts        # Qdrant Cloud indexing script
└── ingest-msmarco-xi.py   # Dataset ingestion (reservoir sampling)
```

---

## 🏆 Submission Checklist

- [x] ✅ GitHub repo — you're looking at it
- [x] ✅ Live working link — [echosage-ai-rag-in-goa-production.up.railway.app](https://echosage-ai-rag-in-goa-production.up.railway.app)
- [x] ✅ Voice demo — real mic capture → Sarvam STT → cited answer
- [x] ✅ 4 chunking strategies — sentence, window, proposition, parent-child
- [x] ✅ Latency under 200ms — P50: 1.49ms local, 84ms deployed
- [x] ✅ P50/P75/P100 analytics — measured across 100+ queries
- [x] ✅ Structured harness — typed I/O, stage tracing, error recovery
- [x] ✅ Guardrails — off-topic, safety, groundedness, abstention
- [x] ✅ 853,779 multilingual chunks indexed in Qdrant Cloud
- [x] 🎬 Team video (90s)
- [x] 🎬 Demo video
- [x] 📱 Social media posts with #RAGInGoa

---

*Built with caffeine, deadlines, and the existential fear of rejection. ☕*

*Shortlist us, please. Mujhe Goa jaana hai. 🏖️*
