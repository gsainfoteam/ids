import {
  createContext,
  isValidElement,
  use,
  useCallback,
  useEffect,
  useLayoutEffect,
  useState,
  type ComponentProps,
  type MouseEvent,
  type ReactElement,
  type ReactNode,
} from 'react';

import { XMarkIcon } from '@heroicons/react/16/solid';

import { useDrawer } from './use-drawer';
import { messages } from '../../../internal/messages';
import { ModalLayer, OverlayItemContext } from '../../../internal/overlay';
import {
  cn,
  flattenFragments,
  invariant,
  mergeEventHandlers,
  mergeProps,
  mergeRefs,
  part,
  tv,
} from '../../../utils';
import { isDevelopment } from '../../../utils/dev';
import { Button } from '../../action/button';
import { IconButton } from '../../action/icon-button';
import { ScrollArea } from '../../layout/scroll-area';
import { Slot } from '../../utility/slot';

import type { DrawerSide, SnapPoint as DrawerSnapPoint } from './drawer-gesture';

const cornerOfThePaddedViewport = cn('concentric-p-6 p-0');

type Context = {
  drawer: ReturnType<typeof useDrawer>;
  role: Drawer.Role;
  side: Drawer.Side;
  modal: boolean;
  dismissible: boolean;
  hideClose: boolean;
  overlay: Drawer.Overlay.Props | undefined;
  titled: boolean;
  setTitled: (titled: boolean) => void;
  described: boolean;
  setDescribed: (described: boolean) => void;
  styles: ReturnType<typeof Drawer.Style>;
};

const DrawerContext = createContext<Context | null>(null);

function useDrawerContext(part: string) {
  const context = use(DrawerContext);
  invariant(context, `${part} must be rendered inside Drawer.`);
  return context;
}

const isOverlay = (node: ReactNode): node is ReactElement<Drawer.Overlay.Props> =>
  isValidElement(node) && node.type === Drawer.Overlay;

export function Drawer({
  open,
  defaultOpen = false,
  onOpenChange,
  onOpenChangeComplete,
  dismissible = true,
  role = 'dialog',
  hideClose = false,
  side = 'right',
  modal = true,
  scaleBackground = true,
  snapPoints,
  activeSnapPoint,
  defaultActiveSnapPoint,
  onActiveSnapPointChange,
  fadeFromIndex,
  children,
}: Drawer.Props) {
  const drawer = useDrawer({
    open,
    defaultOpen,
    onOpenChange,
    onOpenChangeComplete,
    dismissible,
    side,
    modal,
    scaleBackground,
    snapPoints,
    activeSnapPoint,
    defaultActiveSnapPoint,
    onActiveSnapPointChange,
    fadeFromIndex,
  });

  const [titled, setTitled] = useState(false);
  const [described, setDescribed] = useState(false);

  const parts = flattenFragments(children);
  const overlay = parts.find(isOverlay);

  return (
    <DrawerContext
      value={{
        drawer,
        role,
        side,
        modal,
        dismissible,
        hideClose,
        overlay: overlay?.props,
        titled,
        setTitled,
        described,
        setDescribed,
        styles: Drawer.Style({ side, snapping: !!snapPoints && snapPoints.length > 0 }),
      }}
    >
      {parts.filter((node) => node !== overlay)}
    </DrawerContext>
  );
}

