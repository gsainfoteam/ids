---
'@gsainfoteam/ids-react': minor
---

`Card.Footer` and `Dialog.Footer` are now bands: a `border-neutral` line on top and a `bg-band`
background, one step below the card or dialog in both modes, reaching its edges. A
Card footer stops 1px inside the outline border and, as the last child, fills the bottom corners;
a `ghost` card keeps only the line. The footer always draws its top line, so `className="border-t"`
is no longer needed. A trailing `Dialog.Footer` sits outside the body that scrolls, so it stays at
the bottom of a long dialog.
