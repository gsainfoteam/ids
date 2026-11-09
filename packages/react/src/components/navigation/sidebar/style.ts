import { tv } from '../../../utils';

export type SidebarVariant = 'sidebar' | 'floating' | 'inset';
export type SidebarCollapsibleMode = 'icon' | 'offcanvas';
export type SidebarPanelState = 'expanded' | 'rail' | 'hidden';

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
    header: 'flex min-w-0 items-center gap-2 p-2 pt-3',
    footer: 'flex min-w-0 flex-col gap-2 p-2',
    scroll: 'min-h-0 flex-1',
    nav: 'flex min-w-0 flex-col gap-4 p-2',
    drawer: 'flex min-w-0 flex-col gap-4',
    group: 'flex min-w-0 flex-col gap-1',
    groupLabel: 'flex min-h-8 items-center px-2 text-caption-c1-medium text-(--ids-color-on-muted)',
    groupTrigger:
      'min-h-8 items-center px-2 py-0 text-caption-c1-medium text-(--ids-color-on-muted)',
    list: 'flex min-w-0 flex-col gap-px',
    listItem: 'flex min-w-0 flex-col',
    subTree: 'ms-4.5 flex min-w-0 pt-0.5',
    subList: 'flex min-w-0 flex-1 flex-col gap-px ps-2',
    item: 'concentric-p-0 px-2',
    label: 'min-w-0',
    title: 'text-body-b3-medium',
    end: '',
    submenuTrigger: 'data-hovered:bg-transparent data-active:bg-transparent',
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
        header: 'flex-col',
        groupLabel: 'sr-only',
        item: 'justify-center',
        label: 'sr-only',
        end: 'hidden',
      },
      hidden: { root: 'p-0', panel: 'w-0', divider: 'hidden' },
    } satisfies Record<SidebarPanelState, object>,
    standalone: { true: {}, false: { root: 'max-sm:hidden' } },
    inDrawer: { true: { header: 'min-h-8 pe-10' }, false: {} },
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
    inDrawer: false,
    card: false,
  },
});
