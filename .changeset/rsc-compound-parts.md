---
'@gsainfoteam/ids-react': minor
---

Server Components can now render compound component parts such as `<Dialog.Trigger>`,
`<Select.Item>` and `<Card.Title>`. Every component with parts keeps its entry module free of
client code: the root there only renders the client root, and the parts are client references a
Server Component can pass through. `X.Style` of those components is callable on the server too.
The public API and its types are unchanged.
