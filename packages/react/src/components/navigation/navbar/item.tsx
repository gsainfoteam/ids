'use client';

import {
  isValidElement,
  type ComponentProps,
  type MouseEvent,
  type ReactElement,
  type ReactNode,
} from 'react';

import { useNavbarContext } from './context';
import { invariant } from '../../../utils';
import { Item } from '../../data/item';
import { Link } from '../../typography/link';
import { linkElementOf } from '../sidebar/item-children';

export type NavbarItemProps = Omit<ComponentProps<'a'>, 'children' | 'href'> & {
  value?: string;
  href?: string;
  asChild?: boolean;
  children?: ReactNode;
};

function labelOf(asChild: boolean, children: ReactNode): ReactNode {
  if (!asChild) return children;
  invariant(
    isValidElement(children),
    '`<Navbar.Item asChild>` needs one link element as its child.',
  );
  return (children as ReactElement<{ children?: ReactNode }>).props.children;
}

export function NavbarItem({
  value,
  href,
  asChild = false,
  className,
  children,
  onClick,
  ...props
}: NavbarItemProps) {
  const navbar = useNavbarContext('Navbar.Item');
  const { styles } = navbar;
  const current = value !== undefined && value === navbar.value;
  const label = labelOf(asChild, children);
  const link = { href, asChild, children };
  const linkProps = {
    ...props,
    'aria-current': current ? ('page' as const) : undefined,
    'data-navbar-item': '',
    'data-navbar-value': value,
  };

  if (navbar.presentation === 'drawer')
    return (
      <li className={styles.listItem()}>
        <Item
          asChild
          interactive
          size="tiny"
          selected={current}
          className={styles.drawerItem({ className })}
        >
          {linkElementOf(
            link,
            {
              ...linkProps,
              onClick: (event: MouseEvent<HTMLAnchorElement>) => {
                onClick?.(event);
                navbar.setMenuOpen(false);
              },
            },
            <Item.Content asChild>
              <span>
                <Item.Title asChild truncate className={styles.drawerTitle()}>
                  <span>{label}</span>
                </Item.Title>
              </span>
            </Item.Content>,
          )}
        </Item>
      </li>
    );

  return (
    <li className={styles.listItem()}>
      <Link asChild colorScheme="neutral" underline="none" className={styles.link({ className })}>
        {linkElementOf(link, { ...linkProps, onClick }, label)}
      </Link>
    </li>
  );
}

NavbarItem.displayName = 'Navbar.Item';
