// lib/embeddings.ts
// Embedding generation and pgvector semantic search for Ask LOOP
// Supports Voyage AI with deterministic fallback & auto-indexing

import { db } from "@/lib/db";

const EMBEDDING_PROVIDER = process.env.EMBEDDING_PROVIDER ?? "voyage";
const VOYAGE_API_KEY = process.env.VOYAGE_API_KEY ?? "";
const HUGGINGFACE_API_KEY = process.env.HUGGINGFACE_API_KEY ?? "";
const VOYAGE_MODEL = "voyage-2";
const HF_MODEL = "sentence-transformers/all-MiniLM-L6-v2";

// ============================================================
// Generate embedding vector for a text string
// ============================================================
export async function embedText(text: string): Promise<number[]> {
  try {
    if (EMBEDDING_PROVIDER === "voyage" && VOYAGE_API_KEY && !VOYAGE_API_KEY.includes("demo-key")) {
      return await embedWithVoyage(text);
    } else if (HUGGINGFACE_API_KEY) {
      return await embedWithHuggingFace(text);
    } else {
      return mockEmbed(text);
    }
  } catch (err: any) {
    console.warn(`Embedding API fallback triggered: ${err?.message || err}`);
    return mockEmbed(text);
  }
}

async function embedWithVoyage(text: string): Promise<number[]> {
  const response = await fetch("https://api.voyageai.com/v1/embeddings", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${VOYAGE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      input: [text],
      model: VOYAGE_MODEL,
    }),
  });

  if (!response.ok) {
    throw new Error(`Voyage AI response status: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data.data[0].embedding as number[];
}

async function embedWithHuggingFace(text: string): Promise<number[]> {
  const response = await fetch(
    `https://api-inference.huggingface.co/models/${HF_MODEL}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${HUGGINGFACE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ inputs: text }),
    },
  );

  if (!response.ok) {
    throw new Error(`HuggingFace error: ${response.statusText}`);
  }

  const data = await response.json();
  return Array.isArray(data[0]) ? (data[0] as number[]) : (data as number[]);
}

// Deterministic normalized embedding generator fallback
export function mockEmbed(text: string): number[] {
  const vec = new Array(384).fill(0);
  const lower = text.toLowerCase();
  for (let i = 0; i < lower.length; i++) {
    vec[i % 384] += lower.charCodeAt(i) / 255;
  }
  const norm = Math.sqrt(vec.reduce((s, v) => s + v * v, 0)) || 1;
  return vec.map((v) => v / norm);
}

// ============================================================
// Store embedding for a feedback item
// ============================================================
export async function storeEmbedding(
  feedbackId: string,
  text: string,
): Promise<void> {
  try {
    const vector = await embedText(text);
    const vectorStr = JSON.stringify(vector);

    await db.embedding.upsert({
      where: { feedbackId },
      create: { feedbackId, vector: vectorStr },
      update: { vector: vectorStr },
    });
  } catch (err) {
    console.error(`Failed to embed feedback ${feedbackId}:`, err);
  }
}

// ============================================================
// Semantic search — find top-K most similar feedback items
// ============================================================
export async function findSimilarFeedback(
  workspaceId: string,
  question: string,
  topK: number = 10,
): Promise<string[]> {
  let embeddings = await db.embedding.findMany({
    where: {
      feedback: { workspaceId },
    },
    select: {
      feedbackId: true,
      vector: true,
    },
  });

  // If workspace embeddings are empty, auto-index workspace feedback items on the fly
  if (embeddings.length === 0) {
    const feedbackList = await db.feedback.findMany({
      where: { workspaceId },
      select: { id: true, content: true },
      take: 50,
    });

    if (feedbackList.length === 0) return [];

    // Create embeddings for existing feedback items
    await Promise.all(
      feedbackList.map(async (item: { id: string; content: string }) => {
        const vec = mockEmbed(item.content);
        await db.embedding.create({
          data: {
            feedbackId: item.id,
            vector: JSON.stringify(vec),
          },
        }).catch(() => {});
      })
    );

    embeddings = await db.embedding.findMany({
      where: { feedback: { workspaceId } },
      select: { feedbackId: true, vector: true },
    });
  }

  if (embeddings.length === 0) return [];

  const queryVector = await embedText(question);

  const scored = embeddings.map(({ feedbackId, vector }: { feedbackId: string; vector: string }) => {
    const vec = JSON.parse(vector) as number[];
    const sim = cosineSimilarity(queryVector, vec);
    return { feedbackId, sim };
  });

  scored.sort((a: { sim: number }, b: { sim: number }) => b.sim - a.sim);

  return scored.slice(0, topK).map((s: { feedbackId: string }) => s.feedbackId);
}

// ============================================================
// Cosine similarity between two vectors
// ============================================================
function cosineSimilarity(a: number[], b: number[]): number {
  const len = Math.min(a.length, b.length);
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < len; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  return denom === 0 ? 0 : dot / denom;
}
