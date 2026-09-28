---
'@gsainfoteam/ids-react': minor
---

Breaking: Kbd's `keys` takes a TanStack Hotkeys string (`Kbd.Keys`: the `Hotkey` type, or one
modifier on its own), so a misspelled shortcut is a type error. Write modifiers in TanStack's
case and order, `Mod` (or `Control`), `Alt`, `Shift`, `Meta`, with the key last: `mod+k` becomes
`Mod+K`, `shift+mod+z` becomes `Mod+Shift+Z`, `mod+,` becomes `Mod+,`, `left` becomes
`ArrowLeft`, `esc` becomes `Escape`. Arrays become one string (`['mod', 'shift', 'P']` is
`'Mod+Shift+P'`), and tinykeys' `$mod` and `KeyK` are `Mod` and `K` (or the physical `[KeyK]`).
`platform` on Kbd and Kbd.Group is `'mac' | 'windows' | 'linux'` instead of
`'apple' | 'other'`, detected with TanStack's `detectPlatform()`, and a server render uses
`windows`. `Meta` shows as `Win` on Windows and `Super` on Linux, read as "슈퍼" (`labels.super`).
Menu.Shortcut takes the same strings. Adds `@tanstack/react-hotkeys` as a dependency.
