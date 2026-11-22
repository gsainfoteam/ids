import { useState } from 'react';

import { renderToString } from 'react-dom/server';
import { expect, test, vi } from 'vitest';
import { cdp, page, userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';

import { skipWithoutCdp } from './engines';
import { testTheme } from './theme';
import { Button, Dialog, Field, IdsProvider } from '../src';
import { toast } from '../src/components/feedback/toast';
import { Editor } from '../src/editor';
import { RichText } from '../src/rich-text';

const MOD_AS_PROSEMIRROR_READS_IT = /Mac|iP(hone|[oa]d)/.test(navigator.platform)
  ? 'Meta'
  : 'Control';

const press = (key: string) =>
  userEvent.keyboard(`{${MOD_AS_PROSEMIRROR_READS_IT}>}${key}{/${MOD_AS_PROSEMIRROR_READS_IT}}`);

function heldUpload() {
  const calls: { file: File; resolve: (url: string) => void; reject: (reason: unknown) => void }[] =
    [];
  const upload = vi.fn(
    (file: File) =>
      new Promise<string>((resolve, reject) => {
        calls.push({ file, resolve, reject });
      }),
  );
  return { upload, calls };
}

const PICTURE = `data:image/svg+xml;base64,${btoa(
  '<svg xmlns="http://www.w3.org/2000/svg" width="80" height="48"><rect width="80" height="48" fill="#3b82f6"/></svg>',
)}`;

const png = (name = 'map.png') => new File(['png'], name, { type: 'image/png' });

function transfer(files: File[], html?: string) {
  const data = new DataTransfer();
  for (const file of files) data.items.add(file);
  if (html !== undefined) data.setData('text/html', html);
  return data;
}

function pasteEvent(files: File[], html?: string) {
  const event = new ClipboardEvent('paste', { bubbles: true, cancelable: true });
  Object.defineProperty(event, 'clipboardData', { value: transfer(files, html) });
  return event;
}

const imageInput = () =>
  page.elementLocator(document.querySelector<HTMLInputElement>('[data-editor-image-input]')!);

const placeholders = () => document.querySelectorAll('[data-editor-upload]').length;

type Point = { x: number; y: number };

const inTheTopPage = (point: Point) => {
  const frame = window.frameElement!.getBoundingClientRect();
  const scale = frame.width / window.innerWidth;
  return { x: frame.left + point.x * scale, y: frame.top + point.y * scale };
};

const centerOf = (element: Element): Point => {
  const box = element.getBoundingClientRect();
  return { x: box.left + box.width / 2, y: box.top + box.height / 2 };
};

async function mouse(type: 'mousePressed' | 'mouseMoved' | 'mouseReleased', point: Point) {
  await cdp().send('Input.dispatchMouseEvent', {
    type,
    ...inTheTopPage(point),
    button: 'left',
    buttons: type === 'mouseReleased' ? 0 : 1,
    clickCount: 1,
  });
}

const dropLine = () => document.querySelector('[data-editor-drop-line]');

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

test('Image uploads the picked file, holds a placeholder while it waits and inserts the URL it returns', async () => {
  const { upload, calls } = heldUpload();
  const onValueChange = vi.fn();
  render(
    <Editor
      aria-label="본문"
      defaultValue="<p>지도</p>"
      onImageUpload={upload}
      onValueChange={onValueChange}
    >
      <Editor.Image />
      <Editor.Content />
    </Editor>,
  );
  const content = await editable('본문');
  const tool = page.getByRole('button', { name: '그림' });
  await userEvent.click(content);

  await userEvent.upload(imageInput(), png());
  await expect.poll(() => calls.length).toBe(1);
  expect(calls[0]!.file.name).toBe('map.png');
  await expect.element(tool).toHaveAttribute('aria-busy', 'true');
  expect(placeholders()).toBe(1);
  await expect
    .element(page.getByRole('status').filter({ hasText: '그림을 올리는 중' }))
    .toBeInTheDocument();
  expect(onValueChange).not.toHaveBeenCalled();

  calls[0]!.resolve('https://cdn.gistory.me/map.png');
  await expect
    .poll(() => onValueChange.mock.lastCall?.[0])
    .toBe('<p>지도</p><img src="https://cdn.gistory.me/map.png" alt="">');
  await expect.element(tool).not.toHaveAttribute('aria-busy');
  expect(placeholders()).toBe(0);
});

test('a failed upload removes its placeholder and says so in a toast', async () => {
  const { upload, calls } = heldUpload();
  const onValueChange = vi.fn();
  render(
    <IdsProvider theme={testTheme}>
      <Editor aria-label="본문" onImageUpload={upload} onValueChange={onValueChange}>
        <Editor.Image />
        <Editor.Content />
      </Editor>
    </IdsProvider>,
  );
  const content = await editable('본문');
  await userEvent.click(content);

  await userEvent.upload(imageInput(), png('broken.png'));
  await expect.poll(() => calls.length).toBe(1);
  calls[0]!.reject(new Error('503'));

  await expect.element(page.getByText('그림을 올리지 못했습니다')).toBeVisible();
  await expect.element(page.getByText('broken.png')).toBeVisible();
  expect(placeholders()).toBe(0);
  expect(content.element().querySelector('img')).toBeNull();
  expect(onValueChange).not.toHaveBeenCalled();
  toast.dismissAll();
});

test('a pasted or dropped image file goes through the upload, and other files do not', async () => {
  const upload = vi.fn(async (file: File) => `https://cdn.gistory.me/${file.name}`);
  const onValueChange = vi.fn();
  render(
    <Editor aria-label="본문" onImageUpload={upload} onValueChange={onValueChange}>
      <Editor.Content />
    </Editor>,
  );
  const content = await editable('본문');
  await userEvent.click(content);

  const pasted = pasteEvent(
    [png('pasted.png')],
    '<img src="https://elsewhere.example/pasted.png">',
  );
  content.element().dispatchEvent(pasted);
  expect(pasted.defaultPrevented).toBe(true);
  await expect
    .poll(() => onValueChange.mock.lastCall?.[0])
    .toBe('<img src="https://cdn.gistory.me/pasted.png" alt="">');

  const box = content.element().getBoundingClientRect();
  content.element().dispatchEvent(
    new DragEvent('drop', {
      bubbles: true,
      cancelable: true,
      clientX: box.left + 4,
      clientY: box.bottom - 4,
      dataTransfer: transfer([png('dropped.png')]),
    }),
  );
  await expect.poll(() => content.element().querySelectorAll('img').length).toBe(2);
  expect(upload.mock.calls.map(([file]) => file.name)).toEqual(['pasted.png', 'dropped.png']);

  const pdf = pasteEvent([new File(['%PDF'], 'notes.pdf', { type: 'application/pdf' })]);
  content.element().dispatchEvent(pdf);
  expect(pdf.defaultPrevented).toBe(false);
  await expect.element(content).toHaveFocus();
  expect(upload).toHaveBeenCalledTimes(2);
});

test('without onImageUpload there is no Image tool, files are not pasted and pasted images are dropped, but saved images stay', async () => {
  const onValueChange = vi.fn();
  render(
    <Editor
      aria-label="본문"
      defaultValue='<p>본문</p><img src="https://cdn.gistory.me/saved.png" alt="저장된 그림">'
      onValueChange={onValueChange}
    >
      <Editor.Bold />
      <Editor.Image />
      <Editor.Content />
    </Editor>,
  );
  const content = await editable('본문');
  await expect.element(page.getByRole('img', { name: '저장된 그림' })).toBeVisible();
  await expect.element(page.getByRole('button', { name: '그림' })).not.toBeInTheDocument();
  expect(document.querySelector('[data-editor-image-input]')).toBeNull();

  await userEvent.click(content.element().querySelector('p')!);
  const file = pasteEvent([png()]);
  content.element().dispatchEvent(file);
  expect(file.defaultPrevented).toBe(false);
  await expect.element(content).toHaveFocus();

  content
    .element()
    .dispatchEvent(pasteEvent([], '<p>붙인 글</p><img src="https://elsewhere.example/a.png">'));
  await expect.element(content).toMatchTextContent('붙인 글');
  expect(content.element().querySelectorAll('img')).toHaveLength(1);
});

const WORD_CLIPBOARD = `<html xmlns:o="urn:schemas-microsoft-com:office:office"><body><!--StartFragment-->
<p class=MsoNormal>목록 앞<o:p></o:p></p>
<p class=MsoListParagraphCxSpFirst style='mso-list:l0 level1 lfo1'><![if !supportLists]><span style='mso-list:Ignore'>1.<span style='font:7.0pt "Times New Roman"'>&nbsp;&nbsp; </span></span><![endif]>하나<o:p></o:p></p>
<p class=MsoListParagraphCxSpMiddle style='mso-list:l0 level2 lfo1'><![if !supportLists]><span style='mso-list:Ignore'>·<span>&nbsp;</span></span><![endif]>안쪽<o:p></o:p></p>
<p class=MsoListParagraphCxSpLast style='mso-list:l0 level1 lfo1'><![if !supportLists]><span style='mso-list:Ignore'>2.<span>&nbsp;</span></span><![endif]>둘<o:p></o:p></p>
<p class=MsoNormal><o:p>&nbsp;</o:p></p>
<p class=MsoNormal><b>굵게</b> 끝<o:p></o:p></p>
<!--EndFragment--></body></html>`;

const GOOGLE_DOCS_CLIPBOARD = `<meta charset="utf-8"><b style="font-weight:normal;" id="docs-internal-guid-5f1c"><p dir="ltr" style="line-height:1.38;margin-top:0pt;margin-bottom:0pt;"><span style="font-size:11pt;font-weight:700;">굵게</span><span style="font-size:11pt;"> 보통</span></p><br><ul style="margin-top:0;margin-bottom:0;"><li dir="ltr" style="list-style-type:disc;" aria-level="1"><p dir="ltr" role="presentation"><span>하나</span></p></li><ul><li dir="ltr" style="list-style-type:circle;" aria-level="2"><p dir="ltr" role="presentation"><span>안쪽</span></p></li></ul></ul></b>`;

async function pasteHtml(html: string) {
  const onValueChange = vi.fn();
  render(
    <Editor aria-label="본문" onValueChange={onValueChange}>
      <Editor.Content />
    </Editor>,
  );
  const content = await editable('본문');
  await userEvent.click(content);
  content.element().dispatchEvent(pasteEvent([], html));
  return onValueChange;
}

test('a list pasted from Word becomes a nested list, without its markers and blank paragraphs', async () => {
  const onValueChange = await pasteHtml(WORD_CLIPBOARD);

  await expect
    .poll(() => onValueChange.mock.lastCall?.[0])
    .toBe(
      '<p>목록 앞</p><ol><li><p>하나</p><ul><li><p>안쪽</p></li></ul></li><li><p>둘</p></li></ol><p><strong>굵게</strong> 끝</p>',
    );
});

test('a paste from Google Docs keeps its bold and lists, without blank paragraphs between blocks', async () => {
  const onValueChange = await pasteHtml(GOOGLE_DOCS_CLIPBOARD);

  await expect
    .poll(() => onValueChange.mock.lastCall?.[0])
    .toBe(
      '<p><strong>굵게</strong> 보통</p><ul><li><p>하나</p><ul><li><p>안쪽</p></li></ul></li></ul>',
    );
});

test('javascript: and data: addresses never become images, in HTML, markdown or JSON', async () => {
  render(
    <>
      <Editor
        aria-label="HTML"
        defaultValue='<img src="javascript:alert(1)"><img src=" java&#10;script:alert(1)"><img src="data:image/png;base64,AAAA"><img src="/uploads/kept.png" alt="상대 주소">'
      >
        <Editor.Content />
      </Editor>
      <Editor
        format="markdown"
        aria-label="마크다운"
        defaultValue={
          '![x](javascript:alert(1))\n\n![y](data:image/png;base64,AAAA)\n\n![지도](https://cdn.gistory.me/map.png)'
        }
      >
        <Editor.Content />
      </Editor>
      <Editor
        format="json"
        aria-label="JSON"
        defaultValue={{
          type: 'doc',
          content: [
            { type: 'image', attrs: { src: 'javascript:alert(1)', alt: 'x' } },
            { type: 'image', attrs: { src: 'https://cdn.gistory.me/ok.png', alt: '괜찮은 그림' } },
          ],
        }}
      >
        <Editor.Content />
      </Editor>
    </>,
  );
  for (const [name, alt] of [
    ['HTML', '상대 주소'],
    ['마크다운', '지도'],
    ['JSON', '괜찮은 그림'],
  ] as const) {
    const content = await editable(name);
    const images = [...content.element().querySelectorAll('img')];
    expect(images.map((image) => image.alt)).toEqual([alt]);
  }
});

test('Image sets the alt text of the selected image from a popover', async () => {
  const onValueChange = vi.fn();
  render(
    <Editor
      aria-label="본문"
      defaultValue="<p>지도</p>"
      onImageUpload={async () => PICTURE}
      onValueChange={onValueChange}
    >
      <Editor.Image />
      <Editor.Content />
    </Editor>,
  );
  const content = await editable('본문');
  const tool = page.getByRole('button', { name: '그림' });
  await userEvent.click(content);
  await userEvent.upload(imageInput(), png());
  await expect.poll(() => content.element().querySelector('img')).not.toBeNull();
  const image = page.elementLocator(content.element().querySelector('img')!);
  await expect.element(image).toBeVisible();
  await expect.element(tool).toHaveAttribute('aria-pressed', 'false');

  await userEvent.click(image);
  await expect.element(tool).toHaveAttribute('aria-pressed', 'true');
  await userEvent.click(tool);
  const alt = page.getByRole('textbox', { name: '대체 텍스트' });
  await expect.element(alt).toHaveFocus();
  await userEvent.keyboard('학생회관 가는 길{Enter}');

  await expect
    .poll(() => onValueChange.mock.lastCall?.[0])
    .toBe(`<p>지도</p><img src="${PICTURE}" alt="학생회관 가는 길">`);
  await expect.element(page.getByRole('img', { name: '학생회관 가는 길' })).toBeVisible();
  await expect.element(content).toHaveFocus();
});

test('markdown and JSON keep an uploaded image and its alt text', async () => {
  const markdown = vi.fn();
  const json = vi.fn();
  render(
    <>
      <Editor
        format="markdown"
        aria-label="마크다운"
        defaultValue="![지도](https://cdn.gistory.me/map.png)"
        onImageUpload={async () => 'blob:https://gistory.me/0f3c'}
        onValueChange={markdown}
      >
        <Editor.Image />
        <Editor.Content />
      </Editor>
      <Editor
        format="json"
        aria-label="JSON"
        onImageUpload={async () => 'data:image/png;base64,AAAA'}
        onValueChange={json}
      >
        <Editor.Image />
        <Editor.Content />
      </Editor>
    </>,
  );
  const md = await editable('마크다운');
  await expect.element(md).toContainHTML('alt="지도"');
  await userEvent.click(md.element().querySelector('img')!);
  await userEvent.upload(imageInput(), png());
  await expect
    .poll(() => markdown.mock.lastCall?.[0])
    .toBe('![지도](https://cdn.gistory.me/map.png)\n\n![](blob:https://gistory.me/0f3c)');

  const doc = await editable('JSON');
  await userEvent.click(doc);
  await userEvent.upload(
    page.elementLocator(
      document.querySelectorAll<HTMLInputElement>('[data-editor-image-input]')[1]!,
    ),
    png(),
  );
  await expect
    .poll(
      () =>
        json.mock.lastCall?.[0]?.content?.find((node: Editor.Json) => node.type === 'image')?.attrs,
    )
    .toMatchObject({ src: 'data:image/png;base64,AAAA', alt: '' });
});

test('Highlight marks the selection and writes == in markdown', async () => {
  const onValueChange = vi.fn();
  render(
    <IdsProvider theme={testTheme}>
      <Editor
        format="markdown"
        aria-label="본문"
        defaultValue="중요한 글"
        onValueChange={onValueChange}
      >
        <Editor.Highlight />
        <Editor.Content />
      </Editor>
    </IdsProvider>,
  );
  const content = await editable('본문');
  const highlight = page.getByRole('button', { name: '형광펜' });
  await userEvent.click(content);
  await press('a');
  await userEvent.click(highlight);

  await expect.poll(() => onValueChange.mock.lastCall?.[0]).toBe('==중요한 글==');
  await expect.element(highlight).toHaveAttribute('aria-pressed', 'true');
  await expect.element(content).toContainHTML('<mark>중요한 글</mark>');
  const mark = content.element().querySelector('mark')!;
  expect(getComputedStyle(mark).backgroundColor).not.toBe('rgba(0, 0, 0, 0)');
});

test('an extension loads only when its part is in the Editor', async () => {
  render(
    <>
      <Editor
        aria-label="없음"
        defaultValue='<p><mark>형광</mark></p><ul data-type="taskList"><li data-type="taskItem" data-checked="true"><p>할 일</p></li></ul><p style="text-align: center">가운데</p><table><tbody><tr><th><p>시간</p></th></tr></tbody></table>'
      >
        <Editor.Content />
      </Editor>
      <Editor
        aria-label="있음"
        defaultValue='<p><mark>형광</mark></p><ul data-type="taskList"><li data-type="taskItem" data-checked="true"><p>할 일</p></li></ul><p style="text-align: center">가운데</p><table><tbody><tr><th><p>시간</p></th></tr></tbody></table>'
      >
        <Editor.Content />
        <Editor.BubbleMenu>
          <Editor.Highlight />
          <Editor.TaskList />
          <Editor.TextAlign />
          <Editor.Table />
        </Editor.BubbleMenu>
      </Editor>
    </>,
  );
  const without = await editable('없음');
  expect(without.element().querySelector('mark')).toBeNull();
  expect(without.element().querySelector('input[type="checkbox"]')).toBeNull();
  expect(without.element().querySelector('[style*="text-align"]')).toBeNull();
  expect(without.element().querySelector('table')).toBeNull();

  const within = await editable('있음');
  expect(within.element().querySelector('mark')).not.toBeNull();
  expect(within.element().querySelector('input[type="checkbox"]')).not.toBeNull();
  expect(within.element().querySelector('[style*="text-align"]')).not.toBeNull();
  expect(within.element().querySelector('th')).not.toBeNull();
});

test('TaskList turns the paragraph into a task whose IDS checkbox checks it, and markdown writes [x]', async () => {
  const onValueChange = vi.fn();
  render(
    <Editor
      format="markdown"
      aria-label="본문"
      defaultValue="부스 신청"
      onValueChange={onValueChange}
    >
      <Editor.TaskList />
      <Editor.Content />
    </Editor>,
  );
  const content = await editable('본문');
  await userEvent.click(content);
  await userEvent.click(page.getByRole('button', { name: '할 일 목록' }));
  await expect.poll(() => onValueChange.mock.lastCall?.[0]).toBe('- [ ] 부스 신청');

  const checkbox = page.getByRole('checkbox', { name: '할 일: 부스 신청' });
  await expect.element(checkbox).not.toBeChecked();
  expect(checkbox.element().closest('[data-state]')).toHaveAttribute('data-state', 'unchecked');
  await userEvent.click(checkbox);
  await expect.poll(() => onValueChange.mock.lastCall?.[0]).toBe('- [x] 부스 신청');
  await expect.element(checkbox).toBeChecked();
  expect(checkbox.element().closest('[data-state]')).toHaveAttribute('data-state', 'checked');
});

test('HorizontalRule inserts a divider that markdown writes as ---', async () => {
  const onValueChange = vi.fn();
  render(
    <Editor format="markdown" aria-label="본문" defaultValue="위" onValueChange={onValueChange}>
      <Editor.HorizontalRule />
      <Editor.Content />
    </Editor>,
  );
  const content = await editable('본문');
  await userEvent.click(content);
  await userEvent.click(page.getByRole('button', { name: '구분선' }));

  await expect.element(content).toContainHTML('<hr');
  await expect.poll(() => onValueChange.mock.lastCall?.[0]).toBe('위\n\n---\n\n');
  await expect.element(content).toHaveFocus();
});

test('TextAlign is a group of toggles that align the block and unset back to left', async () => {
  const onValueChange = vi.fn();
  render(
    <Editor aria-label="본문" defaultValue="<p>가운데로</p>" onValueChange={onValueChange}>
      <Editor.TextAlign alignments={['left', 'center', 'right', 'justify']} />
      <Editor.Content />
    </Editor>,
  );
  const content = await editable('본문');
  const group = page.getByRole('group', { name: '정렬' });
  const left = group.getByRole('button', { name: '왼쪽 정렬' });
  const center = group.getByRole('button', { name: '가운데 정렬' });
  await userEvent.click(content);
  await expect.element(left).toHaveAttribute('aria-pressed', 'true');

  await userEvent.click(center);
  await expect
    .poll(() => onValueChange.mock.lastCall?.[0])
    .toBe('<p style="text-align: center;">가운데로</p>');
  await expect.element(center).toHaveAttribute('aria-pressed', 'true');
  await expect.element(left).toHaveAttribute('aria-pressed', 'false');

  await userEvent.click(left);
  await expect.poll(() => onValueChange.mock.lastCall?.[0]).toBe('<p>가운데로</p>');
  await expect.element(group.getByRole('button', { name: '양쪽 정렬' })).toBeVisible();
});

test('a picked file that is not an image is turned away with the FileField message', async () => {
  const upload = vi.fn(async (file: File) => `https://cdn.gistory.me/${file.name}`);
  render(
    <IdsProvider theme={testTheme}>
      <Editor aria-label="본문" onImageUpload={upload}>
        <Editor.Image />
        <Editor.Content />
      </Editor>
    </IdsProvider>,
  );
  await editable('본문');
  await userEvent.upload(
    imageInput(),
    new File(['%PDF'], 'notes.pdf', { type: 'application/pdf' }),
  );

  await expect.element(page.getByText('notes.pdf')).toBeVisible();
  await expect.element(page.getByText('허용되지 않는 파일 형식입니다.')).toBeVisible();
  expect(upload).not.toHaveBeenCalled();
  toast.dismissAll();
});

test('Table inserts a table with a header row, edits it from its menu, and markdown writes a pipe table', async () => {
  const onValueChange = vi.fn();
  render(
    <Editor format="markdown" aria-label="본문" defaultValue="일정" onValueChange={onValueChange}>
      <Editor.Table />
      <Editor.Content />
    </Editor>,
  );
  const content = await editable('본문');
  const table = page.getByRole('button', { name: '표' });
  const choose = async (name: string) => {
    await userEvent.click(table);
    await userEvent.click(page.getByRole('menuitem', { name }));
  };
  await userEvent.click(content);
  await userEvent.click(table);
  const picker = page.getByRole('group', { name: '표 넣기' });
  await expect.element(picker.getByRole('button', { name: '3행 3열' })).toHaveFocus();
  await userEvent.keyboard('{Enter}');

  await expect.element(content).toHaveFocus();
  expect(content.element().querySelectorAll('tr')).toHaveLength(3);
  expect(content.element().querySelectorAll('th')).toHaveLength(3);
  await userEvent.keyboard('시간');
  await expect
    .poll(() => onValueChange.mock.lastCall?.[0])
    .toContain('| 시간  |     |     |\n| --- | --- | --- |\n|     |     |     |\n');

  await choose('아래에 행 추가');
  expect(content.element().querySelectorAll('tr')).toHaveLength(4);
  await choose('열 지우기');
  expect(content.element().querySelectorAll('th')).toHaveLength(2);
  await expect.element(content).toHaveFocus();

  await choose('표 지우기');
  expect(content.element().querySelector('table')).toBeNull();
  await expect.poll(() => onValueChange.mock.lastCall?.[0]).toBe('일정\n\n');
});

test('the table size grid grows with the arrow keys and the pointer, and inserts the size it shows', async () => {
  render(
    <Editor aria-label="본문">
      <Editor.Table />
      <Editor.Content />
    </Editor>,
  );
  const content = await editable('본문');
  await userEvent.click(content);
  await userEvent.click(page.getByRole('button', { name: '표' }));

  const picker = page.getByRole('group', { name: '표 넣기' });
  await userEvent.keyboard('{ArrowRight}{ArrowDown}{ArrowDown}');
  await expect.element(picker.getByRole('button', { name: '5행 4열' })).toHaveFocus();
  await expect.element(page.getByText('5행 4열', { exact: true })).toBeVisible();
  await userEvent.keyboard('{Enter}');

  await expect.poll(() => content.element().querySelectorAll('tr').length).toBe(5);
  expect(content.element().querySelectorAll('tr:first-child th')).toHaveLength(4);

  await userEvent.click(content.getByRole('cell').last());
  await userEvent.click(page.getByRole('button', { name: '표' }));
  expect(page.getByRole('group', { name: '표 넣기' }).query()).toBeNull();
  await expect.element(page.getByRole('menuitemcheckbox', { name: '머리글 행' })).toBeChecked();
});

test('in HTML the table menu turns the header row off and merges and splits cells', async () => {
  const onValueChange = vi.fn();
  render(
    <Editor
      aria-label="본문"
      defaultValue="<table><tbody><tr><th><p>가</p></th><th><p>나</p></th></tr><tr><td><p>1</p></td><td><p>2</p></td></tr></tbody></table><p></p>"
      onValueChange={onValueChange}
    >
      <Editor.Table />
      <Editor.Content />
    </Editor>,
  );
  const content = await editable('본문');
  const table = page.getByRole('button', { name: '표' });
  await userEvent.click(content.getByText('1'));
  await userEvent.click(table);
  await expect.element(page.getByRole('menuitem', { name: '셀 합치기' })).toBeDisabled();
  await userEvent.click(page.getByRole('menuitemcheckbox', { name: '머리글 행' }));
  await expect.poll(() => content.element().querySelectorAll('th').length).toBe(0);

  await userEvent.click(content.getByText('1'));
  await userEvent.click(content.getByText('2'), { modifiers: ['Shift'] });
  await userEvent.click(table);
  await userEvent.click(page.getByRole('menuitem', { name: '셀 합치기' }));
  await expect.poll(() => content.element().querySelector('td[colspan="2"]')).not.toBeNull();

  await userEvent.click(table);
  await userEvent.click(page.getByRole('menuitem', { name: '셀 나누기' }));
  await expect.poll(() => content.element().querySelector('td[colspan="2"]')).toBeNull();
});

test('in markdown the table menu leaves out what a pipe table cannot keep', async () => {
  render(
    <Editor
      format="markdown"
      aria-label="본문"
      defaultValue={'| 가 | 나 |\n| --- | --- |\n| 1 | 2 |'}
    >
      <Editor.Table />
      <Editor.Content />
    </Editor>,
  );
  const content = await editable('본문');
  await userEvent.click(content.getByText('1'));
  await userEvent.click(page.getByRole('button', { name: '표' }));
  await expect.element(page.getByRole('menuitem', { name: '아래에 행 추가' })).toBeVisible();
  expect(page.getByRole('menuitemcheckbox', { name: '머리글 행' }).query()).toBeNull();
  expect(page.getByRole('menuitem', { name: '셀 합치기' }).query()).toBeNull();
});

test('a code block is highlighted with CodeBlock tokens, and its language picker rewrites the fence', async () => {
  const onValueChange = vi.fn();
  render(
    <Editor
      format="markdown"
      aria-label="본문"
      defaultValue={'```ts\nconst answer = 42;\n```'}
      onValueChange={onValueChange}
    >
      <Editor.Content />
    </Editor>,
  );
  const content = await editable('본문');
  await expect
    .poll(() => content.element().querySelector('[data-token="keyword"]')?.textContent)
    .toBe('const');
  expect(content.element().querySelector('[data-token="number"]')?.textContent).toBe('42');

  const language = page.getByRole('combobox', { name: '코드 언어' });
  await expect.element(language).toHaveTextContent('typescript');
  await userEvent.click(language);
  await userEvent.keyboard('pyth');
  await userEvent.click(page.getByRole('option', { name: 'python' }));

  await expect
    .poll(() => onValueChange.mock.lastCall?.[0])
    .toBe('```python\nconst answer = 42;\n```');
  await expect.element(language).toHaveTextContent('python');
});

test('a code block in a lazy language is highlighted once the language arrives', async () => {
  render(
    <Editor format="markdown" aria-label="본문" defaultValue={'```rust\nfn main() {}\n```'}>
      <Editor.Content />
    </Editor>,
  );
  const content = await editable('본문');

  await expect
    .poll(() => content.element().querySelector('[data-token="keyword"]')?.textContent)
    .toBe('fn');
});

test('a GitHub alert in markdown is a callout whose kind menu rewrites the marker', async () => {
  const onValueChange = vi.fn();
  render(
    <Editor
      format="markdown"
      aria-label="본문"
      defaultValue={'> [!NOTE]\n> 마감은 금요일입니다.'}
      onValueChange={onValueChange}
    >
      <Editor.Callout />
      <Editor.Content />
    </Editor>,
  );
  const content = await editable('본문');
  await expect
    .poll(() => content.element().querySelector('[data-callout]')?.getAttribute('data-kind'))
    .toBe('note');
  await expect.element(content).toMatchTextContent('참고');

  await userEvent.click(page.getByRole('button', { name: '콜아웃 종류' }));
  await userEvent.click(page.getByRole('menuitemradio', { name: '경고' }));

  await expect
    .poll(() => onValueChange.mock.lastCall?.[0])
    .toBe('> [!WARNING]\n> 마감은 금요일입니다.');

  await userEvent.click(page.getByRole('button', { name: '콜아웃 종류' }));
  await userEvent.click(page.getByRole('menuitem', { name: '콜아웃 해제' }));

  await expect.poll(() => onValueChange.mock.lastCall?.[0]).toBe('마감은 금요일입니다.');
});

test('typing [!tip] in a fresh quote turns the quote into a tip callout', async () => {
  const onValueChange = vi.fn();
  render(
    <Editor format="markdown" aria-label="본문" onValueChange={onValueChange}>
      <Editor.Callout />
      <Editor.Content />
    </Editor>,
  );
  const content = await editable('본문');
  await userEvent.click(content);
  await userEvent.keyboard('> [[!tip] 물 많이 마시기');

  await expect.poll(() => onValueChange.mock.lastCall?.[0]).toBe('> [!TIP]\n> 물 많이 마시기');
  expect(content.element().querySelector('blockquote')).toBeNull();
});

test('Details wraps the block in a toggle that opens, closes and keeps its state in markdown', async () => {
  const onValueChange = vi.fn();
  render(
    <Editor format="markdown" aria-label="본문" onValueChange={onValueChange}>
      <Editor.Details />
      <Editor.Content />
    </Editor>,
  );
  const content = await editable('본문');
  await userEvent.click(content);
  await userEvent.keyboard('숨은 내용');
  await userEvent.click(page.getByRole('button', { name: '토글' }));

  const toggle = page.getByRole('button', { name: '내용 펼치기' });
  await expect.element(toggle).toHaveAttribute('aria-expanded', 'true');
  await userEvent.keyboard('더 보기');

  await expect
    .poll(() => onValueChange.mock.lastCall?.[0])
    .toBe(
      ':::details {open}\n\n:::detailsSummary\n\n더 보기\n\n:::\n\n:::detailsContent\n\n숨은 내용\n\n:::\n\n:::',
    );

  await userEvent.click(toggle);
  await expect.element(toggle).toHaveAttribute('aria-expanded', 'false');
  await expect.element(page.getByText('숨은 내용')).not.toBeVisible();
  expect(onValueChange.mock.lastCall?.[0]).not.toContain('{open}');
});

test('typing / opens the block menu, the query filters it and Enter turns the line into the block', async () => {
  const onValueChange = vi.fn();
  render(<Editor format="markdown" aria-label="본문" onValueChange={onValueChange} />);
  const content = await editable('본문');
  await userEvent.click(content);
  await userEvent.keyboard('/');

  const menu = page.getByRole('listbox', { name: '블록 넣기' });
  await expect.element(menu).toBeVisible();
  await expect.element(content).toHaveAttribute('aria-activedescendant');
  await expect.element(menu.getByRole('option').first()).toHaveAttribute('aria-selected', 'true');

  await userEvent.keyboard('제목 2');
  await expect.element(menu.getByRole('option')).toHaveTextContent('제목 2');
  await userEvent.keyboard('{Enter}');
  await expect.element(menu).not.toBeInTheDocument();
  await userEvent.keyboard('소개');

  await expect.poll(() => onValueChange.mock.lastCall?.[0]).toBe('## 소개');
  expect(content.element().hasAttribute('aria-activedescendant')).toBe(false);
});

test('a block Editor shows no toolbar, offers every block in the / menu and formats with the bubble menu', async () => {
  const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
  render(
    <Editor type="block" aria-label="본문" defaultValue="<p>글</p>">
      <Editor.Bold />
      <Editor.Content />
    </Editor>,
  );
  const content = await editable('본문');
  expect(page.getByRole('toolbar').query()).toBeNull();
  expect(warn).toHaveBeenCalledWith(
    expect.stringContaining('`<Editor type="block">` shows no toolbar'),
  );
  warn.mockRestore();

  await userEvent.click(content);
  await userEvent.keyboard('{End}{Enter}/');
  const menu = page.getByRole('listbox', { name: '블록 넣기' });
  for (const block of ['표', '콜아웃', '토글', '할 일 목록'])
    await expect.element(menu.getByRole('option', { name: block })).toBeVisible();
  await userEvent.keyboard('{Escape}');

  await userEvent.tripleClick(page.getByText('글'));
  await expect.element(page.getByRole('toolbar', { name: '선택한 글 서식' })).toBeVisible();
});

test('the block menu offers only the blocks the Editor loaded and says when nothing matches', async () => {
  render(
    <Editor aria-label="본문">
      <Editor.Callout />
      <Editor.Content />
    </Editor>,
  );
  const content = await editable('본문');
  await userEvent.click(content);
  await userEvent.keyboard('/');

  const menu = page.getByRole('listbox', { name: '블록 넣기' });
  await expect.element(menu.getByRole('option', { name: '콜아웃' })).toBeVisible();
  expect(menu.getByRole('option', { name: '표' }).query()).toBeNull();

  await userEvent.keyboard('없는블록');
  await expect
    .element(page.getByRole('status').filter({ hasText: '맞는 블록이 없습니다' }))
    .toBeVisible();
  await userEvent.keyboard(' ');
  await expect.element(page.getByRole('dialog', { name: '블록 넣기' })).not.toBeInTheDocument();
});

test('Escape closes the block menu and leaves the Dialog around the Editor open', async () => {
  render(
    <IdsProvider theme={testTheme}>
      <Dialog defaultOpen>
        <Dialog.Content>
          <Dialog.Title>글쓰기</Dialog.Title>
          <Editor aria-label="본문" />
        </Dialog.Content>
      </Dialog>
    </IdsProvider>,
  );
  const content = await editable('본문');
  await userEvent.click(content);
  await userEvent.keyboard('/');
  const menu = page.getByRole('listbox', { name: '블록 넣기' });
  await expect.element(menu).toBeVisible();

  await userEvent.keyboard('{Escape}');
  await expect.element(menu).not.toBeInTheDocument();
  await expect.element(page.getByRole('dialog', { name: '글쓰기' })).toBeVisible();
  await expect.element(content).toHaveFocus();

  await userEvent.keyboard('{Escape}');
  await expect.element(page.getByRole('dialog', { name: '글쓰기' })).not.toBeInTheDocument();
});

test('typing @ asks mentions for people, and the chosen one is written as a mention in markdown', async () => {
  const onValueChange = vi.fn();
  const people = [
    { id: 'u1', label: '김지스트', description: '디자인' },
    { id: 'u2', label: '이인포', description: '프론트엔드', avatar: '/faces/u2.png' },
  ];
  const mentions = vi.fn(async (query: string) =>
    people.filter((person) => person.label.includes(query)),
  );
  render(
    <Editor
      format="markdown"
      aria-label="본문"
      mentions={mentions}
      onValueChange={onValueChange}
    />,
  );
  const content = await editable('본문');
  await userEvent.click(content);
  await userEvent.keyboard('검토: @인');

  const menu = page.getByRole('listbox', { name: '멘션' });
  await expect.element(menu.getByRole('option')).toMatchTextContent('이인포프론트엔드');
  expect(mentions).toHaveBeenLastCalledWith('인', expect.any(AbortSignal));
  await userEvent.keyboard('{Enter}');
  await expect.element(menu).not.toBeInTheDocument();
  await userEvent.keyboard('님 확인');

  await expect
    .poll(() => onValueChange.mock.lastCall?.[0])
    .toBe('검토: [@ id="u2" label="이인포" avatar="/faces/u2.png"] 님 확인');
  const mention = () => content.element().querySelector('[data-mention]');
  await expect.poll(() => mention()?.textContent).toContain('이인포');
  expect(mention()?.querySelector('[data-avatar]')).not.toBeNull();
});

test('without mentions, @ is plain text', async () => {
  const onValueChange = vi.fn();
  render(<Editor format="markdown" aria-label="본문" onValueChange={onValueChange} />);
  const content = await editable('본문');
  await userEvent.click(content);
  await userEvent.keyboard('me@ids');

  await expect.poll(() => onValueChange.mock.lastCall?.[0]).toBe('me@ids');
  expect(page.getByRole('listbox').query()).toBeNull();
});

test('hovering a block shows its handle, whose menu turns, duplicates and deletes the block', async () => {
  const onValueChange = vi.fn();
  render(
    <Editor
      type="block"
      format="markdown"
      aria-label="본문"
      defaultValue={'첫 줄\n\n둘째 줄'}
      onValueChange={onValueChange}
    >
      <Editor.Content />
    </Editor>,
  );
  const content = await editable('본문');
  const handle = page.getByRole('button', { name: '블록 메뉴' });
  await expect.element(handle).not.toBeInTheDocument();

  await userEvent.hover(content.getByText('둘째 줄'));
  await expect.element(handle).toBeVisible();
  await userEvent.click(handle);
  await userEvent.click(page.getByRole('menuitem', { name: '바꾸기' }));
  await userEvent.click(page.getByRole('menuitem', { name: '제목 2' }));
  await expect.poll(() => onValueChange.mock.lastCall?.[0]).toBe('첫 줄\n\n## 둘째 줄');
  await expect.element(content).toHaveFocus();

  await userEvent.hover(content.getByText('첫 줄'));
  await userEvent.click(handle);
  await userEvent.click(page.getByRole('menuitem', { name: '복제' }));
  await expect.poll(() => onValueChange.mock.lastCall?.[0]).toBe('첫 줄\n\n첫 줄\n\n## 둘째 줄');

  await userEvent.hover(content.getByText('둘째 줄'));
  await userEvent.click(handle);
  await userEvent.click(page.getByRole('menuitem', { name: '삭제' }));
  await expect.poll(() => onValueChange.mock.lastCall?.[0]).toBe('첫 줄\n\n첫 줄');
});

test('Add a block below opens the block menu on a new line under the block', async () => {
  const onValueChange = vi.fn();
  render(
    <Editor
      type="block"
      format="markdown"
      aria-label="본문"
      defaultValue={'위\n\n아래'}
      onValueChange={onValueChange}
    >
      <Editor.Content />
    </Editor>,
  );
  const content = await editable('본문');
  await userEvent.hover(content.getByText('위'));
  await userEvent.click(page.getByRole('button', { name: '블록 메뉴' }));
  await userEvent.click(page.getByRole('menuitem', { name: '아래에 블록 넣기' }));

  await expect.element(page.getByRole('listbox', { name: '블록 넣기' })).toBeVisible();
  await userEvent.keyboard('인용{Enter}가운데');
  await expect.poll(() => onValueChange.mock.lastCall?.[0]).toBe('위\n\n> 가운데\n\n아래');
});

test('dragging a block by its handle moves it', async (context) => {
  skipWithoutCdp(context);
  const onValueChange = vi.fn();
  render(
    <Editor
      type="block"
      format="markdown"
      aria-label="본문"
      defaultValue={'하나\n\n둘\n\n- 셋'}
      onValueChange={onValueChange}
    >
      <Editor.Content />
    </Editor>,
  );
  const content = await editable('본문');
  await userEvent.hover(content.getByText('셋'));
  const handle = page.getByRole('button', { name: '블록 메뉴' });
  await expect.element(handle).toBeVisible();

  const first = content.getByText('하나').element().getBoundingClientRect();
  const grip = centerOf(handle.element());
  await mouse('mousePressed', grip);
  for (let step = 1; step <= 8; step++)
    await mouse('mouseMoved', {
      x: grip.x + ((first.left + 4 - grip.x) * step) / 8,
      y: grip.y + ((first.top + 2 - grip.y) * step) / 8,
    });
  await expect.poll(dropLine).not.toBeNull();
  await expect
    .poll(() => content.element().querySelector('[data-block-dragging]')?.textContent)
    .toBe('셋');
  await mouse('mouseReleased', { x: first.left + 4, y: first.top + 2 });

  await expect.poll(() => onValueChange.mock.lastCall?.[0]).toBe('- 셋\n\n하나\n\n둘');
  expect(content.element().querySelector('[data-block-dragging]')).toBeNull();
  expect(dropLine()).toBeNull();
});

test('the block handle hangs outside the box, and a toolbar Editor has none', async () => {
  render(
    <div className="flex flex-col gap-4 ps-10">
      <Editor aria-label="손잡이 없음" defaultValue="<p>글</p>" />
      <Editor type="block" aria-label="손잡이 있음" defaultValue="<p>글</p>">
        <Editor.Content />
      </Editor>
    </div>,
  );
  const without = await editable('손잡이 없음');
  const withHandle = await editable('손잡이 있음');
  const inlineStart = (element: Element) => getComputedStyle(element).paddingInlineStart;
  expect(inlineStart(withHandle.element())).toBe(inlineStart(without.element()));

  await userEvent.hover(without.getByText('글'));
  expect(page.getByRole('button', { name: '블록 메뉴' }).query()).toBeNull();

  await userEvent.hover(withHandle.getByText('글'));
  const handle = page.getByRole('button', { name: '블록 메뉴' });
  await expect.element(handle).toBeVisible();
  const box = withHandle.element().closest('[data-editor]')!.getBoundingClientRect();
  expect(handle.element().getBoundingClientRect().right).toBeLessThanOrEqual(box.left + 1);

  await userEvent.hover(handle);
  await expect.element(handle).toBeVisible();
});

test('a read-only Editor has no block handle', async () => {
  render(
    <Editor type="block" readOnly aria-label="본문" defaultValue="<p>읽기만</p>">
      <Editor.Content />
    </Editor>,
  );
  const content = page.getByRole('textbox', { name: '본문' });
  await expect.element(content).toHaveAttribute('contenteditable', 'false');
  await userEvent.hover(content.getByText('읽기만'));
  expect(page.getByRole('button', { name: '블록 메뉴' }).query()).toBeNull();
});

test('Image inserts a picture from an address, adding https:// when it has no scheme, and turns away a script address', async () => {
  const onValueChange = vi.fn();
  render(
    <Editor
      aria-label="본문"
      defaultValue="<p>지도</p>"
      onImageUpload={async () => PICTURE}
      onValueChange={onValueChange}
    >
      <Editor.Image />
      <Editor.Content />
    </Editor>,
  );
  const content = await editable('본문');
  await userEvent.click(content);
  await userEvent.click(page.getByRole('button', { name: '그림' }));

  const address = page.getByRole('textbox', { name: '그림 주소' });
  await expect.element(address).toHaveFocus();
  await userEvent.keyboard('javascript:alert(1){Enter}');
  await expect.element(address).toHaveAttribute('aria-invalid', 'true');
  await expect
    .element(address)
    .toHaveAccessibleDescription('http 나 https 로 시작하는 주소를 넣어 주세요');
  expect(content.element().querySelector('img')).toBeNull();

  await userEvent.fill(address, 'gistory.me/map.png');
  await userEvent.click(page.getByRole('button', { name: '넣기' }));
  await expect
    .poll(() => onValueChange.mock.lastCall?.[0])
    .toBe('<p>지도</p><img src="https://gistory.me/map.png">');
  await expect.element(content).toHaveFocus();
});

test('Image hands Choose files to the file picker', async () => {
  render(
    <Editor aria-label="본문" onImageUpload={async () => PICTURE}>
      <Editor.Image />
      <Editor.Content />
    </Editor>,
  );
  const content = await editable('본문');
  await userEvent.click(content);
  const picked = vi.fn((event: Event) => event.preventDefault());
  document.querySelector('[data-editor-image-input]')!.addEventListener('click', picked);
  await userEvent.click(page.getByRole('button', { name: '그림' }));
  await userEvent.click(page.getByRole('button', { name: '파일에서 고르기' }));

  expect(picked).toHaveBeenCalledOnce();
  await expect.element(page.getByRole('textbox', { name: '그림 주소' })).not.toBeInTheDocument();
});

test('an image is resized by its Resizable handle, and HTML keeps the width', async (context) => {
  skipWithoutCdp(context);
  const onValueChange = vi.fn();
  render(
    <Editor aria-label="본문" onImageUpload={async () => PICTURE} onValueChange={onValueChange}>
      <Editor.Image />
      <Editor.Content />
    </Editor>,
  );
  const content = await editable('본문');
  await userEvent.click(content);
  await userEvent.upload(imageInput(), png());
  await expect.poll(() => content.element().querySelector('img')?.complete).toBe(true);
  const image = content.element().querySelector('img')!;
  await expect.element(page.elementLocator(image)).toBeVisible();
  const handle = content.element().querySelector('[data-resizable-handle]')!;
  const start = centerOf(handle);

  const press = (type: 'mousePressed' | 'mouseMoved' | 'mouseReleased', point: Point) =>
    cdp().send('Input.dispatchMouseEvent', {
      type,
      ...inTheTopPage(point),
      button: 'left',
      buttons: type === 'mouseReleased' ? 0 : 1,
      clickCount: 1,
    });
  await press('mousePressed', start);
  await press('mouseMoved', { x: start.x + 20, y: start.y });
  await press('mouseMoved', { x: start.x + 40, y: start.y });
  await press('mouseReleased', { x: start.x + 40, y: start.y });

  await expect.poll(() => onValueChange.mock.lastCall?.[0]).toMatch(/<img [^>]*width="120"/);
});

test('an image width also changes from the keyboard on its Width separator', async () => {
  const onValueChange = vi.fn();
  render(
    <Editor
      aria-label="본문"
      defaultValue='<img src="/map.png" width="200">'
      onImageUpload={async () => PICTURE}
      onValueChange={onValueChange}
    />,
  );
  await editable('본문');
  const separator = page.getByRole('separator', { name: '너비' });
  await expect.element(separator).toBeInTheDocument();
  separator.element().focus();
  await userEvent.keyboard('{ArrowRight}');

  await expect
    .poll(() => onValueChange.mock.lastCall?.[0])
    .toBe('<img src="/map.png" width="216">');
});

test('a markdown Editor draws no resize handles, since markdown keeps no width', async () => {
  render(
    <Editor
      format="markdown"
      aria-label="본문"
      defaultValue="![지도](/map.png)"
      onImageUpload={async () => PICTURE}
    />,
  );
  const content = await editable('본문');
  await expect.poll(() => content.element().querySelector('img')).not.toBeNull();
  expect(content.element().querySelector('[data-resizable-handle]')).toBeNull();
});

function lineCenterOf(paragraph: Element) {
  const range = document.createRange();
  range.selectNodeContents(paragraph);
  const [line] = range.getClientRects();
  return line!.top + line!.height / 2;
}

function boxCenterOf(item: Element) {
  const { top, height } = item.querySelector('[data-state]')!.getBoundingClientRect();
  return top + height / 2;
}

test('a task checkbox sits on the middle of its first line, in Editor and in RichText', async () => {
  const tasks =
    '<ul data-type="taskList"><li data-type="taskItem" data-checked="true"><p>부스 신청</p></li></ul>';
  render(
    <IdsProvider theme={testTheme}>
      <Editor aria-label="본문" defaultValue={tasks}>
        <Editor.TaskList />
        <Editor.Content />
      </Editor>
      <div data-testid="rich-text">
        <RichText value={'- [x] 부스 신청'} />
      </div>
    </IdsProvider>,
  );
  const content = await editable('본문');
  await expect.poll(() => content.element().querySelector('li[data-checked] p')).not.toBeNull();

  for (const item of [
    content.element().querySelector('li[data-checked]')!,
    page.getByTestId('rich-text').element().querySelector('li[data-checked]')!,
  ])
    expect(
      Math.abs(boxCenterOf(item) - lineCenterOf(item.querySelector('p')!)),
    ).toBeLessThanOrEqual(1);
});