function DrawerPopup({
  className,
  style,
  ref,
  onPointerDown,
  children,
  ...props
}: Drawer.Content.Props) {
  const c = useDrawerContext('Drawer.Content');
  const { drawer, styles, overlay } = c;
  const { ids, position, ending, open, content } = drawer;

  useEffect(() => {
    if (!isDevelopment || !content) return;

    const named =
      content.hasAttribute('aria-label') ||
      !!props['aria-labelledby'] ||
      !!content.querySelector('[data-drawer-title]');

    if (!named)
      console.warn(
        '[IDS] Drawer: add Drawer.Title, or aria-label on Drawer.Content, so screen readers can name the drawer.',
      );
  }, [content, props]);

  const labelledBy =
    props['aria-labelledby'] ??
    (props['aria-label'] === undefined && c.titled ? ids.title : undefined);

  const { setContent } = drawer;
  const contentRef = useCallback(
    (node: HTMLDivElement | null) => mergeRefs(ref, setContent)(node),
    [ref, setContent],
  );

  const sheet = (
    <ScrollArea asChild>
      <div
        {...props}
        ref={c.modal ? undefined : contentRef}
        popover="manual"
        id={ids.content}
        role={c.role}
        aria-modal={c.modal ? 'true' : undefined}
        aria-labelledby={labelledBy}
        aria-describedby={props['aria-describedby'] ?? (c.described ? ids.description : undefined)}
        tabIndex={-1}
        data-drawer-content=""
        data-side={c.side}
        data-open={open ? '' : undefined}
        data-ending-style={ending ? '' : undefined}
        data-nested-open={position.covered ? '' : undefined}
        className={styles.content({ className })}
        style={style}
        onPointerDown={mergeEventHandlers(onPointerDown, drawer.drag.onPointerDown)}
      >
        <ScrollArea.Viewport className={styles.viewport()}>
          <OverlayItemContext value={null}>
            {children}
            {!c.hideClose && <Drawer.Close className={styles.close()} />}
          </OverlayItemContext>
        </ScrollArea.Viewport>
      </div>
    </ScrollArea>
  );

  if (!c.modal) return sheet;
  return (
    <ModalLayer
      open={open}
      layer={drawer.layer}
      element={content}
      contentRef={contentRef}
      backdrop={{
        ...overlay,
        ref: drawer.setBackdrop,
        'data-drawer-backdrop': '',
        'data-side': c.side,
        'data-stacked': position.modalsBelow > 0 ? '' : undefined,
        'data-ending-style': ending ? '' : undefined,
        className: styles.backdrop({ className: overlay?.className }),
      }}
      onBackdropClick={() => {
        if (c.dismissible) drawer.setOpen(false);
      }}
    >
      {sheet}
    </ModalLayer>
  );
}

export namespace Drawer {
  export type Role = 'dialog' | 'alertdialog';
  export type Side = DrawerSide;
  export type SnapPoint = DrawerSnapPoint;

  export type Props = {
    open?: boolean;
    defaultOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
    onOpenChangeComplete?: (open: boolean) => void;
    dismissible?: boolean;
    role?: Role;
    hideClose?: boolean;
    side?: Side;
    modal?: boolean;
    scaleBackground?: boolean;
    snapPoints?: readonly SnapPoint[];
    activeSnapPoint?: SnapPoint;
    defaultActiveSnapPoint?: SnapPoint;
    onActiveSnapPointChange?: (snapPoint: SnapPoint) => void;
    fadeFromIndex?: number;
    children?: ReactNode;
  };

  type PartProps<T extends 'div' | 'h2' | 'p'> = ComponentProps<T> & { asChild?: boolean };

  export function Trigger({ asChild, children, ...props }: Trigger.Props) {
    const { drawer } = useDrawerContext('Drawer.Trigger');

    return part(
      'button',
      asChild,
      children,
      mergeProps(props, {
        ref: drawer.setTrigger,
        type: asChild ? undefined : 'button',
        'aria-haspopup': 'dialog',
        'aria-expanded': drawer.open,
        'aria-controls': drawer.open ? drawer.ids.content : undefined,
        'data-popup-open': drawer.open ? '' : undefined,
        onClick: () => drawer.setOpen(!drawer.open),
      }),
    );
  }
  export namespace Trigger {
    export type Props = ComponentProps<'button'> & { asChild?: boolean };
  }

  export function Overlay(_props: Overlay.Props) {
    useDrawerContext('Drawer.Overlay');
    return null;
  }
  export namespace Overlay {
    export type Props = Omit<ComponentProps<'div'>, 'children'>;
  }

