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

`triggerType="command"` turns the menu into a modal command palette with `Menu.Search` and
`Menu.Empty`: typing filters items ignoring case, width and accents, arrows move the highlight and
Enter runs it, and an optional `hotkey` such as `"mod+k"` toggles it from anywhere. Submenus nested
several levels deep keep opening in the direction their parent submenu flipped to.
