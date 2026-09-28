import {
  createContext,
  use,
  useEffect,
  useLayoutEffect,
  useState,
  type ComponentProps,
  type MouseEvent,
  type ReactNode,
} from 'react';

import { XMarkIcon } from '@heroicons/react/16/solid';

import {
  DEFAULT_PLACEMENT,
  usePopover,
  type PopoverAnchor,
  type PopoverTriggerType,
} from './use-popover';
import { messages } from '../../../internal/messages';
import {
  FloatingArrow,
  ModalLayer,
  OverlayItemContext,
  type AnchoredAlign,
  type AnchoredSide,
} from '../../../internal/overlay';
import { invariant, mergeProps, part, tv } from '../../../utils';
import { Button } from '../../action/button';
import { IconButton } from '../../action/icon-button';
import { Slot } from '../../utility/slot';

type Context = {
  popover: ReturnType<typeof usePopover>;
  titled: boolean;
  setTitled: (titled: boolean) => void;
  described: boolean;
  setDescribed: (described: boolean) => void;
  styles: ReturnType<typeof Popover.Style>;
};

const PopoverContext = createContext<Context | null>(null);

function usePopoverContext(part: string) {
  const context = use(PopoverContext);
  invariant(context, `${part} must be rendered inside Popover.`);
  return context;
}

export function Popover({
  open,
  defaultOpen = false,
  onOpenChange,
  onOpenChangeComplete,
  modal = false,
  triggerType = 'click',
  openDelay = 200,
  closeDelay = 100,
  children,
}: Popover.Props) {
  const popover = usePopover({
    open,
    defaultOpen,
    onOpenChange,
    onOpenChangeComplete,
    modal,
    triggerType,
    openDelay,
    closeDelay,
  });

  const [titled, setTitled] = useState(false);
  const [described, setDescribed] = useState(false);

  return (
    <PopoverContext
      value={{
        popover,
        titled,
        setTitled,
        described,
        setDescribed,
        styles: Popover.Style(),
      }}
    >
      {children}
    </PopoverContext>
  );
}

type PopupProps = Omit<
  Popover.Content.Props,
  'side' | 'align' | 'sideOffset' | 'alignOffset' | 'anchor' | 'initialFocus'
>;

function PopoverPopup({ className, style, children, ...props }: PopupProps) {
  const c = usePopoverContext('Popover.Content');
  const { popover, styles } = c;
  const { ids, anchored, open, ending, modal } = popover;

  const labelledBy =
    props['aria-labelledby'] ??
    (props['aria-label'] === undefined && c.titled ? ids.title : undefined);

  return (
    <ModalLayer
      open={modal && open}
      layer={popover.layer}
      element={popover.content}
      contentRef={popover.setContent}
      context={anchored.context}
      backdrop={
        modal && {
          ref: popover.setBackdrop,
          'data-popover-backdrop': '',
          className: styles.backdrop(),
        }
      }
      onBackdropClick={() => popover.setOpen(false)}
    >
      <div
        {...props}
        popover="manual"
        id={ids.content}
        role="dialog"
        aria-modal={modal || undefined}
        aria-labelledby={labelledBy}
        aria-describedby={props['aria-describedby'] ?? (c.described ? ids.description : undefined)}
        tabIndex={-1}
        data-popover-content=""
        data-open={open ? '' : undefined}
        data-ending-style={ending ? '' : undefined}
        data-side={anchored.side}
        data-align={anchored.align}
        className={styles.content({ className })}
        style={{ ...style, ...anchored.floatingStyles }}
      >
        <OverlayItemContext value={null}>{children}</OverlayItemContext>
      </div>
    </ModalLayer>
  );
}

export namespace Popover {
  export type Side = AnchoredSide;
  export type Align = AnchoredAlign;
  export type TriggerType = PopoverTriggerType;
  export type Anchor = PopoverAnchor;

  export type Props = {
    open?: boolean;
    defaultOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
    onOpenChangeComplete?: (open: boolean) => void;
    modal?: boolean;
    triggerType?: TriggerType;
    openDelay?: number;
    closeDelay?: number;
    children?: ReactNode;
  };

  type PartProps<T extends 'h2' | 'p'> = ComponentProps<T> & { asChild?: boolean };

  export function Trigger({ asChild, children, ...props }: Trigger.Props) {
    const { popover } = usePopoverContext('Popover.Trigger');

    return part(
      'button',
      asChild,
      children,
      mergeProps(mergeProps(props, popover.getReferenceProps()), {
        ref: popover.setTrigger,
        type: asChild ? undefined : 'button',
        'aria-haspopup': 'dialog',
        'aria-expanded': popover.open,
        'aria-controls': popover.open ? popover.ids.content : undefined,
        'data-popup-open': popover.open ? '' : undefined,
        onClick: (event: MouseEvent<HTMLElement>) => popover.requestFromTrigger(event.nativeEvent),
      }),
    );
  }
  export namespace Trigger {
    export type Props = ComponentProps<'button'> & { asChild?: boolean };
  }

