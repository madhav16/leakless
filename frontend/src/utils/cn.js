import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * cn — utility for merging Tailwind class names without conflicts.
 * Combines clsx (conditional classes) + tailwind-merge (deduplication).
 *
 * @example
 * cn('px-4 py-2', isActive && 'bg-brand-500', 'px-6')
 * // → 'py-2 bg-brand-500 px-6'  (px-4 deduplicated by px-6)
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
