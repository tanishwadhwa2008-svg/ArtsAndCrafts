import { render } from '@testing-library/react';
import { axe } from 'jest-axe';
import { describe, expect, it } from 'vitest';
import type { ReactElement } from 'react';
import {
  Badge,
  BarChart,
  BloomLoader,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  Field,
  FullPageSpinner,
  Input,
  Label,
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
} from '../src/index.js';

// Run only the WCAG A/AA rules (the compliance target). Best-practice rules
// like `region` are page-level and produce noise for isolated components. The
// `color-contrast` rule needs a real browser (canvas) — it can't run in jsdom,
// so it is disabled here and verified visually via the component catalog.
const AXE_TAGS = {
  runOnly: { type: 'tag' as const, values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] },
  rules: { 'color-contrast': { enabled: false } },
};

async function a11y(ui: ReactElement) {
  const { container } = render(ui);
  expect(await axe(container, AXE_TAGS)).toHaveNoViolations();
}

describe('design-system primitives have no WCAG A/AA violations', () => {
  it('Button — all variants', async () => {
    await a11y(
      <div>
        <Button>Primary</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="danger">Danger</Button>
        <Button variant="luxury">Explore</Button>
        <Button disabled>Disabled</Button>
      </div>,
    );
  });

  it('Input with associated Label', async () => {
    await a11y(
      <div>
        <Label htmlFor="a11y-input">Email</Label>
        <Input id="a11y-input" type="email" placeholder="you@example.com" />
      </div>,
    );
  });

  it('Textarea with associated Label', async () => {
    await a11y(
      <div>
        <Label htmlFor="a11y-ta">Notes</Label>
        <Textarea id="a11y-ta" />
      </div>,
    );
  });

  it('Select with associated Label', async () => {
    await a11y(
      <div>
        <Label htmlFor="a11y-select">Currency</Label>
        <Select id="a11y-select">
          <option value="USD">USD</option>
          <option value="EUR">EUR</option>
        </Select>
      </div>,
    );
  });

  it('Field (label + control + error)', async () => {
    await a11y(
      <Field label="Price" htmlFor="a11y-price" error="Required">
        <Input id="a11y-price" inputMode="decimal" />
      </Field>,
    );
  });

  it('Badge — all variants', async () => {
    await a11y(
      <div>
        <Badge>Neutral</Badge>
        <Badge variant="gold">Gold</Badge>
        <Badge variant="success">Success</Badge>
        <Badge variant="danger">Danger</Badge>
      </div>,
    );
  });

  it('Card with heading + content', async () => {
    await a11y(
      <Card>
        <CardHeader>
          <CardTitle>Title</CardTitle>
        </CardHeader>
        <CardContent>Body content.</CardContent>
      </Card>,
    );
  });

  it('PageHeader', async () => {
    await a11y(<PageHeader eyebrow="Catalog" title="Products" />);
  });

  it('Table', async () => {
    await a11y(
      <Table>
        <THead>
          <TR>
            <TH>Name</TH>
            <TH>Price</TH>
          </TR>
        </THead>
        <TBody>
          <TR>
            <TD>Mug</TD>
            <TD>28.00</TD>
          </TR>
        </TBody>
      </Table>,
    );
  });

  it('Spinner (decorative) beside text', async () => {
    await a11y(
      <p>
        <Spinner /> Loading…
      </p>,
    );
  });

  it('FullPageSpinner (status)', async () => {
    await a11y(<FullPageSpinner />);
  });

  it('BloomLoader (status)', async () => {
    await a11y(<BloomLoader />);
  });

  it('BarChart', async () => {
    await a11y(
      <BarChart
        data={[
          { label: 'Active', value: 3 },
          { label: 'Draft', value: 1 },
        ]}
      />,
    );
  });

  it('Toast region (empty)', async () => {
    await a11y(
      <ToastProvider>
        <p>App content</p>
      </ToastProvider>,
    );
  });

  it('Dialog (open, portalled)', async () => {
    render(
      <Dialog open>
        <DialogContent>
          <DialogHeader title="Delete item" description="This cannot be undone." />
          <DialogFooter>
            <Button variant="ghost">Cancel</Button>
            <Button variant="danger">Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>,
    );
    expect(await axe(document.body, AXE_TAGS)).toHaveNoViolations();
  });
});
