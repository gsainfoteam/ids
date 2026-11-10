'use client';

import { cloneElement, isValidElement, type ReactNode } from 'react';

import { ArrowUpRightIcon } from '@heroicons/react/16/solid';
import { isFunction } from 'es-toolkit';

import { linkStyle } from './style';
import { useTranslate } from '../../../internal/translate';
import { invariant, mergeProps } from '../../../utils';

import type { Link } from '.';

type RenderChildren = (...args: never[]) => ReactNode;
type ChildProps = { target?: string; rel?: string; children?: ReactNode | RenderChildren };

const SAFE_NEW_TAB_REL = 'noopener noreferrer';

function appendToChildren(children: ChildProps['children'], tail: ReactNode) {
  if (isFunction(children))
    return (...args: never[]) => (
      <>
        {children(...args)}
        {tail}
      </>
    );

  return (
    <>
      {children}
      {tail}
    </>
  );
}

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

  if (child) {
    const merged = mergeProps(child.props, props);
    if (!newTabHint) return cloneElement(child, merged);
    return cloneElement(child, {
      ...merged,
      children: appendToChildren(child.props.children, newTabHint),
    });
  }

  return (
    <a {...props}>
      {children}
      {newTabHint}
    </a>
  );
}
