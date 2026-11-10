'use client';

import { type ComponentProps } from 'react';

import { ArrowUpIcon, StopIcon } from '@heroicons/react/16/solid';

import { usePromptInputContext } from './context';
import { useTranslate } from '../../../internal/translate';
import { IconButton } from '../../action/icon-button';
import { Spinner } from '../../feedback/spinner';
import { Tooltip } from '../../overlay/tooltip';
import { Kbd } from '../../typography/kbd';

export type PromptInputSubmitProps = Omit<ComponentProps<'button'>, 'children' | 'type'>;

export function PromptInputSubmit({ className, onClick, ...props }: PromptInputSubmitProps) {
  const t = useTranslate();
  const c = usePromptInputContext('PromptInput.Submit');

  const stops = c.busy && c.stop !== undefined;
  const waits = c.busy && !stops;
  const label = stops
    ? t('promptInput.stop')
    : waits
      ? t('promptInput.sending')
      : t('promptInput.send');
  const icon = stops ? (
    <StopIcon aria-hidden="true" />
  ) : waits ? (
    <Spinner decorative />
  ) : (
    <ArrowUpIcon aria-hidden="true" />
  );

  return (
    <Tooltip
      content={
        stops || waits ? (
          label
        ) : (
          <>
            {label} <Kbd keys="Enter" />
          </>
        )
      }
    >
      <IconButton
        aria-label={label}
        {...props}
        type={stops ? 'button' : 'submit'}
        variant="solid"
        size={c.size}
        icon={icon}
        disabled={stops ? c.disabled : !c.canSend}
        focusableWhenDisabled
        aria-busy={waits || undefined}
        data-prompt-input-submit=""
        data-status={c.status}
        className={c.styles.submit({ className })}
        onClick={(event) => {
          onClick?.(event);
          if (stops && !event.defaultPrevented) c.stop?.();
        }}
      />
    </Tooltip>
  );
}

PromptInputSubmit.displayName = 'PromptInput.Submit';
