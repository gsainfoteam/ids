---
"@gsainfoteam/ids-react": patch
---

TimePicker columns fade their top and bottom edges while more options are hidden past them
(ScrollArea `fade="y"`, 16px for the columns' `tiny` scroll area). The picked time on the middle row
stays clear of the fade. A column drops the fade while its own keyboard focus ring shows, since the
mask would cut the ring.
