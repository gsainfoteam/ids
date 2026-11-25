'use client';

import { isValidElement, type ChangeEvent, type ReactNode } from 'react';

import { useHotkey, type Hotkey } from '@tanstack/react-hotkeys';

import {
  CommandContext,
  ItemContext,
  useInternalCommandContext,
  useInternalRadioContext,
} from '../context';
import { withIndicator } from './indicator';
import {
  FieldPopupSearch,
  type FieldPopupSearchProps,
} from '../../../../internal/field-popup/parts/search';
import { ModalLayer, OverlayItemContext } from '../../../../internal/overlay';
import { useInternalTranslate } from '../../../../internal/translate';
import {
  buttonTypeFor,
  elementTypeOf,
  flattenFragments,
  mergeProps,
  part,
} from '../../../../utils';
import { ScrollArea } from '../../../layout/scroll-area';
import { useInternalCommandOption, useInternalCommandPalette } from '../hooks/use-command';
import { useInternalCommandListSync } from '../hooks/use-command-list-sync';
import { useInternalCommandNestedMenuWarning } from '../hooks/use-command-nested-menu-warning';
import { selectItem } from '../hooks/use-menu-item';
import { menuStyle } from '../style';

import type { Menu } from '..';

const isType = (type: unknown) => (node: ReactNode) =>
  isValidElement(node) && elementTypeOf(node) === type;

const ONCE_PER_PRESS_EVEN_IN_INPUTS = {
  requireReset: true,
  ignoreInputs: false,
  stopPropagation: false,
} as const;

function CommandHotkey({ hotkey, onPress }: { hotkey: Hotkey; onPress: () => void }) {
  useHotkey(hotkey, onPress, ONCE_PER_PRESS_EVEN_IN_INPUTS);

  return null;
}

export function CommandMenu({
  open,
  defaultOpen = false,
  onOpenChange,
  hotkey,
  children,
}: Menu.Props) {
  const palette = useInternalCommandPalette({ open, defaultOpen, onOpenChange });

  return (
    <CommandContext value={palette}>
      {hotkey && <CommandHotkey hotkey={hotkey} onPress={() => palette.setOpen(!palette.open)} />}
      {children}
    </CommandContext>
  );
}

export function CommandTrigger({
  asChild,
  textValue: _textValue,
  children,
  ...props
}: Menu.TriggerProps) {
  const palette = useInternalCommandContext('Menu.Trigger');

  return part(
    'button',
    asChild,
    children,
    mergeProps(props, {
      ref: palette.setTrigger,
      type: buttonTypeFor(asChild, children),
      'aria-haspopup': 'dialog',
      'aria-expanded': palette.open,
      'aria-controls': palette.open ? palette.ids.content : undefined,
      'data-popup-open': palette.open ? '' : undefined,
      onClick: () => palette.setOpen(!palette.open),
    }),
  );
}

export function CommandContent(props: Menu.ContentProps) {
  const palette = useInternalCommandContext('Menu.Content');

  if (!palette.mounted) return null;
  return <CommandPopup {...props} />;
}

function CommandPopup({
  side: _side,
  align: _align,
  sideOffset: _sideOffset,
  alignOffset: _alignOffset,
  className,
  style,
  children,
  ...props
}: Menu.ContentProps) {
  const t = useInternalTranslate();

  const palette = useInternalCommandContext('Menu.Content');
  const { open, ending, stacked, layer, content, ids, setOpen, setContent, setBackdrop, setList } =
    palette;

  useInternalCommandListSync(palette);

  const nodes = flattenFragments(children);
  const searches = nodes.filter(isType(CommandSearch));
  const empties = nodes.filter(isType(CommandEmpty));
  const options = nodes.filter((node) => !searches.includes(node) && !empties.includes(node));

  const named = props['aria-label'] !== undefined || props['aria-labelledby'] !== undefined;
  const name = named ? {} : { 'aria-label': t('menu.command') };
  const styles = menuStyle();

  return (
    <ModalLayer
      open={open}
      layer={layer}
      element={content}
      contentRef={setContent}
      backdrop={{
        ref: setBackdrop,
        'data-menu-backdrop': '',
        'data-stacked': stacked ? '' : undefined,
        'data-ending-style': ending ? '' : undefined,
        className: styles.backdrop(),
      }}
      onBackdropClick={() => setOpen(false)}
    >
      <div
        {...name}
        {...props}
        popover="manual"
        id={ids.content}
        role="dialog"
        aria-modal="true"
        tabIndex={-1}
        data-menu-palette=""
        data-open={open ? '' : undefined}
        data-ending-style={ending ? '' : undefined}
        className={styles.palette({ className })}
        style={style}
      >
        <OverlayItemContext value={null}>
          {searches.length ? searches : <CommandSearch />}
          <ScrollArea fade="y" className={styles.listArea()}>
            <ScrollArea.Viewport asChild>
              <div
                ref={setList}
                id={ids.list}
                role="listbox"
                aria-label={props['aria-label'] ?? t('menu.command')}
                data-menu-list=""
                className={styles.list()}
              >
                {options}
              </div>
            </ScrollArea.Viewport>
          </ScrollArea>
          {empties}
        </OverlayItemContext>
      </div>
    </ModalLayer>
  );
}

