import { type ComponentProps, type ReactNode } from 'react';

import { BreadcrumbEllipsis, type BreadcrumbEllipsisProps } from './ellipsis';
import { BreadcrumbItem, type BreadcrumbItemProps } from './item';
import { BreadcrumbLink, type BreadcrumbLinkProps } from './link';
import { BreadcrumbList, type BreadcrumbListProps } from './list';
import { BreadcrumbPage, type BreadcrumbPageProps } from './page';
import { BreadcrumbRoot } from './root';
import { BreadcrumbSeparator, type BreadcrumbSeparatorProps } from './separator';
import { breadcrumbStyle } from './style';

import type { IdsSize } from '../../../tokens/types';

export function Breadcrumb(props: Breadcrumb.Props) {
  return <BreadcrumbRoot {...props} />;
}

export namespace Breadcrumb {
  export type Props = ComponentProps<'nav'> & {
    size?: IdsSize;
    separator?: ReactNode;
    maxItems?: number;
  };

  export type ListProps = BreadcrumbListProps;
  export type ItemProps = BreadcrumbItemProps;
  export type LinkProps = BreadcrumbLinkProps;
  export type PageProps = BreadcrumbPageProps;
  export type SeparatorProps = BreadcrumbSeparatorProps;
  export type EllipsisProps = BreadcrumbEllipsisProps;

  export const List = BreadcrumbList;
  export namespace List {
    export type Props = BreadcrumbListProps;
  }

  export const Item = BreadcrumbItem;
  export namespace Item {
    export type Props = BreadcrumbItemProps;
  }

  export const Link = BreadcrumbLink;
  export namespace Link {
    export type Props = BreadcrumbLinkProps;
  }

  export const Page = BreadcrumbPage;
  export namespace Page {
    export type Props = BreadcrumbPageProps;
  }

  export const Separator = BreadcrumbSeparator;
  export namespace Separator {
    export type Props = BreadcrumbSeparatorProps;
  }

  export const Ellipsis = BreadcrumbEllipsis;
  export namespace Ellipsis {
    export type Props = BreadcrumbEllipsisProps;
  }

  export const Style = breadcrumbStyle;
}
