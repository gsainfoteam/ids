import { renderToString } from 'react-dom/server';
import { FormProvider, useForm, type UseFormReturn } from 'react-hook-form';
import { expect, test, vi } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';

import { Field, FileField } from '../src';
import { Field as RHFField } from '../src/react-hook-form';

const parse = (html: string) => new DOMParser().parseFromString(html, 'text/html');

const file = (name = 'resume.pdf', body = 'hello', type = 'application/pdf') =>
  new File([body], name, { type, lastModified: 1 });

const named = (name: string) => expect.objectContaining({ name });

const picker = (container: HTMLElement) =>
  container.querySelector<HTMLInputElement>('input[type=file]')!;

const fieldRoot = (container: HTMLElement) =>
  container.querySelector<HTMLElement>('[data-file-field]')!;

const removeButton = (name: string) =>
  page.getByRole('button', { name: `${name} 삭제`, exact: true });

const clearButton = () => page.getByRole('button', { name: '파일 모두 지우기', exact: true });

const settle = () => new Promise((resolve) => setTimeout(resolve));

const loads = (url: string) =>
  fetch(url).then(
    (response) => response.ok,
    () => false,
  );

function transfer(files: File[], text?: string) {
  const data = new DataTransfer();
  for (const item of files) data.items.add(item);
  if (text !== undefined) data.setData('text/plain', text);
  return data;
}

function drag(target: Element, type: string, data: DataTransfer) {
  const event = new DragEvent(type, { bubbles: true, cancelable: true, dataTransfer: data });
  target.dispatchEvent(event);
  return event;
}

function pasteFiles(target: Element, files: File[]) {
  const event = new ClipboardEvent('paste', {
    bubbles: true,
    cancelable: true,
    clipboardData: transfer(files),
  });
  target.dispatchEvent(event);
  return event;
}

async function copyText(text: string) {
  const scratch = document.createElement('textarea');
  document.body.append(scratch);
  await userEvent.fill(scratch, text);
  scratch.select();
  await userEvent.copy();
  scratch.remove();
}

test('SSR: labels, native picker attributes, button semantics, validator and diagnostics', () => {
  const doc = parse(
    renderToString(
      <Field required>
        <Field.Label>Resume</Field.Label>
        <FileField accept=".pdf,image/*" capture="environment" multiple />
      </Field>,
    ),
  );
  const button = doc.querySelector<HTMLButtonElement>('[data-file-field] button')!;
  expect(doc.querySelector('label')!.htmlFor).toBe(button.id);
  expect(button.getAttribute('aria-required')).toBe('true');
  expect(button.hasAttribute('data-field-input')).toBe(true);
  const native = doc.querySelector<HTMLInputElement>('[type=file]')!;
  expect(native.getAttribute('capture')).toBe('environment');
  expect(native.multiple).toBe(true);
  expect(native.hasAttribute('name')).toBe(false);
  expect(doc.querySelectorAll('[data-form-value-validator]')).toHaveLength(1);
  expect(doc.querySelector('button button')).toBeNull();
  // @ts-expect-error A single FileField takes a File or null, not an array.
  expect(() => renderToString(<FileField value={[]} />)).toThrow(/single requires/);
  expect(() => renderToString(<FileField accept="pdf" />)).toThrow(/accept/);
});

