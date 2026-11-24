import { type ComponentProps, type ReactNode } from 'react';

import { CodeBlockCopy, type CodeBlockCopyProps } from './parts/copy';
import { CodeBlockLineNumbers, type CodeBlockLineNumbersProps } from './parts/line-numbers';
import { CodeBlockTitle, type CodeBlockTitleProps } from './parts/title';
import { CodeBlockRoot } from './root';
import { codeBlockStyle } from './style';

import type { CodeBlockToken } from './lib/highlight';

export function CodeBlock(props: CodeBlock.Props) {
  return <CodeBlockRoot {...props} />;
}

export namespace CodeBlock {
  export type Variant = 'outline' | 'soft';
  export type Token = CodeBlockToken;

  export type Props = Omit<ComponentProps<'figure'>, 'children' | 'title'> & {
    children?: ReactNode;
    language?: string;
    highlight?: readonly number[];
    variant?: Variant;
    collapsedLines?: number;
    expanded?: boolean;
    defaultExpanded?: boolean;
    onExpandedChange?: (expanded: boolean) => void;
  };

  export type TitleProps = CodeBlockTitleProps;
  export type LineNumbersProps = CodeBlockLineNumbersProps;
  export type CopyProps = CodeBlockCopyProps;

  export const Title = CodeBlockTitle;
  export namespace Title {
    export type Props = CodeBlockTitleProps;
  }

  export const LineNumbers = CodeBlockLineNumbers;
  export namespace LineNumbers {
    export type Props = CodeBlockLineNumbersProps;
  }

  export const Copy = CodeBlockCopy;
  export namespace Copy {
    export type Props = CodeBlockCopyProps;
  }

  export const Style = codeBlockStyle;
}
