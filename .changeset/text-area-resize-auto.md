---
'@gsainfoteam/ids-react': major
---

TextArea folds `autoResize` into `resize` and drops `divided`.

- `resize` takes `'auto'` (the default: the height follows the text), `'none'`, `'vertical'`, `'horizontal'` or `'both'`. `autoResize={false}` was `resize="vertical"` unless another `resize` was given.
- The line between a bar and the input is always drawn. PromptInput joins them itself.

```tsx
<TextArea resize="vertical" rows={5} />
```
