---
'@gsainfoteam/ids-react': patch
---

Widget keyboard handling shares one key matcher built on TanStack Hotkeys: roving focus,
RadioGroup, Rating, Slider, NumberField, ColorPicker, TimePicker, Select, ChipField, the command
palette, menu items, Accordion, Chip, the date, time and color fields, the text fields' Escape,
Alert, the toast region, pressable surfaces, Button and the overlay layer stack. Keys behave as
before. The IME composition check is now the same everywhere, so an Escape or Enter that Safari
reports with `keyCode 229` while ending a composition no longer clears a text field, drops a date
draft or commits a color draft.
