import 'pretendard-gov/dist/web/variable/pretendardvariable-gov.css';

import { expect, test } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';

import { testTheme } from './theme';
import { IdsProvider } from '../src';
import { Editor } from '../src/editor';

const PICTURE = `data:image/svg+xml;base64,${btoa(
  '<svg xmlns="http://www.w3.org/2000/svg" width="480" height="160" viewBox="0 0 480 160"><rect width="480" height="160" fill="hsl(210 70% 88%)"/><circle cx="350" cy="50" r="20" fill="hsl(40 90% 66%)"/><path d="M0 160 L130 72 L250 128 L350 84 L480 160 Z" fill="hsl(210 32% 40%)"/></svg>',
)}`;

const NOTICE =
  '<h2>박람회 준비</h2><p style="text-align: center">부스마다 <mark>안내판</mark>을 세웁니다.</p><ul data-type="taskList"><li data-type="taskItem" data-checked="true"><p>부스 신청</p></li><li data-type="taskItem" data-checked="false"><p>장소 배정</p></li></ul><hr><table><tbody><tr><th><p>시간</p></th><th><p>장소</p></th></tr><tr><td><p>10:00</p></td><td><p>학생회관</p></td></tr></tbody></table><p>학생회관 가는 길</p>';

const png = () => new File(['png'], '지도.png', { type: 'image/png' });

for (const mode of ['light', 'dark'] as const) {
  test(`tools ${mode}`, async () => {
    await page.viewport(760, 1040);
    let release: (url: string) => void = () => {};
    render(
      <IdsProvider theme={testTheme} mode={mode}>
        <div data-testid="shot" className="flex flex-col gap-4 bg-surface p-6">
          <Editor
            aria-label="모든 도구"
            defaultValue={NOTICE}
            onImageUpload={async () => PICTURE}
            className="w-[40rem]"
          >
            <Editor.BlockType />
            <Editor.Separator />
            <Editor.Bold />
            <Editor.Italic />
            <Editor.Highlight />
            <Editor.Link />
            <Editor.Separator />
            <Editor.BulletList />
            <Editor.OrderedList />
            <Editor.TaskList />
            <Editor.Separator />
            <Editor.TextAlign />
            <Editor.Separator />
            <Editor.Image />
            <Editor.HorizontalRule />
            <Editor.Table />
            <Editor.Content />
          </Editor>
          <Editor
            aria-label="올리는 중"
            defaultValue="<p>사진을 올리는 중입니다</p>"
            onImageUpload={() => new Promise<string>((resolve) => (release = resolve))}
            className="w-[40rem]"
          >
            <Editor.Bold />
            <Editor.Italic />
            <Editor.Image />
            <Editor.Content />
          </Editor>
        </div>
      </IdsProvider>,
    );
    const all = page.getByRole('textbox', { name: '모든 도구' });
    await expect.element(all).toHaveAttribute('contenteditable', 'true');
    await userEvent.click([...all.element().querySelectorAll(':scope > p')].at(-1)!);
    const inputs = document.querySelectorAll<HTMLInputElement>('[data-editor-image-input]');
    await userEvent.upload(page.elementLocator(inputs[0]!), png());
    await expect.poll(() => all.element().querySelector('img')).not.toBeNull();
    await userEvent.click(all.element().querySelector('img')!);

    const pending = page.getByRole('textbox', { name: '올리는 중' });
    await userEvent.click(pending);
    await userEvent.upload(page.elementLocator(inputs[1]!), png());
    await expect.poll(() => document.querySelector('[data-editor-upload]')).not.toBeNull();

    await userEvent.click(page.getByRole('button', { name: '그림' }).first());
    await expect.element(page.getByRole('textbox', { name: '대체 텍스트' })).toHaveFocus();
    await userEvent.keyboard('학생회관 지도');
    await new Promise((resolve) => setTimeout(resolve, 300));
    await page.screenshot({ path: `../.vitest/pr-shots/editor-tools-${mode}.png`, element: page.getByTestId('shot') });
    release(PICTURE);
  });
}
