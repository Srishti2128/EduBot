import 'server-only';

/**
 * Vertex AI Embeddings client wrapper.
 * Generates text embeddings for concept similarity and knowledge graph.
 */

import { PredictionServiceClient } from '@google-cloud/aiplatform';

/** Singleton embeddings client */
let embeddingsClient: PredictionServiceClient | null = null;

/** Embedding model to use */
const EMBEDDING_MODEL = 'text-embedding-005';
const LOCATION = 'us-central1';

/**
 * Returns the Vertex AI Prediction client singleton.
 * @returns The PredictionServiceClient instance
 */
function getClient(): PredictionServiceClient {
  if (!embeddingsClient) {
    embeddingsClient = new PredictionServiceClient({
      apiEndpoint: `${LOCATION}-aiplatform.googleapis.com`,
    });
  }
  return embeddingsClient;
}

/**
 * Generates a text embedding using Vertex AI.
 * @param text - The text to generate an embedding for
 * @returns An array of floating-point numbers representing the embedding vector
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  const client = getClient();
  const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID;

  const endpoint = `projects/${projectId}/locations/${LOCATION}/publishers/google/models/${EMBEDDING_MODEL}`;

  const instance = { content: text };
  const parameters = { taskType: 'RETRIEVAL_DOCUMENT' };

  const [response] = await client.predict({
    endpoint,
    instances: [{ structValue: { fields: { content: { stringValue: instance.content } } } }],
    parameters: { structValue: { fields: { taskType: { stringValue: parameters.taskType } } } },
  });

  const embedding = response.predictions?.[0]?.structValue?.fields?.embedding?.structValue?.fields?.values?.listValue?.values;

  if (!embedding) {
    throw new Error('No embedding returned from Vertex AI');
  }

  return embedding.map((v) => v.numberValue ?? 0);
}

/**
 * Calculates cosine similarity between two embedding vectors.
 * @param vecA - First embedding vector
 * @param vecB - Second embedding vector
 * @returns Cosine similarity score between -1 and 1
 */
export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (vecA.length !== vecB.length) {
    throw new Error('Vectors must have the same dimension');
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  if (denominator === 0) return 0;

  return dotProduct / denominator;
}
