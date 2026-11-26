'use client';

import { isValidElement, use, useId, type ReactElement, type ReactNode } from 'react';

import { MessageContext, MessageGroupContext, MessageRetryPlacementContext } from './context';
import { useInternalMessageContentReader } from './hooks/use-message-content-reader';
import { MessageActions } from './parts/actions';
import { MessageAvatar } from './parts/avatar';
import { MessageContent } from './parts/content';
import { MessageFooter } from './parts/footer';
import { MessageHeader } from './parts/header';
import { MessageRetry } from './parts/retry';
import { MessageSide } from './parts/side';
import { MessageStatus as MessageStatusPart, type MessageStatusProps } from './parts/status';
import { messageStyle } from './style';
import { containsElementOfType, elementTypeOf, flattenFragments } from '../../../utils';
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
  MessageStatusPart,
  MessageRetry,
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

export function MessageRoot({
  align: alignProp,
  name,
  time,
  unread,
  className,
  children,
  ...rest
}: Message.Props) {
  const group = use(MessageGroupContext);
  const labelId = useId();
  const { contentRef, readContent } = useInternalMessageContentReader();

  const align = alignProp ?? group?.align ?? 'start';
  const first = group?.first ?? true;
  const last = group?.last ?? true;
  const { body, part } = splitParts(children);
  const header = part(MessageHeader);
  const content = part(MessageContent);
  const footer = part(MessageFooter);
  const statusPart = part(MessageStatusPart) as ReactElement<MessageStatusProps> | undefined;
  const status: MessageStatus = statusPart?.props.value ?? 'sent';
  const retry = part(MessageRetry);
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
        retryBesideTheFailure:
          !bubbled && retry ? (
            <MessageRetryPlacementContext value="failure">{retry}</MessageRetryPlacementContext>
          ) : null,
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
                <MessageSide retry={bubbled ? retry : null} />
              </div>
              {content !== undefined && body}
              {statusPart}
              {part(MessageActions)}
              {drawnFooter}
            </div>
          </article>
        </BubbleAlignContext>
      </MessageGroupContext>
    </MessageContext>
  );
}
