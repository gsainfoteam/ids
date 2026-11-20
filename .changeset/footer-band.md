---
'@gsainfoteam/ids-react': minor
---

`Card.Footer` and `Dialog.Footer` are now bands: a `border-neutral` line on top and a `bg-band`
background (`neutral-50` under a white card in light, `neutral-850` under a `neutral-900` card in
dark), reaching the edges of the card or dialog. A
Card footer stops 1px inside the outline border and, as the last child, fills the bottom corners;
a `ghost` card keeps only the line. The footer always draws its top line, so `className="border-t"`
is no longer needed. A trailing `Dialog.Footer` sits outside the body that scrolls, so it stays at
the bottom of a long dialog.
