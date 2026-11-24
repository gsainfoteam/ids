'use client';

import { isValidElement, type ComponentProps } from 'react';

import { XMarkIcon } from '@heroicons/react/16/solid';

import { useInternalRegisteredId } from '../../../../internal/lib/surface';
import { useInternalTranslate } from '../../../../internal/translate';
import { IconButton } from '../../../action/icon-button';
import { useInternalChipContext } from '../context';

export type ChipCloseProps = Omit<ComponentProps<'button'>, 'type'>;

export function ChipClose({
  className,
  children,
  id,
  onClick,
  onKeyDown,
  'aria-label': ariaLabel,
  ...rest
}: ChipCloseProps) {
  const t = useInternalTranslate();

  const context = useInternalChipContext('Chip.Close');
  const closeId = useInternalRegisteredId(undefined, id);
  const glyph = children ?? <XMarkIcon />;
  const chipLabelThenOwnLabel =
    ariaLabel === undefined && context.labelId ? `${context.labelId} ${closeId}` : undefined;

  if (context.rootIsButton)
    return (
      <span
        aria-hidden="true"
        data-chip-close=""
        className={context.styles.close({ className })}
        onClick={(event) => {
          event.stopPropagation();
          context.remove(event);
        }}
      >
        {glyph}
      </span>
    );

  return (
    <IconButton
      {...rest}
      id={closeId}
      variant="ghost"
      colorScheme={context.colorScheme}
      size={context.size}
      aria-label={ariaLabel ?? t('common.remove')}
      aria-labelledby={chipLabelThenOwnLabel}
      disabled={context.disabled}
      data-chip-close=""
      icon={isValidElement(glyph) ? glyph : <>{glyph}</>}
      className={context.styles.close({ className })}
      onClick={(event) => {
        onClick?.(event);
        if (event.defaultPrevented) return;
        event.stopPropagation();
        context.remove(event);
      }}
      onKeyDown={(event) => {
        onKeyDown?.(event);
        if (!event.defaultPrevented) context.removeOnKey(event);
      }}
    />
  );
}

ChipClose.displayName = 'Chip.Close';
