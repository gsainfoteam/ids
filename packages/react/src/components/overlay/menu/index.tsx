import {
  cloneElement,
  isValidElement,
  use,
  useEffect,
  useId,
  useLayoutEffect,
  useState,
  type ComponentProps,
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent,
  type ReactNode,
} from 'react';

import { ChevronRightIcon } from '@heroicons/react/16/solid';

import {
  CommandCheckboxItem,
  CommandContent,
  CommandEmpty,
  CommandItem,
  CommandMenu,
  CommandNestedMenu,
  CommandRadioItem,
  CommandSearch,
  CommandTrigger,
} from './command';
import {
  CommandContext,
  ContentContext,
  GroupContext,
  ItemContext,
  MenuContext,
  RadioContext,
  useContentContext,
  useMenuContext,
  useRadioContext,
} from './context';
import { MenuItemIndicator, withIndicator, type MenuItemIndicatorProps } from './indicator';
import { menuStyle } from './style';
import { useMenuLevel, type MenuLevel, type MenuPlacement, type MenuTriggerType } from './use-menu';
import { selectItem, useMenuItem } from './use-menu-item';
import { messages } from '../../../internal/messages';
import {
  FloatingList,
  FloatingNode,
  FloatingTree,
  OverlayItemContext,
  raiseWhatStaysAboveLayers,
  showInTopLayer,
  type AnchoredAlign,
  type AnchoredSide,
} from '../../../internal/overlay';
import { mergeProps, mergeRefs, part } from '../../../utils';
import { isDevelopment } from '../../../utils/dev';
import { Divider } from '../../layout/divider';
import { ScrollArea } from '../../layout/scroll-area';
import { Kbd } from '../../typography/kbd';

function usePlacement(level: MenuLevel, { side, align, sideOffset, alignOffset }: MenuPlacement) {
  const { setPlacement } = level;

  useLayoutEffect(() => {
    setPlacement({ side, align, sideOffset, alignOffset });
  }, [setPlacement, side, align, sideOffset, alignOffset]);
}

const continuesSideways = (side: AnchoredSide) => side === 'left' || side === 'right';

function awayFromParent(parent: MenuLevel): AnchoredSide {
  const parentSide = parent.anchored.side;

  return parent.nested && continuesSideways(parentSide) ? parentSide : 'right';
}

export function Menu({ triggerType, ...props }: Menu.Props) {
  const parent = use(ContentContext);
  const palette = use(CommandContext);

  if (palette) return <CommandNestedMenu />;
  if (parent) return <NestedMenu {...props} triggerType={triggerType} parent={parent} />;
  if (triggerType === 'command') return <CommandMenu {...props} />;

  return (
    <FloatingTree>
      <RootMenu {...props} triggerType={triggerType ?? 'click'} />
    </FloatingTree>
  );
}

type RootMenuProps = Omit<Menu.Props, 'triggerType'> & { triggerType: MenuTriggerType };

function RootMenu({
  open,
  defaultOpen = false,
  onOpenChange,
  triggerType,
  children,
}: RootMenuProps) {
  const root = useMenuLevel({ open, defaultOpen, onOpenChange, parentOpen: null, triggerType });

  return (
    <MenuContext value={{ level: root, root, triggerType }}>
      <FloatingNode id={root.nodeId}>{children}</FloatingNode>
    </MenuContext>
  );
}

type NestedMenuProps = Menu.Props & { parent: MenuLevel };

