---
'ids_flutter': minor
---

Add `IdsPalette.fromSeed`, which builds an 11-step palette from one color with the same model as
ids-react's `createIdsPalette` and gives the same 8-bit colors. The seed appears unchanged at the
step whose lightness is nearest. A Display P3 seed is read as the sRGB color it shows.

- `IdsStatusPalettes` exposes the four status palettes (red, yellow, green, sky) the model ships
  with.