test('single: replacement, rejections keep the model, a repeat pick, and clear', async () => {
  const onValueChange = vi.fn();
  const onReject = vi.fn();
  const screen = await render(
    <FileField
      aria-label="Files"
      accept=".pdf"
      maxSize={10}
      onValueChange={onValueChange}
      onReject={onReject}
    />,
  );
  const trigger = screen.getByRole('button', { name: 'Files', exact: true });
  const input = picker(screen.container);
  await userEvent.upload(input, [file()]);
  expect(onValueChange).toHaveBeenLastCalledWith(named('resume.pdf'));
  await expect.element(trigger).toMatchTextContent('resume.pdf');
  expect(input.value).toBe('');
  await userEvent.upload(input, [file('bad.txt', 'text', 'text/plain')]);
  expect(onValueChange).toHaveBeenCalledTimes(1);
  expect(onReject).toHaveBeenLastCalledWith([{ file: named('bad.txt'), reason: 'type' }]);
  await expect.element(trigger).toHaveAttribute('aria-invalid', 'true');
  await expect
    .element(screen.getByRole('alert'))
    .toHaveTextContent('bad.txt: 허용되지 않는 파일 형식입니다.');
  await userEvent.upload(input, [file('big.pdf', '12345678901')]);
  await expect.element(screen.getByRole('alert')).toHaveTextContent('big.pdf: 10 B보다 큽니다.');
  await userEvent.upload(input, [file('new.pdf')]);
  expect(onValueChange).toHaveBeenLastCalledWith(named('new.pdf'));
  await expect.element(screen.getByRole('alert')).not.toBeInTheDocument();
  await userEvent.upload(input, []);
  expect(onValueChange).toHaveBeenCalledTimes(2);
  expect(onValueChange).toHaveBeenLastCalledWith(named('new.pdf'));
  expect(clearButton().element().closest('[data-file-field-control]')).toContainElement(
    trigger.element() as HTMLElement,
  );
  await userEvent.click(clearButton());
  expect(onValueChange).toHaveBeenLastCalledWith(null);
  await expect.element(trigger).toHaveFocus();
  await userEvent.upload(input, [file('new.pdf')]);
  expect(onValueChange).toHaveBeenLastCalledWith(named('new.pdf'));
  expect(input.value).toBe('');
});

test('multiple: appends, dedupes, limits, and removal keeps focus in the list', async () => {
  const onValueChange = vi.fn();
  const onReject = vi.fn();
  const screen = await render(
    <form>
      <input name="files" defaultValue="unrelated" />
      <FileField
        aria-label="Files"
        multiple
        accept=".pdf"
        maxCount={3}
        onValueChange={onValueChange}
        onReject={onReject}
      />
    </form>,
  );
  const trigger = screen.getByRole('button', { name: 'Files', exact: true });
  await userEvent.upload(picker(screen.container), [file('a.pdf')]);
  const [picked] = onValueChange.mock.lastCall![0] as File[];
  const sameFileFromDisk = new File([picked], picked.name, {
    type: picked.type,
    lastModified: picked.lastModified,
  });
  drag(
    fieldRoot(screen.container),
    'drop',
    transfer([sameFileFromDisk, file('b.pdf'), file('c.pdf'), file('d.pdf')]),
  );
  expect(onValueChange).toHaveBeenLastCalledWith([named('a.pdf'), named('b.pdf'), named('c.pdf')]);
  expect(onReject).toHaveBeenLastCalledWith([{ file: named('d.pdf'), reason: 'count' }]);
  await expect
    .element(screen.getByRole('alert'))
    .toHaveTextContent('d.pdf: 최대 3개까지 고를 수 있습니다.');
  await expect.element(trigger).toMatchTextContent('파일 3개');
  await userEvent.click(removeButton('a.pdf'));
  expect(onValueChange).toHaveBeenLastCalledWith([named('b.pdf'), named('c.pdf')]);
  await expect.element(removeButton('b.pdf')).toHaveFocus();
  await userEvent.click(removeButton('c.pdf'));
  await expect.element(removeButton('b.pdf')).toHaveFocus();
  await userEvent.click(removeButton('b.pdf'));
  await expect.element(trigger).toHaveFocus();
});

