---
"@gsainfoteam/ids-react": major
---

MessageScroller drops `loading`. Pass `aria-busy` instead: it shows the spinner at the top, stops `onReachStart` and lands on the scroll area (`role="log"`), not on the root.

```tsx
<MessageScroller onReachStart={loadOlder} aria-busy={loadingOlder}>
  …
</MessageScroller>
```
