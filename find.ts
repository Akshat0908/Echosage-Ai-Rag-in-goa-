import { ragEngine } from "./src/server/rag/engine.js";
import { msmarcoCorpus } from "./src/server/rag/generated-corpus.js";

async function findWorking() {
  const workingEnglish = [];
  const workingHindi = [];
  
  // Randomize a bit to find different queries
  for (let i = 0; i < msmarcoCorpus.length; i += 100) {
    const record = msmarcoCorpus[i];
    const q = record.query;
    
    // Quick language heuristic
    const isHindi = /[\u0900-\u097F]/.test(q);
    const isEnglish = /^[a-zA-Z\s\?]+$/.test(q);
    
    if (isEnglish && workingEnglish.length < 3) {
      const res = await ragEngine.answerProduction(q);
      if (res.verdict === "grounded") workingEnglish.push(q);
    } else if (isHindi && workingHindi.length < 3) {
      const res = await ragEngine.answerProduction(q);
      if (res.verdict === "grounded") workingHindi.push(q);
    }
    
    if (workingEnglish.length >= 3 && workingHindi.length >= 3) break;
  }
  
  console.log("WORKING ENGLISH:");
  console.log(workingEnglish);
  console.log("WORKING HINDI:");
  console.log(workingHindi);
}

findWorking().catch(console.error);
