'use client';

import { isValidElement } from 'react';

import { BreadcrumbContext } from './context';
import { BreadcrumbList } from './list';
import { breadcrumbStyle } from './style';
import { useTranslate } from '../../../internal/translate';
import { elementTypeOf, flattenFragments } from '../../../utils';

import type { Breadcrumb } from '.';

export function BreadcrumbRoot({
  size = 'standard',
  separator,
  maxItems,
  className,
  children,
  ...props
}: Breadcrumb.Props) {
  const t = useTranslate();
  const styles = breadcrumbStyle({ size });

  const writesOwnList = flattenFragments(children).some(
    (child) => isValidElement(child) && elementTypeOf(child) === BreadcrumbList,
  );

  return (
    <BreadcrumbContext value={{ styles, separator, maxItems }}>
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
