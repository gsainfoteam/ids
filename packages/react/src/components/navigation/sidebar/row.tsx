'use client';

import { Item } from '../../data/item';

import type { SidebarContextValue } from './context';
import type { ItemParts } from './item-children';

export function SidebarRow({
  parts,
  styles,
}: {
  parts: Pick<ItemParts<unknown>, 'icon' | 'label' | 'end'>;
  styles: SidebarContextValue['styles'];
}) {
  return (
    <>
      {parts.icon !== undefined && (
        <Item.Media asChild>
          <span>{parts.icon}</span>
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
