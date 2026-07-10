import { useCallback, useEffect, useState } from 'react';
import Cropper from 'react-easy-crop';
import 'react-easy-crop/react-easy-crop.css';
import { ArrowLeft, ArrowRight, ZoomIn } from 'lucide-react';
import {
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  Spinner,
} from '@arts/ui';
import { PRODUCT_IMAGE_ASPECT, cropImageToWebp, type PixelCrop } from '../../lib/image-crop.js';

interface FrameState {
  crop: { x: number; y: number };
  zoom: number;
  pixels: PixelCrop | null;
}

const initialFrame = (): FrameState => ({ crop: { x: 0, y: 0 }, zoom: 1, pixels: null });

/**
 * Interactive crop wizard shown after the seller picks one or more images. It
 * rolls through each selected file so the seller can drag to reposition and zoom
 * it inside the fixed product aspect ratio, instead of relying on an automatic
 * centre crop. Framing is kept per image, so Back/Next never loses work; on the
 * last image every crop is exported to WebP and the whole batch is handed to the
 * caller to upload in one go.
 */
export function ImageCropDialog({
  open,
  files,
  onCancel,
  onComplete,
}: {
  open: boolean;
  files: File[];
  onCancel: () => void;
  /** Uploads the cropped batch. Rejects to keep the dialog open with an error. */
  onComplete: (cropped: File[]) => Promise<void>;
}) {
  const [index, setIndex] = useState(0);
  const [frames, setFrames] = useState<FrameState[]>([]);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Start a fresh wizard whenever a new batch is opened.
  useEffect(() => {
    setIndex(0);
    setFrames(files.map(initialFrame));
    setError(null);
  }, [files]);

  // Load an object URL for the image currently being framed.
  useEffect(() => {
    const file = files[index];
    if (!file) {
      setImageUrl(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setImageUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [files, index]);

  const current = frames[index];
  const total = files.length;
  const isLast = index >= total - 1;
  const ready = current?.pixels != null;

  const patch = useCallback(
    (change: Partial<FrameState>) => {
      setFrames((prev) => {
        const next = [...prev];
        next[index] = { ...(next[index] ?? initialFrame()), ...change };
        return next;
      });
    },
    [index],
  );

  const onCropComplete = useCallback(
    (_area: PixelCrop, areaPixels: PixelCrop) => patch({ pixels: areaPixels }),
    [patch],
  );

  const finish = async () => {
    setBusy(true);
    setError(null);
    try {
      const cropped: File[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const frame = frames[i];
        if (!file || !frame?.pixels) continue;
        cropped.push(await cropImageToWebp(file, frame.pixels));
      }
      await onComplete(cropped);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save the images.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next && !busy) onCancel();
      }}
    >
      <DialogContent className="max-w-xl">
        <DialogHeader
          title={total > 1 ? `Position image ${index + 1} of ${total}` : 'Position image'}
          description="Drag to reposition and use the slider to zoom. The framed area is exactly what customers will see."
        />

        <div className="relative h-[50vh] w-full overflow-hidden rounded-lg bg-black">
          {imageUrl ? (
            <Cropper
              key={index}
              image={imageUrl}
              crop={current?.crop ?? { x: 0, y: 0 }}
              zoom={current?.zoom ?? 1}
              minZoom={1}
              maxZoom={4}
              aspect={PRODUCT_IMAGE_ASPECT}
              onCropChange={(value) => patch({ crop: value })}
              onZoomChange={(value) => patch({ zoom: value })}
              onCropComplete={onCropComplete}
            />
          ) : null}
        </div>

        <div className="mt-4 flex items-center gap-3">
          <ZoomIn className="h-4 w-4 shrink-0 text-muted" aria-hidden />
          <input
            type="range"
            min={1}
            max={4}
            step={0.01}
            value={current?.zoom ?? 1}
            onChange={(e) => patch({ zoom: Number(e.target.value) })}
            aria-label="Zoom"
            className="h-1 w-full cursor-pointer accent-gold-500"
          />
        </div>

        {error ? <p className="mt-3 text-sm text-danger">{error}</p> : null}

        <DialogFooter className="items-center">
          <Button variant="ghost" onClick={onCancel} disabled={busy}>
            Cancel
          </Button>
          <div className="ml-auto flex items-center gap-2">
            {index > 0 ? (
              <Button
                variant="outline"
                onClick={() => setIndex((i) => Math.max(0, i - 1))}
                disabled={busy}
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
            ) : null}
            {isLast ? (
              <Button onClick={() => void finish()} disabled={busy || !ready}>
                {busy ? <Spinner /> : null}
                {busy ? 'Uploading…' : `Upload ${total} image${total === 1 ? '' : 's'}`}
              </Button>
            ) : (
              <Button
                onClick={() => setIndex((i) => Math.min(total - 1, i + 1))}
                disabled={busy || !ready}
              >
                Next
                <ArrowRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
