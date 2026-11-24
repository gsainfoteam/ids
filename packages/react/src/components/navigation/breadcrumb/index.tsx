import { type ComponentProps } from 'react';

import { BreadcrumbEllipsis, type BreadcrumbEllipsisProps } from './parts/ellipsis';
import { BreadcrumbItem, type BreadcrumbItemProps } from './parts/item';
import { BreadcrumbLink, type BreadcrumbLinkProps } from './parts/link';
import { BreadcrumbList, type BreadcrumbListProps } from './parts/list';
import { BreadcrumbPage, type BreadcrumbPageProps } from './parts/page';
import { BreadcrumbSeparator, type BreadcrumbSeparatorProps } from './parts/separator';
import { BreadcrumbRoot } from './root';
import { breadcrumbStyle } from './style';

import type { AccessibleName } from '../../../internal/lib/accessible-name';
import type { IdsSize } from '../../../tokens/types';

export function Breadcrumb(props: Breadcrumb.Props) {
  return <BreadcrumbRoot {...props} />;
}

export namespace Breadcrumb {
  export type Props = ComponentProps<'nav'> &
    AccessibleName & {
      size?: IdsSize;
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
