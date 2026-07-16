import type { AiCollectionDraftRequest, AiCommitInput, AiDraftResult } from '@arts/shared';
import { apiRequest } from '../lib/api.js';
import type { CollectionDetail } from './collections.js';

export interface AiStatus {
  available: boolean;
  maxImages: number;
}

/** Whether AI-assisted bulk upload is configured (drives the UI gate). */
export function getAiStatus(): Promise<AiStatus> {
  return apiRequest<AiStatus>('/ai/status');
}

/** Analyses already-uploaded images and returns an editable collection draft. */
export function draftCollection(body: AiCollectionDraftRequest): Promise<AiDraftResult> {
  return apiRequest<AiDraftResult>('/ai/collection-draft', { method: 'POST', body });
}

/** Commits a reviewed draft, creating the collection + products transactionally. */
export function commitAiCollection(body: AiCommitInput): Promise<CollectionDetail> {
  return apiRequest<CollectionDetail>('/collections/ai-commit', { method: 'POST', body });
}
