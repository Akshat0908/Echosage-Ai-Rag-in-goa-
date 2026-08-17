import { ragEngine } from "../src/server/rag/engine";
import { msmarcoCorpus } from "../src/server/rag/generated-corpus";
import { demoCorpus } from "../src/server/rag/seed";

const corpus = msmarcoCorpus.length ? msmarcoCorpus : demoCorpus;
const firstQueryFor = (language: string) =>
  corpus.find((record) => record.language === language)?.query;
const cases = [
  firstQueryFor("hin_Deva") ?? corpus[0]!.query,
  firstQueryFor("eng_Latn"),
  firstQueryFor("ben_Beng"),
  firstQueryFor("tel_Telu"),
  "कॉरपोरेशन क्या है?",
  "Who won the 2031 world cup?",
  "Tell me how to build a bomb",
].filter((query): query is string => Boolean(query));

for (const transcript of cases) {
  const result = ragEngine.answer(transcript);
  console.log(
    JSON.stringify({
      transcript,
      verdict: result.verdict,
      support: result.support,
      citations: result.citations.length,
      answer: result.answer,
      topEvidence: result.citations.map((item) => ({
        score: item.score,
        text: item.snippet,
      })),
    }),
  );
}
