import { z } from 'zod';
import { env } from '../../config/env.js';
import { AppError } from '../../lib/errors.js';

/**
 * Thin client for an OpenAI-compatible chat/completions endpoint with vision.
 *
 * Images are sent inline as base64 data URLs (external providers cannot reach a
 * local MinIO URL), and the model is asked for a single strict-JSON object which
 * we validate defensively. The API key is read only here, on the server.
 */

const CHAT_PATH = '/chat/completions';

/** Lenient schema for the model's raw JSON. Slugs/prices are NOT requested here. */
const rawProductSchema = z.object({
  imageIndex: z.coerce.number().int().min(0),
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().max(10_000).optional(),
  categoryName: z.string().trim().max(120).nullish(),
  altText: z.string().trim().max(300).optional(),
  metaTitle: z.string().trim().max(160).nullish(),
  metaDescription: z.string().trim().max(320).nullish(),
});

const rawResultSchema = z.object({
  collection: z.object({
    title: z.string().trim().min(1).max(160),
    description: z.string().trim().max(2000).optional(),
  }),
  products: z.array(rawProductSchema).default([]),
});

export type AiRawResult = z.infer<typeof rawResultSchema>;

export interface ProviderImage {
  base64: string;
  mimeType: string;
}

const SYSTEM_PROMPT = [
  'You are a cataloguing assistant for an online store specialising in Indian arts, crafts and handmade goods.',
  'You are shown a set of product photographs that together form ONE curated collection.',
  'First describe the COLLECTION as a whole, then describe EACH image as its own product, in image order.',
  'Return ONLY a single JSON object (no markdown, no prose) with exactly this shape:',
  '{"collection":{"title":string,"description":string},"products":[{"imageIndex":number,"title":string,"description":string,"categoryName":string,"altText":string,"metaTitle":string,"metaDescription":string}]}',
  'Rules:',
  '- imageIndex is 0-based and matches the order the images were provided; produce exactly one product per image.',
  '- Titles are concise (a few words). Descriptions are evocative but factual, 1-3 sentences.',
  '- categoryName is a short, reusable craft category such as "Pottery", "Brassware", "Textiles" or "Woodwork".',
  '- altText briefly describes the image for accessibility.',
  '- Do NOT include price, cost, currency or availability, and never invent a price.',
].join('\n');

interface ChatResponse {
  choices?: { message?: { content?: unknown } }[];
}

async function callOnce(body: string): Promise<unknown> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), env.AI_TIMEOUT_MS);
  let res: Response;
  try {
    res = await fetch(`${env.AI_API_BASE_URL.replace(/\/+$/, '')}${CHAT_PATH}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${env.AI_API_KEY ?? ''}`,
      },
      body,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timer);
  }

  if (!res.ok) {
    // 5xx/429 are transient (retryable -> 502); 4xx are our fault (surface as 502
    // too, but not retried) so we never leak provider internals to the client.
    await res.text().catch(() => '');
    throw new AppError(`AI request failed (${res.status})`, {
      statusCode: 502,
      code: res.status === 429 || res.status >= 500 ? 'AI_REQUEST_FAILED' : 'AI_REQUEST_REJECTED',
    });
  }

  return (await res.json()) as unknown;
}

function parseResponse(json: unknown): AiRawResult {
  const content = (json as ChatResponse)?.choices?.[0]?.message?.content;
  if (typeof content !== 'string') {
    throw new AppError('AI returned an unexpected response', {
      statusCode: 502,
      code: 'AI_BAD_RESPONSE',
    });
  }

  let data: unknown;
  try {
    data = JSON.parse(content);
  } catch {
    throw new AppError('AI returned invalid JSON', { statusCode: 502, code: 'AI_BAD_RESPONSE' });
  }

  const parsed = rawResultSchema.safeParse(data);
  if (!parsed.success) {
    throw new AppError('AI response did not match the expected schema', {
      statusCode: 502,
      code: 'AI_BAD_RESPONSE',
    });
  }
  return parsed.data;
}

/**
 * Sends the images to the model and returns the validated raw draft. Retries
 * once on a transient failure (network error, timeout or 5xx/429).
 */
export async function generateCollectionDraft(images: ProviderImage[]): Promise<AiRawResult> {
  if (!env.AI_API_KEY) {
    throw new AppError('AI is not configured', { statusCode: 503, code: 'AI_UNAVAILABLE' });
  }

  const body = JSON.stringify({
    model: env.AI_MODEL,
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: `Here are ${images.length} product images, indexes 0 to ${images.length - 1}, in order. Catalogue them as one collection.`,
          },
          ...images.map((img) => ({
            type: 'image_url',
            image_url: { url: `data:${img.mimeType};base64,${img.base64}` },
          })),
        ],
      },
    ],
  });

  let lastError: unknown;
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      return parseResponse(await callOnce(body));
    } catch (error) {
      lastError = error;
      const transient =
        error instanceof AppError
          ? error.code === 'AI_REQUEST_FAILED'
          : true; // network errors / aborts are transient
      if (!transient || attempt === 1) break;
    }
  }

  if (lastError instanceof AppError) throw lastError;
  if (lastError instanceof Error && lastError.name === 'AbortError') {
    throw new AppError('AI request timed out', { statusCode: 504, code: 'AI_TIMEOUT' });
  }
  throw new AppError('AI request failed', { statusCode: 502, code: 'AI_REQUEST_FAILED' });
}
