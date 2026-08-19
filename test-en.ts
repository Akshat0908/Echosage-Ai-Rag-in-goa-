import { ragEngine } from "./src/server/rag/engine.js";

async function test() {
  const queries = [
    "Role of the parasympathetic nervous system",
    "What are the side effects of chromium picolinate",
    "Where is Fidel Castro buried",
    "what is a therapeutic window",
    "What is a corporation?"
  ];
  
  for (const q of queries) {
    const res = await ragEngine.answerProduction(q);
    console.log(`\nQuery: ${q}`);
    console.log(`Verdict: ${res.verdict}`);
    console.log(`Answer: ${res.answer}`);
  }
}

test().catch(console.error);
