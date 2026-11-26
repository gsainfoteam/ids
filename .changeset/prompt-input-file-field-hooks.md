---
'@gsainfoteam/ids-react': major
---

FileField and FileDropzone take their upload limits from a new `useFileField` hook. The roots lose `maxSize`, `maxCount` and `onReject` and take `useFileField({ limits: { maxSize, maxCount, onReject } })` as `fileField`. `value` / `defaultValue` / `onValueChange`, `multiple` and `accept` stay on the root. The `invalid` prop is gone: the error look follows `aria-invalid`, the `invalid` of a surrounding `Field`, or a rejected file, as before.

FileDropzone loses `placeholder` and draws its text from a new `FileDropzone.Title` part, which the default trigger places under the icon. FileField's `placeholder` is a `string`.

PromptInput takes its attachments and tools from a new `usePromptInput` hook, passed as `promptInput`. The root loses `files`, `defaultFiles`, `onFilesChange`, `accept`, `maxSize`, `maxCount`, `onReject`, `tools`, `defaultTools` and `onToolsChange`. `usePromptInput({ attachments, tools })` takes one object per feature, each with its value as `value` / `defaultValue` / `onValueChange`; `attachments` also holds `accept` and FileField's limits. The text value, `onSend`, `onStop` and `status` stay on the root.

```tsx
const fileField = useFileField({ limits: { maxSize: 5 * 1024 * 1024, onReject } });

<FileDropzone multiple accept="image/*,.pdf" fileField={fileField}>
  <FileDropzone.Title>Drop files here</FileDropzone.Title>
</FileDropzone>;

const promptInput = usePromptInput({
  attachments: { value: files, onValueChange: setFiles, accept: 'image/*', maxCount: 5 },
  tools: { defaultValue: ['search'] },
});

<PromptInput aria-label="Message" promptInput={promptInput} onSend={send} />;
```
