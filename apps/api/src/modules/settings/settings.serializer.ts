import type { StorefrontSettings } from '@prisma/client';
import type { ContactField, ContactSettings } from '@arts/shared';

const emptyField: ContactField = { enabled: false, value: '' };

export interface SettingsDto {
  contact: ContactSettings;
}

/** Normalise a stored contact field, tolerating missing/partial JSON. */
function readField(value: unknown): ContactField {
  if (value && typeof value === 'object') {
    const f = value as { enabled?: unknown; value?: unknown };
    return {
      enabled: f.enabled === true,
      value: typeof f.value === 'string' ? f.value : '',
    };
  }
  return emptyField;
}

export function serializeSettings(settings: StorefrontSettings): SettingsDto {
  const stored = (settings.contact ?? {}) as Record<string, unknown>;
  return {
    contact: {
      phone: readField(stored.phone),
      email: readField(stored.email),
      location: readField(stored.location),
    },
  };
}
