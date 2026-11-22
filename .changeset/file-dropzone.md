---
'@gsainfoteam/ids-react': major
---

FileField's `appearance="dropzone"` moved to a new `FileDropzone` component. It takes the same props (value trio, `multiple`, `accept`, `maxSize`, `maxCount`, `onReject`, `variant`, `size`) and the same parts under its own names (`FileDropzone.Trigger`, `.List`, `.Item`, ...), and both share one internal hook. `FileField` always draws the field, its root carries `data-file-field` (a dropzone root carries `data-file-dropzone`), and `FileField.State` loses `appearance`.

```tsx
<FileDropzone multiple accept="image/*" maxSize={5 * 1024 * 1024} />
```
