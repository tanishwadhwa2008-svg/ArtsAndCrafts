import { BloomLoader } from '@arts/ui';

export default function Loading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <BloomLoader className="h-12 w-12 text-gold-500" label="Loading" />
    </div>
  );
}
