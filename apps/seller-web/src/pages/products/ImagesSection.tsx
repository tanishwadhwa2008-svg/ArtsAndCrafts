import { useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, ImagePlus, Star, Trash2 } from 'lucide-react';
import { ALLOWED_IMAGE_TYPES, MAX_UPLOAD_BYTES, type UploadUrlInput } from '@arts/shared';
import type { ProductImage } from '../../api/catalog.js';
import { requestUploadUrl, uploadToStorage } from '../../api/catalog.js';
import {
  useAddImage,
  useDeleteImage,
  useSetPrimaryImage,
  useUpdateImage,
} from '../../hooks/mutations.js';
import {
  useToast,
  useConfirm,
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@arts/ui';
import { ApiError } from '../../lib/api.js';
import { cn } from '../../lib/cn.js';
import { ImageCropDialog } from './ImageCropDialog.js';

export function ImagesSection({
  productId,
  images,
}: {
  productId: string;
  images: ProductImage[];
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [cropFile, setCropFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const addMut = useAddImage(productId);
  const setPrimaryMut = useSetPrimaryImage(productId);
  const updateMut = useUpdateImage(productId);
  const deleteMut = useDeleteImage(productId);
  const toast = useToast();
  const confirm = useConfirm();

  const sorted = [...images].sort((a, b) => a.position - b.position);

  const move = async (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= sorted.length) return;
    const current = sorted[index];
    const neighbor = sorted[target];
    if (!current || !neighbor) return;
    try {
      await Promise.all([
        updateMut.mutateAsync({ imageId: current.id, body: { position: neighbor.position } }),
        updateMut.mutateAsync({ imageId: neighbor.id, body: { position: current.position } }),
      ]);
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : 'Failed to reorder images.');
    }
  };

  const setPrimary = (img: ProductImage) => {
    setPrimaryMut.mutate(img.id, {
      onSuccess: () => toast.success('Primary image updated.'),
      onError: (e) =>
        toast.error(e instanceof ApiError ? e.message : 'Failed to set primary image.'),
    });
  };

  const removeImage = async (img: ProductImage) => {
    const ok = await confirm({
      title: 'Delete image',
      message: 'Remove this image from the product?',
      confirmLabel: 'Delete',
      destructive: true,
    });
    if (!ok) return;
    deleteMut.mutate(img.id, {
      onSuccess: () => toast.success('Image deleted.'),
      onError: (e) => toast.error(e instanceof ApiError ? e.message : 'Failed to delete image.'),
    });
  };

  const openCropper = (file: File) => {
    setError(null);
    if (!ALLOWED_IMAGE_TYPES.includes(file.type as (typeof ALLOWED_IMAGE_TYPES)[number])) {
      setError('Unsupported file type. Use JPEG, PNG, WebP or GIF.');
      return;
    }
    setCropFile(file);
  };

  // Uploads the cropped WebP the editor produced. Rejects so the crop dialog can
  // surface the error and stay open; resolves and closes it on success.
  const uploadCropped = async (cropped: File) => {
    if (cropped.size > MAX_UPLOAD_BYTES) {
      throw new Error('Image is too large (max 5 MB).');
    }
    const target = await requestUploadUrl({
      fileName: cropped.name,
      contentType: cropped.type as UploadUrlInput['contentType'],
      size: cropped.size,
    });
    await uploadToStorage(target.uploadUrl, cropped);
    await addMut.mutateAsync({
      storageKey: target.storageKey,
      url: target.publicUrl,
      position: images.length,
      isPrimary: images.length === 0,
    });
    toast.success('Image uploaded.');
    setCropFile(null);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Images</CardTitle>
      </CardHeader>
      <CardContent>
        <input
          ref={fileRef}
          type="file"
          accept={ALLOWED_IMAGE_TYPES.join(',')}
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) openCropper(file);
            e.target.value = '';
          }}
        />

        {images.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {sorted.map((img, index) => (
              <div
                key={img.id}
                className={cn(
                  'group relative overflow-hidden rounded-lg border bg-surface-2',
                  img.isPrimary ? 'border-gold-500' : 'border-line',
                )}
              >
                <img
                  src={img.url}
                  alt={img.altText ?? 'Product image'}
                  className="aspect-[4/5] w-full object-cover"
                />
                {img.isPrimary ? (
                  <Badge variant="gold" className="absolute left-2 top-2">
                    Primary
                  </Badge>
                ) : null}
                <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-1 bg-gradient-to-t from-black/70 to-transparent p-2 opacity-0 transition-opacity group-hover:opacity-100">
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Move left"
                      className="text-fg disabled:opacity-30"
                      disabled={index === 0 || updateMut.isPending}
                      onClick={() => void move(index, -1)}
                    >
                      <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Move right"
                      className="text-fg disabled:opacity-30"
                      disabled={index === sorted.length - 1 || updateMut.isPending}
                      onClick={() => void move(index, 1)}
                    >
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex gap-1">
                    {!img.isPrimary ? (
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Set as primary"
                        className="text-gold-300"
                        onClick={() => setPrimary(img)}
                      >
                        <Star className="h-4 w-4" />
                      </Button>
                    ) : null}
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Delete image"
                      className="text-danger"
                      onClick={() => void removeImage(img)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="mb-4 text-sm text-muted">No images yet.</p>
        )}

        {error ? <p className="mt-3 text-sm text-danger">{error}</p> : null}

        <div className="mt-5">
          <Button variant="outline" onClick={() => fileRef.current?.click()}>
            <ImagePlus className="h-4 w-4" />
            Upload image
          </Button>
        </div>

        <ImageCropDialog
          open={cropFile !== null}
          file={cropFile}
          onCancel={() => setCropFile(null)}
          onApply={uploadCropped}
        />
      </CardContent>
    </Card>
  );
}
