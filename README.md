# 🏖️ EchoSage AI — Voice RAG on the Beach

> **HH Goa 2026 · Shortlisting Task 2**
> Speak a question → get a grounded, cited answer. No hallucinations. No vibes. Just evidence.

🔗 **[Live Demo](https://echosage-ai-rag-in-goa-production.up.railway.app)** · 📦 **[API Endpoint](https://echosage-ai-rag-in-goa-production.up.railway.app/api/rag)**

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
- **Explicit stages**: validation → retrieval → reranking → grounding → citation — traceable, not one opaque prompt
- **Recoverable voice path**: Sarvam retries transient failures; missing keys return actionable errors
- **Measured runs**: every response includes per-stage timings in milliseconds

### The Guardrails
- **Off-topic gate**: Known non-corpus requests refused before extraction
- **Groundedness check**: Answer is an extracted sentence with query-term support — never generated
- **Abstention path**: Low support → "I don't have that in the dataset" with nearest passages
- **Safety filter**: Unsafe/PII-seeking inputs short-circuit before touching the pipeline

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

```
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
- [ ] 🎬 Team video (90s)
- [ ] 🎬 Demo video
- [ ] 📱 Social media posts with #RAGInGoa

---

*Built with caffeine, deadlines, and the existential fear of rejection. ☕*

*Shortlist us, please. Mujhe Goa jaana hai. 🏖️*
