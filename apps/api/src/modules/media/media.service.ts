import { randomUUID } from 'node:crypto';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import type { UploadUrlInput } from '@arts/shared';
import { getBucket, getS3Client, publicUrlFor } from '../../lib/storage.js';

const UPLOAD_EXPIRY_SECONDS = 300;

const EXTENSION_BY_TYPE: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
};

export interface UploadTarget {
  uploadUrl: string;
  storageKey: string;
  publicUrl: string;
  expiresIn: number;
}

/**
 * Issues a short-lived presigned PUT URL. The client uploads the file bytes
 * directly to object storage (keeping large payloads off the API), then calls
 * the product image endpoint with the returned `storageKey`/`publicUrl`.
 */
export async function createUploadUrl(
  shopId: string,
  input: UploadUrlInput,
): Promise<UploadTarget> {
  const extension = EXTENSION_BY_TYPE[input.contentType] ?? 'bin';
  const storageKey = `shops/${shopId}/products/${randomUUID()}.${extension}`;

  const command = new PutObjectCommand({
    Bucket: getBucket(),
    Key: storageKey,
    ContentType: input.contentType,
  });

  const uploadUrl = await getSignedUrl(getS3Client(), command, {
    expiresIn: UPLOAD_EXPIRY_SECONDS,
  });

  return {
    uploadUrl,
    storageKey,
    publicUrl: publicUrlFor(storageKey),
    expiresIn: UPLOAD_EXPIRY_SECONDS,
  };
}
