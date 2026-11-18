import { cn } from '../../utils/cn';

const borderOptionsCannotCover = cn('border border-neutral');
const cornerOfThePaddedViewport = cn('concentric-p-1 p-0');

export const overlayStyles = {
  popup: cn(
    'fixed z-50 m-0 flex flex-col outline-none',
    cornerOfThePaddedViewport,
    borderOptionsCannotCover,
    'bg-panel text-neutral-bold',
    'text-body-b3-regular shadow-md',
  ),
  backdrop: cn(
    'fixed inset-0 z-50 m-0 size-full max-h-none max-w-none border-0 p-0',
    'bg-black/40 backdrop-blur-xs data-stacked:bg-transparent data-stacked:backdrop-blur-none',
    'transition-opacity starting:opacity-0 data-ending-style:opacity-0',
    'motion-reduce:transition-none',
  ),
} as const;
