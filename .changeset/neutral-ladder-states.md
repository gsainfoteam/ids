---
'@gsainfoteam/ids-react': patch
---

Neutral hover and press climb the state ladder. Pressing an `outline` or `ghost` Button, Toggle,
IconButton or FloatingButton `outline` is now one step darker than hover (`muted-hover`, or the
status color at 16%), and a pressed `ghost` or `outline` Toggle takes that press step, so it no
longer looks the same as a hovered one. Accordion, TelField's country button, TimePicker options,
Calendar days and the FileField dropzone press one step darker as well; the soft Accordion header
and soft dropzone hover to `muted-hover` instead of an alpha tint, and a Menu item whose submenu is
open takes the press step. The Calendar range band now hovers to `muted-hover`, which is visible in
dark mode where the old `border` hover matched the band.
