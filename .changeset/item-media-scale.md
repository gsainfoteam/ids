---
"@gsainfoteam/ids-react": minor
---

- An `Item.Media` tile (`soft`, `outline`) and the space around it now scale together with the
  row: the 32px tile and 12px inset of a title-only row grow to 38px and 14px beside a title and
  one line of description, with equal inset at the start, top and bottom. A taller row keeps that
  size in its top corner. Its icon grows to half the tile.
- Breaking: `dense` is gone from `Item` and `Item.Group`, along with `data-dense`. FileField's list
  takes the standard padding.
