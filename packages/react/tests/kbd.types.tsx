import { Kbd } from '../src/components/typography/kbd';
export const shortcut = <Kbd keys="Mod+Shift+K" />;
export const functionKey = <Kbd keys="F6" />;
export const arrow = <Kbd keys="ArrowUp" />;
export const physical = <Kbd keys="Mod+[KeyK]" />;
export const modifierAlone = <Kbd keys="Shift" />;
export const platforms: Kbd.Platform[] = ['mac', 'windows', 'linux'];
// @ts-expect-error Shortcuts are written in TanStack's case: Mod+K.
export const lowercase = <Kbd keys="mod+k" />;
// @ts-expect-error Modifiers come in the order Mod, Alt, Shift.
export const shiftFirst = <Kbd keys="Shift+Mod+K" />;
// @ts-expect-error One string names one shortcut.
export const array = <Kbd keys={['Mod', 'K']} />;
// @ts-expect-error Platforms are TanStack's: mac, windows, linux.
export const apple = <Kbd platform="apple" />;
