---
"@gsainfoteam/ids-react": patch
---

Popup lists fade their top and bottom edges while more options are hidden past them: the Select
and ChipField option lists, Menu content, the command palette list, and the field popup itself
(Select, ChipField, ColorField, DateField, TimeField, DateTimeField) when its content is taller than
the screen. They use ScrollArea `fade="y"`, so an option reached with the arrow keys stops clear of
the fade: Select and ChipField now leave the scroll padding of their list when they reveal the
highlighted option, the way `scrollIntoView` does.
