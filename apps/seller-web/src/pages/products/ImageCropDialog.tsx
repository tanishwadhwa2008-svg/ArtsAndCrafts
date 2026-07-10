import { useCallback, useEffect, useState } from 'react';
import Cropper from 'react-easy-crop';
import 'react-easy-crop/react-easy-crop.css';
import { ZoomIn } from 'lucide-react';
import {
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  Spinner,
} from '@arts/ui';
import { PRODUCT_IMAGE_ASPECT, cropImageToWebp, type PixelCrop } from '../../lib/image-crop.js';

/**
 * Interactive cropper shown after the seller picks an image. They drag to
 * reposition and zoom so the product is framed correctly inside the fixed
 * product aspect ratio, instead of relying on an automatic centre crop. On
 * apply the framed region is exported to a WebP file and handed back to the
 * caller for upload.
 */
export function ImageCropDialog({
  open,
  file,
  onCancel,
  onApply,
}: {
  open: boolean;
  file: File | null;
  onCancel: () => void;
  /** Uploads the cropped file. Rejects to keep the dialog open with an error. */
  onApply: (cropped: File) => Promise<void>;
}) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [pixels, setPixels] = useState<PixelCrop | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!file) {
      setImageUrl(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setImageUrl(url);
    // Reset the framing whenever a new file is opened.
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setPixels(null);
    setError(null);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const onCropComplete = useCallback((_area: PixelCrop, areaPixels: PixelCrop) => {
    setPixels(areaPixels);
  }, []);

  const apply = async () => {
    if (!file || !pixels) return;
    setBusy(true);
    setError(null);
    try {
      const cropped = await cropImageToWebp(file, pixels);
      await onApply(cropped);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save the image.');
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
          title="Position image"
          description="Drag to reposition and use the slider to zoom. The framed area is exactly what customers will see."
        />

        <div className="relative h-[50vh] w-full overflow-hidden rounded-lg bg-black">
          {imageUrl ? (
            <Cropper
              image={imageUrl}
              crop={crop}
              zoom={zoom}
              minZoom={1}
              maxZoom={4}
              aspect={PRODUCT_IMAGE_ASPECT}
              onCropChange={setCrop}
              onZoomChange={setZoom}
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
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            aria-label="Zoom"
            className="h-1 w-full cursor-pointer accent-gold-500"
          />
        </div>

        {error ? <p className="mt-3 text-sm text-danger">{error}</p> : null}

        <DialogFooter>
          <Button variant="ghost" onClick={onCancel} disabled={busy}>
            Cancel
          </Button>
          <Button onClick={() => void apply()} disabled={busy || !pixels}>
            {busy ? <Spinner /> : null}
            {busy ? 'Uploading…' : 'Apply & upload'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
