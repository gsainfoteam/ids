---
'@gsainfoteam/ids-react': patch
---

IdsProvider resolves a theme's color roles once per color set (`primary`, `secondary`, `tertiary`,
`neutral`, `status`) and keeps the last 64. An `IdsProvider.Scope`, or a theme object built anew on
every render, no longer runs the APCA role search again for colors it has already resolved; a page
with many Scopes of the same palettes renders several times faster.
