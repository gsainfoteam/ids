---
'@gsainfoteam/ids-react': minor
---

Tabs keeps two appearances, `underline` and `enclosed`, and draws the selected label in
`text-primary` (the `colorScheme`'s `text-X`). `appearance="pill"` and the `variant` prop are
removed: a filled or segmented look is composed from other IDS controls sharing the same state.
`enclosed` paints the selected tab with `--ids-bg-current`, so it covers the list line on a card or
a band as well as on the page.
