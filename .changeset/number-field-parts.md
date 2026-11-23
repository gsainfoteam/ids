---
'@gsainfoteam/ids-react': major
---

NumberField drops `hideStepper`, `incrementLabel`, `decrementLabel`, `locale` and `allowWheelScrub`.

- The stepper is drawn when the children name none of NumberField's parts (`Input`, `Stepper`, `Increment`, `Decrement`, `Clear`). Once a part is written, only the written parts are drawn, so `<NumberField><NumberField.Input /></NumberField>` has no buttons. Adornments such as a unit are not parts and keep the default stepper.
- Button names go on the parts: `NumberField.Stepper` now takes `NumberField.Increment` and `NumberField.Decrement` as children, which stack inside it and take `aria-label`.
- The number format follows the nearest `IdsProvider`'s `locale` (`en-US` without one).
- The wheel no longer changes the value.

```tsx
<NumberField>
  <NumberField.Input />
  <NumberField.Stepper>
    <NumberField.Increment aria-label="Add a seat" />
    <NumberField.Decrement aria-label="Remove a seat" />
  </NumberField.Stepper>
</NumberField>
```
