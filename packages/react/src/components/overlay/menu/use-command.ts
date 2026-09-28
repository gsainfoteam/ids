import {
  useCallback,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type MouseEvent,
  type PointerEvent,
} from 'react';

import { useControllableState } from '../../../hooks/use-controllable-state';
import { keyHandler, withModifiers } from '../../../internal/keys';
import {
  focusReturnTarget,
  initialFocusTarget,
  returnFocusTo,
  useLayer,
  useOverlayItem,
  usePresence,
} from '../../../internal/overlay';
import { matchesSearch, textOf } from '../../../internal/search-text';
import { keepFocusWhereItIs } from '../../../utils';

export type UseCommandPaletteOptions = {
  open?: boolean;
  defaultOpen: boolean;
  onOpenChange?: (open: boolean) => void;
};

type Move = 'next' | 'previous' | 'first' | 'last';

const OPTION = '[data-menu-option]';
const ENABLED_OPTION = '[data-menu-option]:not([aria-disabled="true"])';
const OPTION_OR_SEPARATOR = '[data-menu-option], [data-menu-separator]';
const GROUP = '[data-menu-group]';
const NO_SECTIONS: ReadonlySet<Element> = new Set();

function sectionsWithoutOptions(list: HTMLElement) {
  const hidden = new Set<Element>();

  for (const group of list.querySelectorAll(GROUP))
    if (!group.querySelector(OPTION)) hidden.add(group);

  let optionBefore = false;
  let separatorAwaitingOption: Element | null = null;

  for (const element of list.querySelectorAll(OPTION_OR_SEPARATOR)) {
    if (element.matches(OPTION)) {
      optionBefore = true;
      separatorAwaitingOption = null;
      continue;
    }

    if (!optionBefore || separatorAwaitingOption) hidden.add(element);
    else separatorAwaitingOption = element;
  }

  if (separatorAwaitingOption) hidden.add(separatorAwaitingOption);

  return hidden;
}

const sameElements = (a: ReadonlySet<Element>, b: ReadonlySet<Element>) =>
  a.size === b.size && [...a].every((element) => b.has(element));

const optionsIn = (list: HTMLElement | null) => [
  ...(list?.querySelectorAll<HTMLElement>(ENABLED_OPTION) ?? []),
];

function reveal(list: HTMLElement, option: HTMLElement, index: number) {
  if (index === 0) list.scrollTop = 0;
  else option.scrollIntoView({ block: 'nearest' });
}

