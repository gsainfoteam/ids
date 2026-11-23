---
"@gsainfoteam/ids-react": major
---

CodeBlock loses its `title`, `lineNumbers` and `wrap` props. The caption's name is now the `CodeBlock.Title` part, and line numbers are drawn when the `CodeBlock.LineNumbers` part is among the children. Long lines no longer wrap: the code scrolls sideways, and `CodeBlock.Style` loses its `wrap` variant.

```tsx
<CodeBlock language="tsx" highlight={[3]}>
  <CodeBlock.Title>button.tsx</CodeBlock.Title>
  <CodeBlock.LineNumbers />
  {code}
</CodeBlock>
```
