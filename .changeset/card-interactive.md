---
'@gsainfoteam/ids-react': major
---

Card drops its `interactive` prop. A card is pressable, with the hover, press and focus states and `data-interactive`, when it has an `onClick`, or when it is `asChild` around an element with an `href` (`<a href>`, a router link that takes `href`) or a `<button>`. An `<a>` without `href` no longer counts, and a router link that only takes `to` is not recognised: wrap the `<a>` it renders, or navigate in `onClick`. `Card.State` keeps `interactive`, now read from these rules.

```tsx
<Card asChild>
  <Link href="/posts/1">...</Link>
</Card>
```
