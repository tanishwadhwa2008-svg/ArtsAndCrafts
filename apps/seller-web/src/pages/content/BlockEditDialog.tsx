import { useEffect, useState } from 'react';
import type { ContentBlockInput } from '@arts/shared';
import type { ContentBlock } from '../../api/content.js';
import { useCollections, useProducts } from '../../hooks/queries.js';
import { useUpdateBlock } from '../../hooks/mutations.js';
import { ApiError } from '../../lib/api.js';
import {
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  Field,
  Input,
  Spinner,
  Textarea,
  useToast,
} from '@arts/ui';
import { BLOCK_LABELS } from './block-meta.js';

interface FormState {
  heading: string;
  eyebrow: string;
  subheading: string;
  body: string;
  text: string;
  backgroundImageUrl: string;
  imageUrl: string;
  primaryCtaLabel: string;
  primaryCtaHref: string;
  ctaLabel: string;
  ctaHref: string;
  collectionIds: string[];
  productIds: string[];
}

function initForm(block: ContentBlock): FormState {
  const p = (block.payload ?? {}) as Record<string, unknown>;
  const str = (v: unknown): string => (typeof v === 'string' ? v : '');
  const cta = (v: unknown): { label?: unknown; href?: unknown } =>
    v && typeof v === 'object' ? (v as { label?: unknown; href?: unknown }) : {};
  const primary = cta(p.primaryCta);
  const banner = cta(p.cta);
  return {
    heading: str(p.heading),
    eyebrow: str(p.eyebrow),
    subheading: str(p.subheading),
    body: str(p.body),
    text: str(p.text),
    backgroundImageUrl: str(p.backgroundImageUrl),
    imageUrl: str(p.imageUrl),
    primaryCtaLabel: str(primary.label),
    primaryCtaHref: str(primary.href),
    ctaLabel: str(banner.label),
    ctaHref: str(banner.href),
    collectionIds: Array.isArray(p.collectionIds) ? (p.collectionIds as string[]) : [],
    productIds: Array.isArray(p.productIds) ? (p.productIds as string[]) : [],
  };
}

function optional(value: string): string | undefined {
  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
}

function cta(label: string, href: string): { label: string; href: string } | undefined {
  const l = label.trim();
  const h = href.trim();
  return l && h ? { label: l, href: h } : undefined;
}

function prune(obj: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined));
}

function buildPayload(type: string, f: FormState): Record<string, unknown> {
  switch (type) {
    case 'HERO':
      return prune({
        eyebrow: optional(f.eyebrow),
        heading: f.heading.trim(),
        subheading: optional(f.subheading),
        backgroundImageUrl: optional(f.backgroundImageUrl),
        primaryCta: cta(f.primaryCtaLabel, f.primaryCtaHref),
      });
    case 'BANNER':
      return prune({
        heading: f.heading.trim(),
        text: optional(f.text),
        imageUrl: optional(f.imageUrl),
        cta: cta(f.ctaLabel, f.ctaHref),
      });
    case 'RICH_TEXT':
      return prune({ heading: optional(f.heading), body: f.body.trim() });
    case 'FEATURED_COLLECTIONS':
      return prune({ heading: optional(f.heading), collectionIds: f.collectionIds });
    case 'PRODUCT_GRID':
      return prune({ heading: optional(f.heading), productIds: f.productIds });
    default:
      return {};
  }
}

