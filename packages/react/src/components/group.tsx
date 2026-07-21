import { createContext, useContext, type ComponentProps, type ReactNode } from 'react';

import { cn, invariant, tv } from '../utils';

import type { StackDirection } from '../layout/types';
import type { IdsSize } from '../tokens/types';

export const groupRootStyle = tv({
  base: [
    'inline-flex [&>button]:relative',
    '[&>button[data-hovered]]:z-10',
    '[&>button[data-pressed]]:z-20',
    '[&>button[data-focus-visible]]:z-30',
  ],
  variants: {
    orientation: {
      horizontal: [
        'flex-row items-center',
        '[&>button:has(+button)]:rounded-r-none',
        '[&>button+button]:-ml-px [&>button+button]:rounded-l-none',
      ],
      vertical: [
        'flex-col items-stretch',
        '[&>button:has(+button)]:rounded-b-none',
        '[&>button+button]:-mt-px [&>button+button]:rounded-t-none',
      ],
    },
  },
  defaultVariants: {
    orientation: 'horizontal',
  },
});

export type GroupContextValue = {
  orientation: StackDirection;
  size: IdsSize;
};

export const GroupContext = createContext<GroupContextValue | null>(null);

export function useGroupContext() {
  return useContext(GroupContext);
}

export function useGroupedSize(componentName: string, size?: IdsSize) {
  const group = useGroupContext();
  if (group == null) return size;

  invariant(
    size == null || size === group.size,
    `\`<${componentName}>\` inside a group must use the group's \`size\` (${group.size}).`,
  );

  return group.size;
}

export function GroupRoot({
  orientation = 'horizontal',
  size = 'standard',
  className,
  children,
  ...rest
}: {
  orientation?: StackDirection;
  size?: IdsSize;
  className?: string;
  children?: ReactNode;
} & ComponentProps<'div'>) {
  return (
    <GroupContext.Provider value={{ orientation, size }}>
      <div
        role="group"
        data-orientation={orientation}
        data-size={size}
        className={groupRootStyle({ orientation, className })}
        {...rest}
      >
        {children}
      </div>
    </GroupContext.Provider>
  );
}

export function GroupSeparator({ className }: { className?: string }) {
  const group = useGroupContext();
  invariant(
    group != null,
    '`<ButtonGroup.Separator>` / `<ToggleGroup.Separator>` must be used inside a group.',
  );

  const { orientation } = group;
  const separatorOrientation = orientation === 'horizontal' ? 'vertical' : 'horizontal';

  return (
    <div
      role="separator"
      aria-orientation={separatorOrientation}
      data-group-separator=""
      data-orientation={separatorOrientation}
      className={cn(
        'shrink-0',
        orientation === 'horizontal' ? 'w-2 self-stretch' : 'h-2 w-full',
        className,
      )}
    />
  );
}
