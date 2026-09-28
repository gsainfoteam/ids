---
'@gsainfoteam/ids-react': minor
---

Add `Menu` with `Trigger`, `Content`, `Item`, `CheckboxItem`, `RadioGroup`, `RadioItem`,
`ItemIndicator`, `Group`, `Label`, `Separator`, `Shortcut` and submenus through `Sub`,
`SubTrigger` and `SubContent`. The trigger opens it with a click or Enter, Space and ArrowDown on
the first item, ArrowUp on the last; arrows loop and skip disabled items, and typing jumps to a
matching item. Selecting an item closes the whole menu and returns focus to the trigger unless
`onSelect` calls `preventDefault()`. Submenus open on hover, with a safe path to reach them, or
ArrowRight, and ArrowLeft or Escape closes only the submenu. `triggerType="contextmenu"` opens the
menu at the pointer on a right click.
