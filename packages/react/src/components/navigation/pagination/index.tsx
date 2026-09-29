import type { ComponentProps, ReactNode } from 'react';

import { PaginationEllipsis, type PaginationEllipsisProps } from './ellipsis';
import { PaginationItem, type PaginationItemProps } from './item';
import { PaginationLink, type PaginationLinkProps } from './link';
import { PaginationList, type PaginationListProps } from './list';
import { PaginationNext, type PaginationNextProps } from './next';
import { PaginationPrevious, type PaginationPreviousProps } from './previous';
import { type PaginationEntry } from './range';
import { PaginationRoot } from './root';
import { paginationStyle } from './style';

import type { IdsSize, IdsVariant } from '../../../tokens/types';

export function Pagination(props: Pagination.Props) {
  return <PaginationRoot {...props} />;
}

export namespace Pagination {
  export type Entry = PaginationEntry;

  export type Props = Omit<ComponentProps<'nav'>, 'children'> & {
    page?: number;
    defaultPage?: number;
    onPageChange?: (page: number) => void;
    pageCount: number;
    siblingCount?: number;
    boundaryCount?: number;
    size?: IdsSize;
    variant?: IdsVariant;
    disabled?: boolean;
    getHref?: (page: number) => string;
    children?: ReactNode;
  };

  export type ListProps = PaginationListProps;
  export type ItemProps = PaginationItemProps;
  export type LinkProps = PaginationLinkProps;
  export type PreviousProps = PaginationPreviousProps;
  export type NextProps = PaginationNextProps;
  export type EllipsisProps = PaginationEllipsisProps;

  export const List = PaginationList;
  export namespace List {
    export type Props = PaginationListProps;
  }

  export const Item = PaginationItem;
  export namespace Item {
    export type Props = PaginationItemProps;
  }

  export const Link = PaginationLink;
  export namespace Link {
    export type Props = PaginationLinkProps;
  }

  export const Previous = PaginationPrevious;
  export namespace Previous {
    export type Props = PaginationPreviousProps;
  }

  export const Next = PaginationNext;
  export namespace Next {
    export type Props = PaginationNextProps;
  }

  export const Ellipsis = PaginationEllipsis;
  export namespace Ellipsis {
    export type Props = PaginationEllipsisProps;
  }

  export const Style = paginationStyle;
}
