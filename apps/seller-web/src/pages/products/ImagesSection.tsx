import { useRef, useState } from 'react';
import { ImagePlus, Star, Trash2 } from 'lucide-react';
import { ALLOWED_IMAGE_TYPES, MAX_UPLOAD_BYTES, type UploadUrlInput } from '@arts/shared';
import type { ProductImage } from '../../api/catalog.js';
import { requestUploadUrl, uploadToStorage } from '../../api/catalog.js';
import { compressImage } from '../../lib/image-compression.js';
import { useAddImage, useDeleteImage, useSetPrimaryImage } from '../../hooks/mutations.js';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card.js';
import { Button } from '../../components/ui/button.js';
import { Badge } from '../../components/ui/badge.js';
import { Spinner } from '../../components/ui/spinner.js';
import { cn } from '../../lib/cn.js';

export function ImagesSection({
  productId,
  images,
}: {
  productId: string;
  images: ProductImage[];
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addMut = useAddImage(productId);
  const setPrimaryMut = useSetPrimaryImage(productId);
  const deleteMut = useDeleteImage(productId);

  const handleFile = async (file: File) => {
    setError(null);
    if (!ALLOWED_IMAGE_TYPES.includes(file.type as (typeof ALLOWED_IMAGE_TYPES)[number])) {
      setError('Unsupported file type. Use JPEG, PNG, WebP or GIF.');
      return;
    }
    setUploading(true);
    try {
      // Optimize in the browser first so only the compressed payload is uploaded.
      const { file: optimized } = await compressImage(file);
      if (optimized.size > MAX_UPLOAD_BYTES) {
        setError('File is too large (max 5 MB after optimization).');
        return;
      }
      const target = await requestUploadUrl({
        fileName: optimized.name,
        contentType: optimized.type as UploadUrlInput['contentType'],
        size: optimized.size,
      });
      await uploadToStorage(target.uploadUrl, optimized);
      await addMut.mutateAsync({
        storageKey: target.storageKey,
        url: target.publicUrl,
        position: images.length,
        isPrimary: images.length === 0,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload failed.');
    } finally {
      setUploading(false);
    }
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
            if (file) void handleFile(file);
            e.target.value = '';
          }}
        />

        {images.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {images.map((img) => (
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
                  className="aspect-square w-full object-cover"
                />
                {img.isPrimary ? (
                  <Badge variant="gold" className="absolute left-2 top-2">
                    Primary
                  </Badge>
                ) : null}
                <div className="absolute inset-x-0 bottom-0 flex justify-end gap-1 bg-gradient-to-t from-black/70 to-transparent p-2 opacity-0 transition-opacity group-hover:opacity-100">
                  {!img.isPrimary ? (
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Set as primary"
                      className="text-gold-300"
                      onClick={() => setPrimaryMut.mutate(img.id)}
                    >
                      <Star className="h-4 w-4" />
                    </Button>
                  ) : null}
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Delete image"
                    className="text-danger"
                    onClick={() => deleteMut.mutate(img.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="mb-4 text-sm text-muted">No images yet.</p>
        )}

        {error ? <p className="mt-3 text-sm text-danger">{error}</p> : null}

        <div className="mt-5">
          <Button variant="outline" onClick={() => fileRef.current?.click()} disabled={uploading}>
            {uploading ? <Spinner /> : <ImagePlus className="h-4 w-4" />}
            {uploading ? 'Uploading…' : 'Upload image'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
