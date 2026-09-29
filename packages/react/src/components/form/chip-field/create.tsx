'use client';

import { type ComponentProps, type PointerEvent, type ReactNode } from 'react';

import { useChip } from './context';
import { CREATE } from './use-chip-field';
import { useTranslate } from '../../../internal/translate';
import { keepFocusWhereItIs, mergeProps, part } from '../../../utils';

export type ChipCreateProps = Omit<ComponentProps<'div'>, 'children'> & {
  asChild?: boolean;
  children?: ReactNode | ((text: string) => ReactNode);
};

export function ChipCreate({ asChild, children, className, ...props }: ChipCreateProps) {
  const t = useTranslate();

  const c = useChip('Create');
  const { state: s, ids, actions } = c.field;
  if (!s.canCreate) return null;

  const error = s.createError;
  const content =
    error ??
    (typeof children === 'function'
      ? children(s.trimmed)
      : (children ?? t('chipField.create', { text: s.trimmed })));

  return part(
    'div',
    asChild,
    content,
    mergeProps(props, {
      id: ids.option(CREATE),
      role: 'option',
      'aria-selected': false,
      'aria-disabled': error ? true : undefined,
      'data-chip-field-create': '',
      'data-highlighted': s.activeCandidate === CREATE ? '' : undefined,
      'data-invalid': error ? '' : undefined,
      className: c.styles.create({ className }),
      onPointerDown: keepFocusWhereItIs,
      onPointerMove: (event: PointerEvent) => {
        if (event.pointerType === 'mouse' && !error) actions.highlight(CREATE);
      },
      onClick: actions.create,
    }),
  );
}

ChipCreate.displayName = 'ChipField.Create';
