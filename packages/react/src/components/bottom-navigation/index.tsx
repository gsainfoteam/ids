import { createContext, useContext, type ReactNode } from 'react';

import { cn } from '../../utils';

type BottomNavigationContextValue = {
  value?: string;
  onValueChange?: (value: string) => void;
};

const BottomNavigationContext = createContext<BottomNavigationContextValue | null>(null);

export function BottomNavigation({
  value,
  onValueChange,
  children,
  className,
}: BottomNavigation.Props) {
  return (
    <BottomNavigationContext.Provider value={{ value, onValueChange }}>
      <nav
        aria-label="Bottom navigation"
        className={cn(
          'w-full border-t border-(--ids-color-outline) bg-(--ids-color-surface)',
          'pb-[env(safe-area-inset-bottom)]',
          className,
        )}
      >
        <div className="mx-auto flex h-16 max-w-screen-sm items-center justify-around px-2">
          {children}
        </div>
      </nav>
    </BottomNavigationContext.Provider>
  );
}

function BottomNavigationItem({
  value,
  icon,
  label,
  disabled,
  className,
}: BottomNavigation.ItemProps) {
  const context = useContext(BottomNavigationContext);
  const active = context?.value === value;

  return (
    <button
      type="button"
      disabled={disabled}
      aria-current={active ? 'page' : undefined}
      onClick={() => context?.onValueChange?.(value)}
      className={cn(
        'text-caption flex min-w-14 flex-1 flex-col items-center justify-center gap-1 rounded-lg px-2 py-1 transition-colors',
        'focus-visible:outline-2 focus-visible:outline-offset-2 disabled:pointer-events-none disabled:opacity-40',
        active
          ? 'text-(--ids-color-primary)'
          : 'text-(--ids-color-on-muted) hover:text-(--ids-color-on-surface)',
        className,
      )}
    >
      <span className="flex size-7 items-center justify-center">{icon}</span>
      <span className="whitespace-nowrap">{label}</span>
    </button>
  );
}

BottomNavigation.Item = BottomNavigationItem;

export namespace BottomNavigation {
  export type Props = {
    value?: string;
    onValueChange?: (value: string) => void;
    children: ReactNode;
    className?: string;
  };

  export type ItemProps = {
    value: string;
    icon: ReactNode;
    label: string;
    disabled?: boolean;
    className?: string;
  };
}
