'use client';

import { use, useEffect } from 'react';

import { CommandMenu, CommandNestedMenu } from './command';
import { CommandContext, ContentContext, MenuContext, useMenuContext } from './context';
import { useMenuLevel, type MenuLevel, type MenuTriggerType } from './use-menu';
import { FloatingNode, FloatingTree } from '../../../internal/overlay';
import { isDevelopment } from '../../../utils/dev';

import type { Menu } from '.';

export function MenuRoot({ triggerType, ...props }: Menu.Props) {
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
