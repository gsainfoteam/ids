import { cn } from '../../utils/cn';

const borderOptionsCannotCover = cn('border border-(--ids-color-border)');
const cornerOfThePaddedViewport = cn('concentric-p-1 p-0');

export const overlayStyles = {
  popup: cn(
    'fixed z-50 m-0 flex flex-col outline-none',
    cornerOfThePaddedViewport,
    borderOptionsCannotCover,
    'bg-(--ids-color-surface) text-(--ids-color-on-surface)',
    'text-body-b3-regular shadow-md',
  ),
  backdrop: cn(
    'fixed inset-0 z-50 m-0 size-full max-h-none max-w-none border-0 p-0',
    'bg-black/50 transition-opacity starting:opacity-0 data-ending-style:opacity-0',
    'motion-reduce:transition-none',
  ),
} as const;
