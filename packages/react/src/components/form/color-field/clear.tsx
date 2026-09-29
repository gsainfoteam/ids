'use client';

import { isValidElement, type ComponentProps, type ReactElement } from 'react';

import { XMarkIcon } from '@heroicons/react/16/solid';

import { useColorFieldContext } from './context';
import { useTranslate } from '../../../internal/translate';
import { invariant, mergeEventHandlers } from '../../../utils';
import { IconButton } from '../../action/icon-button';

export type ColorFieldClearProps = Omit<ComponentProps<'button'>, 'children'> & {
  asChild?: boolean;
  children?: ReactElement;
};

export function ColorFieldClear({
  asChild,
  children,
  className,
  onClick,
  ...props
}: ColorFieldClearProps) {
  const t = useTranslate();

  const c = useColorFieldContext('ColorField.Clear');

  if (!c.field.state.value || c.state.readOnly) return null;

  const button = {
    ...props,
    'aria-label': props['aria-label'] ?? t('colorField.clear'),
    disabled: c.state.disabled,
    'data-color-field-clear': '',
    variant: 'ghost' as const,
    size: c.size,
    className: c.styles.clear({ className }),
    onClick: mergeEventHandlers(onClick, c.field.actions.clear),
  };

  if (asChild) {
    invariant(isValidElement(children), '`ColorField.Clear asChild` requires one element.');
    return (
      <IconButton {...button} asChild>
        {children}
      </IconButton>
    );
  }

  return <IconButton {...button} icon={children ?? <XMarkIcon aria-hidden="true" />} />;
}

ColorFieldClear.displayName = 'ColorField.Clear';
