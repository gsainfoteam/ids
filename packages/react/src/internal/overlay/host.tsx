import {
  createContext,
  use,
  useLayoutEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from 'react';

import {
  bindLayer,
  overlay,
  overlayHosts,
  overlayItems,
  registerOverlayHost,
  removeClosed,
  removeIfNothingExits,
  type OverlayItem,
  type OverlayOptions,
  type OverlayRender,
} from './store';
import { ThemeContext } from '../../components/utility/ids-provider/use-ids-provider';

export type OverlayItemBinding = {
  open: boolean;
  close: (value?: unknown) => void;
  exited: () => void;
  bind: () => () => void;
};

export const OverlayItemContext = createContext<OverlayItemBinding | null>(null);

export const PortalRootContext = createContext<HTMLElement | null>(null);

const NO_ITEMS: readonly OverlayItem[] = [];

export function useOverlayItem(controlledOpen: boolean | undefined) {
  const item = use(OverlayItemContext);
  const bound = controlledOpen === undefined ? item : null;

  useLayoutEffect(() => bound?.bind(), [bound]);

  return bound;
}

export function useOverlay() {
  const theme = use(ThemeContext);

  return useMemo(
    () => ({
      ...overlay,
      open: <T,>(render: OverlayRender<T>, options: OverlayOptions = {}) =>
        overlay.open(render, { theme, ...options }),
    }),
    [theme],
  );
}

function OverlayItemView({ item }: { item: OverlayItem }) {
  const hostTheme = use(ThemeContext);
  const theme = item.theme ?? hostTheme;

  useLayoutEffect(() => {
    if (!item.open) removeIfNothingExits(item.id);
  }, [item.open, item.id]);

  const binding = useMemo<OverlayItemBinding>(
    () => ({
      open: item.open,
      close: (value) => overlay.close(item.id, value),
      exited: () => removeClosed(item.id),
      bind: () => bindLayer(item.id),
    }),
    [item.open, item.id],
  );

  return (
    <ThemeContext value={theme}>
      <div
        className="contents"
        data-overlay-item={item.id}
        data-color={theme.color}
        data-mode={theme.resolvedMode}
        style={{ colorScheme: theme.resolvedMode }}
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
  const [host] = useState(() => Symbol('overlay host'));

  useLayoutEffect(() => registerOverlayHost(host), [host]);

  const elected = useSyncExternalStore(
    overlayHosts.subscribe,
    () => overlayHosts.get()[0] === host,
    () => false,
  );
  const items = useSyncExternalStore(overlayItems.subscribe, overlayItems.get, () => NO_ITEMS);

  if (!elected) return null;
  return items.map((item) => <OverlayItemView key={item.id} item={item} />);
}
