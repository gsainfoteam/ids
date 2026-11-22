import 'pretendard-gov/dist/web/variable/pretendardvariable-gov.css';

import { expect, test } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';

import { testTheme } from './theme';
import { IdsProvider } from '../src';
import { Editor } from '../src/editor';

import type { ReactNode } from 'react';

const MODES = ['light', 'dark'] as const;

function Shot({ mode, children }: { mode: (typeof MODES)[number]; children: ReactNode }) {
  return (
    <IdsProvider theme={testTheme} mode={mode}>
      <div data-testid="shot" className="flex min-h-[20rem] w-[40rem] flex-col gap-4 bg-base p-6">
        {children}
      </div>
    </IdsProvider>
  );
}

const settle = () => new Promise((resolve) => setTimeout(resolve, 500));

const shoot = (name: string, mode: string) =>
  page.screenshot({
    path: `../.vitest/pr-shots/${name}-${mode}.png`,
    element: page.getByTestId('shot'),
  });

async function editable(name: string) {
  const box = page.getByRole('textbox', { name });
  await expect.element(box).toHaveAttribute('contenteditable', 'true');
  return box.element() as HTMLElement;
}

function select(element: Element) {
  const range = document.createRange();
  range.selectNodeContents(element);
  const selection = getSelection()!;
  selection.removeAllRanges();
  selection.addRange(range);
}

const SCHEDULE =
  '<p>박람회 일정</p><table><tbody><tr><th><p>시간</p></th><th><p>장소</p></th><th><p>담당</p></th><th><p>준비물</p></th></tr><tr><td><p>10:00</p></td><td><p>학생회관 앞</p></td><td><p>이인포</p></td><td><p>안내판, 연장선</p></td></tr><tr><td><p>13:00</p></td><td><p>대강당</p></td><td><p>박디자인</p></td><td><p>명찰</p></td></tr></tbody></table><p>문의는 학생회로 보내 주세요.</p>';

for (const mode of MODES) {
  test(`tooltip ${mode}`, async () => {
    await page.viewport(900, 700);
    render(
      <Shot mode={mode}>
        <Editor aria-label="도구" defaultValue="<p>회의록을 적습니다.</p>">
          <Editor.Bold />
          <Editor.Italic />
          <Editor.Underline />
          <Editor.Strike />
          <Editor.Code />
          <Editor.Separator />
          <Editor.TextAlign />
          <Editor.Content />
        </Editor>
      </Shot>,
    );
    await editable('도구');
    await userEvent.hover(page.getByRole('button', { name: '취소선' }));
    await expect.element(page.getByRole('tooltip')).toBeVisible();
    await settle();
    await shoot('editor-tooltip', mode);
  });

  test(`link ${mode}`, async () => {
    await page.viewport(900, 700);
    render(
      <Shot mode={mode}>
        <Editor aria-label="링크" defaultValue="<p>자세한 안내는 학생회 공지에 있습니다.</p>">
          <Editor.Bold />
          <Editor.Italic />
          <Editor.Link />
          <Editor.Content />
        </Editor>
      </Shot>,
    );
    const content = await editable('링크');
    await userEvent.click(content);
    select(content.querySelector('p')!);
    await userEvent.click(page.getByRole('button', { name: '링크' }));
    await userEvent.fill(page.getByRole('textbox', { name: '링크 주소' }), 'https://gistory.me');
    await settle();
    await shoot('editor-link', mode);
  });

  test(`table ${mode}`, async () => {
    await page.viewport(900, 900);
    render(
      <Shot mode={mode}>
        <Editor type="block" aria-label="표" defaultValue={SCHEDULE} className="w-[30rem]">
          <Editor.Table />
          <Editor.Content />
        </Editor>
        <div className="h-80" />
      </Shot>,
    );
    await editable('표');
    await userEvent.hover(page.getByRole('textbox', { name: '표' }).getByText('시간'));
    await userEvent.click(page.getByRole('button', { name: '블록 메뉴' }));
    await expect.element(page.getByRole('menuitem', { name: '아래에 행 추가' })).toBeVisible();
    await settle();
    await shoot('editor-table-menu', mode);
  });
}
