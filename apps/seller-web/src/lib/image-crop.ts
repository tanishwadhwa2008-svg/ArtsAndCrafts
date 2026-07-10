/**
 * Client-side image cropping.
 *
 * Takes the crop rectangle the seller framed in the editor (expressed in the
 * source image's natural pixel coordinates) and produces a WebP file cropped to
 * exactly that region. The output is downscaled so its longest edge never
 * exceeds `MAX_OUTPUT_EDGE` — and never upscaled beyond the selected region —
 * so uploads stay small while preserving the seller's chosen framing and
 * aspect ratio. Because the crop already re-encodes to WebP at a sane size, the
 * separate compression pass is not needed for cropped images.
 */

/** A crop rectangle in the source image's natural pixels. */
export interface PixelCrop {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Aspect ratio (width / height) product images are cropped to. 4:5 matches the
 * primary storefront displays — the product cards in listings and the product
 * detail hero — so the seller's framing is exactly what customers see.
 */
export const PRODUCT_IMAGE_ASPECT = 4 / 5;

/** Longest edge (px) the cropped output is allowed to keep. */
const MAX_OUTPUT_EDGE = 1600;

/** WebP encoder quality (0-1). Matches the compression pipeline. */
const WEBP_QUALITY = 0.82;

function withWebpName(name: string): string {
  const base = name.replace(/\.[^./\\]+$/, '').trim();
  return `${base || 'image'}.webp`;
}

/**
 * Crops `crop` out of `file` and returns a WebP `File`. Throws when the browser
 * cannot decode or encode the image so the caller can surface a clear error.
 */
export async function cropImageToWebp(file: File, crop: PixelCrop): Promise<File> {
  const bitmap = await createImageBitmap(file);
  try {
    // Clamp the crop to the image bounds as a safety net against rounding.
    const sx = Math.max(0, Math.min(Math.round(crop.x), bitmap.width - 1));
    const sy = Math.max(0, Math.min(Math.round(crop.y), bitmap.height - 1));
    const sw = Math.max(1, Math.min(Math.round(crop.width), bitmap.width - sx));
    const sh = Math.max(1, Math.min(Math.round(crop.height), bitmap.height - sy));

    const scale = Math.min(1, MAX_OUTPUT_EDGE / Math.max(sw, sh));
    const outW = Math.max(1, Math.round(sw * scale));
    const outH = Math.max(1, Math.round(sh * scale));

    const canvas = document.createElement('canvas');
    canvas.width = outW;
    canvas.height = outH;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Your browser could not process this image.');
    }
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(bitmap, sx, sy, sw, sh, 0, 0, outW, outH);

    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob((result) => resolve(result), 'image/webp', WEBP_QUALITY);
    });
    if (!blob) {
      throw new Error('Your browser could not process this image.');
    }

    return new File([blob], withWebpName(file.name), {
      type: 'image/webp',
      lastModified: Date.now(),
    });
  } finally {
    bitmap.close();
  }
}
