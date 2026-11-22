import { renderToString } from 'react-dom/server';
import { afterEach, beforeEach, expect, test, vi, type MockInstance } from 'vitest';

import { RichText } from '../src/rich-text';

let complaints: MockInstance[] = [];

beforeEach(() => {
  complaints = [vi.spyOn(console, 'error'), vi.spyOn(console, 'warn')];
});

afterEach(() => {
  expect(complaints.flatMap((spy) => spy.mock.calls)).toEqual([]);
  for (const spy of complaints) spy.mockRestore();
});

const render = (markdown: string) => renderToString(<RichText value={markdown} />);

test('headings, emphasis and lists are plain document markup', () => {
  const html = render(
    '# 제목\n\n##### 작은 제목\n\n**굵게** _기울임_ `code` ==표시==\n\n- 하나\n- 둘\n\n1. 첫째',
  );

  expect(html).toContain('<h1>제목</h1>');
  expect(html).toContain('<h5>작은 제목</h5>');
  expect(html).toContain('<strong>굵게</strong>');
  expect(html).toContain('<em>기울임</em>');
  expect(html).toContain('<code>code</code>');
  expect(html).toMatch(/<ul>.*하나.*둘.*<\/ul>/);
  expect(html).toMatch(/<ol[^>]*>.*첫째.*<\/ol>/);
});

test('a fenced code block becomes an IDS CodeBlock highlighted on the server', () => {
  const html = render('```ts\nconst a = 1;\n```');

  expect(html).toContain('data-token');
  expect(html).toContain('const');
});

test('a GitHub alert becomes a callout Alert with its title', () => {
  const html = render('> [!WARNING]\n> 되돌릴 수 없습니다.\n>\n> 두 번째 문단');

  expect(html).toContain('role="note"');
  expect(html).toContain('경고');
  expect(html).toContain('되돌릴 수 없습니다.');
  expect(html).toContain('두 번째 문단');
  expect(html).not.toContain('[!WARNING]');
});

test('a plain quote stays a blockquote', () => {
  expect(render('> 인용')).toContain('<blockquote><p>인용</p></blockquote>');
});

test('details become an Accordion item without a heading of their own', () => {
  const html = render(
    ':::details {open}\n\n:::detailsSummary\n\n더 보기\n\n:::\n\n:::detailsContent\n\n숨은 내용\n\n:::\n\n:::',
  );

  expect(html).toContain('aria-expanded="true"');
  expect(html).toContain('더 보기');
  expect(html).toContain('숨은 내용');
  expect(html).not.toMatch(/<h3/);
});

test('a table keeps its header row in thead', () => {
  const html = render('| 이름 | 값 |\n| --- | --- |\n| 가 | 1 |');

  expect(html).toMatch(/<thead[^>]*>.*이름.*<\/thead>/);
  expect(html).toMatch(/<tbody[^>]*>.*가.*<\/tbody>/);
});

test('task items are read-only checkboxes named by their text', () => {
  const html = render('- [x] 끝난 일\n- [ ] 남은 일');

  expect(html).toMatch(/aria-label="끝난 일"[^>]*checked=""|checked=""[^>]*aria-label="끝난 일"/);
  expect(html).toContain('남은 일');
});

test('a mention shows its avatar and name, or links when mentionHref is given', () => {
  const markdown = '안녕 [@ id="u1" label="하늘" avatar="/faces/u1.png"]';

  expect(render(markdown)).toContain('하늘');
  expect(render(markdown)).toContain('src="/faces/u1.png"');
  expect(render('[@ id="u1" label="하늘" avatar="javascript:alert(1)"]')).not.toContain(
    'javascript:',
  );
  expect(
    renderToString(<RichText value={markdown} mentionHref={(id) => `/users/${id}`} />),
  ).toContain('href="/users/u1"');
});

test('a horizontal rule is a Divider', () => {
  expect(render('위\n\n---\n\n아래')).toContain('role="separator"');
});

test('an image with a title gets a figcaption', () => {
  const html = render('![고양이](https://example.com/cat.png "창가의 고양이")');

  expect(html).toContain('src="https://example.com/cat.png"');
  expect(html).toContain('<figcaption');
  expect(html).toContain('창가의 고양이');
});

test('unsafe links and images are dropped, raw HTML stays text', () => {
  const html = render(
    '[누르기](javascript:alert(1)) ![x](javascript:alert(1))\n\n<script>alert(1)</script>',
  );

  expect(html).not.toContain('href="javascript');
  expect(html).not.toContain('src="javascript');
  expect(html).not.toContain('<script>');
  expect(html).toContain('누르기');
});

test('json content renders the same tree', () => {
  const html = renderToString(
    <RichText
      format="json"
      value={{
        type: 'doc',
        content: [
          { type: 'paragraph', content: [{ type: 'text', text: '본문' }] },
          { type: 'image', attrs: { src: 'javascript:alert(1)' } },
        ],
      }}
    />,
  );

  expect(html).toContain('<p>본문</p>');
  expect(html).not.toContain('<img');
});

test('a callout kind named like an Object property falls back to a note', () => {
  const callout = (kind: string) => ({
    type: 'callout',
    attrs: { kind },
    content: [{ type: 'paragraph', content: [{ type: 'text', text: kind }] }],
  });
  const html = renderToString(
    <RichText
      format="json"
      value={{ type: 'doc', content: ['constructor', 'toString', '__proto__'].map(callout) }}
    />,
  );

  expect(html.match(/role="note"/g)).toHaveLength(3);
  expect(html.match(/참고/g)).toHaveLength(3);
});

test('sub and sup tags in markdown become subscript and superscript', () => {
  const html = render('H<sub>2</sub>O and E=mc<sup>2</sup>');

  expect(html).toContain('H<sub>2</sub>O');
  expect(html).toContain('mc<sup>2</sup>');
  expect(html).not.toContain('&lt;sub&gt;');
});

test('colored text and highlights draw IDS color roles, and an unknown color is dropped', () => {
  const html = render(
    '<span data-color="danger">마감</span> <mark data-color="success">완료</mark> ==기본== <span data-color="hotpink">분홍</span>',
  );

  expect(html).toContain('<span data-color="danger">마감</span>');
  expect(html).toContain('<mark data-color="success">완료</mark>');
  expect(html).toContain('<mark>기본</mark>');
  expect(html).not.toContain('data-color="hotpink"');
});