function NestedMenu({
  open,
  defaultOpen = false,
  onOpenChange,
  triggerType: ignoredTriggerType,
  hotkey: ignoredHotkey,
  parent,
  children,
}: NestedMenuProps) {
  const { root, triggerType } = useMenuContext('Menu');
  const level = useMenuLevel({
    open,
    defaultOpen,
    onOpenChange,
    parentOpen: parent.open,
    triggerType,
  });

  const setsRootOnlyProps = ignoredTriggerType !== undefined || ignoredHotkey !== undefined;

  useEffect(() => {
    if (isDevelopment && setsRootOnlyProps)
      console.warn(
        '[IDS] Menu: triggerType and hotkey apply only to the outermost Menu. A Menu inside Menu.Content is a submenu and ignores them.',
      );
  }, [setsRootOnlyProps]);

  return (
    <MenuContext value={{ level, root, triggerType }}>
      <FloatingNode id={level.nodeId}>{children}</FloatingNode>
    </MenuContext>
  );
}

function MenuTrigger(props: Menu.TriggerProps) {
  const palette = use(CommandContext);
  const menu = use(MenuContext);

  if (palette) return <CommandTrigger {...props} />;
  if (menu?.level.nested) return <NestedMenuTrigger {...props} />;

  return <RootMenuTrigger {...props} />;
}

function RootMenuTrigger({
  asChild,
  textValue: _textValue,
  children,
  ...props
}: Menu.TriggerProps) {
  const { root, triggerType } = useMenuContext('Menu.Trigger');

  const state = {
    ref: root.setTrigger,
    'data-popup-open': root.open ? '' : undefined,
  };

  if (triggerType === 'contextmenu')
    return part(
      'div',
      asChild,
      children,
      mergeProps(props, {
        ...state,
        onContextMenu: (event: MouseEvent<HTMLElement>) => {
          event.preventDefault();
          root.openAt(event.nativeEvent);
        },
        onPointerDown: (event: PointerEvent<HTMLElement>) => {
          const plainPress = event.button === 0 && !event.ctrlKey;
          const pressedInMenu = !!root.content?.contains(event.target as Node);

          if (root.open && plainPress && !pressedInMenu) root.setOpen(false, event.nativeEvent);
        },
      }),
    );

  return part(
    'button',
    asChild,
    children,
    mergeProps(props, {
      ...root.getReferenceProps(),
      ...state,
      id: props.id ?? root.ids.trigger,
      type: asChild ? undefined : 'button',
      'aria-haspopup': 'menu',
      'aria-expanded': root.open,
      'aria-controls': root.open ? root.ids.content : undefined,
    }),
  );
}

function NestedMenuTrigger({
  disabled = false,
  textValue,
  asChild,
  className,
  children,
  ...props
}: Menu.TriggerProps) {
  const { level } = useMenuContext('Menu.Trigger');
  const parent = useContentContext('Menu.Trigger');
  const item = useMenuItem(parent, {
    disabled,
    textValue,
    activatesOnKeys: false,
    keepsHighlightOnLeave: level.open,
  });

  const styles = menuStyle();
  const withChevron = (nodes: ReactNode) => (
    <>
      {nodes}
      <ChevronRightIcon aria-hidden="true" className={styles.chevron()} />
    </>
  );

  return part(
    'div',
    asChild,
    asChild && isValidElement<{ children?: ReactNode }>(children)
      ? cloneElement(children, {}, withChevron(children.props.children))
      : withChevron(children),
    mergeProps(mergeProps(props, disabled ? {} : level.getReferenceProps()), {
      ...item.props,
      ref: mergeRefs(item.props.ref, level.setTrigger),
      id: props.id ?? level.ids.trigger,
      role: 'menuitem',
      'aria-haspopup': 'menu',
      'aria-expanded': level.open,
      'aria-controls': level.open ? level.ids.content : undefined,
      'data-popup-open': level.open ? '' : undefined,
      'data-menu-nested-trigger': '',
      className: styles.item({ className }),
    }),
  );
}

type PopupProps = Menu.ContentProps & { level: MenuLevel; name: ComponentProps<'div'> };