  export function Content(props: Content.Props) {
    const { drawer } = useDrawerContext('Drawer.Content');
    if (!drawer.mounted) return null;
    return <DrawerPopup {...props} />;
  }
  export namespace Content {
    export type Props = ComponentProps<'div'>;
  }

  export function Handle({ className, onClick, ...props }: Handle.Props) {
    const { drawer, styles } = useDrawerContext('Drawer.Handle');

    if (!drawer.drag.cycles)
      return (
        <div
          {...(props as ComponentProps<'div'>)}
          aria-hidden="true"
          data-drawer-handle=""
          className={styles.handle({ className })}
        />
      );

    return (
      <button
        type="button"
        aria-label={messages.drawer.handle}
        aria-controls={drawer.ids.content}
        {...props}
        data-drawer-handle=""
        className={styles.handle({ className })}
        onClick={(event) => {
          onClick?.(event);
          if (!event.defaultPrevented) drawer.drag.cycleSnapPoint();
        }}
      />
    );
  }
  export namespace Handle {
    export type Props = Omit<ComponentProps<'button'>, 'type' | 'children'>;
  }

  export function Header({ asChild, className, ...props }: Header.Props) {
    const { styles } = useDrawerContext('Drawer.Header');
    const Root = asChild ? Slot : 'div';
    return <Root {...props} data-drawer-header="" className={styles.header({ className })} />;
  }
  export namespace Header {
    export type Props = PartProps<'div'>;
  }

  export function Title({ asChild, className, ...props }: Title.Props) {
    const { styles, drawer, setTitled } = useDrawerContext('Drawer.Title');

    useLayoutEffect(() => {
      setTitled(true);
      return () => setTitled(false);
    }, [setTitled]);

    const Root = asChild ? Slot : 'h2';

    return (
      <Root
        id={drawer.ids.title}
        {...props}
        data-drawer-title=""
        className={styles.title({ className })}
      />
    );
  }
  export namespace Title {
    export type Props = PartProps<'h2'>;
  }

  export function Description({ asChild, className, ...props }: Description.Props) {
    const { styles, drawer, setDescribed } = useDrawerContext('Drawer.Description');

    useLayoutEffect(() => {
      setDescribed(true);
      return () => setDescribed(false);
    }, [setDescribed]);

    const Root = asChild ? Slot : 'p';

    return (
      <Root
        id={drawer.ids.description}
        {...props}
        data-drawer-description=""
        className={styles.description({ className })}
      />
    );
  }
  export namespace Description {
    export type Props = PartProps<'p'>;
  }

  export function Footer({ asChild, className, ...props }: Footer.Props) {
    const { styles } = useDrawerContext('Drawer.Footer');
    const Root = asChild ? Slot : 'div';
    return <Root {...props} data-drawer-footer="" className={styles.footer({ className })} />;
  }
  export namespace Footer {
    export type Props = PartProps<'div'>;
  }

  export function Close({ asChild, children, onClick, ...props }: Close.Props) {
    const { drawer } = useDrawerContext('Drawer.Close');

    const close = (event: MouseEvent<HTMLButtonElement>) => {
      onClick?.(event);
      if (!event.defaultPrevented) drawer.setOpen(false);
    };

    if (asChild)
      return part('button', true, children, { ...props, onClick: close, 'data-drawer-close': '' });
    if (children == null)
      return (
        <IconButton
          aria-label={messages.drawer.close}
          {...props}
          variant="ghost"
          size="tiny"
          icon={<XMarkIcon />}
          onClick={close}
          data-drawer-close=""
        />
      );
    return (
      <Button variant="outline" {...props} onClick={close} data-drawer-close="">
        {children}
      </Button>
    );
  }
  export namespace Close {
    export type Props = Omit<ComponentProps<'button'>, 'type'> & { asChild?: boolean };
  }