export function CommandSearch({ placeholder, ...props }: Menu.SearchProps) {
  const t = useInternalTranslate();

  const palette = useInternalCommandContext('Menu.Search');

  const own = mergeProps(props as Record<string, unknown>, {
    'aria-label': props['aria-label'] ?? t('common.search'),
    'data-menu-search': '',
    value: palette.query,
    placeholder,
    onChange: (event: ChangeEvent<HTMLInputElement>) => palette.search(event.currentTarget.value),
    onKeyDown: palette.onSearchKeyDown,
  }) as Omit<FieldPopupSearchProps, 'controls' | 'activeDescendant'>;

  return (
    <FieldPopupSearch
      {...own}
      controls={palette.ids.list}
      activeDescendant={palette.activeId ?? undefined}
    />
  );
}

CommandSearch.displayName = 'Menu.Search';

export function CommandEmpty({ asChild, children, className, ...props }: Menu.EmptyProps) {
  const palette = useInternalCommandContext('Menu.Empty');

  return part(
    'div',
    asChild,
    palette.empty ? children : null,
    mergeProps(props, {
      role: 'status',
      'data-menu-empty': '',
      'data-empty': palette.empty ? '' : undefined,
      className: menuStyle().empty({ className }),
    }),
  );
}

CommandEmpty.displayName = 'Menu.Empty';

export function CommandItem({
  disabled = false,
  textValue,
  onSelect,
  asChild,
  className,
  children,
  ...props
}: Menu.ItemProps) {
  const palette = useInternalCommandContext('Menu.Item');
  const option = useInternalCommandOption(palette, {
    disabled,
    textValue,
    children,
    activate: (element) => {
      if (selectItem(element, onSelect)) palette.setOpen(false);
    },
  });

  if (!option.visible) return null;

  return part(
    'div',
    asChild,
    children,
    mergeProps(props, { ...option.props, className: menuStyle().item({ className }) }),
  );
}

export function CommandCheckboxItem({
  checked = false,
  onCheckedChange,
  disabled = false,
  textValue,
  onSelect,
  asChild,
  className,
  children,
  ...props
}: Menu.CheckboxItemProps) {
  const palette = useInternalCommandContext('Menu.CheckboxItem');
  const option = useInternalCommandOption(palette, {
    disabled,
    textValue,
    children,
    activate: (element) => {
      onCheckedChange?.(!checked);
      if (selectItem(element, onSelect)) palette.setOpen(false);
    },
  });

  if (!option.visible) return null;

  return (
    <ItemContext value={{ checked, kind: 'checkbox' }}>
      {part(
        'div',
        asChild,
        withIndicator(children, asChild),
        mergeProps(props, {
          ...option.props,
          'aria-checked': checked,
          'data-checked': checked ? '' : undefined,
          className: menuStyle().item({ checkable: true, className }),
        }),
      )}
    </ItemContext>
  );
}

export function CommandRadioItem({
  value,
  disabled = false,
  textValue,
  onSelect,
  asChild,
  className,
  children,
  ...props
}: Menu.RadioItemProps) {
  const palette = useInternalCommandContext('Menu.RadioItem');
  const group = useInternalRadioContext('Menu.RadioItem');

  const checked = group.value === value;
  const option = useInternalCommandOption(palette, {
    disabled,
    textValue,
    children,
    activate: (element) => {
      group.setValue(value);
      if (selectItem(element, onSelect)) palette.setOpen(false);
    },
  });

  if (!option.visible) return null;

  return (
    <ItemContext value={{ checked, kind: 'radio' }}>
      {part(
        'div',
        asChild,
        withIndicator(children, asChild),
        mergeProps(props, {
          ...option.props,
          'aria-checked': checked,
          'data-checked': checked ? '' : undefined,
          className: menuStyle().item({ checkable: true, className }),
        }),
      )}
    </ItemContext>
  );
}

export function CommandNestedMenu() {
  useInternalCommandNestedMenuWarning();

  return null;
}
