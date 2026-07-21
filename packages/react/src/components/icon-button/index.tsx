import { Children, type ReactElement } from 'react';

import { resolveInteractiveValue, type InteractiveValue } from '../../hooks/use-interactive';
import { invariant, tv } from '../../utils';
import { Button } from '../button';
import { useGroupContext } from '../group';
import { iconSquare } from '../icon-square';

import type { IdsSize } from '../../tokens/types';

export function IconButton({
  icon,
  children,
  className,
  variant = 'ghost',
  size,
  'aria-label': ariaLabel,
  ...rest
}: IconButton.Props) {
  const group = useGroupContext();

  invariant(children == null, '`<IconButton>` does not accept `children`. Use the `icon` prop.');
  invariant(icon != null, '`<IconButton>` requires an `icon` prop.');
  invariant(ariaLabel != null, '`<IconButton>` requires an `aria-label` prop.');
  invariant(
    typeof ariaLabel !== 'string' || ariaLabel.trim() !== '',
    '`<IconButton>` `aria-label` must not be empty.',
  );

  return (
    <Button
      {...rest}
      aria-label={ariaLabel}
      variant={variant}
      size={size}
      className={(state) => {
        const resolvedSize = resolveInteractiveValue(size, state) as IdsSize | undefined;
        invariant(
          group == null || resolvedSize == null || resolvedSize === group.size,
          `\`<IconButton>\` inside a group must use the group's \`size\` (${group?.size}).`,
        );

        return IconButton.Style({
          size: group?.size ?? resolvedSize ?? 'standard',
          className: resolveInteractiveValue(className, state),
        });
      }}
    >
      {(state) => Children.only(resolveInteractiveValue(icon, state)!)}
    </Button>
  );
}

export namespace IconButton {
  export const Style = tv({
    base: iconSquare.base,
    variants: {
      size: iconSquare.size,
    },
  });

  export type Props = Omit<Button.Props, 'children'> & {
    icon: InteractiveValue<ReactElement>;
    children?: never;
    'aria-label': InteractiveValue<string>;
  };
}
