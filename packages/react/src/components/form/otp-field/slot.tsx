import { use, type ComponentProps, type ReactNode } from 'react';

import { OTPFieldCaret } from './caret';
import { GroupContext, useOTPContext } from './context';
import { invariant } from '../../../utils';

import type { OTPSlotState } from './use-otp-field';

export type OTPFieldSlotProps = Omit<ComponentProps<'div'>, 'children' | 'className'> & {
  index: number;
  className?: string | ((state: OTPSlotState) => string | undefined);
  children?: ReactNode | ((state: OTPSlotState) => ReactNode);
};

function Masked({
  char,
  mask,
  className,
}: {
  char: string;
  mask: boolean | string | undefined;
  className: string;
}) {
  if (mask === true) return <span className={className} />;
  if (typeof mask === 'string' && mask !== '') return mask;
  return char;
}

export function OTPFieldSlot({ index, className, children, ...props }: OTPFieldSlotProps) {
  const { slots, mask, placeholder, styles } = useOTPContext('OTPField.Slot');
  const grouped = use(GroupContext);
  const state = slots[index];
  invariant(state, `OTPField.Slot: index ${index} is outside the code length.`);

  const resolvedClassName = typeof className === 'function' ? className(state) : className;
  const fallback = state.char ?? placeholder?.charAt(index) ?? '';
  const content =
    typeof children === 'function'
      ? children(state)
      : (children ?? (
          <>
            {state.char === undefined ? (
              <span className={styles.placeholder()}>{fallback}</span>
            ) : (
              <Masked char={state.char} mask={mask} className={styles.maskDot()} />
            )}
            {state.hasFakeCaret && <OTPFieldCaret />}
          </>
        ));

  return (
    <div
      {...props}
      aria-hidden="true"
      data-otp-slot={index}
      data-active={state.isActive ? '' : undefined}
      data-filled={state.isFilled ? '' : undefined}
      data-grouped={grouped ? '' : undefined}
      className={styles.slot({ className: resolvedClassName })}
    >
      {content}
    </div>
  );
}

OTPFieldSlot.displayName = 'OTPField.Slot';
