import { msmarcoCorpus } from "./src/server/rag/generated-corpus.js";

const samples = [];
for (let i = 0; i < msmarcoCorpus.length; i++) {
  if (msmarcoCorpus[i].language === 'en') {
     samples.push(msmarcoCorpus[i].query);
     if (samples.length >= 10) break;
  }
}
console.log(samples);