  export function Content({
    side = DEFAULT_PLACEMENT.side,
    align = DEFAULT_PLACEMENT.align,
    sideOffset = DEFAULT_PLACEMENT.sideOffset,
    alignOffset = DEFAULT_PLACEMENT.alignOffset,
    anchor,
    initialFocus,
    ...props
  }: Content.Props) {
    const { popover } = usePopoverContext('Popover.Content');
    const { setPlacement, mountContent } = popover;
    const anchored = anchor !== undefined;

    useLayoutEffect(() => {
      setPlacement({ side, align, sideOffset, alignOffset, anchor, initialFocus });
    }, [setPlacement, side, align, sideOffset, alignOffset, anchor, initialFocus]);

    useEffect(() => mountContent(anchored), [mountContent, anchored]);

    if (!popover.mounted) return null;

    return <PopoverPopup {...props} />;
  }
  export namespace Content {
    export type Props = ComponentProps<'div'> & {
      side?: Side;
      align?: Align;
      sideOffset?: number;
      alignOffset?: number;
      anchor?: Anchor;
      initialFocus?: string;
    };
  }

  export function Arrow(props: Arrow.Props) {
    const { setArrow, anchored } = usePopoverContext('Popover.Arrow').popover;

    return (
      <FloatingArrow
        width={14}
        height={7}
        fill="var(--ids-color-surface)"
        stroke="var(--ids-color-border)"
        strokeWidth={1}
        {...props}
        ref={setArrow}
        context={anchored.context}
        data-popover-arrow=""
      />
    );
  }
  export namespace Arrow {
    export type Props = Omit<ComponentProps<'svg'>, 'ref' | 'width' | 'height' | 'strokeWidth'> & {
      width?: number;
      height?: number;
      strokeWidth?: number;
      tipRadius?: number;
    };
  }

  export function Title({ asChild, className, ...props }: Title.Props) {
    const { styles, popover, setTitled } = usePopoverContext('Popover.Title');

    useLayoutEffect(() => {
      setTitled(true);
      return () => setTitled(false);
    }, [setTitled]);

    const Root = asChild ? Slot : 'h2';

    return (
      <Root
        id={popover.ids.title}
        {...props}
        data-popover-title=""
        className={styles.title({ className })}
      />
    );
  }
  export namespace Title {
    export type Props = PartProps<'h2'>;
  }

  export function Description({ asChild, className, ...props }: Description.Props) {
    const { styles, popover, setDescribed } = usePopoverContext('Popover.Description');

    useLayoutEffect(() => {
      setDescribed(true);
      return () => setDescribed(false);
    }, [setDescribed]);

    const Root = asChild ? Slot : 'p';

    return (
      <Root
        id={popover.ids.description}
        {...props}
        data-popover-description=""
        className={styles.description({ className })}
      />
    );
  }
  export namespace Description {
    export type Props = PartProps<'p'>;
  }

  export function Close({ asChild, children, onClick, ...props }: Close.Props) {
    const { popover } = usePopoverContext('Popover.Close');

    const close = (event: MouseEvent<HTMLButtonElement>) => {
      onClick?.(event);
      if (!event.defaultPrevented) popover.setOpen(false);
    };

    if (asChild)
      return part('button', true, children, { ...props, onClick: close, 'data-popover-close': '' });
    if (children == null)
      return (
        <IconButton
          aria-label={messages.popover.close}
          {...props}
          variant="ghost"
          size="tiny"
          icon={<XMarkIcon />}
          onClick={close}
          data-popover-close=""
        />
      );
    return (
      <Button variant="outline" {...props} onClick={close} data-popover-close="">
        {children}
      </Button>
    );
  }
  export namespace Close {
    export type Props = Omit<ComponentProps<'button'>, 'type'> & { asChild?: boolean };
  }

  export const Style = tv({
    slots: {
      backdrop:
        'fixed inset-0 z-50 m-0 size-full max-h-none max-w-none border-0 bg-transparent p-0',
      content: [
        'fixed z-50 m-0 flex w-72 max-w-[calc(100vw-1rem)] flex-col gap-2 overflow-visible concentric-p-3 outline-none',
        'border border-(--ids-color-border) bg-(--ids-color-surface) text-(--ids-color-on-surface)',
        'text-body-b3-regular shadow-md',
        'transition-[opacity,scale] duration-(--ids-motion-fast) ease-out',
        'starting:scale-95 starting:opacity-0 data-ending-style:scale-95 data-ending-style:opacity-0',
        'data-[side=bottom]:origin-top data-[side=left]:origin-right data-[side=right]:origin-left data-[side=top]:origin-bottom',
        'motion-reduce:transition-none',
      ],
      title: 'text-body-b3-semibold [overflow-wrap:anywhere]',
      description: 'text-body-b3-regular text-(--ids-color-on-muted)',
    },
  });
}
