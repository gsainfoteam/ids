import {
  Children,
  isValidElement,
  useRef,
  type ComponentProps,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
} from 'react';

import { isNotNil } from 'es-toolkit';

import { invariant, tv } from '../../utils';
import {
  TextField,
  TextFieldGroupContext,
  textFieldSurface,
  useTextFieldGroupContext,
  type TextFieldVariant,
} from '../text-field';

import type { IdsSize } from '../../tokens/types';

function splitByField(children: ReactNode) {
  const items = Children.toArray(children);
  const fieldIndexes = items
    .map((child, index) => (isValidElement(child) && child.type === TextField ? index : null))
    .filter(isNotNil);

  invariant(
    fieldIndexes.length === 1,
    '`<TextFieldGroup>` requires exactly one `<TextField />` as a child (structural pivot).',
  );

  const fieldIndex = fieldIndexes[0]!;
  return {
    leading: items.slice(0, fieldIndex),
    field: items[fieldIndex] as ReactElement,
    trailing: items.slice(fieldIndex + 1),
  };
}

export function TextFieldGroup({
  variant = 'outline',
  size = 'standard',
  disabled,
  className,
  style,
  children = <TextField />,
  onPointerDown,
}: TextFieldGroup.Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { leading, field, trailing } = splitByField(children);

  return (
    <TextFieldGroupContext.Provider
      value={{
        size,
        disabled,
        inputRef,
      }}
    >
      <div
        role="group"
        data-variant={variant}
        data-size={size}
        data-disabled={disabled ? '' : undefined}
        className={textFieldSurface({ as: 'group', variant, size, className })}
        style={style}
        onPointerDown={(e) => {
          onPointerDown?.(e);
          if (disabled) return;
          const target = e.target as HTMLElement;
          if (target.closest('button, a, input, textarea, select, [data-text-field]')) return;
          inputRef.current?.focus();
        }}
      >
        {leading}
        {field}
        {trailing}
      </div>
    </TextFieldGroupContext.Provider>
  );
}

export namespace TextFieldGroup {
  /**
   * 텍스트/아이콘 장식, 또는 Button·Toggle·(향후 control)을 감싸는 래퍼.
   * - plain (`:not(:has(button))`): adornment 톤 유지
   * - control (`:has(button)`): 패딩·고정 사이즈만 리셋 — 컴포넌트 스타일은 그대로
   */
  export function Adornment({ children, className, style, ...rest }: Adornment.Props) {
    const group = useTextFieldGroupContext();
    invariant(
      group != null,
      '`<TextFieldGroup.Adornment>` must be used inside `<TextFieldGroup>`.',
    );

    return (
      <span
        data-text-field-adornment=""
        className={Adornment.Style({ size: group.size, className })}
        style={style}
        {...rest}
      >
        {children}
      </span>
    );
  }

  export namespace Adornment {
    export const Style = tv({
      base: [
        'inline-flex shrink-0 items-center',
        // plain content
        'not-has-[button]:text-(--ids-color-on-muted)',
        'not-has-[button]:[&_svg]:shrink-0 not-has-[button]:[&_svg]:text-current',
        // any button (Button, Toggle, future controls) — layout only
        '[&_button]:size-auto [&_button]:h-auto [&_button]:min-h-0 [&_button]:w-auto [&_button]:min-w-0',
        '[&_button]:p-0',
      ],
      variants: {
        size: {
          standard: [
            'gap-1',
            'not-has-[button]:text-body-b2-regular not-has-[button]:[&_svg]:size-5',
          ],
          tiny: [
            'gap-0.5',
            'not-has-[button]:text-body-b3-regular not-has-[button]:[&_svg]:size-4',
          ],
        } satisfies Record<IdsSize, string[]>,
      },
    });

    export type Props = {
      children?: ReactNode;
      className?: string;
      style?: CSSProperties;
    } & Omit<ComponentProps<'span'>, 'children' | 'className' | 'style'>;
  }

  export type Props = {
    variant?: TextFieldVariant;
    size?: IdsSize;
    disabled?: boolean;
    children?: ReactNode;
    className?: string;
    style?: CSSProperties;
    onPointerDown?: ComponentProps<'div'>['onPointerDown'];
  };
}
