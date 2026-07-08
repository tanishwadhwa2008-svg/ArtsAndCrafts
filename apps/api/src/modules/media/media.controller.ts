import type { Request, Response } from 'express';
import type { ApiSuccess, UploadUrlInput } from '@arts/shared';
import { requireShopId } from '../../lib/shop-scope.js';
import { createUploadUrl, type UploadTarget } from './media.service.js';

export async function createUploadUrlHandler(req: Request, res: Response): Promise<void> {
  const shopId = requireShopId(req);
  const input = req.validated.body as UploadUrlInput;
  const target = await createUploadUrl(shopId, input);
  const body: ApiSuccess<UploadTarget> = { ok: true, data: target };
  res.status(201).json(body);
}
