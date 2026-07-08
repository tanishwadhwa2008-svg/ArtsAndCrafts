import { useAuth } from '../auth/AuthProvider.js';
import { PageHeader } from '../components/ui/page-header.js';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card.js';

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between border-b border-line/60 py-3 last:border-0">
      <span className="text-muted">{label}</span>
      <span className="text-fg">{value}</span>
    </div>
  );
}

export function SettingsPage() {
  const { user } = useAuth();

  return (
    <div>
      <PageHeader eyebrow="Account" title="Settings" />
      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <Row label="Name" value={user?.displayName ?? '—'} />
          <Row label="Email" value={user?.email ?? '—'} />
          <Row label="Role" value={user?.role ?? '—'} />
          <Row label="Shop ID" value={user?.shopId ?? '—'} />
        </CardContent>
      </Card>
    </div>
  );
}
