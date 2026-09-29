'use client';

import {
  cloneElement,
  isValidElement,
  useRef,
  type KeyboardEvent,
  type ReactElement,
  type ReactNode,
} from 'react';

import { cn } from '../utils/cn';

export type SurfaceTrigger = {
  disabled: boolean;
  describedBy: string | undefined;
  pressed?: boolean;
};

const triggerReset = cn(
  'inline-flex max-w-full items-center gap-[inherit] text-start outline-none cursor-[inherit]',
);

function TriggerButton({
  trigger,
  className,
  children,
}: {
  trigger: SurfaceTrigger;
  className?: string;
  children: ReactNode;
}) {
  const spaceWentDownHere = useRef(false);

  return (
    <button
      type="button"
      data-surface-trigger=""
      data-field-input=""
      disabled={trigger.disabled}
      aria-describedby={trigger.describedBy}
      aria-pressed={trigger.pressed}
      className={cn(triggerReset, className)}
      onKeyDown={(event: KeyboardEvent<HTMLButtonElement>) => {
        if (event.key === ' ') spaceWentDownHere.current = true;
      }}
      onKeyUp={(event: KeyboardEvent<HTMLButtonElement>) => {
        if (event.key !== ' ') return;
        if (!spaceWentDownHere.current) event.preventDefault();
        spaceWentDownHere.current = false;
      }}
      onBlur={() => {
        spaceWentDownHere.current = false;
      }}
    >
      {children}
    </button>
  );
}

export function titleContent({
  trigger,
  asChild,
  children,
  triggerClassName,
}: {
  trigger: SurfaceTrigger | null;
  asChild: boolean | undefined;
  children: ReactNode;
  triggerClassName?: string;
}): ReactNode {
  if (!trigger) return children;

  if (asChild && isValidElement<{ children?: ReactNode }>(children)) {
    const element = children as ReactElement<{ children?: ReactNode }>;
    return cloneElement(
      element,
      {},
      <TriggerButton trigger={trigger} className={triggerClassName}>
        {element.props.children}
      </TriggerButton>,
    );
  }

  return (
    <TriggerButton trigger={trigger} className={triggerClassName}>
      {children}
    </TriggerButton>
  );
}
