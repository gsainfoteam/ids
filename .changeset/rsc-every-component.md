---
'@gsainfoteam/ids-react': minor
---

Every component, not only those with parts, can now be used from a Server Component, and its
`Style` can be called there: `<a className={Button.Style({ variant: 'outline' })}>` works in a
Next.js App Router page. Parts that had no public name now show as `Kbd.Group`, `Switch.Thumb`,
`Radio.Indicator`, `TextField.Input`, `Group.Separator`, `Group.Text`, `AvatarGroup.Overflow` and
`CheckboxGroup.All` in React DevTools and Storybook's Show code.
