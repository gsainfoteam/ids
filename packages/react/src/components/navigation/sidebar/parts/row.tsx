'use client';

import { Item } from '../../../data/item';
import { tintedIcon } from '../lib/tinted-icon';
import { type SidebarIconColorScheme } from '../style';

import type { SidebarContextValue } from '../context';
import type { ItemParts } from '../lib/item-children';

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
