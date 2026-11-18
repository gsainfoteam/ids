import { useState } from 'react';

import { renderToString } from 'react-dom/server';
import { expect, test, vi } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';

import { Button, Field } from '../src';
import { Editor } from '../src/editor';

const MOD_AS_PROSEMIRROR_READS_IT = /Mac|iP(hone|[oa]d)/.test(navigator.platform)
  ? 'Meta'
  : 'Control';

const press = (key: string) =>
  userEvent.keyboard(`{${MOD_AS_PROSEMIRROR_READS_IT}>}${key}{/${MOD_AS_PROSEMIRROR_READS_IT}}`);

async function editable(name: string) {
  const content = page.getByRole('textbox', { name });
  await expect.element(content).toHaveAttribute('contenteditable', 'true');
  return content;
}

test('SSR renders the shell, the toolbar and a labelled body before the engine mounts', () => {
  const html = renderToString(
    <Field required>
      <Field.Label>본문</Field.Label>
      <Editor name="body" defaultValue="<p>초안</p>" />
    </Field>,
  );
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const content = doc.querySelector('[data-editor-content]')!;

  expect(doc.querySelector('[role="toolbar"]')?.getAttribute('aria-label')).toBe('서식');
  expect(content.getAttribute('role')).toBe('textbox');
  expect(content.getAttribute('aria-required')).toBe('true');
  expect(doc.getElementById(content.getAttribute('aria-labelledby')!)?.textContent).toContain(
    '본문',
  );
  expect(doc.querySelector<HTMLInputElement>('input[type="hidden"][name="body"]')?.value).toBe(
    '<p>초안</p>',
  );
});

test('typing reports HTML, and an emptied document reports an empty string', async () => {
  const onValueChange = vi.fn();
  render(
    <Editor aria-label="메모" onValueChange={onValueChange}>
      <Editor.Content placeholder="메모" />
    </Editor>,
  );
  const content = await editable('메모');

  await userEvent.click(content);
  await userEvent.keyboard('안녕');
  await expect.poll(() => onValueChange.mock.lastCall?.[0]).toBe('<p>안녕</p>');

  await userEvent.keyboard('{Backspace}{Backspace}');
  await expect.poll(() => onValueChange.mock.lastCall?.[0]).toBe('');
});

test('the bold shortcut marks the selection and presses the toolbar toggle', async () => {
  const onValueChange = vi.fn();
  render(
    <Editor aria-label="본문" defaultValue="<p>굵게</p>" onValueChange={onValueChange}>
      <Editor.Bold />
      <Editor.Italic />
      <Editor.Content />
    </Editor>,
  );
  const content = await editable('본문');
  const bold = page.getByRole('button', { name: '굵게' });

  await userEvent.click(content);
  await press('a');
  await press('b');

  await expect.poll(() => onValueChange.mock.lastCall?.[0]).toBe('<p><strong>굵게</strong></p>');
  await expect.element(bold).toHaveAttribute('aria-pressed', 'true');

  await userEvent.click(bold);
  await expect.poll(() => onValueChange.mock.lastCall?.[0]).toBe('<p>굵게</p>');
  await expect.element(content).toHaveFocus();
});

test('the toolbar is one Tab stop and arrows move between its tools', async () => {
  render(
    <>
      <Button>앞</Button>
      <Editor aria-label="본문">
        <Editor.BlockType />
        <Editor.Bold />
        <Editor.Italic />
        <Editor.Content />
      </Editor>
    </>,
  );
  await editable('본문');
  const toolbar = page.getByRole('toolbar', { name: '서식' });
  await expect.element(toolbar).toHaveAttribute('aria-controls');

  await userEvent.click(page.getByRole('button', { name: '앞' }));
  await userEvent.keyboard('{Tab}');
  await expect.element(page.getByRole('combobox', { name: '문단 모양' })).toHaveFocus();

  await userEvent.keyboard('{ArrowRight}');
  await expect.element(page.getByRole('button', { name: '굵게' })).toHaveFocus();
  await userEvent.keyboard('{ArrowRight}');
  await expect.element(page.getByRole('button', { name: '기울임' })).toHaveFocus();

  await userEvent.keyboard('{Tab}');
  await expect.element(page.getByRole('textbox', { name: '본문' })).toHaveFocus();
});

test('a toolbar wider than the field stays one row and scrolls to the focused tool', async () => {
  render(
    <div style={{ width: 200 }}>
      <Editor aria-label="본문" />
    </div>,
  );
  await editable('본문');
  const toolbar = page.getByRole('toolbar', { name: '서식' });
  const bold = page.getByRole('button', { name: '굵게' });
  const codeBlock = page.getByRole('button', { name: '코드 블록' });
  const scroller = () =>
    toolbar.element().querySelector<HTMLElement>('[data-scroll-area-viewport]')!;

  await expect.element(codeBlock).toBeInTheDocument();
  expect(codeBlock.element().getBoundingClientRect().top).toBe(
    bold.element().getBoundingClientRect().top,
  );
  expect(scroller().scrollWidth).toBeGreaterThan(scroller().clientWidth);
  expect(scroller().scrollLeft).toBe(0);

  await userEvent.click(page.getByRole('textbox', { name: '본문' }));
  await userEvent.keyboard('{Shift>}{Tab}{/Shift}');
  await userEvent.keyboard('{End}');
  await expect.element(codeBlock).toHaveFocus();
  await expect.poll(() => scroller().scrollLeft).toBeGreaterThan(0);
});

