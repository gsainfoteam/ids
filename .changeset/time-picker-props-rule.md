---
'@gsainfoteam/ids-react': major
---

TimePicker drops `locale` and `selectionMode`. The clock reads the nearest `IdsProvider` `locale`
(wrap it in `<IdsProvider.Scope locale="en-US">` for another language), and `selectionMode="none"` is
`readOnly`.

TimePicker is as wide as its columns and no longer stretches to its parent. DateField, DateTimeField
and TimeField are block level and fill their parent; set their width on a wrapping element.