test('FormData carries the exact File objects and leaves other fields alone', async () => {
  const onValueChange = vi.fn();
  const screen = await render(
    <form>
      <input name="files" defaultValue="unrelated" />
      <FileField aria-label="Files" multiple name="files" onValueChange={onValueChange} />
    </form>,
  );
  await userEvent.upload(picker(screen.container), [file('a.pdf', 'aaa'), file('b.pdf', 'bb')]);
  const chosen = onValueChange.mock.lastCall![0] as File[];
  const [unrelated, ...sent] = new FormData(screen.container.querySelector('form')!).getAll(
    'files',
  );
  const describe = (entry: FormDataEntryValue) =>
    entry instanceof File ? [entry.name, entry.size, entry.type, entry.lastModified] : entry;
  expect(unrelated).toBe('unrelated');
  expect(sent.map(describe)).toEqual(chosen.map(describe));
  expect(await Promise.all(sent.map((entry) => (entry as File).text()))).toEqual(['aaa', 'bb']);
});

test('paste takes files from the clipboard; text pastes are left alone', async () => {
  const onValueChange = vi.fn();
  const screen = await render(
    <FileField aria-label="Files" multiple onValueChange={onValueChange} />,
  );
  const trigger = screen.getByRole('button', { name: 'Files', exact: true });
  const pasted = pasteFiles(trigger.element(), [file('screenshot.png', 'png', 'image/png')]);
  expect(pasted.defaultPrevented).toBe(true);
  expect(onValueChange).toHaveBeenLastCalledWith([named('screenshot.png')]);
  const pastes: Array<{ text: string | undefined; event: ClipboardEvent }> = [];
  const record = (event: ClipboardEvent) =>
    pastes.push({ text: event.clipboardData?.getData('text'), event });
  document.addEventListener('paste', record);
  try {
    await copyText('just text');
    (trigger.element() as HTMLElement).focus();
    await userEvent.paste();
  } finally {
    document.removeEventListener('paste', record);
  }
  expect(pastes.map(({ text }) => text)).toEqual(['just text']);
  expect(pastes[0].event.defaultPrevented).toBe(false);
  expect(onValueChange).toHaveBeenCalledTimes(1);
});

test('dragging over nested children stays one drag; text drags and prevented drops are ignored', async () => {
  const onValueChange = vi.fn();
  const screen = await render(
    <FileField
      aria-label="Files"
      multiple
      onValueChange={onValueChange}
      onDrop={(event) => event.defaultPrevented}
    />,
  );
  const root = fieldRoot(screen.container);
  const trigger = screen.getByRole('button', { name: 'Files', exact: true }).element();
  const files = () => transfer([file()]);
  drag(root, 'dragenter', files());
  await expect.element(page.elementLocator(root)).toHaveAttribute('data-dragging');
  drag(trigger, 'dragenter', files());
  drag(root, 'dragleave', files());
  await settle();
  await expect.element(page.elementLocator(root)).toHaveAttribute('data-dragging');
  drag(trigger, 'dragleave', files());
  await expect.element(page.elementLocator(root)).not.toHaveAttribute('data-dragging');
  expect(drag(root, 'dragover', files()).defaultPrevented).toBe(true);
  expect(drag(root, 'dragover', transfer([], 'just text')).defaultPrevented).toBe(false);
  await screen.rerender(
    <FileField
      key="prevented"
      aria-label="Files"
      multiple
      onValueChange={onValueChange}
      onDrop={(event) => event.preventDefault()}
    />,
  );
  const prevented = fieldRoot(screen.container);
  drag(prevented, 'dragenter', files());
  await expect.element(page.elementLocator(prevented)).toHaveAttribute('data-dragging');
  drag(prevented, 'drop', files());
  await expect.element(page.elementLocator(prevented)).not.toHaveAttribute('data-dragging');
  expect(onValueChange).not.toHaveBeenCalled();
});

