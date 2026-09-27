---
'@gsainfoteam/ids-react': minor
---

Rebuild Select on the WAI-ARIA select-only combobox. Arrow keys stop at the ends, Home, End,
PageUp and PageDown move through the list, typeahead matches a typed prefix and cycles through the
options of a repeated letter, and disabled options are skipped. The list opens centered on the
selected option, and a selected option shows a check (`Select.ItemIndicator`).

Adds `Select.Clear`, a ghost `IconButton` in the field that returns the value to `null` (or `[]`),
`Select.Separator`, a decorative `Divider`, `Select.Icon`, `Select.ItemIndicator`, `open` /
`defaultOpen` / `onOpenChange`, and a `label` prop on items for the text the trigger shows.
`required` is now enforced by the browser's own validation, which anchors its message to the field
and sends focus to the trigger, and a form reset restores `defaultValue`. Multiple values are kept
in list order and read as two labels and a count. The search field ignores case, width and
accents, is drawn like a command input, and announces when nothing matches; it is a borderless
`TextField`, shared with ChipField's sheet, so a press on its icon keeps focus in it. Item
`className` and `children`, and the root `className`, accept a function of the state; state is
also exposed as `data-*` attributes.

Breaking: `onChange(value)` is now `onValueChange(value)`. `className` and `style` go to a new root
element that draws the field, not to the trigger button; `ref` and the other native props still go
to the trigger. `searchValue` only affects search and no longer changes the label in the trigger.
Arrow keys no longer wrap around the list. An empty-string value is no longer submitted.
`Select.SearchField` no longer takes the input's `size` and `color` attributes.
