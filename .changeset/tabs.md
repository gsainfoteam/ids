---
'@gsainfoteam/ids-react': minor
---

Add `Tabs` with `Tabs.List`, `Tabs.Trigger` and `Tabs.Content`, following the WAI-ARIA Tabs
pattern: roving focus with the arrows, Home and End (flipped in right-to-left, skipping disabled
tabs), `activationMode` `automatic` or `manual`, `orientation` horizontal or vertical, controlled
and uncontrolled `value`, and `forceMount` to keep a hidden panel mounted, which page find opens.
`appearance` is `underline`, `pill` or `enclosed`; `pill` takes an `IdsVariant` for the selected
fill. Children can be a function that hands over `List`, `Trigger` and `Content` narrowed to the
tab value type.
