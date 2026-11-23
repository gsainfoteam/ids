---
'@gsainfoteam/ids-react': major
---

TextArea folds `autoResize` into `resize` and drops `divided`.

- `resize` takes `'auto'` (the default: the height follows the text), `'none'`, `'vertical'`, `'horizontal'` or `'both'`. `autoResize={false}` was `resize="vertical"` unless another `resize` was given.
- The line between a bar and the input is always drawn. To join them, take the bar borders away with `className="[&>[data-text-area-top]]:border-b-0 [&>[data-text-area-bottom]]:border-t-0"`; PromptInput does this itself.

```tsx
<TextArea resize="vertical" rows={5} />
```
