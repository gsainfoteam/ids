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
import { CodeBlockLineNumbers } from './line-numbers';
import { codeBlockStyle } from './style';
import { CodeBlockTitle } from './title';
import { useHighlightedLines } from './use-code-block';
import { useControllableState } from '../../../hooks/use-controllable-state';
import { elementTypeOf } from '../../../utils';
import { isDevelopment } from '../../../utils/dev';
import { Divider } from '../../layout/divider';
import { ScrollArea } from '../../layout/scroll-area';

import type { CodeBlock } from '.';

const withoutEdgeNewlines = (code: string) => code.replace(/^\r?\n/, '').replace(/\r?\n$/, '');

const isPart = (child: ReactNode, part: unknown): child is ReactElement =>
  isValidElement(child) && elementTypeOf(child) === part;

function splitChildren(children: ReactNode) {
  let code = '';
  let title: ReactElement | undefined;
  let copy: ReactElement | undefined;
  let lineNumbers = false;

  Children.toArray(children).forEach((child) => {
    if (typeof child === 'string' || typeof child === 'number') code += String(child);
    else if (isPart(child, CodeBlockTitle)) title = child;
    else if (isPart(child, CodeBlockCopy)) copy = child;
    else if (isPart(child, CodeBlockLineNumbers)) lineNumbers = true;
    else if (isDevelopment)
      console.warn(
        'CodeBlock: children take the code as a string, `CodeBlock.Title`, `CodeBlock.LineNumbers` and `CodeBlock.Copy`.',
      );
  });

  return { code: withoutEdgeNewlines(code.replace(/\r\n/g, '\n')), title, copy, lineNumbers };
}

export function CodeBlockRoot({
  children,
  language = 'text',
  highlight,
  variant = 'outline',
  collapsedLines,
  expanded: expandedProp,
  defaultExpanded = false,
  onExpandedChange,
  className,
  style,
  ...rest
}: CodeBlock.Props) {
  const { code, title, copy, lineNumbers } = splitChildren(children);
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
  const showLanguage = !isPlainText(language);
  const hasCaption = title != null || showLanguage;
  const styles = codeBlockStyle({ variant, lineNumbers, captioned: hasCaption, collapsed });
  const digits = String(lines.length).length;

  return (
    <CodeBlockContext value={{ code, styles }}>
      <figure
        {...rest}
        data-variant={variant}
        data-language={language}
        data-line-numbers={lineNumbers ? '' : undefined}
        data-collapsed={collapsed ? '' : undefined}
        className={styles.root({ className })}
        style={style}
      >
        {hasCaption && (
          <figcaption className={styles.caption()}>
            {title}
            {showLanguage && <span className={styles.language()}>{language}</span>}
          </figcaption>
        )}
        {hasCaption && <Divider aria-hidden className={styles.divider()} />}
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
            onExpandedChange={setExpanded}
          />
        )}
      </figure>
    </CodeBlockContext>
  );
}
