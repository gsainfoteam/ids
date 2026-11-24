'use client';

import { isValidElement } from 'react';

import { BreadcrumbContext } from './context';
import { BreadcrumbList } from './list';
import { breadcrumbStyle } from './style';
import { useRequiredName } from '../../../internal/accessible-name';
import { elementTypeOf, flattenFragments } from '../../../utils';

import type { Breadcrumb } from '.';

export function BreadcrumbRoot({
  size = 'standard',
  maxItems,
  className,
  children,
  ...props
}: Breadcrumb.Props) {
  useRequiredName('Breadcrumb', props);

  const styles = breadcrumbStyle({ size });

  const writesOwnList = flattenFragments(children).some(
    (child) => isValidElement(child) && elementTypeOf(child) === BreadcrumbList,
  );

  return (
    <BreadcrumbContext value={{ styles, maxItems }}>
      <nav {...props} data-breadcrumb="" data-size={size} className={styles.root({ className })}>
        {writesOwnList ? children : <BreadcrumbList>{children}</BreadcrumbList>}
      </nav>
    </BreadcrumbContext>
  );
}