test('the block type select turns the paragraph into a heading', async () => {
  const onValueChange = vi.fn();
  render(
    <Editor aria-label="본문" defaultValue="<p>제목</p>" onValueChange={onValueChange}>
      <Editor.BlockType />
      <Editor.Content />
    </Editor>,
  );
  const content = await editable('본문');
  await userEvent.click(content);

  await userEvent.click(page.getByRole('combobox', { name: '문단 모양' }));
  await userEvent.click(page.getByRole('option', { name: '제목 2' }));

  await expect.poll(() => onValueChange.mock.lastCall?.[0]).toBe('<h2>제목</h2>');
  await expect
    .element(page.getByRole('combobox', { name: '문단 모양' }))
    .toHaveTextContent('제목 2');
});

test('Link inserts the address as a link when nothing is selected, and removes it again', async () => {
  const onValueChange = vi.fn();
  render(
    <Editor aria-label="본문" onValueChange={onValueChange}>
      <Editor.Link />
      <Editor.Content />
    </Editor>,
  );
  const content = await editable('본문');
  await userEvent.click(content);

  await userEvent.click(page.getByRole('button', { name: '링크' }));
  const url = page.getByRole('textbox', { name: '링크 주소' });
  await expect.element(url).toHaveFocus();
  await userEvent.keyboard('gistory.me{Enter}');

  await expect
    .poll(() => onValueChange.mock.lastCall?.[0])
    .toBe(
      '<p><a target="_blank" rel="noopener noreferrer nofollow" href="https://gistory.me">gistory.me</a></p>',
    );
  await expect.element(content).toHaveFocus();
  await expect
    .element(page.getByRole('button', { name: '링크' }))
    .toHaveAttribute('aria-pressed', 'true');

  await userEvent.click(page.getByRole('button', { name: '링크' }));
  await userEvent.click(page.getByRole('button', { name: '링크 지우기' }));
  await expect.poll(() => onValueChange.mock.lastCall?.[0]).toBe('<p>gistory.me</p>');
});

test('a javascript: address is not linked', async () => {
  const onValueChange = vi.fn();
  render(
    <Editor aria-label="본문" defaultValue="<p>누르기</p>" onValueChange={onValueChange}>
      <Editor.Link />
      <Editor.Content />
    </Editor>,
  );
  const content = await editable('본문');
  await userEvent.click(content);
  await press('a');

  await userEvent.click(page.getByRole('button', { name: '링크' }));
  await userEvent.keyboard('javascript:alert(1){Enter}');

  await expect.element(page.getByRole('dialog')).not.toBeInTheDocument();
  expect(content.element().querySelector('a')).toBeNull();
  expect(onValueChange).not.toHaveBeenCalled();
});

test('a javascript: address typed with nothing selected is neither linked nor inserted', async () => {
  const onValueChange = vi.fn();
  render(
    <Editor
      aria-label="본문"
      format="json"
      defaultValue={{ type: 'doc', content: [{ type: 'paragraph' }] }}
      onValueChange={onValueChange}
    >
      <Editor.Link />
      <Editor.Content />
    </Editor>,
  );
  const content = await editable('본문');
  await userEvent.click(content);

  await userEvent.click(page.getByRole('button', { name: '링크' }));
  await userEvent.keyboard('javascript:alert(1){Enter}');

  await expect.element(page.getByRole('dialog')).not.toBeInTheDocument();
  expect(content.element().querySelector('a')).toBeNull();
  expect(content.element().textContent).toBe('');
  expect(onValueChange).not.toHaveBeenCalled();
});

test('Field names the body, blocks an empty required submit and reports the browser message', async () => {
  const onSubmit = vi.fn();
  render(
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit(new FormData(event.currentTarget).get('body'));
      }}
    >
      <Field required>
        <Field.Label>본문</Field.Label>
        <Editor name="body">
          <Editor.Content />
        </Editor>
        <Field.Error data-testid="error" />
      </Field>
      <Button type="submit">올리기</Button>
    </form>,
  );
  const content = await editable('본문');

  await userEvent.click(page.getByRole('button', { name: '올리기' }));
  expect(onSubmit).not.toHaveBeenCalled();
  await expect.element(page.getByTestId('error')).toBeVisible();
  await expect.element(content).toHaveAttribute('aria-invalid', 'true');

  await userEvent.click(content);
  await userEvent.keyboard('내용');
  await expect.element(page.getByTestId('error')).not.toBeInTheDocument();
  await userEvent.click(page.getByRole('button', { name: '올리기' }));
  expect(onSubmit).toHaveBeenLastCalledWith('<p>내용</p>');
});

