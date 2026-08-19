import { ragEngine } from "./src/server/rag/engine.js";

async function test() {
  const queries = [
    "What is a corporation?",
    "Tell me the ways to get a passport.",
    "What are the symptoms of an asthma attack?",
    "How many calories in an apple?",
  ];
  
  for (const q of queries) {
    const res = await ragEngine.answerProduction(q);
    console.log(`\nQuery: ${q}`);
    console.log(`Verdict: ${res.verdict}`);
    console.log(`Answer: ${res.answer}`);
  }
}

test().catch(console.error);
