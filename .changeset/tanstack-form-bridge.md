---
'@gsainfoteam/ids-react': minor
---

Adds `@gsainfoteam/ids-react/tanstack-form`. Its `Field` binds one TanStack Form field to the
control inside: the value through `onValueChange` (or `onCheckedChange` with
`controlMode="checked"`), `onBlur`, and the field's errors, dirty and touched state, with errors
shown once the field was left or a submit was attempted. Pass `field` from `form.Field`, or register
`Field` as a field component of `createFormHook` and use it inside `form.AppField` without a prop.
`@tanstack/react-form@^1.10.0` is an optional peer; the base entry never imports it.
