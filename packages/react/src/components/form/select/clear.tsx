'use client';

import { isValidElement, type ComponentProps, type ReactElement } from 'react';

import { XMarkIcon } from '@heroicons/react/16/solid';

import { useSelectContext } from './context';
import { useTranslate } from '../../../internal/translate';
import { mergeProps } from '../../../utils';
import { IconButton } from '../../action/icon-button';

export type SelectClearProps = ComponentProps<'button'> & { asChild?: boolean };

export function SelectClear({ asChild, children, className, ...props }: SelectClearProps) {
  const t = useTranslate();

  const c = useSelectContext('Select.Clear');
  if (!c.select.state.selected.length || c.state.readOnly) return null;

  const own = mergeProps(props as Record<string, unknown>, {
    'aria-label': props['aria-label'] ?? t('select.clear'),
    disabled: c.state.disabled,
    'data-select-clear': '',
    onClick: c.select.actions.clear,
  }) as Omit<SelectClearProps, 'asChild' | 'children' | 'className'>;
  const button = {
    ...own,
    variant: 'ghost' as const,
    size: c.size,
    className: c.styles.clear({ className }),
  };

  if (asChild)
    return (
      <IconButton {...button} asChild>
        {children as ReactElement}
      </IconButton>
    );

  const glyph = children ?? <XMarkIcon aria-hidden="true" />;

  return <IconButton {...button} icon={isValidElement(glyph) ? glyph : <>{glyph}</>} />;
}

SelectClear.displayName = 'Select.Clear';
