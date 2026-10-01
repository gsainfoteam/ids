'use client';

import { createContext, use, useEffect } from 'react';

import { invariant } from '../../../utils';
import { isDevelopment } from '../../../utils/dev';
import { Divider } from '../../layout/divider';
import { Slot } from '../slot';
import { groupStyle } from './style';

import type { Group } from '.';
import type { IdsSize, IdsVariant } from '../../../tokens/types';

export type GroupOrientation = 'horizontal' | 'vertical';

export type GroupContextValue = {
  orientation: GroupOrientation;
  attached: boolean;
  size?: IdsSize;
  variant?: IdsVariant;
  separator: 'semantic' | 'decorative';
};

const GroupContext = createContext<GroupContextValue | null>(null);

export function useGroupContext() {
  return use(GroupContext);
}

export function useGroupNameWarning(
  component: string,
  props: { 'aria-label'?: string; 'aria-labelledby'?: string },
) {
  const nested = useGroupContext() !== null;
  const named =
    (typeof props['aria-label'] === 'string' && props['aria-label'].trim() !== '') ||
    props['aria-labelledby'] != null;
  useEffect(() => {
    if (isDevelopment && !named && !nested)
      console.warn(
        `[IDS] ${component}: add aria-label or aria-labelledby so a screen reader can say what the group is for.`,
      );
  }, [component, named, nested]);
}

export function GroupRoot({
  orientation = 'horizontal',
  attached = true,
  size,
  variant,
  separator = 'semantic',
  className,
  children,
  ...rest
}: Group.Props) {
  const parent = useGroupContext();
  const context: GroupContextValue = {
    orientation,
    attached,
    size: size ?? parent?.size,
    variant: variant ?? parent?.variant,
    separator,
  };
  return (
    <GroupContext value={context}>
      <div
        role="group"
        data-group=""
        data-orientation={orientation}
        data-size={context.size}
        {...rest}
        className={groupStyle({ orientation, attached }).root({ className })}
      >
        {children}
      </div>
    </GroupContext>
  );
}

export function GroupSeparator({ className, ...props }: Group.SeparatorProps) {
  const group = useGroupContext();
  invariant(group, 'Group.Separator must be rendered inside ButtonGroup or ToggleGroup.');
  return (
    <Divider
      {...props}
      orientation={group.orientation === 'horizontal' ? 'vertical' : 'horizontal'}
      decorative={group.separator === 'decorative'}
      data-group-separator=""
      className={groupStyle({ orientation: group.orientation, attached: group.attached }).separator(
        {
          className,
        },
      )}
    />
  );
}

GroupSeparator.displayName = 'Group.Separator';

export function GroupText({ asChild, className, ...props }: Group.TextProps) {
  const group = useGroupContext();
  const Root = asChild ? Slot : 'div';
  return (
    <Root
      data-variant="outline"
      {...props}
      className={groupStyle({ size: group?.size ?? 'standard' }).text({ className })}
    />
  );
}

GroupText.displayName = 'Group.Text';
