'use client';

import { use, useLayoutEffect, type ComponentProps, type KeyboardEvent } from 'react';

import { CommandContent } from './command';
import {
  CommandContext,
  ContentContext,
  MenuContext,
  useContentContext,
  useMenuContext,
} from './context';
import { menuStyle } from './style';
import { type MenuLevel, type MenuPlacement } from './use-menu';
import { keyHandler, withModifiers } from '../../../internal/keys';
import {
  FloatingList,
  OverlayItemContext,
  raiseWhatStaysAboveLayers,
  showInTopLayer,
  type AnchoredSide,
} from '../../../internal/overlay';
import { useTranslate } from '../../../internal/translate';
import { mergeProps } from '../../../utils';
import { ScrollArea } from '../../layout/scroll-area';

import type { Menu } from '.';

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
    <ScrollArea asChild fade="y">
      <div
        {...mergeProps(props, {
          ...floating,
          ...(named ? {} : name),
          ref: level.setContent,
          onKeyDown: (event: KeyboardEvent<HTMLElement>) => {
            const ownMenu = (event.target as Element).closest('[data-menu-content]');
            if (ownMenu !== event.currentTarget) return;

            const closedOnTab = keyHandler(
              withModifiers({
                Tab: () => {
                  root.closeTree({ returnFocus: true });
                },
              }),
              { evenIfPrevented: true, evenWhileComposing: true },
            )(event);

            if (!closedOnTab) navigate?.(event);
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

export function MenuContent(props: Menu.ContentProps) {
  const palette = use(CommandContext);
  const menu = use(MenuContext);

  if (palette) return <CommandContent {...props} />;
  if (menu?.level.nested) return <NestedMenuContent {...props} />;

  return <RootMenuContent {...props} />;
}

MenuContent.displayName = 'Menu.Content';

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
  const t = useTranslate();

  const { level } = useMenuContext('Menu.Content');
  const parent = useContentContext('Menu.Content');

  usePlacement(level, { side: side ?? awayFromParent(parent), align, sideOffset, alignOffset });

  if (!level.mounted) return null;

  const label = level.trigger?.textContent?.trim() ?? '';

  return (
    <MenuPopup {...props} level={level} name={{ 'aria-label': t('menu.submenu', { label }) }} />
  );
}
