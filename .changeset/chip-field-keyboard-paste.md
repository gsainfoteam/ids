---
'@gsainfoteam/ids-react': minor
---

Rebuild ChipField around the keyboard and the clipboard. From the start of the input `←` moves to
the last chip, the arrows walk the chips (mirrored in right-to-left), and `Backspace` or `Delete`
remove a chip and keep focus on its neighbour. Pasting text with commas, tabs or line breaks adds a
chip per value, skipping duplicates and leaving what cannot be added in the input, and typing a
comma commits what was typed. Values that differ only in case, width or accents count as one.

Adds `validate` for created values (its message shows in the create row), `ChipField.Limit` with a
notice when `maxCount` is reached, `ChipField.ItemIndicator` checks on chosen options,
`open` / `defaultOpen` / `onOpenChange`, `removeLabel`, a function `className`, and `data-*` state on
the root, chips and options. `required` is enforced by the browser's own validation, a form reset
also clears the typed text, and on a small screen the modal sheet carries its own search field,
the same borderless `TextField` as `Select.SearchField`.

Breaking: `onChange(value)` is now `onValueChange(value)`, and an `onChange` on the root no longer
reaches the input. Chip remove buttons left the Tab order and are reached with the arrow keys.
`onCreate` is optional with `creatable`. A read-only field hides the remove buttons instead of
disabling them, the list is as wide as the field, and a field without options has no chevron.
