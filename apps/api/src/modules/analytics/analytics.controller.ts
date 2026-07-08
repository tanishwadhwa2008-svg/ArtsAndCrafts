import type { Request, Response } from 'express';
import type { AnalyticsSummary, ApiSuccess } from '@arts/shared';
import { requireShopId } from '../../lib/shop-scope.js';
import * as analyticsService from './analytics.service.js';

export async function getSummaryHandler(req: Request, res: Response): Promise<void> {
  const shopId = requireShopId(req);
  const summary = await analyticsService.getAnalyticsSummary(shopId);

  const body: ApiSuccess<AnalyticsSummary> = { ok: true, data: summary };
  res.json(body);
}
