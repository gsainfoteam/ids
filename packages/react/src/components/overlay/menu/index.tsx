import {
  cloneElement,
  createContext,
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

import { CheckIcon, ChevronRightIcon } from '@heroicons/react/16/solid';

import { useMenuLevel, type MenuLevel, type MenuPlacement, type MenuTriggerType } from './use-menu';
import { selectItem, useMenuItem } from './use-menu-item';
import { listStyles } from '../../../internal/list-styles';
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
import { flattenFragments, invariant, mergeProps, mergeRefs, part, tv } from '../../../utils';
import { Divider } from '../../layout/divider';
import { Kbd } from '../../typography/kbd';

type RootContextValue = { root: MenuLevel; triggerType: MenuTriggerType };
type ItemState = { checked: boolean; kind: 'checkbox' | 'radio' };
type GroupContextValue = { labelId: string; setLabelled: (labelled: boolean) => void };
type RadioContextValue = { value: string | undefined; setValue: (value: string) => void };

const RootContext = createContext<RootContextValue | null>(null);
const LevelContext = createContext<MenuLevel | null>(null);
const SubContext = createContext<MenuLevel | null>(null);
const GroupContext = createContext<GroupContextValue | null>(null);
const RadioContext = createContext<RadioContextValue | null>(null);
const ItemContext = createContext<ItemState | null>(null);

function useRootContext(part: string) {
  const context = use(RootContext);
  invariant(context, `${part} must be rendered inside Menu.`);
  return context;
}

function useLevelContext(part: string) {
  const context = use(LevelContext);
  invariant(context, `${part} must be rendered inside Menu.Content or Menu.SubContent.`);
  return context;
}

function useSubContext(part: string) {
  const context = use(SubContext);
  invariant(context, `${part} must be rendered inside Menu.Sub.`);
  return context;
}

function usePlacement(level: MenuLevel, { side, align, sideOffset, alignOffset }: MenuPlacement) {
  const { setPlacement } = level;

  useLayoutEffect(() => {
    setPlacement({ side, align, sideOffset, alignOffset });
  }, [setPlacement, side, align, sideOffset, alignOffset]);
}

const isIndicator = (node: ReactNode) => isValidElement(node) && node.type === MenuItemIndicator;

function withIndicator(children: ReactNode, asChild: boolean | undefined) {
  const append = (nodes: ReactNode) => (
    <>
      {nodes}
      {!flattenFragments(nodes).some(isIndicator) && <MenuItemIndicator />}
    </>
  );

  if (asChild && isValidElement<{ children?: ReactNode }>(children))
    return cloneElement(children, {}, append(children.props.children));
  return append(children);
}

export function Menu(props: Menu.Props) {
  return (
    <FloatingTree>
      <MenuRoot {...props} />
    </FloatingTree>
  );
}

function MenuRoot({
  open,
  defaultOpen = false,
  onOpenChange,
  triggerType = 'click',
  children,
}: Menu.Props) {
  const root = useMenuLevel({ open, defaultOpen, onOpenChange, parentOpen: null, triggerType });

  return (
    <RootContext value={{ root, triggerType }}>
      <FloatingNode id={root.nodeId}>{children}</FloatingNode>
    </RootContext>
  );
}

function MenuTrigger({ asChild, children, ...props }: Menu.TriggerProps) {
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
      className={Menu.Style({ nested: level.nested }).content({ className })}
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

function MenuContent({
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

function MenuItem({
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
      className: Menu.Style().item({ className }),
    }),
  );
}

function MenuCheckboxItem({
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
          className: Menu.Style().item({ checkable: true, className }),
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

function MenuRadioItem({
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
  const group = use(RadioContext);
  invariant(group, 'Menu.RadioItem must be rendered inside Menu.RadioGroup.');

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
          className: Menu.Style().item({ checkable: true, className }),
        }),
      )}
    </ItemContext>
  );
}

function MenuItemIndicator({ asChild, children, className, ...props }: Menu.ItemIndicatorProps) {
  const item = use(ItemContext);
  invariant(
    item,
    'Menu.ItemIndicator must be rendered inside Menu.CheckboxItem or Menu.RadioItem.',
  );

  if (!item.checked) return null;

  const styles = Menu.Style();
  const glyph = item.kind === 'radio' ? <span className={styles.dot()} /> : <CheckIcon />;

  return part(
    'span',
    asChild,
    children ?? glyph,
    mergeProps(props, {
      'aria-hidden': true,
      'data-menu-item-indicator': '',
      className: styles.indicator({ className }),
    }),
  );
}

function MenuGroup({ asChild, className, children, ...props }: Menu.GroupProps) {
  const labelId = useId();
  const [labelled, setLabelled] = useState(false);

  return (
    <GroupContext value={{ labelId, setLabelled }}>
      {part(
        'div',
        asChild,
        children,
        mergeProps(props, {
          role: 'group',
          'aria-labelledby': props['aria-labelledby'] ?? (labelled ? labelId : undefined),
          'data-menu-group': '',
          className: Menu.Style().group({ className }),
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
      className: Menu.Style().label({ className }),
    }),
  );
}

function MenuSeparator({ className, ...props }: Menu.SeparatorProps) {
  return (
    <Divider {...props} data-menu-separator="" className={Menu.Style().separator({ className })} />
  );
}

function MenuShortcut({ className, ...props }: Menu.ShortcutProps) {
  return (
    <Kbd
      size="tiny"
      {...props}
      data-menu-shortcut=""
      className={Menu.Style().shortcut({ className })}
    />
  );
}

function MenuSub({ open, defaultOpen = false, onOpenChange, children }: Menu.SubProps) {
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

  const styles = Menu.Style();
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
  export type TriggerType = MenuTriggerType;
  export type Side = AnchoredSide;
  export type Align = AnchoredAlign;
  export type SelectEvent = Event;

  export type Props = {
    open?: boolean;
    defaultOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
    triggerType?: TriggerType;
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
  export type ItemIndicatorProps = ComponentProps<'span'> & { asChild?: boolean };
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

  export const Style = tv({
    slots: {
      content: [
        'fixed z-50 m-0 flex max-h-(--available-height) max-w-(--available-width) flex-col',
        'overflow-x-hidden overflow-y-auto overscroll-contain concentric-p-1 outline-none',
        'border border-(--ids-color-border) bg-(--ids-color-surface) text-(--ids-color-on-surface)',
        'text-body-b3-regular shadow-md',
        'transition-[opacity,scale] duration-(--ids-motion-fast) ease-out',
        'starting:scale-95 starting:opacity-0 data-ending-style:scale-95 data-ending-style:opacity-0',
        'data-[side=bottom]:origin-top data-[side=left]:origin-right data-[side=right]:origin-left data-[side=top]:origin-bottom',
        'motion-reduce:transition-none',
      ],
      item: [
        listStyles.option,
        'pe-2.5 data-popup-open:bg-(--ids-color-muted) [&_svg]:size-(--ids-size-icon-standard)',
      ],
      indicator: listStyles.indicator,
      dot: 'size-1.5 rounded-full bg-current',
      subIcon: '-me-0.5 ms-auto text-(--ids-color-on-muted)',
      group: 'flex flex-col',
      label: listStyles.heading,
      separator: listStyles.separator,
      shortcut: 'ms-auto ps-3',
    },
    variants: {
      nested: {
        false: { content: 'min-w-[max(var(--anchor-width),8rem)]' },
        true: { content: 'min-w-32' },
      },
      checkable: {
        true: { item: 'pe-8' },
      },
    },
    defaultVariants: { nested: false },
  });
}
