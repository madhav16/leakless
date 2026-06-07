import * as React from 'react';
import { cn } from '@/utils/cn';

/**
 * Input — ShadCN UI component (leakless-customized).
 */
const Input = React.forwardRef(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        'flex h-9 w-full rounded-md border border-white/10 bg-surface-300 px-3 py-1 text-sm text-white shadow-sm transition-colors',
        'placeholder:text-slate-500',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      ref={ref}
      {...props}
    />
  );
});
Input.displayName = 'Input';

export { Input };
