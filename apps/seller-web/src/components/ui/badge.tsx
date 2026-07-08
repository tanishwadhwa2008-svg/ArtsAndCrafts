import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/cn.js';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium tracking-wide',
  {
    variants: {
      variant: {
        gold: 'border-line-strong bg-gold-500/10 text-gold-300',
        neutral: 'border-line bg-white/5 text-muted',
        success: 'border-success/30 bg-success/10 text-success',
        danger: 'border-danger/30 bg-danger/10 text-danger',
      },
    },
    defaultVariants: { variant: 'neutral' },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
