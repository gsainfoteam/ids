---
'@gsainfoteam/ids-react': minor
---

Field popups (Select, ChipField and the date, time and color fields) now flip above their trigger
when there is no room below, shrink to the room they have, stay inside the viewport and align to
the reading direction. They keep the side they opened on while their content changes size, fade in
unless reduced motion is on, and Escape closes only the topmost one.

With `mobileVariant="drawer"` on a small screen the popup is a modal sheet: the page behind is
dimmed and takes no clicks, focus stays inside the sheet, the page scroll is locked, and the sheet
rises above the on-screen keyboard. Clicking the backdrop closes it and returns focus to the field.

Breaking: the highlighted option in a field listbox is marked with `data-highlighted` instead of
`data-active`, and selected options are no longer drawn in bold.
