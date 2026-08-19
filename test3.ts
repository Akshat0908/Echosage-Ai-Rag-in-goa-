import { ragEngine } from "./src/server/rag/engine.js";

async function test() {
  const queries = [
    "what is a therapeutic window",
    "difference between psychopathy and antisocial",
    "मनोविकृति और असामाजिकता के बीच अंतर",
    "एक चिकित्सीय खिड़की क्या है"
  ];
  
  for (const q of queries) {
    const res = await ragEngine.answerProduction(q);
    console.log(`\nQuery: ${q}`);
    console.log(`Verdict: ${res.verdict}`);
    console.log(`Answer: ${res.answer}`);
  }
}

test().catch(console.error);
