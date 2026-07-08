import { z } from 'zod';

/** Allowed image MIME types for product media uploads. */
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'] as const;

/** Max upload size in bytes (5 MB). */
export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

export const uploadUrlSchema = z.object({
  fileName: z.string().trim().min(1).max(255),
  contentType: z.enum(ALLOWED_IMAGE_TYPES),
  size: z.number().int().positive().max(MAX_UPLOAD_BYTES).optional(),
});

export type UploadUrlInput = z.infer<typeof uploadUrlSchema>;
