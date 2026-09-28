import {
  createContext,
  isValidElement,
  use,
  useEffect,
  useLayoutEffect,
  useState,
  type ComponentProps,
  type MouseEvent,
  type ReactElement,
  type ReactNode,
} from 'react';

import { XMarkIcon } from '@heroicons/react/16/solid';

import { useDialog } from './use-dialog';
import { messages } from '../../../internal/messages';
import { ModalLayer, OverlayItemContext } from '../../../internal/overlay';
import { cn, flattenFragments, invariant, mergeProps, part, tv } from '../../../utils';
import { isDevelopment } from '../../../utils/dev';
import { Button } from '../../action/button';
import { IconButton } from '../../action/icon-button';
import { ScrollArea } from '../../layout/scroll-area';
import { Slot } from '../../utility/slot';

const cornerOfThePaddedViewport = cn('concentric-p-6 p-0');

type Context = {
  dialog: ReturnType<typeof useDialog>;
  role: Dialog.Role;
  dismissible: boolean;
  hideClose: boolean;
  overlay: Dialog.Overlay.Props | undefined;
  titled: boolean;
  setTitled: (titled: boolean) => void;
  described: boolean;
  setDescribed: (described: boolean) => void;
  styles: ReturnType<typeof Dialog.Style>;
};

const DialogContext = createContext<Context | null>(null);

function useDialogContext(part: string) {
  const context = use(DialogContext);
  invariant(context, `${part} must be rendered inside Dialog.`);
  return context;
}

const isOverlay = (node: ReactNode): node is ReactElement<Dialog.Overlay.Props> =>
  isValidElement(node) && node.type === Dialog.Overlay;

export function Dialog({
  open,
  defaultOpen = false,
  onOpenChange,
  onOpenChangeComplete,
  dismissible = true,
  role = 'dialog',
  hideClose = false,
  children,
}: Dialog.Props) {
  const dialog = useDialog({ open, defaultOpen, onOpenChange, onOpenChangeComplete, dismissible });

  const [titled, setTitled] = useState(false);
  const [described, setDescribed] = useState(false);

  const parts = flattenFragments(children);
  const overlay = parts.find(isOverlay);

  return (
    <DialogContext
      value={{
        dialog,
        role,
        dismissible,
        hideClose,
        overlay: overlay?.props,
        titled,
        setTitled,
        described,
        setDescribed,
        styles: Dialog.Style(),
      }}
    >
      {parts.filter((node) => node !== overlay)}
    </DialogContext>
  );
}

function DialogPopup({ className, style, children, ...props }: Dialog.Content.Props) {
  const c = useDialogContext('Dialog.Content');
  const { dialog, styles, overlay } = c;
  const { ids, position, ending, open, content } = dialog;

  useEffect(() => {
    if (!isDevelopment || !content) return;

    const named =
      content.hasAttribute('aria-label') ||
      !!props['aria-labelledby'] ||
      !!content.querySelector('[data-dialog-title]');

    if (!named)
      console.warn(
        '[IDS] Dialog: add Dialog.Title, or aria-label on Dialog.Content, so screen readers can name the dialog.',
      );
  }, [content, props]);

  const labelledBy =
    props['aria-labelledby'] ??
    (props['aria-label'] === undefined && c.titled ? ids.title : undefined);

  return (
    <ModalLayer
      open={open}
      layer={dialog.layer}
      element={content}
      contentRef={dialog.setContent}
      backdrop={{
        ...overlay,
        ref: dialog.setBackdrop,
        'data-dialog-backdrop': '',
        'data-stacked': position.modalsBelow > 0 ? '' : undefined,
        'data-ending-style': ending ? '' : undefined,
        className: styles.backdrop({ className: overlay?.className }),
      }}
      onBackdropClick={() => {
        if (c.dismissible) dialog.setOpen(false);
      }}
    >
      <ScrollArea asChild>
        <div
          {...props}
          popover="manual"
          id={ids.content}
          role={c.role}
          aria-modal="true"
          aria-labelledby={labelledBy}
          aria-describedby={
            props['aria-describedby'] ?? (c.described ? ids.description : undefined)
          }
          tabIndex={-1}
          data-dialog-content=""
          data-open={open ? '' : undefined}
          data-ending-style={ending ? '' : undefined}
          data-nested-open={position.covered ? '' : undefined}
          className={styles.content({ className })}
          style={style}
        >
          <ScrollArea.Viewport className={styles.viewport()}>
            <OverlayItemContext value={null}>
              {children}
              {!c.hideClose && <Dialog.Close className={styles.close()} />}
            </OverlayItemContext>
          </ScrollArea.Viewport>
        </div>
      </ScrollArea>
    </ModalLayer>
  );
}

export namespace Dialog {
  export type Role = 'dialog' | 'alertdialog';

  export type Props = {
    open?: boolean;
    defaultOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
    onOpenChangeComplete?: (open: boolean) => void;
    dismissible?: boolean;
    role?: Role;
    hideClose?: boolean;
    children?: ReactNode;
  };

  type PartProps<T extends 'div' | 'h2' | 'p'> = ComponentProps<T> & { asChild?: boolean };

