import { embed, EMBEDDING_MODEL } from "../src/server/rag/embeddings";

const vector = await embed("कॉर्पोरेशन क्या है?");
console.log(JSON.stringify({ model: EMBEDDING_MODEL, dimensions: vector.length }));
