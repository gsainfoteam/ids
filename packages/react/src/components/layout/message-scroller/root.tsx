'use client';

import { isValidElement, type ReactNode } from 'react';

import { MessageScrollerContext, MessageScrollerViewContext } from './context';
import { MessageScrollerList } from './list';
import { MessageScrollerScrollToBottom } from './scroll-to-bottom';
import { messageScrollerStyle } from './style';
import { useMessageScroller } from './use-message-scroller';
import { useTranslate } from '../../../internal/translate';
import { elementTypeOf, flattenFragments, invariant } from '../../../utils';
import { Card } from '../../data/card';
import { Spinner } from '../../feedback/spinner';
import { ScrollArea } from '../scroll-area';

import type { MessageScroller } from '.';

const isPart = (type: unknown) => (node: ReactNode) =>
  isValidElement(node) && elementTypeOf(node) === type;

const isList = isPart(MessageScrollerList);
const isScrollToBottom = isPart(MessageScrollerScrollToBottom);

function arrange(children: ReactNode) {
  const nodes = flattenFragments(children);
  const lists = nodes.filter(isList);
  const buttons = nodes.filter(isScrollToBottom);
  const messages = nodes.filter((node) => !isList(node) && !isScrollToBottom(node));

  invariant(lists.length <= 1, '`<MessageScroller>` accepts at most one `<MessageScroller.List>`.');
  invariant(
    !lists.length || messages.length === 0,
    '`<MessageScroller>` takes its messages either inside `<MessageScroller.List>` or directly, not both.',
  );

  return {
    list: lists[0] ?? <MessageScrollerList>{messages}</MessageScrollerList>,
    scrollToBottom: buttons.at(-1) ?? <MessageScrollerScrollToBottom />,
  };
}

export function MessageScrollerRoot({
  onReachStart,
  loading = false,
  stickToBottom = true,
  scrollOnAppend = 'end',
  className,
  children,
  'aria-label': label,
  'aria-labelledby': labelledBy,
  ...props
}: MessageScroller.Props) {
  const t = useTranslate();
  const { scroll, viewportProps, atEnd, unseen } = useMessageScroller({
    onReachStart,
    loading,
    stickToBottom,
    scrollOnAppend,
  });

  const { list, scrollToBottom } = arrange(children);
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
              aria-label={labelledBy ? label : (label ?? t('messageScroller.label'))}
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
                <Spinner size="tiny" aria-label={t('messageScroller.loading')} />
              </Card>
            </div>
          ) : null}
          {scrollToBottom}
        </div>
      </MessageScrollerViewContext>
    </MessageScrollerContext>
  );
}