test('image previews use object URLs that are revoked when the file goes', async () => {
  const screen = await render(
    <FileField
      aria-label="Files"
      multiple
      defaultValue={[
        file('a.png', 'a', 'image/png'),
        file('b.png', 'b', 'image/png'),
        file('c.pdf'),
      ]}
    />,
  );
  const preview = (name: string) =>
    screen
      .getByTitle(name, { exact: true })
      .element()
      .closest('[data-file-field-item]')!
      .querySelector('[data-file-field-preview]')!;
  const source = (name: string) => preview(name).querySelector('img')?.getAttribute('src');
  await expect.poll(() => source('a.png')).toMatch(/^blob:/);
  await expect.poll(() => source('b.png')).toMatch(/^blob:/);
  const [a, b] = [source('a.png')!, source('b.png')!];
  expect(a).not.toBe(b);
  expect(source('c.pdf')).toBeUndefined();
  expect(preview('c.pdf').querySelector('svg')).not.toBeNull();
  expect(await loads(a)).toBe(true);
  await userEvent.click(removeButton('a.png'));
  await expect.poll(() => loads(a)).toBe(false);
  expect(source('b.png')).toBe(b);
  expect(await loads(b)).toBe(true);
  await screen.unmount();
  await expect.poll(() => loads(b)).toBe(false);
});

test('dropzone: limits are described up front, and a single file is listed with its preview', async () => {
  const screen = await render(
    <FileField
      aria-label="Files"
      appearance="dropzone"
      accept="image/*,.pdf,application/x-zip"
      maxSize={5 * 1024 * 1024}
      defaultValue={file('cover.png', 'x', 'image/png')}
    />,
  );
  await expect
    .element(screen.getByRole('button', { name: 'Files', exact: true }))
    .toHaveAccessibleDescription('이미지, PDF, ZIP · 파일당 최대 5 MB');
  expect(fieldRoot(screen.container).dataset.appearance).toBe('dropzone');
  const rows = screen.getByRole('listitem').elements();
  expect(rows).toHaveLength(1);
  expect(rows[0].querySelector('[data-file-field-item]')).not.toBeNull();
  await expect
    .poll(() => rows[0].querySelector('[data-file-field-preview] img')?.getAttribute('src'))
    .toMatch(/^blob:/);
  expect(screen.container.querySelector('[data-file-field-control]')).toBeNull();
});

test('rows are dense outline Items in a group; Clear and Remove are ghost IconButtons', async () => {
  const screen = await render(
    <FileField
      aria-label="Files"
      multiple
      defaultValue={[file('quarterly-report.pdf'), file('photo.png', 'png', 'image/png')]}
    />,
  );
  const list = screen.getByRole('list', { name: '고른 파일' }).element();
  expect(list.tagName).toBe('UL');
  expect(list.hasAttribute('data-item-group')).toBe(true);
  expect(Array.from(list.children, (child) => child.tagName)).toEqual(['LI', 'LI']);
  const [row, image] = screen.container.querySelectorAll<HTMLElement>('[data-file-field-item]');
  expect(row.hasAttribute('data-item')).toBe(true);
  expect(row.dataset.variant).toBe('outline');
  expect(row.dataset.size).toBe('standard');
  expect(row.hasAttribute('data-dense')).toBe(true);
  expect(row.hasAttribute('role')).toBe(false);
  const title = row.querySelector<HTMLElement>('[data-item-title]')!;
  expect(title.textContent).toBe('quarterly-report.pdf');
  expect(title.title).toBe('quarterly-report.pdf');
  expect(title.classList.contains('truncate')).toBe(true);
  expect(row.querySelector('[data-item-description]')!.textContent).toBe('5 B');
  const preview = image.querySelector<HTMLElement>('[data-file-field-preview]')!;
  expect(preview.hasAttribute('data-item-media')).toBe(true);
  expect(preview.dataset.variant).toBe('soft');
  await expect.poll(() => preview.querySelector('img')?.getAttribute('src')).toMatch(/^blob:/);
  const remove = row.querySelector<HTMLElement>('[data-item-actions] [data-file-field-remove]')!;
  expect(remove.tagName).toBe('BUTTON');
  expect(remove.dataset.variant).toBe('ghost');
  expect(remove.classList.contains('size-7')).toBe(true);
  const clear = screen.container.querySelector<HTMLElement>(
    '[data-file-field-control] [data-file-field-clear]',
  )!;
  expect(clear.dataset.variant).toBe('ghost');
  expect(clear.classList.contains('size-7')).toBe(true);
  expect(clear.classList.contains('me-1')).toBe(true);
  expect(clear.className).not.toMatch(/-me-2/);
  await screen.rerender(
    <FileField key="tiny" aria-label="Files" multiple size="tiny" defaultValue={[file('a.pdf')]} />,
  );
  const tiny = screen.container.querySelector<HTMLElement>('[data-file-field-item]')!;
  expect(tiny.dataset.size).toBe('tiny');
  expect(tiny.querySelector('[data-file-field-remove]')!.classList.contains('size-6')).toBe(true);
});

