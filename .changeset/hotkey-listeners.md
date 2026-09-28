---
'@gsainfoteam/ids-react': minor
---

Breaking: the command palette's `hotkey` and the Toaster's `hotkey` are TanStack Hotkeys strings
(`Hotkey`), listened to with `useHotkey` from `@tanstack/react-hotkeys`, so IDS and the app share
one shortcut manager and a shortcut registered twice warns in development. Write
`<Toaster hotkey="Alt+T" />` instead of `hotkey={['altKey', 'KeyT']}` (`'Alt+T'` stays the
default, and F6 always works). The `ToasterHotkey` and `ToasterModifier` types are removed.
Modifiers must match exactly: Ctrl+Alt+T no longer moves focus to the toasts. A held key toggles
once, the palette opens from the K position on non-Latin layouts such as Korean 2-set, and both
shortcuts fire even when an input called `preventDefault()` on the key first. The Toaster's
`aria-keyshortcuts` names the shortcut with `Mod` resolved for the device (`F6 Alt+T`).
