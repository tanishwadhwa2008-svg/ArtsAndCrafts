import type { ContactSettings, UpdateStorefrontSettingsInput } from '@arts/shared';
import { apiRequest } from '../lib/api.js';

export interface StorefrontSettings {
  contact: ContactSettings;
}

export function getSettings(): Promise<StorefrontSettings> {
  return apiRequest<StorefrontSettings>('/settings');
}

export function updateSettings(body: UpdateStorefrontSettingsInput): Promise<StorefrontSettings> {
  return apiRequest<StorefrontSettings>('/settings', { method: 'PATCH', body });
}
