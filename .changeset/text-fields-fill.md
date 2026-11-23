---
'@gsainfoteam/ids-react': major
---

Every text field fills its parent: Field, Input, TextField, TextArea, NumberField, PasswordField, TelField, ChipField, ColorField, FileField, OTPField and PromptInput are block-level and `w-full min-w-0`.

- Input, TextField, NumberField, PasswordField and TelField were `inline-flex`; they are `flex` now.
- OTPField was as wide as its slots; it takes the full width and keeps the slots at the start.
- Size and place a field with the element around it, not with its `className`.

```tsx
<form className="grid w-72 gap-4">
  <Field>
    <Field.Label>이름</Field.Label>
    <TextField />
  </Field>
  <Button type="submit">저장</Button>
</form>
```
