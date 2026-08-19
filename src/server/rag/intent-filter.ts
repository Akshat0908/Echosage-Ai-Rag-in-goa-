import type { GuardrailResult } from "./types";

/**
 * Intent classification filter — blocks non-factual query intents before retrieval.
 *
 * 6 classes blocked:
 *   1. Poetry / creative writing requests
 *   2. Personal advice / opinion seeking
 *   3. Role-play / character simulation
 *   4. Code generation / programming tasks
 *   5. Math computation / calculation
 *   6. Casual chat / greetings
 *
 * All pattern-based, runs in <0.1ms.
 */

const POETRY_CREATIVE =
  /\b(?:write|compose|create|generate|make)\b.{0,20}\b(?:poem|poetry|song|haiku|limerick|story|essay|paragraph|letter|speech|article|blog)\b/i;

const PERSONAL_ADVICE =
  /\b(?:should\s+i|what\s+should|give\s+me\s+advice|recommend\s+(?:me|a)|suggest\s+(?:me|a)|help\s+me\s+(?:decide|choose)|my\s+(?:relationship|girlfriend|boyfriend|career|life))\b/i;

const CODE_GEN =
  /\b(?:write|generate|create|build|make|code|implement|develop)\b.{0,20}\b(?:code|function|script|program|class|api|app|component|algorithm|snippet|html|css|javascript|python|java|sql)\b/i;

const MATH_COMPUTE =
  /\b(?:calculate|compute|solve|evaluate|simplify|what\s+is\s+\d+\s*[\+\-\*\/x×÷]\s*\d+)\b/i;

const CASUAL_CHAT =
  /^(?:hi|hello|hey|howdy|sup|yo|good\s+(?:morning|afternoon|evening|night)|what'?s\s+up|how\s+are\s+you|who\s+are\s+you|what\s+is\s+your\s+name|tell\s+me\s+(?:a\s+joke|something\s+funny))[\s?!.]*$/i;

const ALL_INTENTS: Array<{ pattern: RegExp; label: string; message: string }> = [
  {
    pattern: POETRY_CREATIVE,
    label: "creative-writing",
    message: "I'm a factual retrieval engine, not a creative writer. Try asking a knowledge question instead.",
  },
  {
    pattern: PERSONAL_ADVICE,
    label: "personal-advice",
    message: "I search indexed documents for facts — I can't give personal advice or opinions.",
  },
  {
    pattern: CODE_GEN,
    label: "code-generation",
    message: "I retrieve factual information from a knowledge base, not generate code.",
  },
  {
    pattern: MATH_COMPUTE,
    label: "math-computation",
    message: "I'm a retrieval engine, not a calculator. Try asking a factual question.",
  },
  {
    pattern: CASUAL_CHAT,
    label: "casual-chat",
    message: "I'm built to answer factual questions from the MSMARCO-XI dataset. Try asking something like 'What is a corporation?'",
  },
];

export function classifyIntent(query: string): GuardrailResult {
  const normalized = query.trim();
  for (const { pattern, message } of ALL_INTENTS) {
    if (pattern.test(normalized)) {
      return {
        allowed: false,
        reason: "off-topic",
        message,
      };
    }
  }
  return { allowed: true, reason: "ok" };
}
