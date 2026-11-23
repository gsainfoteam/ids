---
"@gsainfoteam/ids-react": major
---

CodeBlock loses its `title`, `lineNumbers` and `wrap` props. The caption's name is now the `CodeBlock.Title` part, and line numbers are drawn when the `CodeBlock.LineNumbers` part is among the children (the root still carries `data-line-numbers`). Long lines wrap when the app writes `className="whitespace-pre-wrap"` on the root: the root sets `white-space: pre` and the `<pre>` and `<code>` inherit it, so the root no longer carries `data-wrap`, and `CodeBlock.Style` loses its `wrap` variant.

```tsx
<CodeBlock language="tsx" highlight={[3]} className="whitespace-pre-wrap">
  <CodeBlock.Title>button.tsx</CodeBlock.Title>
  <CodeBlock.LineNumbers />
  {code}
</CodeBlock>
```
