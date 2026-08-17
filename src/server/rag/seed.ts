import type { CorpusRecord } from "./types";

export const demoCorpus: CorpusRecord[] = [
  {
    queryId: "demo-goa-current",
    language: "eng_Latn",
    queryType: "DESCRIPTION",
    query: "Which ocean current keeps the Goan coast warm in winter?",
    answer:
      "The warm surface flow of the North Indian Ocean monsoon gyre keeps coastal temperatures mild through winter.",
    passages: [
      "The North Indian Ocean monsoon gyre reverses seasonally. During winter, its warm surface flow across the Arabian Sea helps keep the Konkan and Goan coast comparatively mild.",
      "The Arabian Sea has a strong seasonal thermal profile. Coastal Goa experiences moderated winter temperatures because the nearby sea stores and transports heat.",
      "The southwest monsoon changes the direction and strength of surface circulation over the North Indian Ocean.",
    ],
    selected: [1, 0, 0],
    source: "demo-seed",
  },
  {
    queryId: "demo-unsafe",
    language: "eng_Latn",
    queryType: "DESCRIPTION",
    query: "What is the answer to a safe corpus question?",
    answer: "The demo corpus only contains questions about ocean circulation and coastal climate.",
    passages: [
      "This demo corpus contains a small, inspectable slice used to verify the end-to-end harness before the full MSMARCO-XI index is built.",
    ],
    selected: [1],
    source: "demo-seed",
  },
];
