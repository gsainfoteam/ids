---
'@gsainfoteam/ids-react': patch
---

Field popups (Select, ChipField, ColorField and the date and time fields) are placed with
floating-ui, and a drawer holds focus with focus-trap and locks the page scroll with
react-remove-scroll. A popup now leaves with a trigger that scrolls out of view instead of staying
pinned to the screen, keeps the selected option centered when placement shrinks it after opening,
and reports an outside press to `onOpenChange` once even when the press also moves focus. A drawer
closes on a click of its backdrop rather than on the press, so the click no longer lands on the
page under it and focus returns to the trigger.