export function BlockEditDialog({
  pageId,
  block,
  open,
  onOpenChange,
}: {
  pageId: string;
  block: ContentBlock;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const updateMut = useUpdateBlock(pageId);
  const toast = useToast();
  const collections = useCollections();
  const products = useProducts({ pageSize: 100 });

  const [form, setForm] = useState<FormState>(() => initForm(block));

  useEffect(() => {
    if (open) setForm(initForm(block));
  }, [open, block]);

  const set = (patch: Partial<FormState>) => setForm((prev) => ({ ...prev, ...patch }));

  const toggleId = (key: 'collectionIds' | 'productIds', id: string) =>
    setForm((prev) => ({
      ...prev,
      [key]: prev[key].includes(id) ? prev[key].filter((x) => x !== id) : [...prev[key], id],
    }));

  const save = () => {
    const body = {
      type: block.type,
      payload: buildPayload(block.type, form),
    } as unknown as ContentBlockInput;
    updateMut.mutate(
      { blockId: block.id, body },
      {
        onSuccess: () => {
          toast.success('Block saved.');
          onOpenChange(false);
        },
        onError: (e) =>
          toast.error(e instanceof ApiError ? e.message : 'Failed to save block.'),
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader title={`Edit ${BLOCK_LABELS[block.type] ?? block.type} block`} />

        <div className="max-h-[60vh] space-y-4 overflow-y-auto pr-1">
          {block.type === 'HERO' && (
            <>
              <Field label="Eyebrow" htmlFor="b-eyebrow">
                <Input id="b-eyebrow" value={form.eyebrow} onChange={(e) => set({ eyebrow: e.target.value })} />
              </Field>
              <Field label="Heading" htmlFor="b-heading">
                <Input id="b-heading" value={form.heading} onChange={(e) => set({ heading: e.target.value })} />
              </Field>
              <Field label="Subheading" htmlFor="b-sub">
                <Textarea id="b-sub" value={form.subheading} onChange={(e) => set({ subheading: e.target.value })} />
              </Field>
              <Field label="Background image URL" htmlFor="b-bg">
                <Input id="b-bg" value={form.backgroundImageUrl} onChange={(e) => set({ backgroundImageUrl: e.target.value })} placeholder="https://…" />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="CTA label" htmlFor="b-cta-label">
                  <Input id="b-cta-label" value={form.primaryCtaLabel} onChange={(e) => set({ primaryCtaLabel: e.target.value })} />
                </Field>
                <Field label="CTA link" htmlFor="b-cta-href">
                  <Input id="b-cta-href" value={form.primaryCtaHref} onChange={(e) => set({ primaryCtaHref: e.target.value })} placeholder="/collections" />
                </Field>
              </div>
            </>
          )}

          {block.type === 'BANNER' && (
            <>
              <Field label="Heading" htmlFor="b-heading">
                <Input id="b-heading" value={form.heading} onChange={(e) => set({ heading: e.target.value })} />
              </Field>
              <Field label="Text" htmlFor="b-text">
                <Textarea id="b-text" value={form.text} onChange={(e) => set({ text: e.target.value })} />
              </Field>
              <Field label="Image URL" htmlFor="b-img">
                <Input id="b-img" value={form.imageUrl} onChange={(e) => set({ imageUrl: e.target.value })} placeholder="https://…" />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="CTA label" htmlFor="b-cta-label">
                  <Input id="b-cta-label" value={form.ctaLabel} onChange={(e) => set({ ctaLabel: e.target.value })} />
                </Field>
                <Field label="CTA link" htmlFor="b-cta-href">
                  <Input id="b-cta-href" value={form.ctaHref} onChange={(e) => set({ ctaHref: e.target.value })} />
                </Field>
              </div>
            </>
          )}

          {block.type === 'RICH_TEXT' && (
            <>
              <Field label="Heading" htmlFor="b-heading">
                <Input id="b-heading" value={form.heading} onChange={(e) => set({ heading: e.target.value })} />
              </Field>
              <Field label="Body" htmlFor="b-body">
                <Textarea id="b-body" rows={8} value={form.body} onChange={(e) => set({ body: e.target.value })} />
              </Field>
            </>
          )}

          {block.type === 'FEATURED_COLLECTIONS' && (
            <>
              <Field label="Heading" htmlFor="b-heading">
                <Input id="b-heading" value={form.heading} onChange={(e) => set({ heading: e.target.value })} />
              </Field>
              <Field label="Collections" htmlFor="b-collections">
                <div id="b-collections" className="max-h-56 space-y-2 overflow-y-auto rounded-md border border-line p-3">
                  {collections.data?.length ? (
                    collections.data.map((c) => (
                      <label key={c.id} className="flex items-center gap-2 text-sm text-fg">
                        <input
                          type="checkbox"
                          className="accent-gold-500"
                          checked={form.collectionIds.includes(c.id)}
                          onChange={() => toggleId('collectionIds', c.id)}
                        />
                        {c.title}
                      </label>
                    ))
                  ) : (
                    <p className="text-sm text-muted">No collections yet.</p>
                  )}
                </div>
              </Field>
            </>
          )}

          {block.type === 'PRODUCT_GRID' && (
            <>
              <Field label="Heading" htmlFor="b-heading">
                <Input id="b-heading" value={form.heading} onChange={(e) => set({ heading: e.target.value })} />
              </Field>
              <Field label="Products" htmlFor="b-products">
                <div id="b-products" className="max-h-56 space-y-2 overflow-y-auto rounded-md border border-line p-3">
                  {products.data?.items.length ? (
                    products.data.items.map((p) => (
                      <label key={p.id} className="flex items-center gap-2 text-sm text-fg">
                        <input
                          type="checkbox"
                          className="accent-gold-500"
                          checked={form.productIds.includes(p.id)}
                          onChange={() => toggleId('productIds', p.id)}
                        />
                        {p.title}
                      </label>
                    ))
                  ) : (
                    <p className="text-sm text-muted">No products yet.</p>
                  )}
                </div>
              </Field>
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={save} disabled={updateMut.isPending}>
            {updateMut.isPending ? <Spinner /> : null}
            Save block
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
