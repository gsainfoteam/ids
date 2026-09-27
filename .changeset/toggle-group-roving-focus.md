---
'@gsainfoteam/ids-react': minor
---

ToggleGroup follows the WAI-ARIA patterns. A single-select group is a `radiogroup` of `radio`
items: Tab lands on the checked item and the arrow keys move focus and the check together. A
multiple-select group is a `toolbar` of `aria-pressed` buttons whose arrow keys move focus only
and whose tab stop remembers the item last focused. Both have one tab stop with roving tabindex,
Home and End, wrap around (`loop`, default true), skip disabled items, honour `orientation` and
swap the horizontal arrows in right-to-left layouts. `name` and `form` submit each pressed value
through hidden inputs, `required` blocks an empty native submit (and keeps a single group checked),
and a form reset returns to `defaultValue`. The group also takes `variant` and `attached` like
ButtonGroup, horizontal groups share their width between the toggles, and development warnings
flag values that match no toggle, values of the wrong shape and a group without a name.

Breaking: `type` is renamed `selectionMode`. A single group's empty value is `null` instead of
`''`. A multiple group takes and reports `string[]` (in item order) instead of `Set<string>`.
`ToggleGroup.Separator` is a drawn line, decorative in a single group.
