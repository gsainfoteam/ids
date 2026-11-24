'use client';

import { isValidElement, type ReactNode } from 'react';

import { MessageScrollerContext, MessageScrollerViewContext } from './context';
import { useInternalMessageScroller } from './hooks/use-message-scroller';
import { MessageScrollerJump } from './parts/jump';
import { MessageScrollerList } from './parts/list';
import { messageScrollerStyle } from './style';
import { useInternalRequiredName } from '../../../internal/lib/accessible-name';
import { useInternalTranslate } from '../../../internal/translate';
import { elementTypeOf, flattenFragments, invariant } from '../../../utils';
import { Card } from '../../data/card';
import { Spinner } from '../../feedback/spinner';
import { ScrollArea } from '../scroll-area';

import type { MessageScroller } from '.';

const isPart = (type: unknown) => (node: ReactNode) =>
  isValidElement(node) && elementTypeOf(node) === type;

const isList = isPart(MessageScrollerList);
const isJump = isPart(MessageScrollerJump);

function arrange(children: ReactNode) {
  const nodes = flattenFragments(children);
  const lists = nodes.filter(isList);
  const buttons = nodes.filter(isJump);
  const messages = nodes.filter((node) => !isList(node) && !isJump(node));

  invariant(lists.length <= 1, '`<MessageScroller>` accepts at most one `<MessageScroller.List>`.');
  invariant(
    !lists.length || messages.length === 0,
    '`<MessageScroller>` takes its messages either inside `<MessageScroller.List>` or directly, not both.',
  );

  return {
    list: lists[0] ?? <MessageScrollerList>{messages}</MessageScrollerList>,
    jump: buttons.at(-1) ?? <MessageScrollerJump />,
  };
}

export function MessageScrollerRoot({
  onReachStart,
  stickToBottom = true,
  scrollOnAppend = 'end',
  className,
  children,
  'aria-label': label,
  'aria-labelledby': labelledBy,
  'aria-busy': ariaBusy,
  ...props
}: MessageScroller.Props) {
  const t = useInternalTranslate();
  useInternalRequiredName('MessageScroller', { 'aria-label': label, 'aria-labelledby': labelledBy });

  const loading = ariaBusy === true || ariaBusy === 'true';
  const { scroll, viewportProps, atEnd, unseen } = useInternalMessageScroller({
    onReachStart,
    loading,
    stickToBottom,
    scrollOnAppend,
  });

  const { list, jump } = arrange(children);
  const styles = messageScrollerStyle();

  return (
    <MessageScrollerContext value={scroll}>
      <MessageScrollerViewContext value={{ atEnd, unseen }}>
        <div
          {...props}
          data-message-scroller=""
          data-at-end={atEnd ? '' : undefined}
          data-loading={loading ? '' : undefined}
          className={styles.root({ className })}
        >
          <ScrollArea className={styles.area()}>
            <ScrollArea.Viewport
              {...viewportProps}
              role="log"
              aria-label={label}
              aria-labelledby={labelledBy}
              aria-busy={loading || undefined}
              className={styles.viewport()}
            >
              {list}
            </ScrollArea.Viewport>
          </ScrollArea>
          {loading ? (
            <div data-message-scroller-loader="" className={styles.loader()}>
              <Card variant="outline" size="tiny" className={styles.loaderSurface()}>
                <Spinner size="tiny" aria-label={t('common.loading')} />
              </Card>
            </div>
          ) : null}
          {jump}
        </div>
      </MessageScrollerViewContext>
    </MessageScrollerContext>
  );
}
