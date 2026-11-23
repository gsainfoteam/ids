'use client';

import { isValidElement } from 'react';

import { BreadcrumbContext } from './context';
import { BreadcrumbList } from './parts/list';
import { breadcrumbStyle } from './style';
import { useInternalTranslate } from '../../../internal/translate';
import { elementTypeOf, flattenFragments } from '../../../utils';

import type { Breadcrumb } from '.';

export function BreadcrumbRoot({
  size = 'standard',
  maxItems,
  className,
  children,
  ...props
}: Breadcrumb.Props) {
  const t = useInternalTranslate();
  const styles = breadcrumbStyle({ size });

  const writesOwnList = flattenFragments(children).some(
    (child) => isValidElement(child) && elementTypeOf(child) === BreadcrumbList,
  );

  return (
    <BreadcrumbContext value={{ styles, maxItems }}>
      <nav
        aria-label={t('breadcrumb.label')}
        {...props}
        data-breadcrumb=""
        data-size={size}
        className={styles.root({ className })}
      >
        {writesOwnList ? children : <BreadcrumbList>{children}</BreadcrumbList>}
      </nav>
    </BreadcrumbContext>
  );
}
