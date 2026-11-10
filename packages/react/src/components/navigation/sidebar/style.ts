import { tv } from '../../../utils';

export type SidebarVariant = 'sidebar' | 'floating' | 'inset';
export type SidebarCollapsibleMode = 'icon' | 'offcanvas';
export type SidebarPanelState = 'expanded' | 'rail' | 'hidden';
export type SidebarIconColorScheme =
  | 'neutral'
  | 'primary'
  | 'info'
  | 'success'
  | 'warning'
  | 'danger';

export const sidebarStyle = tv({
  slots: {
    root: [
      'group/sidebar sticky top-0 flex h-dvh shrink-0 self-start text-(--ids-color-on-surface)',
      '[--sidebar-width:15rem]',
    ],
    mobileBar: 'flex flex-col p-2 sm:hidden',
    panel: [
      'flex min-h-0 w-(--sidebar-width) flex-col overflow-hidden max-sm:hidden',
      'transition-[width] duration-(--ids-motion-normal) ease-out motion-reduce:transition-none',
    ],
    divider: 'max-sm:hidden',
    header: 'flex min-w-0 items-center gap-2 py-2 ps-4 pe-2 pt-3',
    footer: 'flex min-w-0 flex-col gap-2 p-2',
    scroll: 'min-h-0 flex-1',
    nav: 'flex min-w-0 flex-col gap-4 p-2',
    drawer: [
      'w-[min(16rem,calc(100%-4rem))]',
      '[&>[data-scroll-area-viewport]]:gap-0 [&>[data-scroll-area-viewport]]:p-0',
    ],
    drawerNav: 'flex min-w-0 grow flex-col gap-4 p-2',
    group: 'flex min-w-0 flex-col gap-0.5',
    groupLabel: [
      'flex h-6 items-center overflow-hidden px-2 text-caption-c1-medium text-(--ids-color-on-muted)',
      'transition-[height,opacity] duration-(--ids-motion-normal) ease-out motion-reduce:transition-none',
    ],
    groupTrigger:
      'min-h-6 items-center px-2 py-0 text-caption-c1-medium text-(--ids-color-on-muted)',
    list: 'flex min-w-0 flex-col gap-px',
    listItem: 'flex min-w-0 flex-col',
    subTree: 'ms-[15.5px] flex min-w-0 pt-0.5',
    subList: 'flex min-w-0 flex-1 flex-col gap-px ps-[7.5px]',
    item: 'min-h-8 concentric-p-0 px-2',
    media: 'w-4 justify-center [&>svg]:stroke-2',
    icon: '',
    label: 'min-w-0',
    title: 'text-body-b3-medium',
    end: '',
    submenuTrigger: 'data-hovered:bg-transparent data-active:bg-transparent',
    dragFrame: [
      'relative w-full min-w-0 data-dragging:opacity-40',
      'data-[drop=inside]:[&>[data-sidebar-item]]:bg-(--ids-color-secondary) data-[drop=inside]:[&>[data-sidebar-item]]:text-(--ids-color-on-secondary)',
    ],
    dropLayer: 'relative',
    dropLine: [
      'pointer-events-none absolute z-10 h-0.5 -translate-y-1/2 rounded-full bg-(--ids-color-primary)',
      'before:absolute before:-start-1 before:top-1/2 before:size-1.5 before:-translate-y-1/2 before:rounded-full before:border-[1.5px] before:border-(--ids-color-primary) before:bg-(--ids-color-surface)',
    ],
    dragPreview: 'w-full cursor-grabbing bg-(--ids-color-surface) opacity-75 shadow-lg',
    inset: 'flex min-w-0 flex-1 flex-col',
    provider: 'group/sidebar-provider flex min-h-dvh w-full',
  },
  variants: {
    variant: {
      sidebar: {},
      floating: { root: 'p-2', panel: 'gap-0 rounded-container p-0' },
      inset: {},
    } satisfies Record<SidebarVariant, object>,
    state: {
      expanded: {},
      rail: {
        panel: 'w-12',
        header: 'flex-col px-2 [&>:not(:first-child,[data-sidebar-trigger])]:sr-only',
        groupLabel: 'h-0 opacity-0',
        label: 'sr-only',
        end: 'hidden',
      },
      hidden: { root: 'p-0', panel: 'w-0', divider: 'hidden' },
    } satisfies Record<SidebarPanelState, object>,
    standalone: { true: {}, false: { root: 'max-sm:hidden' } },
    iconColor: {
      neutral: {},
      primary: { icon: 'text-(--ids-color-accent)' },
      info: { icon: 'text-(--ids-color-info-strong)' },
      success: { icon: 'text-(--ids-color-success-strong)' },
      warning: { icon: 'text-(--ids-color-warning-strong)' },
      danger: { icon: 'text-(--ids-color-danger-strong)' },
    } satisfies Record<SidebarIconColorScheme, object>,
    touch: {
      true: {
        header: 'gap-3 ps-5 pt-4',
        group: 'gap-1',
        groupLabel: 'h-8 px-3',
        groupTrigger: 'min-h-8 px-3',
        list: 'gap-0.5',
        subTree: 'ms-[21.5px]',
        subList: 'ps-[9.5px]',
        item: 'min-h-10 gap-3 px-3',
        media: 'w-5 [--ids-size-icon-standard:1.25rem]',
        title: 'text-body-b2-medium',
      },
      false: {},
    },
    card: {
      true: {
        inset: [
          'm-2 gap-0 overflow-hidden p-0',
          'sm:group-has-[[data-sidebar-variant=inset]:not([data-collapsible=offcanvas][data-collapsed])]/sidebar-provider:ms-0',
        ],
      },
      false: {},
    },
  },
  defaultVariants: {
    variant: 'sidebar',
    state: 'expanded',
    standalone: true,
    touch: false,
    card: false,
  },
});
