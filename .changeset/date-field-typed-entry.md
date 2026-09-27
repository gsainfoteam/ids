---
"@gsainfoteam/ids-react": minor
---

Add `DateField.Input` for typed dates. The text box takes the field's label and combobox role,
reads ISO and other year-first dates, Korean dates, bare digits and the locale's numeric order on
Enter or blur (at once for paste, drop and autofill, never on the Enter that ends an IME
composition), rewrites them in the display format, and keeps text it cannot read or that min,
max or `disabled` rule out, marked `aria-invalid` until it is fixed or reverted with Escape.
Down Arrow opens the calendar on the typed date, and the calendar button leaves the tab order.
