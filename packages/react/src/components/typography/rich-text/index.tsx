import type { ComponentProps } from 'react';

import { documentOf, renderDocument, type RichTextFormat } from './render';
import { richTextStyle } from './style';

import type { IdsSize } from '../../../tokens/types';
import type { JSONContent } from '@tiptap/core';

export function RichText({
  value,
  format = 'markdown',
  size = 'standard',
  mentionHref,
  className,
  ...props
}: RichText.Props) {
  const document = documentOf(value, format);

  return (
    <div data-rich-text="" {...props} className={richTextStyle({ size }).root({ className })}>
      {renderDocument(document, { size, mentionHref })}
    </div>
  );
}

export namespace RichText {
  export type Format = RichTextFormat;

  export type Props = Omit<ComponentProps<'div'>, 'children'> &
    ({ format?: 'markdown'; value?: string } | { format: 'json'; value?: JSONContent | string }) & {
      size?: IdsSize;
      mentionHref?: (id: string) => string;
    };

  export const Style = richTextStyle;
}

export type RichTextProps = RichText.Props;
