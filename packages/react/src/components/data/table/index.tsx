import { type ComponentProps, type CSSProperties } from 'react';

import { type TableAlign, type TableLayout, type TableSection, type TableVariant } from './context';
import { TableBody, type TableBodyProps } from './parts/body';
import { TableCaption, type TableCaptionProps } from './parts/caption';
import { TableCell, type TableCellProps } from './parts/cell';
import { TableFooter, type TableFooterProps } from './parts/footer';
import { TableHead, type TableHeadProps } from './parts/head';
import { TableHeader, type TableHeaderProps } from './parts/header';
import { TableRow, type TableRowProps } from './parts/row';
import { TableRoot } from './root';
import { tableStyle } from './style';

import type { IdsSize } from '../../../tokens/types';

export function Table(props: Table.Props) {
  return <TableRoot {...props} />;
}

export namespace Table {
  export type Variant = TableVariant;
  export type Align = TableAlign;
  export type Layout = TableLayout;
  export type Section = TableSection;

  export type Props = Omit<ComponentProps<'table'>, 'className' | 'style'> & {
    variant?: TableVariant;
    size?: IdsSize;
    layout?: TableLayout;
    className?: string;
    style?: CSSProperties;
  };

  export type HeaderProps = TableHeaderProps;
  export type BodyProps = TableBodyProps;
  export type FooterProps = TableFooterProps;
  export type RowProps = TableRowProps;
  export type HeadProps = TableHeadProps;
  export type CellProps = TableCellProps;
  export type CaptionProps = TableCaptionProps;

  export const Header = TableHeader;
  export namespace Header {
    export type Props = TableHeaderProps;
  }

  export const Body = TableBody;
  export namespace Body {
    export type Props = TableBodyProps;
  }

  export const Footer = TableFooter;
  export namespace Footer {
    export type Props = TableFooterProps;
  }

  export const Row = TableRow;
  export namespace Row {
    export type Props = TableRowProps;
  }

  export const Head = TableHead;
  export namespace Head {
    export type Props = TableHeadProps;
  }

  export const Cell = TableCell;
  export namespace Cell {
    export type Props = TableCellProps;
  }

  export const Caption = TableCaption;
  export namespace Caption {
    export type Props = TableCaptionProps;
  }

  export const Style = tableStyle;
}

export type { TableAlign, TableLayout, TableSection, TableVariant } from './context';
export type TableProps = Table.Props;
