---
'@gsainfoteam/ids-react': major
---

TimePicker drops `locale` and `selectionMode`. The clock reads the nearest `IdsProvider` `locale`
(wrap it in `<IdsProvider.Scope locale="en-US">` for another language), and `selectionMode="none"` is
`readOnly`.
