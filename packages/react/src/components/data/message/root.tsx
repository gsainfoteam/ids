'use client';

import { isValidElement, use, useCallback, useId, useRef, type ReactNode } from 'react';

import { ArrowPathIcon, ExclamationCircleIcon } from '@heroicons/react/16/solid';

import { MessageContext, MessageGroupContext } from './context';
import { MessageActions } from './parts/actions';
import { MessageAvatar } from './parts/avatar';
import { MessageContent } from './parts/content';
import { MessageFooter } from './parts/footer';
import { MessageHeader } from './parts/header';
import { MessageSide } from './parts/side';
import { messageStyle } from './style';
import { useInternalTranslate } from '../../../internal/translate';
import { containsElementOfType, elementTypeOf, flattenFragments } from '../../../utils';
import { Button } from '../../action/button';
import { Marker } from '../../feedback/marker';
import { Bubble } from '../bubble';
import { BubbleAlignContext } from '../bubble/context';
import { BubbleRoot } from '../bubble/root';

import type { Message } from '.';

export type MessageAlign = 'start' | 'end';
export type MessageStatus = 'sent' | 'pending' | 'error';

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

const BUBBLE = new Set<unknown>([Bubble, BubbleRoot]);

function childrenOf(part: ReactNode) {
  return isValidElement<{ children?: ReactNode }>(part) ? part.props.children : undefined;
}

function Failure({
  styles,
  onRetry,
}: {
  styles: ReturnType<typeof messageStyle>;
  onRetry: (() => void) | undefined;
}) {
  const t = useInternalTranslate();

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
  align: alignProp,
  name,
  time,
  status = 'sent',
  unread,
  onRetry,
  className,
  children,
  ...rest
}: Message.Props) {
  const group = use(MessageGroupContext);
  const labelId = useId();
  const contentRef = useRef<HTMLDivElement>(null);
  const readContent = useCallback(() => contentRef.current?.innerText ?? '', []);

  const align = alignProp ?? group?.align ?? 'start';
  const first = group?.first ?? true;
  const last = group?.last ?? true;
  const { body, part } = splitParts(children);
  const header = part(MessageHeader);
  const content = part(MessageContent);
  const footer = part(MessageFooter);
  const bubbled = containsElementOfType(content ? childrenOf(content) : body, BUBBLE);
  const timeIn = bubbled ? 'side' : footer !== undefined || group !== null ? 'footer' : 'header';
  const labelled = name !== undefined || childrenOf(header) != null;
  const styles = messageStyle({ align, first, bubbled, status });

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
        align,
        name,
        time,
        status,
        unread,
        last,
        timeIn,
        labelId,
        contentRef,
        readContent,
      }}
    >
      <MessageGroupContext value={null}>
        <BubbleAlignContext value={align}>
          <article
            aria-labelledby={labelled ? labelId : undefined}
            {...rest}
            data-message=""
            data-align={align}
            data-status={status}
            data-first={group !== null && first ? '' : undefined}
            data-last={group !== null && last ? '' : undefined}
            className={styles.root({ className })}
          >
            {part(MessageAvatar)}
            <div className={styles.column()}>
              {drawnHeader}
              <div className={styles.body()}>
                {drawnContent}
                <MessageSide onRetry={bubbled ? onRetry : undefined} />
              </div>
              {content !== undefined && body}
              {status === 'error' && (
                <Failure styles={styles} onRetry={bubbled ? undefined : onRetry} />
              )}
              {part(MessageActions)}
              {drawnFooter}
            </div>
          </article>
        </BubbleAlignContext>
      </MessageGroupContext>
    </MessageContext>
  );
}
