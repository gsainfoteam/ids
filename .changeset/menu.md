---
"@gsainfoteam/ids-react": minor
---

Add `Menu` with `Trigger`, `Content`, `Item`, `CheckboxItem`, `RadioGroup`, `RadioItem`,
`ItemIndicator`, `Group`, `Label`, `Separator` and `Shortcut`. The trigger opens it with a click or
Enter, Space and ArrowDown on the first item, ArrowUp on the last; arrows loop and skip disabled
items, and typing jumps to a matching item. Selecting an item closes the whole menu and returns
focus to the trigger unless `onSelect` calls `preventDefault()`. `triggerType="contextmenu"` opens
the menu at the pointer on a right click.

A `Menu` placed inside another menu's `Menu.Content` is a submenu: its `Menu.Trigger` becomes a
menu item with a chevron that joins the parent's arrow keys and typing, and its `Menu.Content`
opens beside it. Submenus open on hover, with a safe path to reach them, or ArrowRight, and
ArrowLeft or Escape closes only that level. Submenus nested several levels deep keep opening in the
direction their parent submenu flipped to.

`triggerType="command"` turns the menu into a modal command palette with `Menu.Search` and
`Menu.Empty`: typing filters items ignoring case, width and accents, arrows move the highlight and
Enter runs it, and an optional `hotkey` such as `"mod+k"` toggles it from anywhere.
