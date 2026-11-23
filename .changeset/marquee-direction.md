---
"@gsainfoteam/ids-react": major
---

Marquee's props follow the Props rule. `orientation` and `reverse` became one `direction` prop: `start` (the default, flowing toward the start of the line, so leftward in left-to-right and rightward in right-to-left documents), `end`, `up` and `down`; `Marquee.Orientation` and the `MarqueeOrientation` export gave way to `Marquee.Direction` and `MarqueeDirection`. `fade` became `variant`: `fade` (the default) or `plain`, typed `Marquee.Variant` / `MarqueeVariant`. `pauseControl` is gone: the pause button is drawn only where `<Marquee.Pause />` is placed, so a strip that moves for more than five seconds places it. `pauseOnHover` and `pauseOnFocus` are gone: the strip always pauses while the pointer is over it or keyboard focus is inside. `reducedMotion` is gone: the strip follows `prefers-reduced-motion` only. The root carries `data-direction` in place of `data-reverse`, and still carries `data-orientation`.

```tsx
<Marquee aria-label="Partners" direction="end" variant="plain">
  {partners.map((partner) => (
    <Marquee.Item key={partner.id}>{partner.name}</Marquee.Item>
  ))}
  <Marquee.Pause />
</Marquee>
```
