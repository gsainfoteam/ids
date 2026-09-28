import {
  cloneElement,
  isValidElement,
  use,
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
  CommandRadioItem,
  CommandSearch,
  CommandSub,
  CommandTrigger,
} from './command';
import {
  CommandContext,
  GroupContext,
  ItemContext,
  LevelContext,
  RadioContext,
  RootContext,
  SubContext,
  useLevelContext,
  useRadioContext,
  useRootContext,
  useSubContext,
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
import { Divider } from '../../layout/divider';
import { Kbd } from '../../typography/kbd';

function usePlacement(level: MenuLevel, { side, align, sideOffset, alignOffset }: MenuPlacement) {
  const { setPlacement } = level;

  useLayoutEffect(() => {
    setPlacement({ side, align, sideOffset, alignOffset });
  }, [setPlacement, side, align, sideOffset, alignOffset]);
}

export function Menu({ triggerType = 'click', ...props }: Menu.Props) {
  if (triggerType === 'command') return <CommandMenu {...props} />;

  return (
    <FloatingTree>
      <MenuRoot {...props} triggerType={triggerType} />
    </FloatingTree>
  );
}

function MenuRoot({
  open,
  defaultOpen = false,
  onOpenChange,
  triggerType,
  children,
}: Omit<Menu.Props, 'triggerType'> & { triggerType: MenuTriggerType }) {
  const root = useMenuLevel({ open, defaultOpen, onOpenChange, parentOpen: null, triggerType });

  return (
    <RootContext value={{ root, triggerType }}>
      <FloatingNode id={root.nodeId}>{children}</FloatingNode>
    </RootContext>
  );
}

function MenuTrigger(props: Menu.TriggerProps) {
  if (use(CommandContext)) return <CommandTrigger {...props} />;

  return <PopupMenuTrigger {...props} />;
}

function PopupMenuTrigger({ asChild, children, ...props }: Menu.TriggerProps) {
  const { root, triggerType } = useRootContext('Menu.Trigger');
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

type PopupProps = Menu.ContentProps & { level: MenuLevel; name: ComponentProps<'div'> };

function MenuPopup({ level, name, className, style, children, ...props }: PopupProps) {
  const { root } = useRootContext('Menu.Content');
  const { content } = level;

  useLayoutEffect(() => {
    if (!content) return;

    showInTopLayer(content);
    raiseWhatStaysAboveLayers();
  }, [content]);

  const floating = level.getFloatingProps();
  const navigate = floating.onKeyDown as ((event: KeyboardEvent<HTMLElement>) => void) | undefined;
  const named = props['aria-label'] !== undefined || props['aria-labelledby'] !== undefined;

  return (
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
      className={menuStyle({ nested: level.nested }).content({ className })}
      style={{ ...style, ...level.anchored.floatingStyles }}
    >
      <OverlayItemContext value={null}>
        <LevelContext value={level}>
          <FloatingList elementsRef={level.elementsRef} labelsRef={level.labelsRef}>
            {children}
          </FloatingList>
        </LevelContext>
      </OverlayItemContext>
    </div>
  );
}

function MenuContent(props: Menu.ContentProps) {
  if (use(CommandContext)) return <CommandContent {...props} />;

  return <PopupMenuContent {...props} />;
}

function PopupMenuContent({
  side,
  align = 'start',
  sideOffset,
  alignOffset = 0,
  ...props
}: Menu.ContentProps) {
  const { root, triggerType } = useRootContext('Menu.Content');
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
  const { root } = useRootContext('Menu.Item');
  const level = useLevelContext('Menu.Item');
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
  const { root } = useRootContext('Menu.CheckboxItem');
  const level = useLevelContext('Menu.CheckboxItem');
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
  const { root } = useRootContext('Menu.RadioItem');
  const level = useLevelContext('Menu.RadioItem');
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

function MenuSub(props: Menu.SubProps) {
  if (use(CommandContext)) return <CommandSub />;

  return <PopupMenuSub {...props} />;
}

function PopupMenuSub({ open, defaultOpen = false, onOpenChange, children }: Menu.SubProps) {
  const { triggerType } = useRootContext('Menu.Sub');
  const parent = useLevelContext('Menu.Sub');
  const sub = useMenuLevel({
    open,
    defaultOpen,
    onOpenChange,
    parentOpen: parent.open,
    triggerType,
  });

  return (
    <SubContext value={sub}>
      <FloatingNode id={sub.nodeId}>{children}</FloatingNode>
    </SubContext>
  );
}

function MenuSubTrigger({
  disabled = false,
  textValue,
  asChild,
  className,
  children,
  ...props
}: Menu.SubTriggerProps) {
  const parent = useLevelContext('Menu.SubTrigger');
  const sub = useSubContext('Menu.SubTrigger');
  const item = useMenuItem(parent, {
    disabled,
    textValue,
    activatesOnKeys: false,
    keepsHighlightOnLeave: sub.open,
  });

  const styles = menuStyle();
  const content = (nodes: ReactNode) => (
    <>
      {nodes}
      <ChevronRightIcon aria-hidden="true" className={styles.subIcon()} />
    </>
  );

  return part(
    'div',
    asChild,
    asChild && isValidElement<{ children?: ReactNode }>(children)
      ? cloneElement(children, {}, content(children.props.children))
      : content(children),
    mergeProps(mergeProps(props, disabled ? {} : sub.getReferenceProps()), {
      ...item.props,
      ref: mergeRefs(item.props.ref, sub.setTrigger),
      id: props.id ?? sub.ids.trigger,
      role: 'menuitem',
      'aria-haspopup': 'menu',
      'aria-expanded': sub.open,
      'aria-controls': sub.open ? sub.ids.content : undefined,
      'data-popup-open': sub.open ? '' : undefined,
      'data-menu-sub-trigger': '',
      className: styles.item({ className }),
    }),
  );
}

function MenuSubContent({
  side = 'right',
  align = 'start',
  sideOffset = 2,
  alignOffset = -5,
  ...props
}: Menu.SubContentProps) {
  const sub = useSubContext('Menu.SubContent');

  usePlacement(sub, { side, align, sideOffset, alignOffset });

  if (!sub.mounted) return null;

  const label = sub.trigger?.textContent?.trim() ?? '';

  return <MenuPopup {...props} level={sub} name={{ 'aria-label': messages.menu.submenu(label) }} />;
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

  export type TriggerProps = ComponentProps<'button'> & { asChild?: boolean };
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
  export type SubProps = {
    open?: boolean;
    defaultOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
    children?: ReactNode;
  };
  export type SubTriggerProps = Omit<ItemBaseProps, 'onSelect'>;
  export type SubContentProps = ContentProps;
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
  export const Sub = MenuSub;
  export const SubTrigger = MenuSubTrigger;
  export const SubContent = MenuSubContent;
  export const Search = CommandSearch;
  export const Empty = CommandEmpty;

  export const Style = menuStyle;
}
