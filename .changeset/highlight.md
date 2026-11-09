---
'@gsainfoteam/ids-react': minor
---

Add Highlight, which marks the parts of a text that match one query or several in `<mark>`. It
matches with the Select search rule (case, full width and accents ignored), merges overlapping and
touching matches, reads regular expression characters as text and never splits a grapheme. The
`soft` variant draws `secondary` with `on-secondary` text, `solid` draws `primary` with
`on-primary`. A `Highlight.Mark` child gives its props to every match, and on its own it is a
single marked phrase. The search results block highlights the query in each result.
