'use client';

import { type ReactElement, type ReactNode } from 'react';

import { CheckIcon } from '@heroicons/react/16/solid';

import { usePromptInputContext } from './context';
import { Toggle } from '../../action/toggle';

export type PromptInputToolProps = Omit<
  Toggle.Props,
  'value' | 'pressed' | 'defaultPressed' | 'onPressedChange' | 'variant' | 'size' | 'type' | 'children' | 'className'
> & {
  value: string;
  icon?: ReactElement;
  children?: ReactNode;
  className?: string;
};

export function PromptInputTool({
  value,
  icon,
  disabled,
  className,
  children,
  ...props
}: PromptInputToolProps) {
  const c = usePromptInputContext('PromptInput.Tool');
  const on = c.tools.includes(value);

  return (
    <Toggle
      {...props}
      variant="outline"
      size={c.size}
      disabled={disabled ?? c.disabled}
      pressed={on}
      onPressedChange={() => c.toggleTool(value)}
      data-prompt-input-tool={value}
      className={c.styles.tool({ className })}
    >
      {icon ?? (on ? <CheckIcon aria-hidden="true" /> : null)}
      {children}
    </Toggle>
  );
}

PromptInputTool.displayName = 'PromptInput.Tool';
