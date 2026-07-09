import { useEffect, useState } from 'react';
import { Plus, Star, Trash2 } from 'lucide-react';
import {
  Badge,
  BarChart,
  BloomLoader,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  ConfirmProvider,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTrigger,
  Field,
  Input,
  PageHeader,
  Select,
  Spinner,
  Table,
  TBody,
  TD,
  TH,
  THead,
  TR,
  Textarea,
  ToastProvider,
  themes,
  useConfirm,
  useToast,
  type Palette,
  type ThemeName,
} from '@arts/ui';

/** Applies a palette by overriding the theme CSS variables on :root. */
function applyTheme(name: ThemeName): void {
  const p: Palette = themes[name];
  const vars: Array<[string, string]> = [
    ['--color-bg', p.bg],
    ['--color-surface', p.surface],
    ['--color-surface-2', p.surface2],
    ['--color-elevated', p.elevated],
    ['--color-gold-300', p.gold[300]],
    ['--color-gold-400', p.gold[400]],
    ['--color-gold-500', p.gold[500]],
    ['--color-gold-600', p.gold[600]],
    ['--color-gold-700', p.gold[700]],
    ['--color-fg', p.fg],
    ['--color-muted', p.muted],
    ['--color-faint', p.faint],
    ['--color-line', p.line],
    ['--color-line-strong', p.lineStrong],
    ['--color-danger', p.danger],
    ['--color-success', p.success],
  ];
  const root = document.documentElement;
  for (const [k, v] of vars) root.style.setProperty(k, v);
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-b border-line py-10">
      <h2 className="mb-5 font-display text-xl text-gold-300">{title}</h2>
      <div className="space-y-6">{children}</div>
    </section>
  );
}

function Row({ label, children }: { label?: string; children: React.ReactNode }) {
  return (
    <div>
      {label ? (
        <p className="mb-2 text-xs uppercase tracking-[0.14em] text-faint">{label}</p>
      ) : null}
      <div className="flex flex-wrap items-center gap-3">{children}</div>
    </div>
  );
}

