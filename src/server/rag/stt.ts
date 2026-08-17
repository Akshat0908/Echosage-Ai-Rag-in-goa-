export type TranscriptionResult = {
  transcript: string;
  provider: "sarvam" | "client-fallback";
  languageCode: string | null;
  requestId: string | null;
  ms: number;
};

const RETRYABLE_STATUS = new Set([408, 425, 429, 500, 502, 503, 504]);

export async function transcribeWithSarvam(file: File): Promise<TranscriptionResult> {
  const started = performance.now();
  const apiKey = process.env.SARVAM_API_KEY;
  if (!apiKey) throw new Error("SARVAM_API_KEY is not configured");
  if (!file.type.startsWith("audio/")) throw new Error("The upload must be an audio file");
  if (file.size === 0 || file.size > 12 * 1024 * 1024)
    throw new Error("Audio must be between 1 byte and 12 MB");

  let response: Response | undefined;
  let lastError: unknown;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const form = new FormData();
      form.append("file", file, file.name || "voice.webm");
      form.append("model", process.env.SARVAM_STT_MODEL || "saaras:v3");
      form.append("with_timestamps", "false");
      response = await fetch("https://api.sarvam.ai/speech-to-text", {
        method: "POST",
        headers: { "api-subscription-key": apiKey },
        body: form,
        signal: AbortSignal.timeout(15_000),
      });
      if (response.ok || !RETRYABLE_STATUS.has(response.status) || attempt === 2) break;
    } catch (error) {
      lastError = error;
      if (attempt === 2) break;
    }
    await new Promise((resolve) => setTimeout(resolve, 150 * 2 ** attempt));
  }
  if (!response?.ok) {
    const detail = await response?.text().catch(() => "unknown Sarvam error");
    const fallback = lastError instanceof Error ? lastError.message : "network error";
    throw new Error(
      `Sarvam STT failed (${response?.status ?? fallback}): ${(detail ?? fallback).slice(0, 240)}`,
    );
  }
  const payload = (await response.json()) as {
    request_id?: string | null;
    transcript?: string;
    language_code?: string | null;
  };
  if (!payload.transcript?.trim()) throw new Error("Sarvam returned an empty transcript");
  return {
    transcript: payload.transcript.trim(),
    provider: "sarvam",
    languageCode: payload.language_code ?? null,
    requestId: payload.request_id ?? null,
    ms: Math.round((performance.now() - started) * 100) / 100,
  };
}
