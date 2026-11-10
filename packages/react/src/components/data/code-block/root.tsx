'use client';

import {
  Children,
  Fragment,
  isValidElement,
  useId,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
} from 'react';

import { CodeBlockContext } from './context';
import { CodeBlockCopy } from './copy';
import { CodeBlockFold } from './fold';
import { isPlainText } from './highlight';
import { codeBlockStyle } from './style';
import { useHighlightedLines } from './use-code-block';
import { useControllableState } from '../../../hooks/use-controllable-state';
import { elementTypeOf } from '../../../utils';
import { isDevelopment } from '../../../utils/dev';
import { Divider } from '../../layout/divider';
import { ScrollArea } from '../../layout/scroll-area';

import type { CodeBlock } from '.';

const COPY_PARTS: ReadonlySet<unknown> = new Set([CodeBlockCopy]);

const withoutEdgeNewlines = (code: string) => code.replace(/^\r?\n/, '').replace(/\r?\n$/, '');

function splitChildren(children: ReactNode) {
  let code = '';
  let copy: ReactElement | undefined;

  Children.toArray(children).forEach((child) => {
    if (typeof child === 'string' || typeof child === 'number') code += String(child);
    else if (isValidElement(child) && COPY_PARTS.has(elementTypeOf(child))) copy = child;
    else if (isDevelopment)
      console.warn('CodeBlock: children take the code as a string and `CodeBlock.Copy`.');
  });

  return { code: withoutEdgeNewlines(code.replace(/\r\n/g, '\n')), copy };
}

export function CodeBlockRoot({
  children,
  language = 'text',
  title,
  lineNumbers = false,
  highlight,
  wrap = false,
  variant = 'outline',
  collapsedLines,
  expanded: expandedProp,
  defaultExpanded = false,
  onExpandedChange,
  className,
  style,
  ...rest
}: CodeBlock.Props) {
  const { code, copy } = splitChildren(children);
  const lines = useHighlightedLines(code, language);
  const highlighted = new Set(highlight);
  const preId = useId();
  const [expanded, setExpanded] = useControllableState({
    value: expandedProp,
    defaultValue: defaultExpanded,
    onValueChange: onExpandedChange,
  });
  const hiddenLines = collapsedLines == null ? 0 : Math.max(0, lines.length - collapsedLines);
  const foldable = hiddenLines > 0;
  const collapsed = foldable && !expanded;
  const styles = codeBlockStyle({ variant, wrap, lineNumbers, collapsed });
  const showLanguage = !isPlainText(language);
  const hasCaption = title != null || showLanguage;
  const digits = String(lines.length).length;

  return (
    <CodeBlockContext value={{ code, styles }}>
      <figure
        {...rest}
        data-variant={variant}
        data-language={language}
        data-wrap={wrap ? '' : undefined}
        data-line-numbers={lineNumbers ? '' : undefined}
        data-collapsed={collapsed ? '' : undefined}
        className={styles.root({ className })}
        style={style}
      >
        {hasCaption && (
          <figcaption className={styles.caption()}>
            {title != null && <span className={styles.title()}>{title}</span>}
            {showLanguage && <span className={styles.language()}>{language}</span>}
          </figcaption>
        )}
        {hasCaption && <Divider decorative className={styles.divider()} />}
        {copy ?? <CodeBlockCopy />}
        <ScrollArea orientation="horizontal" className={styles.scroller()}>
          <ScrollArea.Viewport asChild>
            <pre
              id={preId}
              dir="ltr"
              className={styles.pre()}
              style={{ '--code-block-collapsed-lines': collapsedLines } as CSSProperties}
            >
              <code
                className={styles.code()}
                style={{ '--code-block-digits': digits } as CSSProperties}
              >
                {lines.map((segments, index) => (
                  <Fragment key={index}>
                    {index > 0 && '\n'}
                    <span
                      data-line={index + 1}
                      data-highlighted={highlighted.has(index + 1) ? '' : undefined}
                      className={styles.line()}
                    >
                      <span className={styles.glyphs()}>
                        {segments.map((segment, at) =>
                          segment.token ? (
                            <span key={at} data-token={segment.token}>
                              {segment.text}
                            </span>
                          ) : (
                            segment.text
                          ),
                        )}
                      </span>
                    </span>
                  </Fragment>
                ))}
              </code>
            </pre>
          </ScrollArea.Viewport>
        </ScrollArea>
        {foldable && (
          <CodeBlockFold
            className={styles.fold()}
            controls={preId}
            expanded={expanded}
            hiddenLines={hiddenLines}
            onExpandedChange={setExpanded}
          />
        )}
      </figure>
    </CodeBlockContext>
  );
}