function MenuPopup({ level, name, className, style, children, ...props }: PopupProps) {
  const { root } = useMenuContext('Menu.Content');
  const { content } = level;

  useLayoutEffect(() => {
    if (!content) return;

    showInTopLayer(content);
    raiseWhatStaysAboveLayers();
  }, [content]);

  const floating = level.getFloatingProps();
  const navigate = floating.onKeyDown as ((event: KeyboardEvent<HTMLElement>) => void) | undefined;
  const named = props['aria-label'] !== undefined || props['aria-labelledby'] !== undefined;

  const styles = menuStyle({ nested: level.nested });

  return (
    <ScrollArea asChild>
      <div
        {...mergeProps(props, {
          ...floating,
          ...(named ? {} : name),
          ref: level.setContent,
          onKeyDown: (event: KeyboardEvent<HTMLElement>) => {
            const ownMenu = (event.target as Element).closest('[data-menu-content]');
            if (ownMenu !== event.currentTarget) return;

            if (event.key === 'Tab') {
              event.preventDefault();
              root.closeTree({ returnFocus: true });
              return;
            }

            navigate?.(event);
          },
        })}
        popover="manual"
        id={level.ids.content}
        role="menu"
        tabIndex={-1}
        data-menu-content=""
        data-nested={level.nested ? '' : undefined}
        data-side={level.anchored.side}
        data-align={level.anchored.align}
        data-open={level.open ? '' : undefined}
        data-ending-style={level.ending ? '' : undefined}
        className={styles.content({ className })}
        style={{ ...style, ...level.anchored.floatingStyles }}
      >
        <ScrollArea.Viewport className={styles.viewport()}>
          <OverlayItemContext value={null}>
            <ContentContext value={level}>
              <FloatingList elementsRef={level.elementsRef} labelsRef={level.labelsRef}>
                {children}
              </FloatingList>
            </ContentContext>
          </OverlayItemContext>
        </ScrollArea.Viewport>
      </div>
    </ScrollArea>
  );
}

function MenuContent(props: Menu.ContentProps) {
  const palette = use(CommandContext);
  const menu = use(MenuContext);

  if (palette) return <CommandContent {...props} />;
  if (menu?.level.nested) return <NestedMenuContent {...props} />;

  return <RootMenuContent {...props} />;
}

function RootMenuContent({
  side,
  align = 'start',
  sideOffset,
  alignOffset = 0,
  ...props
}: Menu.ContentProps) {
  const { root, triggerType } = useMenuContext('Menu.Content');
  const atPointer = triggerType === 'contextmenu';

  usePlacement(root, {
    side: side ?? (atPointer ? 'right' : 'bottom'),
    align,
    sideOffset: sideOffset ?? (atPointer ? 2 : 4),
    alignOffset,
  });

  if (!root.mounted) return null;

  return (
    <MenuPopup
      {...props}
      level={root}
      name={atPointer ? {} : { 'aria-labelledby': root.trigger?.id || undefined }}
    />
  );
}

function NestedMenuContent({
  side,
  align = 'start',
  sideOffset = 2,
  alignOffset = -5,
  ...props
}: Menu.ContentProps) {
  const { level } = useMenuContext('Menu.Content');
  const parent = useContentContext('Menu.Content');

  usePlacement(level, { side: side ?? awayFromParent(parent), align, sideOffset, alignOffset });

  if (!level.mounted) return null;

  const label = level.trigger?.textContent?.trim() ?? '';

  return (
    <MenuPopup {...props} level={level} name={{ 'aria-label': messages.menu.submenu(label) }} />
  );
}

function MenuItem(props: Menu.ItemProps) {
  if (use(CommandContext)) return <CommandItem {...props} />;

  return <PopupMenuItem {...props} />;
}

function PopupMenuItem({
  disabled = false,
  textValue,
  onSelect,
  asChild,
  className,
  children,
  ...props
}: Menu.ItemProps) {
  const { root } = useMenuContext('Menu.Item');
  const level = useContentContext('Menu.Item');
  const item = useMenuItem(level, {
    disabled,
    textValue,
    activate: (element) => {
      if (selectItem(element, onSelect)) root.closeTree({ returnFocus: true });
    },
  });

  return part(
    'div',
    asChild,
    children,
    mergeProps(props, {
      ...item.props,
      role: 'menuitem',
      'data-menu-item': '',
      className: menuStyle().item({ className }),
    }),
  );
}

