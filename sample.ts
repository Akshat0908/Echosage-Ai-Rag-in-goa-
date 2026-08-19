import { msmarcoCorpus } from "./src/server/rag/generated-corpus.js";

const samples = [];
for (let i = 0; i < msmarcoCorpus.length; i += Math.floor(msmarcoCorpus.length / 10)) {
  samples.push(msmarcoCorpus[i].query);
}
console.log(samples);
