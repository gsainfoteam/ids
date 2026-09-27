---
'@gsainfoteam/ids-react': minor
---

ColorField opens a ColorPicker, so it gains the eyedropper, copy, a draft text input and a palette
that is one radio group. ArrowDown on the trigger opens the popup, focus starts on its first
control and Escape returns it to the trigger. The trigger reads its label and its value together,
and the popup is named by the field label. `required` is enforced by the browser's own validation,
which sends focus to the trigger, and a form reset restores `defaultValue` and closes the popup.
Adds `open` / `defaultOpen` / `onOpenChange`, a function `className` and `data-*` state; on a
small screen `mobileVariant="drawer"` opens a modal sheet with a title and a close button.

Breaking: `onChange(value)` is now `onValueChange(value)`. `surfaceVariant` is renamed `variant`
(`outline`, `soft`, `ghost`). The panel `variant` (`default`, `compact`, `swatchOnly`) is removed:
put ColorPicker parts in `ColorField.Content` instead, for example `<ColorPicker.Swatches />` alone
for a palette, or `<ColorPicker.HueSlider />` and `<ColorPicker.Input />` for a compact picker.
Children of `ColorField.Content` are ColorPicker parts rather than a replacement panel. An empty
value is no longer submitted, Clear is hidden rather than disabled while read-only, and the popup
header with its close button only appears in the drawer.