function Demos() {
  const toast = useToast();
  const confirm = useConfirm();

  return (
    <div className="mx-auto max-w-4xl px-6 pb-24">
      <Section title="Storefront — premium (customer-facing)">
        <Row label="Luxury buttons — hairline outline, uppercase, no gradient">
          <Button variant="luxury" size="lg">
            Explore the collection
          </Button>
          <Button variant="luxury">Enquire</Button>
          <Button variant="luxury" size="sm">
            View piece
          </Button>
        </Row>
        <Row label="BloomLoader — geometric flower, draws / un-draws while rotating">
          <BloomLoader className="h-8 w-8" />
          <BloomLoader className="h-12 w-12" />
          <BloomLoader className="h-16 w-16 text-gold-400" />
        </Row>
        <p className="max-w-xl text-sm text-muted">
          The storefront favours restraint: premium hairline CTAs, open editorial layouts and
          minimal card chrome. Toggle the <span className="text-gold-300">heritage</span> theme
          above to preview the customer palette.
        </p>
      </Section>

      <Section title="Buttons (seller portal / admin)">
        <Row label="Variants">
          <Button>Primary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="danger">Danger</Button>
          <Button disabled>Disabled</Button>
        </Row>
        <Row label="Sizes">
          <Button size="sm">Small</Button>
          <Button size="md">Medium</Button>
          <Button size="lg">Large</Button>
          <Button size="icon" aria-label="Add">
            <Plus className="h-4 w-4" />
          </Button>
        </Row>
        <Row label="With icons">
          <Button>
            <Plus className="h-4 w-4" /> New product
          </Button>
          <Button variant="outline">
            <Star className="h-4 w-4" /> Feature
          </Button>
        </Row>
      </Section>

      <Section title="Badges">
        <Row>
          <Badge>Neutral</Badge>
          <Badge variant="gold">Gold</Badge>
          <Badge variant="success">Active</Badge>
          <Badge variant="danger">Low</Badge>
        </Row>
      </Section>

      <Section title="Form controls">
        <div className="grid max-w-md gap-4">
          <Field label="Title" htmlFor="c-title">
            <Input id="c-title" placeholder="Brass peacock lamp" />
          </Field>
          <Field label="Currency" htmlFor="c-currency" hint="ISO-4217 code.">
            <Select id="c-currency">
              <option>USD</option>
              <option>EUR</option>
              <option>INR</option>
            </Select>
          </Field>
          <Field label="Description" htmlFor="c-desc">
            <Textarea id="c-desc" />
          </Field>
          <Field label="Price" htmlFor="c-price" error="Enter a valid amount.">
            <Input id="c-price" inputMode="decimal" placeholder="0.00" />
          </Field>
        </div>
      </Section>

      <Section title="Card">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Preserving craftsmanship</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted">
            Cards group related content on a subtly elevated surface.
          </CardContent>
        </Card>
      </Section>

      <Section title="Table">
        <Table>
          <THead>
            <TR>
              <TH>Product</TH>
              <TH>Status</TH>
              <TH>Price</TH>
            </TR>
          </THead>
          <TBody>
            <TR>
              <TD className="text-fg">Hand-thrown mug</TD>
              <TD>
                <Badge variant="success">Active</Badge>
              </TD>
              <TD className="text-gold-300">USD 28.00</TD>
            </TR>
            <TR>
              <TD className="text-fg">Walnut board</TD>
              <TD>
                <Badge variant="gold">Draft</Badge>
              </TD>
              <TD className="text-gold-300">USD 76.00</TD>
            </TR>
          </TBody>
        </Table>
      </Section>

      <Section title="Charts">
        <BarChart
          className="max-w-md"
          data={[
            { label: 'Active', value: 3, hint: '3 products' },
            { label: 'Draft', value: 1, hint: '1 product' },
            { label: 'Archived', value: 0, hint: '0 products' },
          ]}
        />
      </Section>

      <Section title="Feedback — toasts, dialog & confirm">
        <Row label="Toasts">
          <Button variant="outline" onClick={() => toast.success('Saved successfully.')}>
            Success toast
          </Button>
          <Button variant="outline" onClick={() => toast.error('Something went wrong.')}>
            Error toast
          </Button>
          <Button variant="outline" onClick={() => toast.info('Heads up.')}>
            Info toast
          </Button>
        </Row>
        <Row label="Dialog & confirm">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">Open dialog</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader title="Edit variant" description="Update the variant details." />
              <Field label="SKU" htmlFor="d-sku">
                <Input id="d-sku" defaultValue="PEACOCK-LMP-01" />
              </Field>
              <DialogFooter>
                <Button variant="ghost">Cancel</Button>
                <Button>Save changes</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Button
            variant="danger"
            onClick={async () => {
              const ok = await confirm({
                title: 'Delete product',
                message: 'This also removes its variants and images.',
                confirmLabel: 'Delete',
                destructive: true,
              });
              toast.info(ok ? 'Confirmed delete.' : 'Cancelled.');
            }}
          >
            <Trash2 className="h-4 w-4" /> Delete…
          </Button>
        </Row>
      </Section>

      <Section title="Spinner">
        <Row>
          <span className="inline-flex items-center gap-2 text-muted">
            <Spinner className="text-gold-500" /> Loading…
          </span>
        </Row>
      </Section>
    </div>
  );
}

export function Catalog() {
  const [theme, setTheme] = useState<ThemeName>('admin');

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  return (
    <ToastProvider>
      <ConfirmProvider>
        <div className="min-h-screen">
          <div className="sticky top-0 z-10 border-b border-line bg-bg/80 backdrop-blur">
            <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
              <PageHeader eyebrow="Design system" title="@arts/ui catalog" />
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-[0.14em] text-faint">Theme</span>
                {(['admin', 'heritage'] as const).map((t) => (
                  <Button
                    key={t}
                    size="sm"
                    variant={theme === t ? 'primary' : 'outline'}
                    onClick={() => setTheme(t)}
                  >
                    {t}
                  </Button>
                ))}
              </div>
            </div>
          </div>
          <Demos />
        </div>
      </ConfirmProvider>
    </ToastProvider>
  );
}
