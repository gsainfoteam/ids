import { cn } from '../utils';

export const dragSurface = {
  dropLine: cn(
    'pointer-events-none absolute z-10 h-0.5 -translate-y-1/2 rounded-full bg-primary-solid',
    'before:absolute before:-start-1 before:top-1/2 before:size-1.5 before:-translate-y-1/2 before:rounded-full before:border-[1.5px] before:border-primary-strong before:bg-(--ids-bg-current)',
  ),
  preview: cn('cursor-grabbing bg-base opacity-75 shadow-lg'),
};

export function swallowTheClickThatEndsADrag() {
  const swallow = (event: MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
  };
  window.addEventListener('click', swallow, { capture: true, once: true });
  setTimeout(() => window.removeEventListener('click', swallow, { capture: true }));
}
