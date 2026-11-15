---
'@gsainfoteam/ids-react': minor
---

`text-X`, the color text on the page (links, labels, error messages, outline Badge and Chip), is
picked at APCA Lc 60 on the surface and on `bg-X-soft`, the level APCA gives short text. Text on a
fill or a soft surface keeps Lc 75. Light `text-danger` moves from 800 to about 700, and dark text no
longer fades to 200.

`border-X` is no longer picked on its own: it is the `text-X` step. A line and the text beside it are
one color, so an invalid field's `border-danger` matches its label and error message, and a focused
control's border matches a primary link.
