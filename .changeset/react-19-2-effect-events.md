---
'@gsainfoteam/ids-react': major
---

`react` and `react-dom` peers now start at 19.2. Components read their latest callbacks through React's `useEffectEvent`. `useControllableState`'s setter keeps one identity across renders, like React's own `setState`, so it can sit in effect dependencies without re-running them.
