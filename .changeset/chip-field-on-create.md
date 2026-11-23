---
'@gsainfoteam/ids-react': major
---

ChipField drops `creatable` and `mobileVariant`.

- Passing `onCreate` turns creating values on. A field with nothing to save passes `onCreate={noop}`.
- `mobileVariant` moved to the popup part: `<ChipField.Content mobileVariant="popover">` (`drawer` stays the default).
