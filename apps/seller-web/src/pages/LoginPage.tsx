import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Gem } from 'lucide-react';
import { useAuth } from '../auth/AuthProvider.js';
import { ApiError } from '../lib/api.js';
import { Button, Input, Label, Spinner } from '@arts/ui';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const from = (location.state as { from?: string } | null)?.from ?? '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Unable to sign in. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-b from-gold-400 to-gold-600 text-[#1a1206] shadow-lg shadow-gold-700/20">
            <Gem className="h-7 w-7" />
          </span>
          <p className="eyebrow">Artisan Collective</p>
          <h1 className="mt-1 text-3xl text-gold-400">Seller Portal</h1>
          <p className="mt-2 font-serif text-sm italic text-muted">
            Curate your timeless collection.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-5 rounded-2xl border border-line bg-surface/70 p-8 backdrop-blur"
        >
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@artisan.local"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              required
            />
          </div>

          {error ? (
            <p className="rounded-md border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
              {error}
            </p>
          ) : null}

          <Button type="submit" size="lg" className="w-full" disabled={submitting}>
            {submitting ? <Spinner /> : null}
            {submitting ? 'Signing in…' : 'Sign in'}
          </Button>
        </form>

        <p className="mt-6 text-center text-xs text-faint">
          Protected area · Authorized sellers only
        </p>
      </div>
    </div>
  );
}
