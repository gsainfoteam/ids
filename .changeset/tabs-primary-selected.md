---
'@gsainfoteam/ids-react': minor
---

Tabs keeps `underline`, `pill` and `enclosed` as fixed appearances and drops the `variant`
prop. `pill` always fills the selected tab with `bg-primary-subtle` and `text-on-primary-subtle`
(the `colorScheme`'s subtle pair); a different fill goes on `Tabs.Trigger`'s `className`.
`underline` and `enclosed` draw the selected label in `text-primary` (the `colorScheme`'s
`text-X`). `enclosed` paints the selected tab with `--ids-bg-current`, so it covers the list line
on a card or a band as well as on the page.
