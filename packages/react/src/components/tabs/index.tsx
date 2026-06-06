import {
  createContext,
  useContext,
  useId,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from 'react';

import { cn } from '../../utils';

type TabsContextValue = {
  value?: string;
  setValue: (value: string) => void;
  baseId: string;
};

const TabsContext = createContext<TabsContextValue | null>(null);

export function Tabs({ value, defaultValue, onValueChange, children, className }: Tabs.Props) {
  const baseId = useId();
  const [internalValue, setInternalValue] = useState(defaultValue);
  const currentValue = value ?? internalValue;

  const setValue = (nextValue: string) => {
    if (value === undefined) setInternalValue(nextValue);
    onValueChange?.(nextValue);
  };

  return (
    <TabsContext.Provider value={{ value: currentValue, setValue, baseId }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );
}

function useTabsContext(component: string) {
  const context = useContext(TabsContext);
  if (!context) throw new Error(`[IDS] ${component} must be used inside Tabs.`);
  return context;
}

function TabsList({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      role="tablist"
      className={cn(
        'text-label flex border-b border-(--ids-color-outline) text-(--ids-color-on-muted)',
        className,
      )}
    >
      {children}
    </div>
  );
}

function TabsTrigger({ value, disabled, children, className }: Tabs.TriggerProps) {
  const context = useTabsContext('Tabs.Trigger');
  const active = context.value === value;
  const triggerId = `${context.baseId}-trigger-${value}`;
  const panelId = `${context.baseId}-panel-${value}`;
  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    const keys = ['ArrowLeft', 'ArrowRight', 'Home', 'End'];
    if (!keys.includes(event.key)) return;

    const tabList = event.currentTarget.closest('[role="tablist"]');
    const tabs = Array.from(
      tabList?.querySelectorAll<HTMLButtonElement>('[role="tab"]:not(:disabled)') ?? [],
    );
    const currentIndex = tabs.indexOf(event.currentTarget);
    if (currentIndex < 0) return;

    const targetIndex = (() => {
      if (event.key === 'Home') return 0;
      if (event.key === 'End') return tabs.length - 1;
      if (event.key === 'ArrowLeft') return (currentIndex - 1 + tabs.length) % tabs.length;
      return (currentIndex + 1) % tabs.length;
    })();

    const target = tabs[targetIndex];
    const targetValue = target?.dataset.idsTabsValue;
    if (!target || !targetValue) return;

    event.preventDefault();
    context.setValue(targetValue);
    target.focus();
  };

  return (
    <button
      type="button"
      id={triggerId}
      role="tab"
      data-ids-tabs-value={value}
      disabled={disabled}
      aria-selected={active}
      aria-controls={panelId}
      tabIndex={active ? 0 : -1}
      onClick={() => context.setValue(value)}
      onKeyDown={handleKeyDown}
      className={cn(
        'relative flex flex-1 items-center justify-center px-4 py-3 font-medium transition-colors',
        'focus-visible:outline-2 focus-visible:outline-offset-[-2px] disabled:pointer-events-none disabled:opacity-40',
        active ? 'text-(--ids-color-primary)' : 'hover:text-(--ids-color-on-surface)',
        "after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-transparent after:content-['']",
        active && 'after:bg-(--ids-color-primary)',
        className,
      )}
    >
      {children}
    </button>
  );
}

function TabsPanel({ value, forceMount, children, className }: Tabs.PanelProps) {
  const context = useTabsContext('Tabs.Panel');
  const active = context.value === value;
  if (!active && !forceMount) return null;

  return (
    <div
      id={`${context.baseId}-panel-${value}`}
      role="tabpanel"
      aria-labelledby={`${context.baseId}-trigger-${value}`}
      hidden={!active}
      className={className}
    >
      {children}
    </div>
  );
}

Tabs.List = TabsList;
Tabs.Trigger = TabsTrigger;
Tabs.Panel = TabsPanel;

export namespace Tabs {
  export type Props = {
    value?: string;
    defaultValue?: string;
    onValueChange?: (value: string) => void;
    children: ReactNode;
    className?: string;
  };

  export type TriggerProps = {
    value: string;
    disabled?: boolean;
    children: ReactNode;
    className?: string;
  };

  export type PanelProps = {
    value: string;
    forceMount?: boolean;
    children: ReactNode;
    className?: string;
  };
}
