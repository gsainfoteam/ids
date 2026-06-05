import { type ClassValue, clsx } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

const idsTextSizes = ['text-display', 'text-heading', 'text-title', 'text-body', 'text-label', 'text-caption'] as const;

export const twMergeConfig = {
  extend: {
    classGroups: {
      'font-size': [...idsTextSizes],
    },
  },
} as const;

const twMerge = extendTailwindMerge(twMergeConfig);

export function cn(...classes: ClassValue[]) {
  return twMerge(clsx(classes));
}
