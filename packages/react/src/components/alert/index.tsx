import { Children, isValidElement, type ComponentProps, type KeyboardEvent, type MouseEvent, type ReactNode  } from 'react';

import { cn, tv } from '../../utils';
import { CloseIcon } from '../close-icon';
import { Slot } from '../slot';

const ASSERTIVE_VARIANTS = new Set(['warning', 'danger']);

export function Alert({
  variant = 'info',
  dismissible = false,
  onClose,
  className,
  children,
  ...rest
}: Alert.Props) {
  const assertive = ASSERTIVE_VARIANTS.has(variant);

  // Icon과 Close는 텍스트 열의 좌우에 붙는다. 나머지 자식만 열 안으로 넣어야 하므로
  // 여기서 갈라낸다. 그래야 <Alert>텍스트</Alert> 처럼 감싸지 않은 자식도 열로 간다.
  const parts = Children.toArray(children);
  const icon = parts.find((child) => isValidElement(child) && child.type === Alert.Icon);
  const close = parts.find((child) => isValidElement(child) && child.type === Alert.Close);
  const body = parts.filter((child) => child !== icon && child !== close);

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    rest.onKeyDown?.(event);
    if (event.defaultPrevented || event.key !== 'Escape' || !dismissible) return;
    onClose?.();
  }

  return (
    <div
      // warning/danger는 진행 중인 작업을 끊어서라도 읽혀야 한다.
      role={assertive ? 'alert' : 'status'}
      aria-live={assertive ? 'assertive' : 'polite'}
      {...rest}
      onKeyDown={onKeyDown}
      className={Alert.Style({ variant, className })}
    >
      {icon}
      <div className="flex min-w-0 flex-1 flex-col gap-1">{body}</div>
      {close ?? (dismissible ? <Alert.Close onClose={() => onClose?.()} /> : null)}
    </div>
  );
}

export namespace Alert {
  export const Style = tv({
    base: [
      'flex items-start gap-3 rounded-xl p-4 inset-ring-1',
      'bg-(--alert-accent)/10 text-(--ids-color-on-surface) inset-ring-(--alert-accent)/30',
    ],
    variants: {
      // 본문 색은 항상 on-surface다. status 색을 글자에 쓰면 warning 노랑이
      // 어떤 배경에서도 AA(4.5:1)를 못 넘긴다. variant는 틴트/링/아이콘으로만 구분한다.
      variant: {
        info: '[--alert-accent:var(--ids-color-info)]',
        success: '[--alert-accent:var(--ids-color-success)]',
        warning: '[--alert-accent:var(--ids-color-warning)]',
        danger: '[--alert-accent:var(--ids-color-danger)]',
        neutral: '[--alert-accent:var(--ids-color-on-surface)]',
      },
    },
    defaultVariants: { variant: 'info' },
  });

  export function Icon({ asChild, className, ...rest }: PartProps) {
    const Root = asChild === true ? Slot : 'span';
    return (
      <Root
        aria-hidden
        {...rest}
        className={cn(
          // 의미는 role/aria-live와 제목 텍스트가 지고 있으므로 장식으로 둔다.
          'inline-flex shrink-0 text-(--alert-accent) [&_svg]:size-5',
          className,
        )}
      />
    );
  }

  export function Title({ asChild, className, ...rest }: PartProps) {
    const Root = asChild === true ? Slot : 'div';
    return <Root {...rest} className={cn('text-subtitle-s2-semibold', className)} />;
  }

  export function Description({ asChild, className, ...rest }: PartProps) {
    const Root = asChild === true ? Slot : 'div';
    return <Root {...rest} className={cn('text-body-b3-regular', className)} />;
  }

  export function Actions({ asChild, className, ...rest }: PartProps) {
    const Root = asChild === true ? Slot : 'div';
    return <Root {...rest} className={cn('mt-2 flex items-center gap-2', className)} />;
  }

  export function Close({ onClose, children, className, ...rest }: CloseProps) {
    return (
      <button
        type="button"
        aria-label="닫기"
        {...rest}
        className={cn(
          'inline-flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-lg',
          'opacity-60 transition-opacity hover:opacity-100',
          'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current',
          'motion-reduce:transition-none',
          '[&_svg]:size-4',
          className,
        )}
        onClick={(event) => {
          onClose(event);
        }}
      >
        {children ?? <CloseIcon />}
      </button>
    );
  }

  export type PartProps = Omit<ComponentProps<'div'>, 'className'> & {
    asChild?: boolean;
    className?: string;
  };

  export type CloseProps = Omit<ComponentProps<'button'>, 'className' | 'onClick' | 'type'> & {
    onClose: (event: MouseEvent<HTMLButtonElement>) => void;
    className?: string;
  };

  export type Props = Omit<ComponentProps<'div'>, 'children' | 'className' | 'role'> & {
    variant?: 'info' | 'success' | 'warning' | 'danger' | 'neutral';
    /** Render the built-in close button. Pair with `onClose`. */
    dismissible?: boolean;
    onClose?: () => void;
    className?: string;
    children?: ReactNode;
  };
}
