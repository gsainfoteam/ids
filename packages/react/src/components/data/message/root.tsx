'use client';

import { isValidElement, use, useCallback, useId, useRef, type ReactNode } from 'react';

import { ArrowPathIcon, ExclamationCircleIcon } from '@heroicons/react/16/solid';

import { MessageActions } from './actions';
import { MessageAvatar } from './avatar';
import { MessageContent } from './content';
import { MessageContext, MessageGroupContext } from './context';
import { MessageFooter } from './footer';
import { MessageHeader } from './header';
import { messageStyle } from './style';
import { useTranslate } from '../../../internal/translate';
import { elementTypeOf, flattenFragments } from '../../../utils';
import { Button } from '../../action/button';
import { Marker } from '../../feedback/marker';

import type { Message } from '.';

export type MessageFrom = 'user' | 'assistant';
export type MessageAlign = 'start' | 'end';
export type MessageStatus = 'sent' | 'pending' | 'error' | 'read';

const PARTS = new Set<unknown>([
  MessageAvatar,
  MessageHeader,
  MessageContent,
  MessageActions,
  MessageFooter,
]);

function splitParts(children: ReactNode) {
  const body: ReactNode[] = [];
  const parts = new Map<unknown, ReactNode>();
  for (const child of flattenFragments(children)) {
    const type = isValidElement(child) ? elementTypeOf(child) : undefined;
    if (PARTS.has(type)) parts.set(type, child);
    else body.push(child);
  }
  return { body, part: (type: unknown) => parts.get(type) };
}

function hasChildren(part: ReactNode) {
  return isValidElement<{ children?: ReactNode }>(part) && part.props.children != null;
}

function Failure({
  styles,
  onRetry,
}: {
  styles: ReturnType<typeof messageStyle>;
  onRetry: (() => void) | undefined;
}) {
  const t = useTranslate();

  return (
    <div data-message-failure="" className={styles.failure()}>
      <Marker size="tiny" role="status" className={styles.failureText()}>
        <ExclamationCircleIcon aria-hidden="true" />
        {t('message.error')}
      </Marker>
      {onRetry && (
        <Button size="tiny" variant="outline" onClick={() => onRetry()}>
          <ArrowPathIcon aria-hidden="true" />
          {t('message.retry')}
        </Button>
      )}
    </div>
  );
}

export function MessageRoot({
  from = 'assistant',
  align: alignProp,
  name,
  avatar,
  time,
  locale,
  status = 'sent',
  onRetry,
  className,
  children,
  ...rest
}: Message.Props) {
  const group = use(MessageGroupContext);
  const labelId = useId();
  const contentRef = useRef<HTMLDivElement>(null);
  const readContent = useCallback(() => contentRef.current?.innerText ?? '', []);

  const align = alignProp ?? group?.align ?? (from === 'user' ? 'end' : 'start');
  const first = group?.first ?? true;
  const last = group?.last ?? true;
  const styles = messageStyle({ align, first });

  const { body, part } = splitParts(children);
  const header = part(MessageHeader);
  const content = part(MessageContent);
  const footer = part(MessageFooter);
  const timeIn = footer !== undefined || group !== null ? 'footer' : 'header';
  const labelled = name !== undefined || hasChildren(header);

  const drawnAvatar = part(MessageAvatar) ?? (avatar != null ? <MessageAvatar /> : null);
  const drawnHeader =
    header ??
    (name !== undefined || (timeIn === 'header' && time !== undefined) ? <MessageHeader /> : null);
  const drawnContent =
    content ?? (body.length > 0 ? <MessageContent>{body}</MessageContent> : null);
  const drawnFooter = footer ?? (group !== null && last ? <MessageFooter /> : null);

  return (
    <MessageContext
      value={{
        styles,
        from,
        align,
        name,
        avatar,
        time,
        locale,
        status,
        last,
        timeIn,
        labelId,
        contentRef,
        readContent,
      }}
    >
      <MessageGroupContext value={null}>
        <article
          aria-labelledby={labelled ? labelId : undefined}
          {...rest}
          data-message=""
          data-from={from}
          data-align={align}
          data-status={status}
          data-first={group !== null && first ? '' : undefined}
          data-last={group !== null && last ? '' : undefined}
          className={styles.root({ className })}
        >
          {drawnAvatar}
          <div className={styles.column()}>
            {drawnHeader}
            {drawnContent}
            {content !== undefined && body}
            {status === 'error' && <Failure styles={styles} onRetry={onRetry} />}
            {part(MessageActions)}
            {drawnFooter}
          </div>
        </article>
      </MessageGroupContext>
    </MessageContext>
  );
}
