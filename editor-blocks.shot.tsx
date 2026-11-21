import 'pretendard-gov/dist/web/variable/pretendardvariable-gov.css';

import { expect, test } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';

import { testTheme } from './theme';
import { IdsProvider } from '../src';
import { Editor } from '../src/editor';
import { RichText } from '../src/rich-text';

import type { ReactNode } from 'react';

const PICTURE = `data:image/svg+xml;base64,${btoa(
  '<svg xmlns="http://www.w3.org/2000/svg" width="480" height="160" viewBox="0 0 480 160"><rect width="480" height="160" fill="hsl(210 70% 88%)"/><circle cx="350" cy="50" r="20" fill="hsl(40 90% 66%)"/><path d="M0 160 L130 72 L250 128 L350 84 L480 160 Z" fill="hsl(210 32% 40%)"/></svg>',
)}`;

const MEMBERS = [
  { id: 'kim', label: '김지스트', description: '회장' },
  { id: 'lee', label: '이인포', description: '프론트엔드' },
  { id: 'park', label: '박디자인', description: '디자인' },
];

const DOCUMENT = `<h2>박람회 안내</h2><div data-type="callout" data-kind="tip"><p>부스 신청은 금요일까지입니다. <span data-type="mention" data-id="lee" data-label="이인포"></span> 님이 받습니다.</p></div><pre><code class="language-ts">const booth = await reserve({ hall: '학생회관', size: 2 });</code></pre><details open><summary>준비물</summary><div data-type="detailsContent"><p>안내판, 연장선, 명찰</p></div></details><table><tbody><tr><th><p>시간</p></th><th><p>장소</p></th></tr><tr><td colspan="2"><p>10:00 학생회관 앞 집합</p></td></tr></tbody></table><p>문의는 학생회로 보내 주세요.</p>`;

const POST = `## 박람회 안내

> [!TIP]
> 부스 신청은 금요일까지입니다. [@ id="lee" label="이인포"] 님이 받습니다.

\`\`\`ts
const booth = await reserve({ hall: '학생회관', size: 2 });
\`\`\`

:::details {open}

:::detailsSummary

준비물

:::

:::detailsContent

안내판, 연장선, 명찰

:::

:::

| 시간 | 장소 |
| --- | --- |
| 10:00 | 학생회관 |

- [x] 부스 신청
- [ ] 장소 배정
`;

const MODES = ['light', 'dark'] as const;

function Shot({ mode, children }: { mode: (typeof MODES)[number]; children: ReactNode }) {
  return (
    <IdsProvider theme={testTheme} mode={mode}>
      <div data-testid="shot" className="flex min-h-[34rem] w-[44rem] flex-col gap-4 bg-base p-6">
        {children}
      </div>
    </IdsProvider>
  );
}

const settle = () => new Promise((resolve) => setTimeout(resolve, 400));

const shoot = (name: string, mode: string) =>
  page.screenshot({ path: `../.vitest/pr-shots/${name}-${mode}.png`, element: page.getByTestId('shot') });

async function editable(name: string) {
  const box = page.getByRole('textbox', { name });
  await expect.element(box).toHaveAttribute('contenteditable', 'true');
  return box.element() as HTMLElement;
}

function caretAtTheEndOf(element: Element) {
  const range = document.createRange();
  range.selectNodeContents(element);
  range.collapse(false);
  const selection = getSelection()!;
  selection.removeAllRanges();
  selection.addRange(range);
}

