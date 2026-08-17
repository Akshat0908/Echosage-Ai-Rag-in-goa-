import { useEffect, useRef, useState } from "react";
import { LoaderCircle, Mic, ShieldAlert, ShieldCheck, Square } from "lucide-react";

type RagResult = {
  transcript: string;
  answer: string;
  verdict: "grounded" | "abstained" | "blocked";
  support: number;
  requestMs: number;
  stt: { provider: string; ms: number; languageCode: string | null };
  timings: Array<{ name: string; ms: number; status: "ok" | "fallback" | "blocked" }>;
  citations: Array<{
    id: string;
    score: number;
    snippet: string;
    strategy: string;
    language: string;
  }>;
  guardrail: { reason: string };
  index: { chunks: number; source: string };
};

export function DemoConsole() {
  const recorder = useRef<MediaRecorder | null>(null);
  const stream = useRef<MediaStream | null>(null);
  const chunks = useRef<Blob[]>([]);
  const [recording, setRecording] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RagResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => () => stream.current?.getTracks().forEach((track) => track.stop()), []);

  const sendAudio = async (blob: Blob) => {
    setLoading(true);
    setError(null);
    try {
      const form = new FormData();
      form.append("audio", new File([blob], "question.wav", { type: "audio/wav" }));
      const response = await fetch("/api/rag", { method: "POST", body: form });
      const body = (await response.json()) as RagResult & { error?: string; hint?: string };
      if (!response.ok)
        throw new Error(
          body.hint ? `${body.error}. ${body.hint}` : body.error || "Voice request failed",
        );
      setResult(body);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not process that recording.");
    } finally {
      setLoading(false);
    }
  };

  const start = async () => {
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      setError("This browser does not support microphone recording. Use Chrome, Edge, or Safari.");
      return;
    }
    try {
      setResult(null);
      setError(null);
      stream.current = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : "audio/webm";
      const mediaRecorder = new MediaRecorder(stream.current, { mimeType });
      chunks.current = [];
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size) chunks.current.push(event.data);
      };
      mediaRecorder.onstop = () => {
        stream.current?.getTracks().forEach((track) => track.stop());
        stream.current = null;
        const recording = new Blob(chunks.current, { type: mimeType });
        void recordingToWav(recording)
          .then(sendAudio)
          .catch((conversionError) => {
            setError(
              conversionError instanceof Error
                ? conversionError.message
                : "Could not convert the recording to WAV.",
            );
          });
      };
      recorder.current = mediaRecorder;
      mediaRecorder.start();
      setRecording(true);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Microphone permission was not granted.");
    }
  };

  const stop = () => {
    if (recorder.current?.state === "recording") recorder.current.stop();
    setRecording(false);
  };

  const active = recording || loading;
  const verdictStyle = result?.verdict === "grounded" ? "border-primary/60" : "border-coral/60";

  return (
    <div className="grid gap-12 lg:grid-cols-12 lg:items-center">
      <div className="lg:col-span-5">
        <span className="inline-block border-b-2 border-ink pb-1 font-mono text-[11px] font-bold tracking-[0.24em] uppercase">
          [ live voice rag ]
        </span>
        <h2 className="text-3d mt-5 font-display text-[clamp(2.6rem,6.4vw,4.6rem)] leading-[0.86] font-black">
          Speak freely.
          <br />
          <span className="text-primary italic">Cite everything.</span>
        </h2>
        <p className="mt-6 max-w-md text-lg leading-relaxed text-muted-foreground">
          Real microphone capture → Sarvam transcription → hybrid retrieval → grounded extractive
          answer. The timings shown are returned by the server, never pre-scripted.
        </p>
        <button
          type="button"
          onClick={recording ? stop : start}
          disabled={loading}
          className="mt-10 inline-flex h-32 w-32 items-center justify-center rounded-full border-4 border-ink bg-coral text-sun-foreground shadow-[8px_8px_0_0_var(--ink)] transition active:translate-x-1 active:translate-y-1 disabled:opacity-60"
          aria-label={recording ? "Stop recording" : "Start recording"}
        >
          {loading ? (
            <LoaderCircle className="h-10 w-10 animate-spin" />
          ) : recording ? (
            <Square className="h-9 w-9 fill-current" />
          ) : (
            <Mic className="h-11 w-11" />
          )}
        </button>
        <p className="mt-4 font-mono text-[10px] font-bold tracking-[0.18em] uppercase">
          {recording
            ? "recording — tap to send"
            : loading
              ? "processing live audio"
              : "tap to ask a question"}
        </p>
        {error && (
          <p className="mt-4 max-w-md rounded-lg border border-coral/60 bg-coral/10 p-3 text-sm text-foreground">
            {error}
          </p>
        )}
      </div>

      <div className="relative lg:col-span-7">
        <div className="relative min-h-[430px] overflow-hidden rounded-[2rem] border-4 border-ink bg-ink p-6 text-sand shadow-[8px_8px_0_0_var(--ink)] sm:p-8">
          <div className="flex items-center justify-between border-b border-primary/40 pb-5 font-mono text-[10px] tracking-[0.2em] uppercase">
            <span className={active ? "text-sun" : "text-sand/50"}>
              {active ? "live session" : "ready"}
            </span>
            <span className="text-sand/50">no simulated telemetry</span>
          </div>
          {!result && !active && (
            <p className="mt-16 text-center font-mono text-sm tracking-wider text-sand/50">
              Your transcript, sources, verdict, and measured latency will appear here.
            </p>
          )}
          {active && (
            <p className="mt-16 text-center font-mono text-sm tracking-wider text-sun">
              {recording ? "Listening…" : "Transcribing and retrieving…"}
            </p>
          )}
          {result && (
            <div className="mt-6 space-y-5">
              <p className="font-mono text-[11px] leading-relaxed text-sand/75">
                <span className="text-sun">transcript&gt;</span> {result.transcript}
              </p>
              <div className={`rounded-2xl border-2 bg-black/25 p-5 ${verdictStyle}`}>
                <div className="mb-3 flex items-center gap-2 font-mono text-[10px] tracking-[0.18em] uppercase">
                  {result.verdict === "grounded" ? (
                    <ShieldCheck className="h-4 w-4 text-sun" />
                  ) : (
                    <ShieldAlert className="h-4 w-4 text-coral" />
                  )}
                  <span className={result.verdict === "grounded" ? "text-sun" : "text-coral"}>
                    {result.verdict} · support {result.support.toFixed(2)}
                  </span>
                </div>
                <p className="text-[17px] leading-relaxed">{result.answer}</p>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                <Metric label="Sarvam STT" value={`${result.stt.ms} ms`} />
                <Metric label="Request total" value={`${result.requestMs} ms`} />
                {result.timings.map((timing) => (
                  <Metric
                    key={timing.name}
                    label={timing.name}
                    value={`${timing.ms} ms · ${timing.status}`}
                  />
                ))}
              </div>
              <div className="space-y-2">
                <p className="font-mono text-[10px] tracking-[0.18em] text-sand/50 uppercase">
                  retrieved evidence · {result.index.chunks} chunks
                </p>
                {result.citations.length ? (
                  result.citations.map((citation) => (
                    <div
                      key={citation.id}
                      className="rounded-lg border border-primary/30 bg-black/20 p-3 text-sm"
                    >
                      <span className="mr-2 font-mono text-[10px] text-sun">
                        {citation.score.toFixed(2)} · {citation.strategy}
                      </span>
                      {citation.snippet}
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-sand/60">No evidence met the grounding threshold.</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-primary/30 bg-black/25 px-3 py-2">
      <p className="font-mono text-[8px] tracking-[0.16em] text-sand/45 uppercase">{label}</p>
      <p className="mt-1 font-mono text-[11px] text-sun">{value}</p>
    </div>
  );
}

async function recordingToWav(recording: Blob): Promise<Blob> {
  const AudioContextConstructor = window.AudioContext;
  if (!AudioContextConstructor) throw new Error("Your browser cannot prepare microphone audio.");
  const context = new AudioContextConstructor();
  try {
    const decoded = await context.decodeAudioData(await recording.arrayBuffer());
    const targetRate = 16_000;
    const frameCount = Math.ceil(decoded.duration * targetRate);
    const offline = new OfflineAudioContext(1, frameCount, targetRate);
    const source = offline.createBufferSource();
    source.buffer = decoded;
    source.connect(offline.destination);
    source.start();
    const mono = await offline.startRendering();
    return encodeWav(mono.getChannelData(0), targetRate);
  } finally {
    await context.close();
  }
}

function encodeWav(samples: Float32Array, sampleRate: number): Blob {
  const output = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(output);
  const write = (offset: number, value: string) =>
    [...value].forEach((character, index) =>
      view.setUint8(offset + index, character.charCodeAt(0)),
    );
  write(0, "RIFF");
  view.setUint32(4, 36 + samples.length * 2, true);
  write(8, "WAVE");
  write(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  write(36, "data");
  view.setUint32(40, samples.length * 2, true);
  samples.forEach((sample, index) => {
    const clipped = Math.max(-1, Math.min(1, sample));
    view.setInt16(44 + index * 2, clipped < 0 ? clipped * 0x8000 : clipped * 0x7fff, true);
  });
  return new Blob([output], { type: "audio/wav" });
}
