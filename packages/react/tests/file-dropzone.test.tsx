import { expect, test } from 'vitest';
import { render } from 'vitest-browser-react';

import { FileDropzone, FileField } from '../src';

const file = (name = 'resume.pdf', body = 'hello', type = 'application/pdf') =>
  new File([body], name, { type, lastModified: 1 });

const dropzoneRoot = (container: HTMLElement) =>
  container.querySelector<HTMLElement>('[data-file-dropzone]')!;

test('limits are described up front, and a single file is listed with its preview', async () => {
  const screen = await render(
    <FileDropzone
      aria-label="Files"
      accept="image/*,.pdf,application/x-zip"
      maxSize={5 * 1024 * 1024}
      defaultValue={file('cover.png', 'x', 'image/png')}
    />,
  );
  await expect
    .element(screen.getByRole('button', { name: 'Files', exact: true }))
    .toHaveAccessibleDescription('이미지, PDF, ZIP · 파일당 최대 5 MB');
  expect(dropzoneRoot(screen.container)).not.toBeNull();
  expect(screen.container.querySelector('[data-file-field]')).toBeNull();
  const rows = screen.getByRole('listitem').elements();
  expect(rows).toHaveLength(1);
  expect(rows[0].querySelector('[data-file-field-item]')).not.toBeNull();
  await expect
    .poll(() => rows[0].querySelector('[data-file-field-preview] img')?.getAttribute('src'))
    .toMatch(/^blob:/);
  expect(screen.container.querySelector('[data-file-field-control]')).toBeNull();
  expect(screen.container.querySelector('[data-file-field-clear]')).toBeNull();
});

test('the trigger is the drop area and does not take the field focus marker', async () => {
  const screen = await render(<FileDropzone aria-label="Files" variant="soft" />);
  const trigger = screen.getByRole('button', { name: 'Files', exact: true }).element();
  expect(trigger.hasAttribute('data-field-input')).toBe(false);
  expect(trigger.classList.contains('border-dashed')).toBe(true);
  expect(trigger.classList.contains('bg-neutral-soft')).toBe(true);
  expect(trigger).toHaveTextContent('파일을 끌어다 놓거나 눌러서 고르세요');
});

test('its parts are the FileField parts under FileDropzone names', async () => {
  expect(FileDropzone.Trigger.displayName).toBe('FileDropzone.Trigger');
  expect(FileDropzone.List.displayName).toBe('FileDropzone.List');
  expect(FileDropzone.Remove.displayName).toBe('FileDropzone.Remove');

  const screen = await render(
    <FileDropzone aria-label="Files" multiple defaultValue={[file('a.pdf'), file('b.pdf')]}>
      <FileDropzone.Trigger />
      <FileDropzone.Clear />
      <FileDropzone.List />
    </FileDropzone>,
  );
  await expect.element(screen.getByRole('listitem').nth(1)).toMatchTextContent('b.pdf');
  await expect
    .element(screen.getByRole('button', { name: '파일 모두 지우기', exact: true }))
    .toBeVisible();
});

test('a FileField part also works inside FileDropzone', async () => {
  const screen = await render(
    <FileDropzone aria-label="Files">
      <FileField.Trigger />
    </FileDropzone>,
  );
  await expect.element(screen.getByRole('button', { name: 'Files', exact: true })).toBeVisible();
});
