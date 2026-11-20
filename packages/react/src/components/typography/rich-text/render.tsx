import type { ReactNode } from 'react';

import { renderToReactElement } from '@tiptap/static-renderer/pm/react';

import { RichTextCalloutTitle } from './callout-title';
import { calloutKindOf, type CalloutKind } from './schema/callout';
import { documentExtensions, documentMarkdown } from './schema/document';
import { isAllowedLinkHref, keepAllowedImages } from './schema/image-source';
import { richTextStyle } from './style';
import { Accordion } from '../../data/accordion';
import { Chip } from '../../data/chip';
import { CodeBlock } from '../../data/code-block';
import { Image } from '../../data/image';
import { Table } from '../../data/table';
import { Alert } from '../../feedback/alert';
import { Checkbox } from '../../form/checkbox';
import { Divider } from '../../layout/divider';
import { Link } from '../link';

import type { IdsSize } from '../../../tokens/types';
import type { JSONContent } from '@tiptap/core';
import type { Mark, Node as ProseMirrorNode } from '@tiptap/pm/model';

export type RichTextFormat = 'markdown' | 'json';

type NodeProps = {
  node: ProseMirrorNode;
  children?: ReactNode;
  renderElement: (props: { content: ProseMirrorNode; parent?: ProseMirrorNode }) => ReactNode;
};
type MarkProps = { mark: Mark; children?: ReactNode };

const NO_UPLOADS: ReadonlySet<string> = new Set();

const CALLOUT_SCHEME = {
  note: 'info',
  tip: 'success',
  important: 'primary',
  warning: 'warning',
  caution: 'danger',
} as const satisfies Record<CalloutKind, Alert.Props['colorScheme']>;

const extensions = documentExtensions();
const markdown = documentMarkdown(extensions);

export function documentOf(value: string | JSONContent | undefined, format: RichTextFormat) {
  if (value === undefined) return { type: 'doc', content: [] };
  if (typeof value === 'string')
    return format === 'json' ? JSON.parse(value) : markdown.parse(value);
  return keepAllowedImages(value, NO_UPLOADS);
}

const cssWidth = (width: unknown) =>
  typeof width === 'number' || (typeof width === 'string' && /^\d+(\.\d+)?$/.test(width))
    ? `${width}px`
    : undefined;

const cellSpan = (node: ProseMirrorNode) => ({
  colSpan: node.attrs.colspan > 1 ? node.attrs.colspan : undefined,
  rowSpan: node.attrs.rowspan > 1 ? node.attrs.rowspan : undefined,
});

const isHeaderRow = (row: ProseMirrorNode) => row.firstChild?.type.name === 'tableHeader';

export function renderDocument(
  document: JSONContent,
  { size, mentionHref }: { size: IdsSize; mentionHref?: (id: string) => string },
) {
  const styles = richTextStyle({ size });

  return renderToReactElement({
    content: document,
    extensions,
    options: {
      nodeMapping: {
        codeBlock: ({ node }: NodeProps) => (
          <CodeBlock language={node.attrs.language ?? undefined}>{node.textContent}</CodeBlock>
        ),
        callout: ({ node, children }: NodeProps) => {
          const kind = calloutKindOf(node.attrs.kind);
          return (
            <Alert role="note" colorScheme={CALLOUT_SCHEME[kind]} variant="soft">
              <RichTextCalloutTitle kind={kind} />
              <Alert.Description asChild>
                <div>{children}</div>
              </Alert.Description>
            </Alert>
          );
        },
        details: ({ node, children }: NodeProps) => (
          <Accordion type="multiple" defaultValue={node.attrs.open ? ['details'] : []}>
            <Accordion.Item value="details">{children}</Accordion.Item>
          </Accordion>
        ),
        detailsSummary: ({ children }: NodeProps) => (
          <Accordion.Header asChild>
            <div>
              <Accordion.Trigger>{children}</Accordion.Trigger>
            </div>
          </Accordion.Header>
        ),
        detailsContent: ({ children }: NodeProps) => (
          <Accordion.Content>{children}</Accordion.Content>
        ),
        image: ({ node }: NodeProps) => {
          const width = cssWidth(node.attrs.width);
          const image = (
            <Image
              src={node.attrs.src}
              alt={node.attrs.alt ?? ''}
              title={node.attrs.title ?? undefined}
              className={styles.image()}
              style={width ? { width } : undefined}
            />
          );
          if (!node.attrs.title) return image;
          return (
            <figure className={styles.figure()}>
              {image}
              <figcaption className={styles.caption()}>{node.attrs.title}</figcaption>
            </figure>
          );
        },
        table: ({ node, renderElement }: NodeProps) => {
          const rows: ProseMirrorNode[] = [];
          node.forEach((row) => rows.push(row));
          const [first] = rows;
          const header = first && isHeaderRow(first) ? first : undefined;
          const render = (list: ProseMirrorNode[]) =>
            list.map((row) => renderElement({ content: row, parent: node }));
          return (
            <Table layout="fixed">
              {header && <Table.Header>{render([header])}</Table.Header>}
              <Table.Body>{render(header ? rows.slice(1) : rows)}</Table.Body>
            </Table>
          );
        },
        tableRow: ({ children }: NodeProps) => <Table.Row>{children}</Table.Row>,
        tableHeader: ({ node, children }: NodeProps) => (
          <Table.Head {...cellSpan(node)}>{children}</Table.Head>
        ),
        tableCell: ({ node, children }: NodeProps) => (
          <Table.Cell {...cellSpan(node)}>{children}</Table.Cell>
        ),
        taskItem: ({ node, children }: NodeProps) => (
          <li data-checked={node.attrs.checked ? 'true' : 'false'}>
            <Checkbox
              checked={!!node.attrs.checked}
              readOnly
              aria-label={node.textContent}
              className={styles.taskBox()}
            />
            <div>{children}</div>
          </li>
        ),
        mention: ({ node }: NodeProps) => {
          const label = `@${node.attrs.label ?? node.attrs.id}`;
          const href = mentionHref && node.attrs.id ? mentionHref(node.attrs.id) : undefined;
          if (href && isAllowedLinkHref(href)) return <Link href={href}>{label}</Link>;
          return (
            <Chip variant="soft" size="tiny" className={styles.mention()}>
              {label}
            </Chip>
          );
        },
        horizontalRule: () => <Divider />,
      },
      markMapping: {
        link: ({ mark, children }: MarkProps) =>
          isAllowedLinkHref(mark.attrs.href) ? (
            <Link href={mark.attrs.href}>{children}</Link>
          ) : (
            <>{children}</>
          ),
      },
    },
  });
}
