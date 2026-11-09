import { type ComponentProps, type ReactNode } from 'react';

import { CodeBlockCopy, type CodeBlockCopyProps } from './copy';
import { CodeBlockRoot } from './root';
import { codeBlockStyle } from './style';

import type { CodeBlockToken } from './highlight';

export function CodeBlock(props: CodeBlock.Props) {
  return <CodeBlockRoot {...props} />;
}

export namespace CodeBlock {
  export type Variant = 'outline' | 'soft';
  export type Token = CodeBlockToken;

  export type Props = Omit<ComponentProps<'figure'>, 'children' | 'title'> & {
    children?: ReactNode;
    language?: string;
    title?: ReactNode;
    lineNumbers?: boolean;
    highlight?: readonly number[];
    wrap?: boolean;
    variant?: Variant;
  };

  export type CopyProps = CodeBlockCopyProps;

  export const Copy = CodeBlockCopy;
  export namespace Copy {
    export type Props = CodeBlockCopyProps;
  }

  export const Style = codeBlockStyle;
}
