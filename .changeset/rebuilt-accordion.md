---
'@gsainfoteam/ids-react': minor
---

Rebuild Accordion after shadcn/ui: items are separated by a neutral bottom border, a chevron is
drawn when `Accordion.Indicator` is omitted, and panels animate their height without measuring
(instantly under reduced motion). Closed panels are `hidden="until-found"`, so find-in-page and
text fragments open them. Focus inside a panel that closes returns to its header, the open header
of a non-collapsible accordion is `aria-disabled`, and a root `disabled` disables every item.
Item, Trigger, Content and Indicator take `className`, `style` and `children` as functions of the
item state and expose `data-open` and `data-disabled` next to `data-state`.

Breaking: `variant` is now `outline` / `soft` / `ghost`. `bordered` becomes `outline` (lines
between items, no outer box), `separated` becomes `soft` (muted blocks), and `ghost` gains a hover
background. `Accordion.Content`'s `className` and `style` go to the inner body instead of the
animated wrapper. Part prop types move to `Accordion.Item.Props`, `Accordion.Trigger.Props`,
`Accordion.Content.Props` and `Accordion.Indicator.Props`.
