---
'@gsainfoteam/ids-react': minor
---

ButtonGroup takes the shadcn/ui button-group look: only the outer corners are round, adjoining
outline borders overlap into one line, and any child joins (buttons, toggles, `TextField`, the new
`ButtonGroup.Text`), with logical corners so the outer side stays round in right-to-left layouts.
The group's `size` and `variant` now reach the Button, IconButton, Toggle and IconToggle inside
unless a control sets its own, an inner ButtonGroup inherits them and is spaced apart from its
siblings, `attached={false}` spaces the buttons instead of joining them, and an outer group without
`aria-label` or `aria-labelledby` gets a development warning.

Breaking: `ButtonGroup.Separator` is now a drawn 1px line (`role="separator"`) instead of an 8px
gap; nest ButtonGroups to split segments apart. It is a `Divider` (with `data-divider`), as is
`ToggleGroup.Separator`, so neither takes `role`, `aria-orientation`, `aria-hidden` or `tabIndex`. The group no longer defaults `size` to `standard`
for its children, and a child's own `size` wins instead of throwing.
