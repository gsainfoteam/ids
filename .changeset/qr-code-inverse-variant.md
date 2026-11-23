---
'@gsainfoteam/ids-react': major
---

QRCode's `inverted` boolean is replaced by `variant`. `variant="theme"` is the default and follows the mode, as a QRCode without `inverted` did. `variant="light"` (was `inverted={false}`) keeps dark modules on a light plate in either mode through `bg-qr-code` / `text-qr-code`, and `variant="dark"` (was `inverted`) draws light modules on a dark plate through `bg-qr-code-inverse` / `text-qr-code-inverse`. `QRCode.Variant` names the values. A numeric `size` now sets the width; the code stays square and shrinks to a narrower parent.

```tsx
<QRCode value="https://gistory.me/pay/8203" variant="light" aria-label="결제 페이지" />
```
