import type { Request, Response } from 'express';
import type { AiCollectionDraftRequest, AiDraftResult, ApiSuccess } from '@arts/shared';
import { requireShopId } from '../../lib/shop-scope.js';
import { isAiConfigured } from '../../config/env.js';
import { draftCollectionFromImages } from './ai.service.js';

/** Reports whether AI-assisted bulk upload is available (drives the UI gate). */
export function aiStatusHandler(_req: Request, res: Response): void {
  const body: ApiSuccess<{ available: boolean }> = {
    ok: true,
    data: { available: isAiConfigured },
  };
  res.json(body);
}

/** Analyses uploaded images and returns an editable collection + product draft. */
export async function collectionDraftHandler(req: Request, res: Response): Promise<void> {
  const shopId = requireShopId(req);
  const input = req.validated.body as AiCollectionDraftRequest;
  const draft = await draftCollectionFromImages(shopId, input);
  const body: ApiSuccess<AiDraftResult> = { ok: true, data: draft };
  res.json(body);
}