test('form reset restores defaultValue without reporting it', async () => {
  const onValueChange = vi.fn();
  render(
    <form>
      <Editor
        aria-label="본문"
        name="body"
        defaultValue="<p>초안</p>"
        onValueChange={onValueChange}
      >
        <Editor.Content />
      </Editor>
      <Button type="reset">되돌리기</Button>
    </form>,
  );
  const content = await editable('본문');

  await userEvent.click(content);
  await press('a');
  await userEvent.keyboard('새 글');
  await expect.poll(() => onValueChange.mock.lastCall?.[0]).toBe('<p>새 글</p>');
  const reported = onValueChange.mock.calls.length;

  await userEvent.click(page.getByRole('button', { name: '되돌리기' }));
  await expect.element(content).toHaveTextContent('초안');
  await expect
    .poll(() => document.querySelector<HTMLInputElement>('input[name="body"]')?.value)
    .toBe('<p>초안</p>');
  expect(onValueChange).toHaveBeenCalledTimes(reported);
});

test('markdown reads and writes markdown, and a controlled value replaces the document', async () => {
  function Controlled() {
    const [value, setValue] = useState('**굵게** 쓴 글');
    return (
      <>
        <Editor format="markdown" aria-label="본문" value={value} onValueChange={setValue}>
          <Editor.Content />
        </Editor>
        <output data-testid="value">{value}</output>
        <Button onClick={() => setValue('# 새 제목')}>바꾸기</Button>
      </>
    );
  }
  render(<Controlled />);
  const content = await editable('본문');
  await expect.element(content).toContainHTML('<strong>굵게</strong>');

  await userEvent.click(content);
  await press('a');
  await userEvent.keyboard('_기울임_ ');
  await expect.element(page.getByTestId('value')).toHaveTextContent('*기울임*');

  await userEvent.click(page.getByRole('button', { name: '바꾸기' }));
  await expect.element(content).toContainHTML('<h1>새 제목</h1>');
});

test('json reports the ProseMirror document', async () => {
  const onValueChange = vi.fn();
  render(
    <Editor format="json" aria-label="본문" onValueChange={onValueChange}>
      <Editor.Content />
    </Editor>,
  );
  const content = await editable('본문');
  await userEvent.click(content);
  await userEvent.keyboard('가');

  await expect
    .poll(() => onValueChange.mock.lastCall?.[0])
    .toEqual({
      type: 'doc',
      content: [{ type: 'paragraph', content: [{ type: 'text', text: '가' }] }],
    });
});

test('disabled and readOnly keep the document and turn the tools off', async () => {
  render(
    <>
      <Editor aria-label="비활성" disabled defaultValue="<p>글</p>">
        <Editor.Bold />
        <Editor.Content />
      </Editor>
      <Editor aria-label="읽기" readOnly defaultValue="<p>글</p>">
        <Editor.Bold />
        <Editor.Content />
      </Editor>
    </>,
  );
  for (const name of ['비활성', '읽기']) {
    const content = page.getByRole('textbox', { name });
    await expect.element(content).toHaveAttribute('contenteditable', 'false');
    await expect.element(content).toHaveTextContent('글');
  }
  await expect
    .element(page.getByRole('textbox', { name: '읽기' }))
    .toHaveAttribute('aria-readonly', 'true');
  for (const bold of page.getByRole('button', { name: '굵게' }).all())
    await expect.element(bold).toBeDisabled();
});

test('Count shows the characters against maxLength and describes the body', async () => {
  render(
    <Editor aria-label="본문" maxLength={5}>
      <Editor.Content />
      <Editor.Count />
    </Editor>,
  );
  const content = await editable('본문');
  const description = () =>
    document.getElementById(content.element().getAttribute('aria-describedby') ?? '')?.textContent;
  await expect.poll(description).toBe('0 / 5');

  await userEvent.click(content);
  await userEvent.keyboard('가나다라마바사');
  await expect.element(content).toHaveTextContent('가나다라마');
  await expect.poll(description).toBe('5 / 5');
});

test('BubbleMenu opens over a selection and Escape closes it', async () => {
  render(
    <Editor aria-label="본문" defaultValue="<p>버블 메뉴</p>">
      <Editor.Content />
      <Editor.BubbleMenu />
    </Editor>,
  );
  const content = await editable('본문');
  const bubble = page.getByRole('toolbar', { name: '선택한 글 서식' });

  await userEvent.click(content);
  await expect.element(bubble).not.toBeInTheDocument();
  await press('a');
  await expect.element(bubble).toBeVisible();

  await userEvent.keyboard('{Escape}');
  await expect.element(bubble).not.toBeInTheDocument();
  await expect.element(content).toHaveFocus();
});
