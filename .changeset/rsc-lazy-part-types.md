---
'@gsainfoteam/ids-react': patch
---

Parts rendered from a Next.js Server Component are recognised again. On the client, an element a
Server Component hands over arrives with a lazy wrapper as its type, so `<Select.Item>` produced no
options, `<Field.Label>` did not label its control and `<Dialog.Overlay>` stayed in the content.
Every part lookup now unwraps that type first.
