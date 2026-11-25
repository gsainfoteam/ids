'use client';

import { use } from 'react';

import { ThemeContext } from '../../../components/utility/ids-provider/hooks/use-ids-provider';
import { OverlayItemContext } from '../context';
import { useInternalOverlayHost } from '../hooks/use-overlay-host';
import { useInternalOverlayItemBinding } from '../hooks/use-overlay-item-binding';
import { overlay, type OverlayItem } from '../lib/store';

function OverlayItemView({ item }: { item: OverlayItem }) {
  const hostTheme = use(ThemeContext);
  const theme = item.theme ?? hostTheme;
  const binding = useInternalOverlayItemBinding(item);

  return (
    <ThemeContext value={theme}>
      <div
        className="contents scheme-primary"
        data-overlay-item={item.id}
        data-mode={theme.resolvedMode}
        data-scale={theme.scale}
        style={{ colorScheme: theme.resolvedMode, ...theme.variables }}
      >
        <OverlayItemContext value={binding}>
          {item.render({
            id: item.id,
            isOpen: item.open,
            close: binding.close,
            unmount: () => overlay.unmount(item.id),
          })}
        </OverlayItemContext>
      </div>
    </ThemeContext>
  );
}

export function OverlayHost() {
  const items = useInternalOverlayHost();

  return items.map((item) => <OverlayItemView key={item.id} item={item} />);
}
