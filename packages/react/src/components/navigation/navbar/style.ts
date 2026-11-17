import { tv } from '../../../utils';

export const navbarStyle = tv({
  slots: {
    root: 'flex w-full min-w-0 flex-col bg-surface text-on-surface',
    bar: 'flex min-h-14 min-w-0 items-center gap-4 px-4 sm:px-6',
    start: 'flex min-w-0 shrink-0 items-center gap-2',
    end: 'ms-auto flex min-w-0 shrink-0 items-center gap-2',
    menuTrigger: 'sm:hidden',
    nav: 'min-w-0 max-sm:hidden',
    list: 'flex min-w-0 items-center gap-0.5',
    listItem: 'flex',
    link: [
      'inline-flex h-8 items-center rounded-standard px-3 whitespace-nowrap',
      'text-body-b3-medium text-neutral transition-[color,background-color]',
      'hover:bg-neutral-soft active:bg-neutral-soft-hover',
      'aria-[current=page]:bg-neutral-soft aria-[current=page]:text-on-surface',
      'aria-[current=page]:hover:bg-neutral-soft-hover aria-[current=page]:active:bg-neutral-soft-active',
    ],
    drawer: [
      'w-[min(--spacing(64),calc(100%-var(--spacing)*16))]',
      '[&>[data-scroll-area-viewport]]:gap-0 [&>[data-scroll-area-viewport]]:p-0',
    ],
    drawerHeader: 'flex items-center justify-end px-2 pt-3 pb-1',
    drawerNav: 'flex min-w-0 grow flex-col p-2',
    drawerList: 'flex min-w-0 flex-col gap-0.5',
    drawerItem: 'min-h-10 concentric-p-0 px-3',
    drawerTitle: 'text-body-b2-medium',
  },
  variants: {
    sticky: { true: { root: 'sticky top-0 z-30' }, false: {} },
  },
  defaultVariants: { sticky: false },
});
