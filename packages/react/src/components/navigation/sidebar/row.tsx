'use client';

import { cloneElement, isValidElement, type ReactNode } from 'react';

import { sidebarStyle, type SidebarIconColorScheme } from './style';
import { Item } from '../../data/item';

import type { SidebarContextValue } from './context';
import type { ItemParts } from './item-children';

export function tintedIcon(icon: ReactNode, colorScheme: SidebarIconColorScheme | undefined) {
  if (!colorScheme || colorScheme === 'neutral') return icon;
  if (!isValidElement<{ className?: string }>(icon)) return icon;
  return cloneElement(icon, {
    className: sidebarStyle({ iconColor: colorScheme }).icon({ className: icon.props.className }),
  });
}

export function SidebarRow({
  parts,
  styles,
  colorScheme,
}: {
  parts: Pick<ItemParts<unknown>, 'icon' | 'label' | 'end'>;
  styles: SidebarContextValue['styles'];
  colorScheme?: SidebarIconColorScheme;
}) {
  return (
    <>
      {parts.icon !== undefined && (
        <Item.Media asChild className={styles.media()}>
          <span>{tintedIcon(parts.icon, colorScheme)}</span>
        </Item.Media>
      )}
      <Item.Content asChild className={styles.label()}>
        <span>
          <Item.Title asChild truncate className={styles.title()}>
            <span>{parts.label}</span>
          </Item.Title>
        </span>
      </Item.Content>
      {parts.end.length > 0 && (
        <Item.Actions asChild className={styles.end()}>
          <span>{parts.end}</span>
        </Item.Actions>
      )}
    </>
  );
}
