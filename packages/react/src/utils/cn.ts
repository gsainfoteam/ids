import { type ClassValue, clsx } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

const idsTextSizes = [
  'text-headline-h1-bold',
  'text-headline-h1-semibold',
  'text-headline-h1-medium',
  'text-headline-h2-bold',
  'text-headline-h2-semibold',
  'text-headline-h2-medium',
  'text-headline-h3-bold',
  'text-headline-h3-semibold',
  'text-headline-h3-medium',
  'text-headline-h4-bold',
  'text-headline-h4-semibold',
  'text-headline-h4-medium',
  'text-headline-h5-bold',
  'text-headline-h5-semibold',
  'text-headline-h5-medium',
  'text-headline-h6-bold',
  'text-headline-h6-semibold',
  'text-headline-h6-medium',
  'text-subtitle-s1-bold',
  'text-subtitle-s1-semibold',
  'text-subtitle-s1-medium',
  'text-subtitle-s2-bold',
  'text-subtitle-s2-semibold',
  'text-subtitle-s2-medium',
  'text-body-b1-bold',
  'text-body-b1-semibold',
  'text-body-b1-medium',
  'text-body-b1-regular',
  'text-body-b2-bold',
  'text-body-b2-semibold',
  'text-body-b2-medium',
  'text-body-b2-regular',
  'text-body-b3-bold',
  'text-body-b3-semibold',
  'text-body-b3-medium',
  'text-body-b3-regular',
  'text-caption-c1-semibold',
  'text-caption-c1-medium',
  'text-caption-c1-regular',
  'text-caption-c2-semibold',
  'text-caption-c2-medium',
  'text-caption-c2-regular',
  'text-button-standard',
  'text-button-tiny',
] as const;

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