  export const Style = tv({
    slots: {
      backdrop: [
        'fixed inset-0 z-50 m-0 size-full max-h-none max-w-none touch-none border-0 p-0',
        'bg-black/50 opacity-[var(--drawer-fade,1)]',
        'transition-opacity duration-(--ids-motion-slow) ease-[cubic-bezier(0.32,0.72,0,1)]',
        'starting:opacity-0 data-ending-style:opacity-0 data-stacked:bg-transparent',
        'data-dragging:transition-none motion-reduce:transition-none',
      ],
      content: [
        'fixed z-50 m-0 flex flex-col outline-none',
        cornerOfThePaddedViewport,
        'border border-(--ids-color-border) bg-(--ids-color-surface) text-(--ids-color-on-surface) shadow-lg',
        'transition-[translate,transform,scale] duration-(--ids-motion-slow) ease-[cubic-bezier(0.32,0.72,0,1)]',
        'data-nested-open:scale-(--drawer-nested-scale)',
        'data-dragging:transition-none data-dragging:select-none motion-reduce:transition-none',
      ],
      viewport: 'relative flex flex-col gap-4 p-6',
      handle: [
        'relative shrink-0 cursor-grab touch-none rounded-full bg-(--ids-color-border) outline-none focus-ring',
        'before:absolute before:-inset-3',
      ],
      header: 'flex flex-col gap-1.5 pe-8 text-start',
      title: 'text-subtitle-s1-semibold [overflow-wrap:anywhere]',
      description: 'text-body-b3-regular text-(--ids-color-on-muted)',
      footer: 'mt-auto flex flex-col-reverse gap-2 sm:flex-row sm:justify-end',
      close: 'absolute end-4 top-4',
    },
    variants: {
      side: {
        bottom: {
          content: [
            'inset-x-0 top-auto bottom-0 h-fit max-h-[calc(100%-2rem)] w-full max-w-none',
            'data-[side=bottom]:rounded-b-none data-[side=bottom]:border-b-0',
            'starting:translate-y-full data-ending-style:translate-y-full data-nested-open:-translate-y-4',
          ],
          viewport: 'pb-[calc(--spacing(6)+env(safe-area-inset-bottom))]',
          handle: 'order-first mx-auto -mt-2 h-1.5 w-12',
        },
        top: {
          content: [
            'inset-x-0 top-0 bottom-auto h-fit max-h-[calc(100%-2rem)] w-full max-w-none',
            'data-[side=top]:rounded-t-none data-[side=top]:border-t-0',
            'starting:-translate-y-full data-ending-style:-translate-y-full data-nested-open:translate-y-4',
          ],
          viewport: 'pt-[calc(--spacing(6)+env(safe-area-inset-top))]',
          handle: 'order-last mx-auto -mb-2 h-1.5 w-12',
        },
        right: {
          content: [
            'inset-y-0 right-0 left-auto h-full max-h-none w-[min(24rem,calc(100%-2rem))]',
            'data-[side=right]:rounded-r-none data-[side=right]:border-r-0',
            'starting:translate-x-full data-ending-style:translate-x-full data-nested-open:-translate-x-4',
          ],
          handle: 'absolute top-1/2 left-2 h-12 w-1.5 -translate-y-1/2',
        },
        left: {
          content: [
            'inset-y-0 right-auto left-0 h-full max-h-none w-[min(24rem,calc(100%-2rem))]',
            'data-[side=left]:rounded-l-none data-[side=left]:border-l-0',
            'starting:-translate-x-full data-ending-style:-translate-x-full data-nested-open:translate-x-4',
          ],
          handle: 'absolute top-1/2 right-2 h-12 w-1.5 -translate-y-1/2',
        },
      },
      snapping: { true: {}, false: {} },
    },
    compoundVariants: [
      { side: ['top', 'bottom'], snapping: true, class: { content: 'h-[calc(100%-2rem)]' } },
      {
        side: ['left', 'right'],
        snapping: true,
        class: { content: 'w-[calc(100%-2rem)]' },
      },
    ],
    defaultVariants: { side: 'right', snapping: false },
  });
}
