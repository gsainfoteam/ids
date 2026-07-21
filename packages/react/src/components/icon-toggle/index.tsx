import { Children, type ReactElement } from 'react';

import { resolveInteractiveValue, type InteractiveValue } from '../../hooks/use-interactive';
import { invariant, tv } from '../../utils';
import { useGroupContext } from '../group';
import { iconSquare } from '../icon-square';
import { Toggle } from '../toggle';

import type { IdsSize } from '../../tokens/types';

export function IconToggle({
  icon,
  children,
  className,
  variant = 'ghost',
  size,
  'aria-label': ariaLabel,
  ...rest
}: IconToggle.Props) {
  const group = useGroupContext();

  invariant(children == null, '`<IconToggle>` does not accept `children`. Use the `icon` prop.');
  invariant(icon != null, '`<IconToggle>` requires an `icon` prop.');
  invariant(ariaLabel != null, '`<IconToggle>` requires an `aria-label` prop.');
  invariant(
    typeof ariaLabel !== 'string' || ariaLabel.trim() !== '',
    '`<IconToggle>` `aria-label` must not be empty.',
  );

  return (
    <Toggle
      {...rest}
      aria-label={ariaLabel}
      variant={variant}
      size={size}
      className={(state) => {
        const resolvedSize = resolveInteractiveValue(size, state) as IdsSize | undefined;
        invariant(
          group == null || resolvedSize == null || resolvedSize === group.size,
          `\`<IconToggle>\` inside a group must use the group's \`size\` (${group?.size}).`,
        );

        return IconToggle.Style({
          size: group?.size ?? resolvedSize ?? 'standard',
          className: resolveInteractiveValue(className, state),
        });
      }}
    >
      {(state) => Children.only(resolveInteractiveValue(icon, state)!)}
    </Toggle>
  );
}

export namespace IconToggle {
  export const Style = tv({
    base: iconSquare.base,
    variants: {
      size: iconSquare.size,
    },
  });

  export type Props = Omit<Toggle.Props, 'children'> & {
    icon: InteractiveValue<ReactElement>;
    children?: never;
    'aria-label': InteractiveValue<string>;
  };
}
