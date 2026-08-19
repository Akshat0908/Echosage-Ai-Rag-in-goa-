import type { GuardrailResult } from "./types";

/**
 * Lightweight heuristic prompt-injection detector.
 *
 * Catches the most common injection patterns without loading an ML model:
 *   - Instruction override ("ignore previous", "disregard above")
 *   - Role-play injection ("you are now", "pretend to be", "act as")
 *   - System-prompt extraction ("show me your system prompt", "what are your instructions")
 *   - Delimiter / context escape (```system```, "---\n", multi-newline)
 *   - Encoding tricks ("base64", "hex", "rot13")
 *
 * All patterns are case-insensitive and run in <0.1ms on any input.
 */

const INSTRUCTION_OVERRIDE =
  /\b(?:ignore|disregard|forget|override|bypass|skip)\b.{0,30}\b(?:previous|above|prior|earlier|all|system|initial)\b.{0,20}\b(?:instructions?|rules?|prompts?|guidelines?|context)?\b/i;

const ROLE_PLAY =
  /\b(?:you\s+are\s+now|pretend\s+(?:to\s+be|you(?:'re| are))|act\s+as|behave\s+(?:as|like)|assume\s+the\s+role|roleplay|role[- ]play|impersonate|simulate\s+being)\b/i;

const SYSTEM_PROMPT_EXTRACT =
  /\b(?:show|reveal|display|print|output|repeat|echo|leak|dump|give)\b.{0,30}\b(?:system\s*prompt|instructions?|initial\s*prompt|hidden\s*prompt|original\s*prompt|rules|guidelines)\b/i;

const DELIMITER_ATTACK =
  /(?:```\s*(?:system|assistant|user|human|ai)|<\|(?:im_start|system|endoftext)\|>|<<SYS>>|\[INST\]|\[\/INST\]|<\/?(?:system|instruction|prompt)>)/i;

const ENCODING_TRICK =
  /\b(?:base64|hex(?:adecimal)?|rot13|ascii|unicode|url[- ]?encod|decode\s+(?:this|the\s+following))\b.{0,40}\b(?:decode|encode|convert|translate|interpret)\b/i;

const JAILBREAK_PHRASES =
  /\b(?:DAN|do\s+anything\s+now|developer\s+mode|god\s+mode|unrestricted\s+mode|no\s+(?:filter|rules|limits|restrictions)|unlock|jailbreak)\b/i;

const ALL_PATTERNS: Array<{ pattern: RegExp; label: string }> = [
  { pattern: INSTRUCTION_OVERRIDE, label: "instruction-override" },
  { pattern: ROLE_PLAY, label: "role-play-injection" },
  { pattern: SYSTEM_PROMPT_EXTRACT, label: "system-prompt-extraction" },
  { pattern: DELIMITER_ATTACK, label: "delimiter-attack" },
  { pattern: ENCODING_TRICK, label: "encoding-trick" },
  { pattern: JAILBREAK_PHRASES, label: "jailbreak-phrase" },
];

export function detectPromptInjection(query: string): GuardrailResult {
  const normalized = query.trim();
  for (const { pattern, label } of ALL_PATTERNS) {
    if (pattern.test(normalized)) {
      return {
        allowed: false,
        reason: "prompt-injection",
        message: `Blocked: detected prompt injection pattern (${label}).`,
      };
    }
  }
  return { allowed: true, reason: "ok" };
}
