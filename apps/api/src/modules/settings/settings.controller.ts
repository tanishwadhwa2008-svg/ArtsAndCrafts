import type { Request, Response } from 'express';
import type { ApiSuccess, UpdateStorefrontSettingsInput } from '@arts/shared';
import { requireShopId } from '../../lib/shop-scope.js';
import * as settingsService from './settings.service.js';
import { serializeSettings, type SettingsDto } from './settings.serializer.js';

export async function getSettingsHandler(req: Request, res: Response): Promise<void> {
  const shopId = requireShopId(req);
  const settings = await settingsService.getOrCreateSettings(shopId);
  const body: ApiSuccess<SettingsDto> = { ok: true, data: serializeSettings(settings) };
  res.json(body);
}

export async function updateSettingsHandler(req: Request, res: Response): Promise<void> {
  const shopId = requireShopId(req);
  const input = req.validated.body as UpdateStorefrontSettingsInput;
  const settings = await settingsService.updateSettings(shopId, input);
  const body: ApiSuccess<SettingsDto> = { ok: true, data: serializeSettings(settings) };
  res.json(body);
}
