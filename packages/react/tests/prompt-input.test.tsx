import { useState } from 'react';

import { renderToString } from 'react-dom/server';
import { expect, test, vi } from 'vitest';
import { cdp, page, userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';

import { IconButton, PromptInput } from '../src';
import { FIREFOX_DROPS_SYNTHETIC_CLIPBOARD_DATA, skipInFirefox, skipWithoutCdp } from './engines';

const parse = (html: string) => new DOMParser().parseFromString(html, 'text/html');

const pdf = (name = 'report.pdf') =>
  new File(['report'], name, { type: 'application/pdf', lastModified: 1 });

const textbox = () => page.getByRole('textbox', { name: '메시지' });
const sendButton = () => page.getByRole('button', { name: '보내기', exact: true });
const stopButton = () => page.getByRole('button', { name: '멈추기', exact: true });
const attachButton = () => page.getByRole('button', { name: '파일 첨부', exact: true });
const attachments = () => page.getByRole('list', { name: '첨부한 파일' });

const picker = (container: HTMLElement) =>
  container.querySelector<HTMLInputElement>('input[type=file]')!;

const attachedNames = () =>
  attachments()
    .getByRole('listitem')
    .elements()
    .map((item) => item.querySelector('[title]')?.getAttribute('title'));

function transfer(files: File[]) {
  const data = new DataTransfer();
  for (const item of files) data.items.add(item);
  return data;
}

test('the default composition is a form with a labelled textarea and a send button', async () => {
  const screen = await render(<PromptInput onSend={vi.fn()} />);
  const form = screen.container.querySelector('form')!;

  expect(form).toHaveAttribute('data-prompt-input');
  expect(form).toHaveAttribute('data-status', 'idle');
  await expect.element(textbox()).toHaveAttribute('placeholder', '메시지를 입력하세요');
  await expect.element(textbox()).toHaveAttribute('enterkeyhint', 'send');
  await expect.element(textbox()).toHaveAttribute('rows', '1');
  await expect.element(sendButton()).toHaveAttribute('type', 'submit');
  await expect.element(sendButton()).toHaveAttribute('aria-disabled', 'true');
  expect(form.contains(sendButton().element())).toBe(true);
  expect(screen.container.querySelector('[data-text-area-bottom]')).toContainElement(
    sendButton().element(),
  );
  await expect.element(attachButton()).not.toBeInTheDocument();
});

test('Enter sends and clears, Shift+Enter breaks the line, empty or blank text is not sent', async () => {
  const onSend = vi.fn();
  await render(<PromptInput onSend={onSend} />);

  await userEvent.click(textbox());
  await userEvent.keyboard('   {Enter}');
  expect(onSend).not.toHaveBeenCalled();
  await expect.element(textbox()).toHaveValue('   ');

  await userEvent.fill(textbox(), '');
  await userEvent.keyboard('first{Shift>}{Enter}{/Shift}second');
  await expect.element(textbox()).toHaveValue('first\nsecond');
  await userEvent.keyboard('{Enter}');

  expect(onSend).toHaveBeenCalledExactlyOnceWith({ text: 'first\nsecond', files: [], tools: [] });
  await expect.element(textbox()).toHaveValue('');
  await expect.element(textbox()).toHaveFocus();
});

test('Enter that commits an IME composition does not send', async (context) => {
  skipWithoutCdp(context);
  const onSend = vi.fn();
  await render(<PromptInput onSend={onSend} />);
  await userEvent.click(textbox());

  const ime = cdp();
  await ime.send('Input.imeSetComposition', { text: '안녕', selectionStart: 2, selectionEnd: 2 });
  await expect.element(textbox()).toHaveValue('안녕');
  await ime.send('Input.dispatchKeyEvent', {
    type: 'rawKeyDown',
    key: 'Enter',
    code: 'Enter',
    windowsVirtualKeyCode: 229,
  });
  await ime.send('Input.insertText', { text: '안녕' });
  await expect.element(textbox()).toHaveValue('안녕');
  expect(onSend).not.toHaveBeenCalled();

  await userEvent.keyboard('{Enter}');
  expect(onSend).toHaveBeenCalledExactlyOnceWith({ text: '안녕', files: [], tools: [] });
});

test('while busy, Enter keeps the draft and the button or Escape stops, or it waits without onStop', async () => {
  const onSend = vi.fn();
  const onStop = vi.fn();
  const screen = await render(
    <PromptInput status="streaming" onSend={onSend} onStop={onStop} defaultValue="next" />,
  );

  await userEvent.click(textbox());
  await userEvent.keyboard('{Enter}');
  expect(onSend).not.toHaveBeenCalled();
  await expect.element(textbox()).toHaveValue('next');
  await expect.element(stopButton()).toHaveAttribute('type', 'button');
  await expect.element(stopButton()).toBeEnabled();
  await userEvent.click(stopButton());
  expect(onStop).toHaveBeenCalledOnce();
  await userEvent.click(textbox());
  await userEvent.keyboard('{Escape}');
  expect(onStop).toHaveBeenCalledTimes(2);

  await screen.rerender(<PromptInput status="submitting" onSend={onSend} defaultValue="next" />);
  const waiting = page.getByRole('button', { name: '보내는 중', exact: true });
  await expect.element(waiting).toHaveAttribute('type', 'submit');
  await expect.element(waiting).toHaveAttribute('aria-busy', 'true');
  await expect.element(waiting).toHaveAttribute('aria-disabled', 'true');
  await userEvent.click(waiting, { force: true });
  expect(onSend).not.toHaveBeenCalled();

  const escapes: boolean[] = [];
  const recordEscape = (event: KeyboardEvent) => escapes.push(event.defaultPrevented);
  document.addEventListener('keydown', recordEscape);
  await userEvent.click(textbox());
  await userEvent.keyboard('{Escape}');
  document.removeEventListener('keydown', recordEscape);
  expect(escapes, 'Escape without onStop is left to the page').toEqual([false]);
});

test('the send button keeps focus as it turns into the stop button and back', async () => {
  function Chat() {
    const [status, setStatus] = useState<PromptInput.Status>('idle');
    return (
      <PromptInput
        status={status}
        defaultValue="hello"
        onSend={() => setStatus('streaming')}
        onStop={() => setStatus('idle')}
      />
    );
  }
  await render(<Chat />);

  await userEvent.click(sendButton());
  await expect.element(stopButton()).toHaveFocus();
  await userEvent.keyboard('{Enter}');
  await expect.element(sendButton()).toHaveFocus();
  await expect.element(sendButton()).toHaveAttribute('aria-disabled', 'true');
});

test('attachments: picked and dropped files list in the top bar and go with the message', async () => {
  const onSend = vi.fn();
  const onFilesChange = vi.fn();
  const screen = await render(
    <PromptInput onSend={onSend} onFilesChange={onFilesChange} accept=".pdf">
      <PromptInput.Input />
      <PromptInput.Attach />
    </PromptInput>,
  );

  const opened = vi.fn();
  picker(screen.container).addEventListener('click', opened);
  await userEvent.click(attachButton());
  expect(opened).toHaveBeenCalledOnce();
  await expect.element(attachButton()).not.toHaveAttribute('data-field-input');

  await userEvent.upload(picker(screen.container), pdf('a.pdf'));
  await expect.element(attachments()).toBeVisible();
  expect(screen.container.querySelector('[data-text-area-top]')).toContainElement(
    attachments().element(),
  );

  textbox()
    .element()
    .dispatchEvent(
      new DragEvent('drop', {
        bubbles: true,
        cancelable: true,
        dataTransfer: transfer([pdf('b.pdf')]),
      }),
    );
  await expect.poll(attachedNames).toEqual(['a.pdf', 'b.pdf']);

  textbox()
    .element()
    .dispatchEvent(
      new DragEvent('drop', {
        bubbles: true,
        cancelable: true,
        dataTransfer: transfer([new File(['x'], 'x.png', { type: 'image/png' })]),
      }),
    );
  await expect.element(page.getByRole('alert')).toMatchTextContent(/x\.png/);

  await userEvent.click(page.getByRole('button', { name: 'b.pdf 삭제', exact: true }));
  await expect.poll(attachedNames).toEqual(['a.pdf']);

  await userEvent.click(sendButton());
  expect(onSend).toHaveBeenCalledExactlyOnceWith({
    text: '',
    files: [expect.objectContaining({ name: 'a.pdf' })],
    tools: [],
  });
  await expect.element(attachments()).not.toBeInTheDocument();
  expect(onFilesChange).toHaveBeenLastCalledWith([]);
});

test('a file pasted into the textarea is attached, pasted text is typed', async (context) => {
  skipInFirefox(context, FIREFOX_DROPS_SYNTHETIC_CLIPBOARD_DATA);
  await render(<PromptInput onSend={vi.fn()} />);

  await userEvent.click(textbox());
  const pasted = new ClipboardEvent('paste', {
    bubbles: true,
    cancelable: true,
    clipboardData: transfer([pdf('c.pdf')]),
  });
  textbox().element().dispatchEvent(pasted);
  expect(pasted.defaultPrevented).toBe(true);
  await expect.poll(attachedNames).toEqual(['c.pdf']);
  await expect.element(sendButton()).not.toHaveAttribute('aria-disabled');
});

test('controlled value reports the cleared text and parts may be placed by hand', async () => {
  const onSend = vi.fn();
  function Controlled() {
    const [value, setValue] = useState('draft');
    return (
      <PromptInput value={value} onValueChange={setValue} onSend={onSend}>
        <PromptInput.Attachments aria-label="Files" />
        <PromptInput.Input aria-label="Question" maxRows={3} />
        <PromptInput.Submit aria-label="Ask" />
        <IconButton aria-label="Extra" icon={<span />} />
      </PromptInput>
    );
  }
  const screen = await render(<Controlled />);
  const question = page.getByRole('textbox', { name: 'Question' });
  const ask = page.getByRole('button', { name: 'Ask', exact: true });

  await expect.element(question).toHaveValue('draft');
  const bottom = screen.container.querySelector('[data-text-area-bottom]')!;
  expect(
    Array.from(bottom.querySelectorAll('button'), (node) => node.getAttribute('aria-label')),
  ).toEqual(['Ask', 'Extra']);

  await userEvent.click(ask);
  expect(onSend).toHaveBeenCalledExactlyOnceWith({ text: 'draft', files: [], tools: [] });
  await expect.element(question).toHaveValue('');
});

test('onSubmit may cancel sending, and without onSend the form submits natively', async () => {
  const onSend = vi.fn();
  const submitted = vi.fn();
  const screen = await render(
    <PromptInput
      defaultValue="hi"
      onSend={onSend}
      onSubmit={(event) => {
        submitted(new FormData(event.currentTarget).get('prompt'));
        event.preventDefault();
      }}
    >
      <PromptInput.Input name="prompt" />
    </PromptInput>,
  );

  await userEvent.click(textbox());
  await userEvent.keyboard('{Enter}');
  expect(submitted).toHaveBeenCalledExactlyOnceWith('hi');
  expect(onSend).not.toHaveBeenCalled();
  await expect.element(textbox()).toHaveValue('hi');

  const prevented: boolean[] = [];
  const observeAfterReact = (event: Event) => {
    prevented.push(event.defaultPrevented);
    event.preventDefault();
  };
  document.addEventListener('submit', observeAfterReact);
  try {
    await screen.rerender(
      <PromptInput defaultValue="hi">
        <PromptInput.Input name="prompt" />
      </PromptInput>,
    );
    await userEvent.keyboard('{Enter}');
    await userEvent.fill(textbox(), '');
    await userEvent.keyboard('{Enter}');
    await expect.poll(() => prevented).toEqual([false, true]);
  } finally {
    document.removeEventListener('submit', observeAfterReact);
  }
});

test('tools toggle, go with every message and stay on after sending', async () => {
  const onSend = vi.fn();
  const onToolsChange = vi.fn();
  await render(
    <PromptInput onSend={onSend} onToolsChange={onToolsChange}>
      <PromptInput.Input />
      <PromptInput.Tool value="search">웹 검색</PromptInput.Tool>
      <PromptInput.Tool value="sources">출처 보기</PromptInput.Tool>
    </PromptInput>,
  );
  const search = page.getByRole('button', { name: '웹 검색' });

  await expect.element(search).toHaveAttribute('aria-pressed', 'false');
  await userEvent.click(search);
  await expect.element(search).toHaveAttribute('aria-pressed', 'true');
  expect(onToolsChange).toHaveBeenLastCalledWith(['search']);
  expect(onSend).not.toHaveBeenCalled();

  await userEvent.fill(textbox(), 'news');
  await userEvent.keyboard('{Enter}');
  expect(onSend).toHaveBeenCalledExactlyOnceWith({ text: 'news', files: [], tools: ['search'] });
  await expect.element(search).toHaveAttribute('aria-pressed', 'true');

  await userEvent.click(search);
  expect(onToolsChange).toHaveBeenLastCalledWith([]);
});

test('the action menu opens the file picker from its default item', async () => {
  const screen = await render(
    <PromptInput onSend={vi.fn()}>
      <PromptInput.Input />
      <PromptInput.ActionMenu />
    </PromptInput>,
  );
  const opened = vi.fn();
  picker(screen.container).addEventListener('click', (event) => {
    event.preventDefault();
    opened();
  });

  await userEvent.click(page.getByRole('button', { name: '더하기' }));
  await userEvent.click(page.getByRole('menuitem', { name: '파일 첨부' }));
  expect(opened).toHaveBeenCalledOnce();
  await expect.element(page.getByRole('menu')).not.toBeInTheDocument();
});

test('the bars join the input with no line between them', async () => {
  const screen = await render(
    <PromptInput defaultFiles={[pdf()]}>
      <PromptInput.Input />
      <PromptInput.Attach />
    </PromptInput>,
  );
  const top = screen.container.querySelector<HTMLElement>('[data-text-area-top]')!;
  const bottom = screen.container.querySelector<HTMLElement>('[data-text-area-bottom]')!;

  expect(getComputedStyle(top).borderBottomWidth).toBe('0px');
  expect(getComputedStyle(bottom).borderTopWidth).toBe('0px');
});

test('form reset restores the default text, files and tools without reporting them', async () => {
  const onValueChange = vi.fn();
  const screen = await render(
    <PromptInput
      defaultValue="start"
      defaultFiles={[pdf()]}
      defaultTools={['search']}
      onValueChange={onValueChange}
    >
      <PromptInput.Input />
      <PromptInput.Attach />
      <PromptInput.Tool value="search">웹 검색</PromptInput.Tool>
    </PromptInput>,
  );

  await userEvent.fill(textbox(), 'changed');
  await userEvent.click(page.getByRole('button', { name: 'report.pdf 삭제', exact: true }));
  await userEvent.click(page.getByRole('button', { name: '웹 검색' }));
  onValueChange.mockClear();
  screen.container.querySelector('form')!.reset();

  await expect.element(textbox()).toHaveValue('start');
  await expect.poll(attachedNames).toEqual(['report.pdf']);
  await expect
    .element(page.getByRole('button', { name: '웹 검색' }))
    .toHaveAttribute('aria-pressed', 'true');
  expect(onValueChange).not.toHaveBeenCalled();
});

test('disabled turns off the textarea, the attach button and sending', async () => {
  const onSend = vi.fn();
  await render(
    <PromptInput disabled defaultValue="locked" onSend={onSend}>
      <PromptInput.Input />
      <PromptInput.Attach />
    </PromptInput>,
  );

  await expect.element(textbox()).toBeDisabled();
  await expect.element(attachButton()).toBeDisabled();
  await expect.element(sendButton()).toHaveAttribute('aria-disabled', 'true');
  await userEvent.click(sendButton(), { force: true });
  expect(onSend).not.toHaveBeenCalled();
});

test('server markup holds the form, the textarea and the send button', () => {
  const doc = parse(
    renderToString(
      <PromptInput defaultValue="hello" accept="image/*">
        <PromptInput.Input placeholder="Ask" />
        <PromptInput.Attach />
      </PromptInput>,
    ),
  );

  expect(doc.querySelector('form[data-prompt-input] textarea')?.textContent).toBe('hello');
  expect(doc.querySelector('textarea')?.getAttribute('placeholder')).toBe('Ask');
  expect(doc.querySelector('input[type=file]')?.getAttribute('accept')).toBe('image/*');
  expect(doc.querySelector('[data-prompt-input-submit]')?.getAttribute('type')).toBe('submit');
  expect(doc.querySelector('[data-prompt-input-attach]')?.getAttribute('aria-label')).toBe(
    '파일 첨부',
  );
});
