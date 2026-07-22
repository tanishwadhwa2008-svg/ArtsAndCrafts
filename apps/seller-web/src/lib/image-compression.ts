/**
 * Client-side image optimization.
 *
 * Runs entirely in the browser before the presigned upload so that large,
 * unoptimized source files never touch object storage or the network beyond
 * the compressed payload. Source images are downscaled to a sane maximum
 * dimension and re-encoded to WebP, which typically cuts file size by 60-90%
 * versus an original JPEG/PNG while preserving perceived quality.
 *
 * Animated GIFs are passed through untouched — a canvas re-encode would flatten
 * them to a single frame — and any decode/encode failure falls back to the
 * original file so uploads never hard-fail on optimization.
 */

/** Longest edge (px) the optimized image is allowed to keep. */
const MAX_DIMENSION = 2000;

/** WebP encoder quality (0-1). 0.82 is a good size/quality trade-off for photos. */
const WEBP_QUALITY = 0.82;

export interface CompressionResult {
  /** The file to upload — optimized when possible, otherwise the original. */
  file: File;
  /** True when the returned file was re-encoded and is smaller than the source. */
  wasCompressed: boolean;
  /** Intrinsic pixel dimensions of the returned file, when it could be decoded. */
  width?: number;
  height?: number;
}

function withWebpExtension(name: string): string {
  return `${name.replace(/\.[^./\\]+$/, '')}.webp`;
}

/**
 * Reads an image file's intrinsic pixel dimensions in the browser, or
 * `undefined` when it cannot be decoded. Lets callers record native dimensions
 * so images can later be rendered at their true aspect ratio without layout shift.
 */
export async function getImageDimensions(
  file: File,
): Promise<{ width: number; height: number } | undefined> {
  try {
    const bitmap = await createImageBitmap(file);
    const dimensions = { width: bitmap.width, height: bitmap.height };
    bitmap.close();
    return dimensions;
  } catch {
    return undefined;
  }
}

/**
 * Optimizes an image file in the browser. Returns the original file unchanged
 * when it is not a compressible raster type, when the browser cannot decode it,
 * or when compression would not reduce the size. The returned `width`/`height`
 * always describe the file that is handed back (optimized or original).
 */
export async function compressImage(file: File): Promise<CompressionResult> {
  // Ignore anything that is not a raster image.
  if (!file.type.startsWith('image/')) {
    return { file, wasCompressed: false };
  }

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    return { file, wasCompressed: false };
  }

  try {
    const { width, height } = bitmap;

    // Preserve animated GIFs untouched (a canvas re-encode flattens them), but
    // still report their dimensions.
    if (file.type === 'image/gif') {
      return { file, wasCompressed: false, width, height };
    }

    const scale = Math.min(1, MAX_DIMENSION / Math.max(width, height));
    const targetWidth = Math.max(1, Math.round(width * scale));
    const targetHeight = Math.max(1, Math.round(height * scale));

    const canvas = document.createElement('canvas');
    canvas.width = targetWidth;
    canvas.height = targetHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return { file, wasCompressed: false, width, height };
    }
    ctx.drawImage(bitmap, 0, 0, targetWidth, targetHeight);

    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob((result) => resolve(result), 'image/webp', WEBP_QUALITY);
    });

    // Keep the original if encoding failed or did not actually save bytes.
    if (!blob || blob.size >= file.size) {
      return { file, wasCompressed: false, width, height };
    }

    const optimized = new File([blob], withWebpExtension(file.name), {
      type: 'image/webp',
      lastModified: Date.now(),
    });
    return { file: optimized, wasCompressed: true, width: targetWidth, height: targetHeight };
  } finally {
    bitmap.close();
  }
}
