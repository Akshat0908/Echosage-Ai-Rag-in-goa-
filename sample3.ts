import { msmarcoCorpus } from "./src/server/rag/generated-corpus.js";

const samples = [];
for (let i = 0; i < 5; i++) {
  samples.push(msmarcoCorpus[i].query);
}
console.log(samples);
