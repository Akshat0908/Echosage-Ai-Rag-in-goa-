import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { ragEngine } from "@/server/rag/engine";
import { transcribeWithSarvam } from "@/server/rag/stt";

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}

const transcriptRequest = z.object({
  transcript: z.string().trim().min(3).max(1_500),
});

export const Route = createFileRoute("/api/rag")({
  server: {
    handlers: {
      GET: () =>
        json({
          ok: true,
          service: "hhg-voice-rag",
          index: ragEngine.indexStats,
          stt: "Sarvam (optional key)",
        }),
      POST: async ({ request }) => {
        const started = performance.now();
        try {
          const contentType = request.headers.get("content-type") ?? "";
          let transcript = "";
          let stt = {
            provider: "client-fallback",
            languageCode: null as string | null,
            requestId: null as string | null,
            ms: 0,
          };
          if (contentType.includes("multipart/form-data")) {
            const form = await request.formData();
            const audio = form.get("audio") ?? form.get("file");
            if (!(audio instanceof File)) return json({ error: "audio file is required" }, 400);
            try {
              const transcription = await transcribeWithSarvam(audio);
              transcript = transcription.transcript;
              stt = transcription;
            } catch (error) {
              return json(
                {
                  error: error instanceof Error ? error.message : "Speech transcription failed",
                  hint: "Set SARVAM_API_KEY or send JSON { transcript } for local harness testing.",
                },
                503,
              );
            }
          } else {
            const body = transcriptRequest.safeParse(await request.json());
            if (!body.success)
              return json(
                { error: "A transcript between 3 and 1,500 characters is required" },
                400,
              );
            transcript = body.data.transcript;
          }
          const result = await ragEngine.answerProduction(transcript);
          return json({
            ...result,
            stt,
            requestMs: Math.round((performance.now() - started) * 100) / 100,
          });
        } catch (error) {
          return json(
            {
              error: error instanceof Error ? error.message : "Unhandled harness error",
              recoverable: true,
            },
            500,
          );
        }
      },
    },
  },
});
