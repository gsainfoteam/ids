'use client';

import { cloneElement, isValidElement, type ReactNode } from 'react';

import { ArrowUpRightIcon } from '@heroicons/react/16/solid';

import { linkStyle } from './style';
import { useTranslate } from '../../../internal/translate';
import { invariant, mergeProps } from '../../../utils';

import type { Link } from '.';

type ChildProps = { target?: string; rel?: string; children?: ReactNode };

const SAFE_NEW_TAB_REL = 'noopener noreferrer';

export function LinkRoot({
  colorScheme = 'accent',
  underline = 'always',
  asChild = false,
  target,
  rel,
  className,
  children,
  ...rest
}: Link.Props) {
  const t = useTranslate();
  const child = asChild && isValidElement<ChildProps>(children) ? children : undefined;
  invariant(
    !asChild || child !== undefined,
    '`Link asChild` requires one element to render as, such as a router link.',
  );

  const resolvedTarget = target ?? child?.props.target;
  const opensNewTab = resolvedTarget === '_blank';
  const resolvedRel = rel ?? child?.props.rel ?? (opensNewTab ? SAFE_NEW_TAB_REL : undefined);
  const styles = linkStyle({ colorScheme, underline });

  const props = {
    ...rest,
    target: resolvedTarget,
    rel: resolvedRel,
    'data-link': '',
    'data-color-scheme': colorScheme,
    'data-underline': underline,
    className: styles.root({ className }),
  };
  const newTabHint = opensNewTab && (
    <>
      <ArrowUpRightIcon aria-hidden="true" data-link-new-tab="" className={styles.newTab()} />
      <span className="sr-only"> {t('link.newTab')}</span>
    </>
  );

  if (child)
    return cloneElement(child, mergeProps(child.props, props), child.props.children, newTabHint);

  return (
    <a {...props}>
      {children}
      {newTabHint}
    </a>
  );
}
