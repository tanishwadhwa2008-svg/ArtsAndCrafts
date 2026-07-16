import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { env, isStorageConfigured } from '../config/env.js';
import { AppError } from './errors.js';

let client: S3Client | null = null;

/** Lazily-created S3 client for the configured S3-compatible endpoint. */
export function getS3Client(): S3Client {
  if (!isStorageConfigured) {
    throw new AppError('Object storage is not configured', {
      statusCode: 503,
      code: 'STORAGE_UNAVAILABLE',
    });
  }

  client ??= new S3Client({
    endpoint: env.S3_ENDPOINT,
    region: env.S3_REGION,
    forcePathStyle: env.S3_FORCE_PATH_STYLE,
    // Do not add flexible-checksum (CRC32) params to presigned URLs; browser
    // PUT uploads cannot satisfy them and the request is aborted otherwise.
    requestChecksumCalculation: 'WHEN_REQUIRED',
    credentials: {
      accessKeyId: env.S3_ACCESS_KEY!,
      secretAccessKey: env.S3_SECRET_KEY!,
    },
  });

  return client;
}

export function getBucket(): string {
  return env.S3_BUCKET!;
}

/** Builds the public URL for an object key. */
export function publicUrlFor(storageKey: string): string {
  const base = env.S3_PUBLIC_URL ?? `${env.S3_ENDPOINT}/${env.S3_BUCKET}`;
  return `${base.replace(/\/$/, '')}/${storageKey}`;
}

/**
 * Fetches an object's raw bytes from storage. Used server-side to read uploaded
 * images back so they can be base64-encoded and sent to the AI vision provider
 * (external providers cannot reach local MinIO URLs).
 */
export async function getObjectBytes(
  storageKey: string,
): Promise<{ body: Buffer; contentType: string | undefined }> {
  const result = await getS3Client().send(
    new GetObjectCommand({ Bucket: getBucket(), Key: storageKey }),
  );
  if (!result.Body) {
    throw new AppError('Object not found in storage', {
      statusCode: 404,
      code: 'OBJECT_NOT_FOUND',
    });
  }
  const bytes = await result.Body.transformToByteArray();
  return { body: Buffer.from(bytes), contentType: result.ContentType };
}
