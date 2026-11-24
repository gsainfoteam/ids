'use client';

import { type ComponentProps, type FocusEvent } from 'react';

import { mergeProps, part } from '../../../utils';
import { FieldPopup, FieldPopupHeader } from '../../field-popup';
import { useInternalTemporalContext } from '../context';

export type ContentProps = ComponentProps<'div'> & {
  asChild?: boolean;
  mobileVariant?: 'popover' | 'drawer';
};

export function TemporalContent({ asChild, children, mobileVariant, ...props }: ContentProps) {
  const c = useInternalTemporalContext('Content');
  if (!c.state.open) return null;

  return (
    <FieldPopup
      anchor={c.popup.anchor}
      onClose={c.picker.close}
      mobileVariant={mobileVariant}
      preferredWidth={c.popup.preferredWidth}
      initialFocusSelector={c.popup.initialFocusSelector}
      role="dialog"
      id={c.popup.id}
      {...c.popup.name}
      data-temporal-owner={c.popup.id}
      className="concentric-p-3"
      onBlur={c.onBlur as (event: FocusEvent<HTMLDivElement>) => void}
    >
      <FieldPopupHeader
        closeLabel={c.messages.close}
        autoFocus
        onClose={() => c.picker.close(true)}
      />
      {part(
        'div',
        asChild,
        children ?? c.content(),
        mergeProps({ className: c.styles.content() }, props),
      )}
    </FieldPopup>
  );
}
