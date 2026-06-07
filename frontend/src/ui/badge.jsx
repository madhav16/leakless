import * as React from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '@/utils/cn';

/**
 * Badge — ShadCN UI component (leakless-customized).
 */
const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors',
  {
    variants: {
      variant: {
        default:     'border-transparent bg-brand-600 text-white',
        secondary:   'border-transparent bg-surface-300 text-slate-300',
        destructive: 'border-transparent bg-red-600/20 text-red-400',
        success:     'border-transparent bg-emerald-600/20 text-emerald-400',
        warning:     'border-transparent bg-amber-600/20 text-amber-400',
        outline:     'border-white/10 text-slate-300',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

function Badge({ className, variant, ...props }) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