for (const mode of MODES) {
  test(`document ${mode}`, async () => {
    await page.viewport(900, 1100);
    render(
      <Shot mode={mode}>
        <Editor aria-label="문서" defaultValue={DOCUMENT} onImageUpload={async () => PICTURE} mentions={() => MEMBERS}>
          <Editor.BlockType />
          <Editor.Separator />
          <Editor.Bold />
          <Editor.Italic />
          <Editor.Link />
          <Editor.Separator />
          <Editor.CodeBlock />
          <Editor.Callout />
          <Editor.Details />
          <Editor.Table />
          <Editor.Image />
          <Editor.Content />
        </Editor>
      </Shot>,
    );
    const content = await editable('문서');
    await userEvent.click([...content.querySelectorAll(':scope > p')].at(-1)!);
    const input = document.querySelector<HTMLInputElement>('[data-editor-image-input]')!;
    await userEvent.upload(page.elementLocator(input), new File(['png'], '배치도.png', { type: 'image/png' }));
    await expect.poll(() => content.querySelector('img')).not.toBeNull();
    await userEvent.click(content.querySelector('img')!);
    await userEvent.hover(content.querySelector('h2')!);
    await settle();
    await shoot('editor-document', mode);
  });

  test(`slash ${mode}`, async () => {
    await page.viewport(900, 1100);
    render(
      <Shot mode={mode}>
        <Editor aria-label="블록" defaultValue="<h2>회의록</h2><p>안건을 적습니다.</p>">
          <Editor.Callout />
          <Editor.Details />
          <Editor.Table />
          <Editor.Content />
        </Editor>
      </Shot>,
    );
    const content = await editable('블록');
    await userEvent.click(content);
    caretAtTheEndOf(content.querySelector('p')!);
    await userEvent.keyboard('{Enter}/');
    await expect.element(page.getByRole('listbox')).toBeVisible();
    await settle();
    await shoot('editor-slash', mode);
  });

  test(`mention ${mode}`, async () => {
    await page.viewport(900, 1100);
    render(
      <Shot mode={mode}>
        <Editor aria-label="멘션" defaultValue="<p>발표 자료는</p>" mentions={() => MEMBERS}>
          <Editor.Content />
        </Editor>
      </Shot>,
    );
    const content = await editable('멘션');
    await userEvent.click(content);
    caretAtTheEndOf(content.querySelector('p')!);
    await userEvent.keyboard(' @');
    await expect.element(page.getByRole('option', { name: /이인포/ })).toBeVisible();
    await userEvent.keyboard('{ArrowDown}');
    await settle();
    await shoot('editor-mention', mode);
  });

  test(`handle ${mode}`, async () => {
    await page.viewport(900, 1100);
    render(
      <Shot mode={mode}>
        <Editor aria-label="손잡이" defaultValue="<p>첫 문단</p><blockquote><p>인용한 말</p></blockquote><p>마지막 문단</p>">
          <Editor.Content />
        </Editor>
      </Shot>,
    );
    const content = await editable('손잡이');
    await userEvent.hover(content.querySelector('blockquote')!);
    await userEvent.click(page.getByRole('button', { name: '블록 메뉴' }));
    await userEvent.hover(page.getByRole('menuitem', { name: '바꾸기' }));
    await expect.element(page.getByRole('menuitem', { name: '제목 2' })).toBeVisible();
    await settle();
    await shoot('editor-handle', mode);
  });

  test(`table ${mode}`, async () => {
    await page.viewport(900, 1100);
    render(
      <Shot mode={mode}>
        <Editor aria-label="표" defaultValue="<p>일정표</p>">
          <Editor.Table />
          <Editor.Content />
        </Editor>
      </Shot>,
    );
    const content = await editable('표');
    await userEvent.click(content);
    await userEvent.click(page.getByRole('button', { name: '표' }));
    await userEvent.hover(document.querySelector('[data-table-size-cell="3x4"]')!);
    await settle();
    await shoot('editor-table-size', mode);
  });

  test(`image url ${mode}`, async () => {
    await page.viewport(900, 1100);
    render(
      <Shot mode={mode}>
        <Editor aria-label="그림" defaultValue="<p>학생회관 가는 길</p>" onImageUpload={async () => PICTURE}>
          <Editor.Image />
          <Editor.Content />
        </Editor>
      </Shot>,
    );
    const content = await editable('그림');
    await userEvent.click(content);
    await userEvent.click(page.getByRole('button', { name: '그림' }));
    await userEvent.fill(page.getByRole('textbox', { name: '그림 주소' }), 'ftp://gistory.me/map.png');
    await userEvent.keyboard('{Enter}');
    await settle();
    await shoot('editor-image-url', mode);
  });

  test(`rich text ${mode}`, async () => {
    await page.viewport(900, 1100);
    render(
      <Shot mode={mode}>
        <RichText value={POST} />
      </Shot>,
    );
    await expect.element(page.getByRole('heading', { name: '박람회 안내' })).toBeVisible();
    await settle();
    await shoot('rich-text', mode);
  });
}