test('Clear and Remove keep their handlers, and asChild lends their look to the given button', async () => {
  const onValueChange = vi.fn();
  await render(
    <FileField
      aria-label="Files"
      multiple
      defaultValue={[file('a.pdf'), file('b.pdf')]}
      onValueChange={onValueChange}
    >
      <FileField.Trigger />
      <FileField.Clear onClick={(event) => event.preventDefault()}>
        <svg data-glyph="" />
      </FileField.Clear>
      <FileField.List>
        {(files) =>
          files.map((item) => (
            <FileField.Item key={item.name} file={item}>
              {item.name}
              <FileField.Remove file={item} asChild>
                <button className="own" />
              </FileField.Remove>
            </FileField.Item>
          ))
        }
      </FileField.List>
    </FileField>,
  );
  expect(clearButton().element().querySelector('[data-glyph]')).not.toBeNull();
  await userEvent.click(clearButton());
  expect(onValueChange).not.toHaveBeenCalled();
  const remove = removeButton('a.pdf');
  await expect.element(remove).toHaveClass('own');
  await expect.element(remove).toHaveAttribute('data-variant', 'ghost');
  await userEvent.click(remove);
  expect(onValueChange).toHaveBeenLastCalledWith([named('b.pdf')]);
});

test('required is enforced natively; reset, prevented reset, read-only and disabled', async () => {
  const initial = file('initial.pdf');
  const onValueChange = vi.fn();
  const view = (props: {
    value?: File;
    defaultValue?: File | null;
    required?: boolean;
    readOnly?: boolean;
    disabled?: boolean;
    multiple?: false;
  }) => (
    <form onSubmit={(event) => event.preventDefault()}>
      <FileField
        aria-label="Resume"
        name="resume"
        defaultValue={initial}
        onValueChange={onValueChange}
        {...props}
      />
      <button type="submit">Submit</button>
      <button type="reset">Reset</button>
    </form>
  );
  const screen = await render(view({ defaultValue: null, required: true }));
  const form = () => screen.container.querySelector('form')!;
  const sentName = () => (new FormData(form()).get('resume') as File | null)?.name;
  const trigger = screen.getByRole('button', { name: 'Resume', exact: true });
  const reset = screen.getByRole('button', { name: 'Reset' });
  expect(form().checkValidity()).toBe(false);
  await userEvent.click(screen.getByRole('button', { name: 'Submit' }));
  await expect.element(trigger).toHaveFocus();
  await userEvent.upload(picker(screen.container), [file('other.pdf')]);
  expect(form().checkValidity()).toBe(true);
  await screen.rerender(<div key="reset">{view({})}</div>);
  await userEvent.upload(picker(screen.container), [file('other.pdf')]);
  form().addEventListener('reset', (event) => event.preventDefault(), { once: true });
  await userEvent.click(reset);
  await settle();
  expect(sentName()).toBe('other.pdf');
  const reportsBeforeReset = onValueChange.mock.calls.length;
  await userEvent.click(reset);
  await expect.poll(sentName).toBe('initial.pdf');
  expect(onValueChange, 'a reset reports no change').toHaveBeenCalledTimes(reportsBeforeReset);
  await screen.rerender(
    <div key="readonly">{view({ value: initial, readOnly: true, multiple: false })}</div>,
  );
  const calls = onValueChange.mock.calls.length;
  drag(fieldRoot(screen.container), 'drop', transfer([file('blocked.pdf')]));
  pasteFiles(trigger.element(), [file('blocked.pdf')]);
  await settle();
  expect(onValueChange).toHaveBeenCalledTimes(calls);
  await expect.element(clearButton()).not.toBeInTheDocument();
  expect(sentName()).toBe('initial.pdf');
  await screen.rerender(<div key="disabled">{view({ value: initial, disabled: true })}</div>);
  await expect.element(trigger).toHaveAttribute('disabled');
  expect(new FormData(form()).get('resume')).toBeNull();
});

