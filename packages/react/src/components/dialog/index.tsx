import { createContext, useContext, useEffect, type ReactNode } from 'react';

import { cn } from '../../utils';

type DialogContextValue = {
  onOpenChange?: (open: boolean) => void;
};

const DialogContext = createContext<DialogContextValue | null>(null);

export function Dialog({
  open,
  onOpenChange,
  size = 'md',
  variant = 'centered',
  dismissible = true,
  role = 'dialog',
  children,
  className,
}: Dialog.Props) {
  useEffect(() => {
    if (!open || !dismissible) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onOpenChange?.(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [dismissible, onOpenChange, open]);

  if (!open) return null;

  return (
    <DialogContext.Provider value={{ onOpenChange }}>
      <div className="fixed inset-0 z-50 flex bg-black/50 p-4">
        {dismissible ? (
          <button
            type="button"
            aria-label="닫기"
            className="absolute inset-0 cursor-default"
            onClick={() => onOpenChange?.(false)}
          />
        ) : (
          <div aria-hidden className="absolute inset-0" />
        )}
        <div
          role={role}
          aria-modal="true"
          className={cn(
            'relative w-full rounded-xl bg-(--ids-color-surface) text-(--ids-color-on-surface) shadow-xl',
            {
              'max-w-sm': size === 'sm',
              'max-w-md': size === 'md',
              'max-w-2xl': size === 'lg',
              'max-w-4xl': size === 'xl',
              'max-w-none': size === 'full',
            },
            {
              'm-auto': variant === 'centered',
              'mx-auto mt-16 self-start': variant === 'top',
            },
            className,
          )}
        >
          {children}
        </div>
      </div>
    </DialogContext.Provider>
  );
}

function DialogHeader({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('flex flex-col gap-1 p-5 pb-3', className)}>{children}</div>;
}

function DialogTitle({ children, className }: { children: ReactNode; className?: string }) {
  return <h2 className={cn('text-title font-semibold', className)}>{children}</h2>;
}

function DialogDescription({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cn('text-label text-(--ids-color-on-muted)', className)}>{children}</p>;
}

function DialogContent({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('p-5 pt-2', className)}>{children}</div>;
}

function DialogFooter({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        'flex items-center justify-end gap-2 border-t border-(--ids-color-outline) p-4',
        className,
      )}
    >
      {children}
    </div>
  );
}

function DialogClose({ children, className }: { children?: ReactNode; className?: string }) {
  const context = useContext(DialogContext);
  return (
    <button
      type="button"
      onClick={() => context?.onOpenChange?.(false)}
      className={cn('text-label rounded-md px-2 py-1 text-(--ids-color-on-muted)', className)}
    >
      {children ?? '닫기'}
    </button>
  );
}

Dialog.Header = DialogHeader;
Dialog.Title = DialogTitle;
Dialog.Description = DialogDescription;
Dialog.Content = DialogContent;
Dialog.Footer = DialogFooter;
Dialog.Close = DialogClose;

export namespace Dialog {
  export type Props = {
    open: boolean;
    onOpenChange?: (open: boolean) => void;
    size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
    variant?: 'centered' | 'top';
    dismissible?: boolean;
    role?: 'dialog' | 'alertdialog';
    children: ReactNode;
    className?: string;
  };
}