export function useCommandPalette({
  open: openProp,
  defaultOpen,
  onOpenChange,
}: UseCommandPaletteOptions) {
  const item = useOverlayItem(openProp);
  const [ownOpen, setOwnOpen] = useControllableState({
    value: openProp,
    defaultValue: defaultOpen,
    onValueChange: onOpenChange,
  });

  const open = item ? item.open : ownOpen;

  const setOpen = (next: boolean) => {
    if (!item) {
      setOwnOpen(next);
      return;
    }

    if (next === item.open) return;
    onOpenChange?.(next);
    if (!next) item.close(undefined);
  };

  const [trigger, setTrigger] = useState<HTMLElement | null>(null);
  const [content, setContent] = useState<HTMLElement | null>(null);
  const [backdrop, setBackdrop] = useState<HTMLElement | null>(null);
  const [list, setList] = useState<HTMLElement | null>(null);

  const [query, setQuery] = useState('');
  const [activeId, setActiveId] = useState<string | null>(null);
  const [hiddenSections, setHiddenSections] = useState(NO_SECTIONS);
  const [empty, setEmpty] = useState(false);

  const [lastOpen, setLastOpen] = useState(open);
  if (lastOpen !== open) {
    setLastOpen(open);
    if (open) setQuery('');
  }

  const presence = usePresence(open, {
    elements: () => [content, backdrop],
    onExitComplete: () => item?.exited(),
  });

  const layer = useLayer(open, {
    kind: 'modal',
    element: () => content,
    anchor: () => trigger,
    onDismiss: (reason) => {
      if (reason === 'escape-key') setOpen(false);
    },
  });

  useLayoutEffect(() => {
    if (open && content)
      initialFocusTarget(content, { holdsFocus: true })?.focus({ preventScroll: true });
  }, [open, content]);

  const wasOpen = useRef(open);

  useLayoutEffect(() => {
    const closing = wasOpen.current && !open;
    wasOpen.current = open;

    if (!closing || !content) return;

    const focused = content.ownerDocument.activeElement;
    const focusWasInside =
      !focused || focused === content.ownerDocument.body || content.contains(focused);
    if (focusWasInside) returnFocusTo(focusReturnTarget(layer));
  }, [open, content, layer]);

  const syncList = useCallback(() => {
    if (!list) return;

    const hidden = sectionsWithoutOptions(list);
    const enabled = optionsIn(list);

    setHiddenSections((current) => (sameElements(current, hidden) ? current : hidden));
    setEmpty(!list.querySelector(OPTION));
    setActiveId((current) =>
      enabled.some((option) => option.id === current) ? current : (enabled[0]?.id ?? null),
    );
  }, [list]);

  const highlightFirst = useCallback(() => {
    const [first] = optionsIn(list);

    setActiveId(first?.id ?? null);
    if (list && first) reveal(list, first, 0);
  }, [list]);

  useLayoutEffect(() => {
    if (!list) return;

    const observer = new MutationObserver(syncList);
    observer.observe(list, { childList: true, subtree: true, attributeFilter: ['aria-disabled'] });

    return () => observer.disconnect();
  }, [list, syncList]);

  const move = (to: Move) => {
    const options = optionsIn(list);
    if (!list || !options.length) return;

    const index = options.findIndex((option) => option.id === activeId);
    const last = options.length - 1;
    const target = {
      first: 0,
      last,
      next: index >= last ? 0 : index + 1,
      previous: index <= 0 ? last : index - 1,
    }[to];

    setActiveId(options[target]!.id);
    reveal(list, options[target]!, target);
  };

  const onSearchKeyDown = keyHandler(
    withModifiers({
      ArrowDown: () => move('next'),
      ArrowUp: () => move('previous'),
      Home: () => move('first'),
      End: () => move('last'),
      Enter: () => {
        optionsIn(list)
          .find((option) => option.id === activeId)
          ?.click();
      },
    }),
  );

  const baseId = useId();

  return {
    open,
    setOpen,
    mounted: presence.mounted,
    ending: presence.ending,
    layer,
    content,
    setTrigger,
    setContent,
    setBackdrop,
    setList,
    query,
    search: setQuery,
    activeId,
    highlight: setActiveId,
    hiddenSections,
    empty,
    syncList,
    highlightFirst,
    onSearchKeyDown,
    ids: { content: `${baseId}-content`, list: `${baseId}-list` },
  };
}

export type CommandPalette = ReturnType<typeof useCommandPalette>;

export type UseCommandOptionOptions = {
  disabled: boolean;
  textValue: string | undefined;
  children: unknown;
  activate: (option: HTMLElement) => void;
};

export function useCommandOption(
  palette: CommandPalette,
  { disabled, textValue, children, activate }: UseCommandOptionOptions,
) {
  const id = useId();

  const visible = matchesSearch(textValue ?? textOf(children), palette.query);
  const highlighted = palette.activeId === id;

  return {
    visible,
    highlighted,
    props: {
      id,
      role: 'option',
      'aria-selected': highlighted,
      'aria-disabled': disabled || undefined,
      'data-menu-option': '',
      'data-menu-item': '',
      'data-highlighted': highlighted ? '' : undefined,
      'data-disabled': disabled ? '' : undefined,
      onPointerDown: keepFocusWhereItIs,
      onPointerMove: (event: PointerEvent<HTMLElement>) => {
        if (event.pointerType === 'mouse' && !disabled && !highlighted) palette.highlight(id);
      },
      onClick: (event: MouseEvent<HTMLElement>) => {
        if (!disabled) activate(event.currentTarget);
      },
    },
  };
}
