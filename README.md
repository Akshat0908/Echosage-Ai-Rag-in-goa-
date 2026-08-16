# EchoSage AI

copy this refercne but build with some our crips and style 

HH Goa 2026 Shortlisting Task 2: Build a Voice-Enabled RAG Model What to build A voice-enabled Retrieval-Augmented Generation (RAG) system — a user speaks a question, your pipeline transcribes it, retrieves relevant context from a provided dataset, and returns an answer, end to end. Pipeline shape: Voice input → Speech-to-text → Chunking/Retrieval (vector DB) → Answer generation

Dataset We will provide the dataset to build your RAG pipeline on: https://huggingface.co/datasets/ai4bharat/MSMARCO-XI

Technical requirements

Speech-to-text Use either Sarvam or ElevenLabs for voice-to-text. Pick one.

Chunking Chunking strategy should be vast — don't submit a single naive fixed-size chunking approach. We want to see real thought put into how the dataset is split, indexed, and retrieved (e.g. multiple chunking strategies, overlap handling, semantic vs. fixed-size splitting, metadata-aware chunking, etc.).

Latency target The full process — chunking + vector DB retrieval + everything through to final output — should complete in under 200ms.

Latency analytics Submit P50 / P70 / P100 latency numbers for your pipeline, measured across a reasonable number of test queries — not a single best-case run.

Harness your model Your model/pipeline should be run inside a proper harness — structured orchestration around the model (tool calls, retries, structured input/output handling, error recovery) rather than a single raw prompt-in, text-out call.

Guardrail your model Add guardrails around your model — handling for off-topic queries, unsafe/inappropriate inputs, hallucination checks, or answers not grounded in the retrieved context. Show that your system knows when not to answer, not just how to answer.

Submission requirements

Fill the submission form: https://forms.gle/MNvCjcv23Hn2Eeu58

GitHub repo link

Live working link

2 videos (see below)

No resubmissions will be allowed — submit only when your build is final. Video 1 — Team/process video

90 seconds

Shows how your team is working on this — process, not the product itself.

Video 2 — Demo video

Demo of the actual project working end to end.

Promotion requirement (mandatory) Both videos must be uploaded to Instagram, X, and LinkedIn — by every individual team member, not just one shared team post. At least 1 Instagram account should be public. Every post, on every platform, by every member, must include: #RAGInGoa

Timeline

Task launch: August 13, 2026

Deadline: August 22, 2026, 11:59 PM

I want to get shortlist for this hhg 2.0 at any cost coz I went last time this time also I wanted to go soo tell me what can we do to this task at the highest and the bestest way to get shortlisted for this time also https://hhgoa.com/


Skip to chat input

WhisperWise AI

PreviewFilesCodeMore

Response ready

pasted-2026-08-15T19-09-45-836Z.txt

TXT

copy this refercne but build with some our crips and style

HH Goa 2026 Shortlisting Task 2: Build a Voice-Enabled RAG Model What to build A voice-enabled Retrieval-Augmented Generation (RAG) system — a user speaks a question, your pipeline transcribes it, retrieves relevant context from a provided dataset, and returns an answer, end to end. Pipeline shape: Voice input → Speech-to-text → Chunking/Retrieval (vector DB) → Answer generation

Dataset We will provide the dataset to build your RAG pipeline on: https://huggingface.co/datasets/ai4bharat/MSMARCO-XI

Technical requirements

Speech-to-text Use either Sarvam or ElevenLabs for voice-to-text. Pick one.

Chunking Chunking strategy should be vast — don't submit a single naive fixed-size chunking approach. We want to see real thought put into how the dataset is split, indexed, and retrieved (e.g. multiple chunking strategies, overlap handling, semantic vs. fixed-size splitting, metadata-aware chunking, etc.).

Latency target The full process — chunking + vector DB retrieval + everything through to final output — should complete in under 200ms.

Latency analytics Submit P50 / P70 / P100 latency numbers for your pipeline, measured across a reasonable number of test queries — not a single best-case run.

Harness your model Your model/pipeline should be run inside a proper harness — structured orchestration around the model (tool calls, retries, structured input/output handling, error recovery) rather than a single raw prompt-in, text-out call.

Guardrail your model Add guardrails around your model — handling for off-topic queries, unsafe/inappropriate inputs, hallucination checks, or answers not grounded in the retrieved context. Show that your system knows when not to answer, not just how to answer.

Submission requirements

Fill the submission form: https://forms.gle/MNvCjcv23Hn2Eeu58

GitHub repo link

Live working link

2 videos (see below)

No resubmissions will be allowed — submit only when your build is final. ...

Today at 12:40 AM

Created HH Goa landing page



Your submission site is live — HH Goa's jungle green + sun yellow, Imbue display over Victor Mono, riso-grain texture, but with our own structure: pipeline strip, a voice demo panel, six chunking strategies, a P50/P70/P100 board with a per-stage millisecond breakdown, and side-by-side harness/guardrails.

Two things to note: the numbers (118/143/197ms, 500 queries) and the GitHub link are placeholders — swap them for your real measurements before submitting, since judges will check. And the mic button is presentation-only right now; when you're ready I can wire Sarvam STT and a real retrieval backend behind it so the demo actually runs on the page.

Reverted messagesShow

its good i need this complete frontend in this vibe you alredy had gthe code just use that or use anythinh whgich reuired and build this in this vvibe https://reactbits.dev/pro/components some 3d componest from reactbits if reuired


use this image and code and design in the same structure

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/c5632bad-6035-4331-8046-5f48298c774d).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