function MenuCheckboxItem(props: Menu.CheckboxItemProps) {
  if (use(CommandContext)) return <CommandCheckboxItem {...props} />;

  return <PopupMenuCheckboxItem {...props} />;
}

function PopupMenuCheckboxItem({
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
  const { root } = useMenuContext('Menu.CheckboxItem');
  const level = useContentContext('Menu.CheckboxItem');
  const item = useMenuItem(level, {
    disabled,
    textValue,
    activate: (element) => {
      onCheckedChange?.(!checked);
      if (selectItem(element, onSelect)) root.closeTree({ returnFocus: true });
    },
  });

  return (
    <ItemContext value={{ checked, kind: 'checkbox' }}>
      {part(
        'div',
        asChild,
        withIndicator(children, asChild),
        mergeProps(props, {
          ...item.props,
          role: 'menuitemcheckbox',
          'aria-checked': checked,
          'data-checked': checked ? '' : undefined,
          'data-menu-item': '',
          className: menuStyle().item({ checkable: true, className }),
        }),
      )}
    </ItemContext>
  );
}

function MenuRadioGroup({ value, onValueChange, children, ...props }: Menu.RadioGroupProps) {
  const choose = (next: string) => {
    if (next !== value) onValueChange?.(next);
  };

  return (
    <RadioContext value={{ value, setValue: choose }}>
      <MenuGroup {...props}>{children}</MenuGroup>
    </RadioContext>
  );
}

function MenuRadioItem(props: Menu.RadioItemProps) {
  if (use(CommandContext)) return <CommandRadioItem {...props} />;

  return <PopupMenuRadioItem {...props} />;
}

function PopupMenuRadioItem({
  value,
  disabled = false,
  textValue,
  onSelect,
  asChild,
  className,
  children,
  ...props
}: Menu.RadioItemProps) {
  const { root } = useMenuContext('Menu.RadioItem');
  const level = useContentContext('Menu.RadioItem');
  const group = useRadioContext('Menu.RadioItem');

  const checked = group.value === value;
  const item = useMenuItem(level, {
    disabled,
    textValue,
    activate: (element) => {
      group.setValue(value);
      if (selectItem(element, onSelect)) root.closeTree({ returnFocus: true });
    },
  });

  return (
    <ItemContext value={{ checked, kind: 'radio' }}>
      {part(
        'div',
        asChild,
        withIndicator(children, asChild),
        mergeProps(props, {
          ...item.props,
          role: 'menuitemradio',
          'aria-checked': checked,
          'data-checked': checked ? '' : undefined,
          'data-menu-item': '',
          className: menuStyle().item({ checkable: true, className }),
        }),
      )}
    </ItemContext>
  );
}

function MenuGroup({ asChild, className, children, ...props }: Menu.GroupProps) {
  const palette = use(CommandContext);
  const labelId = useId();
  const [labelled, setLabelled] = useState(false);
  const [element, setElement] = useState<HTMLElement | null>(null);

  const hidden = !!element && !!palette?.hiddenSections.has(element);

  return (
    <GroupContext value={{ labelId, setLabelled }}>
      {part(
        'div',
        asChild,
        children,
        mergeProps(props, {
          ref: palette ? setElement : undefined,
          role: 'group',
          hidden: hidden || undefined,
          'aria-labelledby': props['aria-labelledby'] ?? (labelled ? labelId : undefined),
          'data-menu-group': '',
          className: menuStyle().group({ className }),
        }),
      )}
    </GroupContext>
  );
}

function MenuLabel({ asChild, className, children, ...props }: Menu.LabelProps) {
  const group = use(GroupContext);
  const setLabelled = group?.setLabelled;

  useLayoutEffect(() => {
    if (!setLabelled) return;

    setLabelled(true);
    return () => setLabelled(false);
  }, [setLabelled]);

  return part(
    'div',
    asChild,
    children,
    mergeProps(props, {
      id: props.id ?? group?.labelId,
      'data-menu-label': '',
      className: menuStyle().label({ className }),
    }),
  );
}

function MenuSeparator({ className, ...props }: Menu.SeparatorProps) {
  const palette = use(CommandContext);
  const [element, setElement] = useState<HTMLElement | null>(null);

  const hidden = !!element && !!palette?.hiddenSections.has(element);

  return (
    <Divider
      {...mergeProps(props, { ref: palette ? setElement : undefined })}
      decorative={!!palette}
      hidden={hidden || undefined}
      data-menu-separator=""
      className={menuStyle().separator({ className })}
    />
  );
}

function MenuShortcut({ className, ...props }: Menu.ShortcutProps) {
  return (
    <Kbd
      size="tiny"
      {...props}
      data-menu-shortcut=""
      className={menuStyle().shortcut({ className })}
    />
  );
}

export namespace Menu {
  export type TriggerType = MenuTriggerType | 'command';
  export type Side = AnchoredSide;
  export type Align = AnchoredAlign;
  export type SelectEvent = Event;

  export type Props = {
    open?: boolean;
    defaultOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
    triggerType?: TriggerType;
    hotkey?: string;
    children?: ReactNode;
  };

  type ItemBaseProps = Omit<ComponentProps<'div'>, 'onSelect'> & {
    disabled?: boolean;
    textValue?: string;
    asChild?: boolean;
    onSelect?: (event: SelectEvent) => void;
  };

  export type TriggerProps = ComponentProps<'button'> & { asChild?: boolean; textValue?: string };
  export type ContentProps = ComponentProps<'div'> & {
    side?: Side;
    align?: Align;
    sideOffset?: number;
    alignOffset?: number;
  };
  export type ItemProps = ItemBaseProps;
  export type CheckboxItemProps = Omit<ItemBaseProps, 'defaultChecked'> & {
    checked?: boolean;
    onCheckedChange?: (checked: boolean) => void;
  };
  export type RadioGroupProps = Omit<ComponentProps<'div'>, 'defaultValue'> & {
    value?: string;
    onValueChange?: (value: string) => void;
    asChild?: boolean;
  };
  export type RadioItemProps = ItemBaseProps & { value: string };
  export type ItemIndicatorProps = MenuItemIndicatorProps;
  export type GroupProps = ComponentProps<'div'> & { asChild?: boolean };
  export type LabelProps = ComponentProps<'div'> & { asChild?: boolean };
  export type SeparatorProps = Omit<
    Divider.Props,
    'orientation' | 'align' | 'decorative' | 'asChild' | 'children' | 'className'
  > & { className?: string };
  export type ShortcutProps = Omit<Kbd.Props, 'className'> & { className?: string };
  export type SearchProps = Omit<
    ComponentProps<'input'>,
    'size' | 'color' | 'value' | 'defaultValue'
  >;
  export type EmptyProps = ComponentProps<'div'> & { asChild?: boolean };

  export const Trigger = MenuTrigger;
  export const Content = MenuContent;
  export const Item = MenuItem;
  export const CheckboxItem = MenuCheckboxItem;
  export const RadioGroup = MenuRadioGroup;
  export const RadioItem = MenuRadioItem;
  export const ItemIndicator = MenuItemIndicator;
  export const Group = MenuGroup;
  export const Label = MenuLabel;
  export const Separator = MenuSeparator;
  export const Shortcut = MenuShortcut;
  export const Search = CommandSearch;
  export const Empty = CommandEmpty;

  export const Style = menuStyle;
}