test('custom composition: asChild trigger, List as a function, event cancellation', async () => {
  const onValueChange = vi.fn();
  const screen = await render(
    <FileField aria-label="Files" multiple onValueChange={onValueChange}>
      <FileField.Trigger asChild>
        <button>Choose</button>
      </FileField.Trigger>
      <FileField.List>
        {(files) =>
          files.map((item) => (
            <FileField.Item key={item.name} file={item}>
              {({ index }) => `${index}:${item.name}`}
            </FileField.Item>
          ))
        }
      </FileField.List>
      <FileField.Clear />
    </FileField>,
  );
  const input = picker(screen.container);
  const pickerOpened = vi.fn();
  input.addEventListener('click', pickerOpened);
  await userEvent.click(screen.getByRole('button', { name: 'Files', exact: true }));
  expect(pickerOpened).toHaveBeenCalledTimes(1);
  await userEvent.upload(input, [file('a.pdf'), file('b.pdf')]);
  expect(
    screen
      .getByRole('listitem')
      .elements()
      .map((item) => item.textContent),
  ).toEqual(['0:a.pdf', '1:b.pdf']);
  expect(onValueChange).toHaveBeenCalledTimes(1);
});

test('react-hook-form value mode: a File model, focus on error, reset and disabled omission', async () => {
  type Values = { resume: File | null };
  const submitted = vi.fn();
  let methods: UseFormReturn<Values> | undefined;
  function App({ disabled = false }: { disabled?: boolean }) {
    const form = useForm<Values>({ defaultValues: { resume: null } });
    methods = form;
    return (
      <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(submitted)}>
          <RHFField
            name="resume"
            controlMode="value"
            disabled={disabled}
            registerOptions={{ required: 'Required' }}
          >
            <RHFField.Label>Resume</RHFField.Label>
            <FileField accept=".pdf" />
            <RHFField.Error />
          </RHFField>
          <button type="submit">Submit</button>
        </form>
      </FormProvider>
    );
  }
  const screen = await render(<App />);
  const trigger = screen.getByRole('button', { name: 'Resume', exact: true });
  const submit = screen.getByRole('button', { name: 'Submit' });
  await userEvent.click(submit);
  await expect.element(trigger).toHaveFocus();
  await userEvent.upload(picker(screen.container), [file()]);
  await userEvent.click(submit);
  await expect.poll(() => submitted.mock.calls.length).toBe(1);
  const { resume } = submitted.mock.lastCall![0] as Values;
  expect(resume).toBeInstanceOf(File);
  expect(resume).toEqual(named('resume.pdf'));
  methods!.reset();
  await expect.element(clearButton()).not.toBeInTheDocument();
  await screen.rerender(<App disabled />);
  await userEvent.click(submit);
  await expect.poll(() => submitted.mock.calls.length).toBe(2);
  expect(submitted.mock.lastCall![0].resume).toBeUndefined();
});

test('sizes read in familiar units', async () => {
  const sized = (name: string, bytes: number) =>
    new File([new Uint8Array(bytes)], name, { type: 'application/pdf', lastModified: 1 });
  const screen = await render(
    <FileField
      aria-label="Files"
      multiple
      defaultValue={[sized('a.pdf', 512), sized('b.pdf', 1536), sized('c.pdf', 23 * 1024 * 1024)]}
    />,
  );
  expect(
    Array.from(
      screen.container.querySelectorAll('[data-file-field-item] [data-item-description]'),
      (size) => size.textContent,
    ),
  ).toEqual(['512 B', '1.5 KB', '23 MB']);
});
