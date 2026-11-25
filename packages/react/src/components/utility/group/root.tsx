'use client';

import { GroupContext, useInternalGroupContext, type GroupContextValue } from './context';
import { groupStyle } from './style';
import { invariant } from '../../../utils';
import { Divider } from '../../layout/divider';

import type { Group } from '.';

export function GroupRoot({
  orientation = 'horizontal',
  size,
  variant,
  separator = 'semantic',
  className,
  children,
  ...rest
}: Group.Props) {
  const parent = useInternalGroupContext();
  const context: GroupContextValue = {
    orientation,
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
        className={groupStyle({ orientation }).root({ className })}
      >
        {children}
      </div>
    </GroupContext>
  );
}

export function GroupSeparator({ className, ...props }: Group.SeparatorProps) {
  const group = useInternalGroupContext();
  invariant(group, 'Group.Separator must be rendered inside ButtonGroup or ToggleGroup.');
  return (
    <Divider
      {...props}
      orientation={group.orientation === 'horizontal' ? 'vertical' : 'horizontal'}
      aria-hidden={group.separator === 'decorative'}
      data-group-separator=""
      className={groupStyle({ orientation: group.orientation }).separator({ className })}
    />
  );
}

GroupSeparator.displayName = 'Group.Separator';
