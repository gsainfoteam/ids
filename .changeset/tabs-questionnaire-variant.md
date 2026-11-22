---
'@gsainfoteam/ids-react': major
---

Tabs and Questionnaire.Question take `variant` instead of `appearance`, so every component has one look prop.

- Tabs: `appearance` → `variant` (`underline` | `pill` | `enclosed` | `segmented`). `Tabs.Appearance` → `Tabs.Variant`, `TabsAppearance` → `TabsVariant`, `data-appearance` → `data-variant`.
- Questionnaire.Question: `appearance` → `variant` (`card` | `toggle`). `Questionnaire.Appearance` → `Questionnaire.Variant`, `QuestionnaireAppearance` → `QuestionnaireVariant`.

```tsx
<Tabs variant="segmented" />
<Questionnaire.Question variant="toggle" />
```
