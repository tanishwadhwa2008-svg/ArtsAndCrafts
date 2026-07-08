import { useCategories } from '../hooks/queries.js';
import { PageHeader } from '../components/ui/page-header.js';
import { Button } from '../components/ui/button.js';
import { Spinner } from '../components/ui/spinner.js';
import { Table, TBody, TD, TH, THead, TR } from '../components/ui/table.js';

export function CategoriesPage() {
  const { data, isLoading, isError } = useCategories();

  return (
    <div>
      <PageHeader
        eyebrow="Catalog"
        title="Categories"
        actions={<Button disabled>New category</Button>}
      />

      {isLoading ? (
        <div className="flex items-center gap-2 py-16 text-muted">
          <Spinner className="text-gold-500" /> Loading categories…
        </div>
      ) : isError ? (
        <p className="py-16 text-center text-danger">Failed to load categories.</p>
      ) : !data || data.length === 0 ? (
        <p className="py-16 text-center text-muted">No categories yet.</p>
      ) : (
        <Table>
          <THead>
            <TR>
              <TH>Name</TH>
              <TH>Slug</TH>
              <TH>Position</TH>
            </TR>
          </THead>
          <TBody>
            {data.map((c) => (
              <TR key={c.id}>
                <TD className="font-medium text-fg">{c.name}</TD>
                <TD className="text-muted">{c.slug}</TD>
                <TD>{c.position}</TD>
              </TR>
            ))}
          </TBody>
        </Table>
      )}
    </div>
  );
}