  export function Trigger({ asChild, children, ...props }: Trigger.Props) {
    const { dialog } = useDialogContext('Dialog.Trigger');

    return part(
      'button',
      asChild,
      children,
      mergeProps(props, {
        ref: dialog.setTrigger,
        type: asChild ? undefined : 'button',
        'aria-haspopup': 'dialog',
        'aria-expanded': dialog.open,
        'aria-controls': dialog.open ? dialog.ids.content : undefined,
        'data-popup-open': dialog.open ? '' : undefined,
        onClick: () => dialog.setOpen(!dialog.open),
      }),
    );
  }
  export namespace Trigger {
    export type Props = ComponentProps<'button'> & { asChild?: boolean };
  }

  export function Overlay(_props: Overlay.Props) {
    useDialogContext('Dialog.Overlay');
    return null;
  }
  export namespace Overlay {
    export type Props = Omit<ComponentProps<'div'>, 'children'>;
  }

  export function Content(props: Content.Props) {
    const { dialog } = useDialogContext('Dialog.Content');

    if (!dialog.mounted) return null;
    return <DialogPopup {...props} />;
  }
  export namespace Content {
    export type Props = ComponentProps<'div'>;
  }

  export function Header({ asChild, className, ...props }: Header.Props) {
    const { styles } = useDialogContext('Dialog.Header');
    const Root = asChild ? Slot : 'div';

    return <Root {...props} data-dialog-header="" className={styles.header({ className })} />;
  }
  export namespace Header {
    export type Props = PartProps<'div'>;
  }

  export function Title({ asChild, className, ...props }: Title.Props) {
    const { styles, dialog, setTitled } = useDialogContext('Dialog.Title');

    useLayoutEffect(() => {
      setTitled(true);
      return () => setTitled(false);
    }, [setTitled]);

    const Root = asChild ? Slot : 'h2';

    return (
      <Root
        id={dialog.ids.title}
        {...props}
        data-dialog-title=""
        className={styles.title({ className })}
      />
    );
  }
  export namespace Title {
    export type Props = PartProps<'h2'>;
  }

  export function Description({ asChild, className, ...props }: Description.Props) {
    const { styles, dialog, setDescribed } = useDialogContext('Dialog.Description');

    useLayoutEffect(() => {
      setDescribed(true);
      return () => setDescribed(false);
    }, [setDescribed]);

    const Root = asChild ? Slot : 'p';

    return (
      <Root
        id={dialog.ids.description}
        {...props}
        data-dialog-description=""
        className={styles.description({ className })}
      />
    );
  }
  export namespace Description {
    export type Props = PartProps<'p'>;
  }

  export function Footer({ asChild, className, ...props }: Footer.Props) {
    const { styles } = useDialogContext('Dialog.Footer');
    const Root = asChild ? Slot : 'div';

    return <Root {...props} data-dialog-footer="" className={styles.footer({ className })} />;
  }
  export namespace Footer {
    export type Props = PartProps<'div'>;
  }

  export function Close({ asChild, children, onClick, ...props }: Close.Props) {
    const { dialog } = useDialogContext('Dialog.Close');

    const close = (event: MouseEvent<HTMLButtonElement>) => {
      onClick?.(event);
      if (!event.defaultPrevented) dialog.setOpen(false);
    };

    if (asChild)
      return part('button', true, children, { ...props, onClick: close, 'data-dialog-close': '' });
    if (children == null)
      return (
        <IconButton
          aria-label={messages.dialog.close}
          {...props}
          variant="ghost"
          size="tiny"
          icon={<XMarkIcon />}
          onClick={close}
          data-dialog-close=""
        />
      );
    return (
      <Button variant="outline" {...props} onClick={close} data-dialog-close="">
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
        'fixed inset-0 z-50 m-0 size-full max-h-none max-w-none border-0 p-0',
        'bg-black/50 transition-opacity duration-(--ids-motion-normal) ease-out',
        'starting:opacity-0 data-ending-style:opacity-0 data-stacked:bg-transparent',
        'motion-reduce:transition-none',
      ],
      content: [
        'fixed inset-0 z-50 m-auto flex h-fit max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-sm flex-col outline-none',
        cornerOfThePaddedViewport,
        'border border-(--ids-color-border) bg-(--ids-color-surface) text-(--ids-color-on-surface) shadow-lg',
        'transition-[opacity,scale] duration-(--ids-motion-normal) ease-out',
        'starting:scale-95 starting:opacity-0 data-ending-style:scale-95 data-ending-style:opacity-0',
        'data-nested-open:scale-[0.96] motion-reduce:transition-none',
      ],
      viewport: 'relative flex flex-col gap-4 overscroll-contain p-6',
      header: 'flex flex-col gap-1.5 pe-8 text-start',
      title: 'text-subtitle-s1-semibold [overflow-wrap:anywhere]',
      description: 'text-body-b3-regular text-(--ids-color-on-muted)',
      footer: 'flex flex-col-reverse gap-2 sm:flex-row sm:justify-end',
      close: 'absolute end-4 top-4',
    },
  });
}
