# CodeBlock

여러 줄 코드를 구문 강조와 복사 버튼과 함께 보입니다. AI 답 속 코드, 설치 명령, 문서의 예시에 씁니다.

- **블록만.** 문장 속 짧은 코드는 지금처럼 `<code className="font-mono">` 로 씁니다.
- **서버 HTML 에서 이미 강조.** 강조는 [refractor](https://github.com/wooorm/refractor)(Prism 문법)가 렌더 중에 동기로 합니다. 클라이언트에서 다시 칠하지 않고, 깜빡이지 않습니다.
- **IDS 토큰 색.** 조각마다 `data-token` 이 붙고 색은 IDS 토큰입니다. 테마와 다크 모드를 따릅니다.
- **복사.** 오른쪽 위 IconButton 이 코드를 그대로 클립보드에 넣습니다. 줄 번호는 들어가지 않습니다.
- **가로 스크롤은 ScrollArea.** 긴 줄은 OS 막대 대신 IDS 막대로 스크롤하고, `wrap` 이면 줄을 바꿉니다.

```tsx
import { CodeBlock } from '@gsainfoteam/ids-react';

<CodeBlock language="tsx">{code}</CodeBlock>

<CodeBlock language="tsx" title="button.tsx" lineNumbers highlight={[3, 4]}>
  {code}
</CodeBlock>
```

## 구성

```tsx
<figure>                         {/* 루트. figcaption 이 이름이 된다 */}
  <figcaption>title · language</figcaption>
  <hr aria-hidden />             {/* Divider */}
  <button aria-label="코드 복사" /> {/* IconButton */}
  <pre>                          {/* ScrollArea.Viewport */}
    <code>
      <span data-line="1">...</span>
      ...
    </code>
  </pre>
</figure>
```

- `title` 과 `language` 가 `<figcaption>` 이 됩니다. 둘 다 없으면(`language` 가 `text`) figcaption 없이 복사 버튼만 코드 위에 뜹니다.
- 복사 버튼은 figcaption 밖에 둡니다. 안에 두면 figure 의 이름에 "코드 복사" 가 섞입니다.
- `<pre>` 는 `dir="ltr"` 입니다. 오른쪽에서 왼쪽으로 쓰는 페이지에서도 코드는 왼쪽부터 씁니다.

## 코드 넘기기

```tsx
<CodeBlock language="bash">{'pnpm install'}</CodeBlock>

<CodeBlock language="ts">{`
const answer = 42;
`}</CodeBlock>                     // 앞뒤 빈 줄 하나씩은 지운다
```

- `children` 은 코드 문자열과 선택 파트(`CodeBlock.Copy`)입니다. 문자열이 여럿이면 이어 붙입니다.
- 템플릿 리터럴을 줄을 바꿔 열고 닫아도 되게 맨 앞과 맨 뒤의 줄바꿈 하나씩은 지웁니다. `\r\n` 은 `\n` 으로 바꿉니다.
- 다른 요소를 넣으면 개발 빌드에서 경고하고 그리지 않습니다.

## 언어

```tsx
<CodeBlock language="tsx" />    // 기본으로 담긴 언어. 서버 HTML 에서 강조된다
<CodeBlock language="rust" />   // 처음 쓸 때 불러오는 언어
<CodeBlock language="text" />   // 기본. 강조하지 않는다
```

| 묶음        | 언어 (별칭)                                                                                                                                                |
| ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 기본        | `bash` (`sh`, `shell`), `css`, `diff`, `javascript` (`js`), `json`, `jsx`, `markdown` (`md`), `markup` (`html`, `xml`, `svg`), `python` (`py`), `sql`, `tsx`, `typescript` (`ts`), `yaml` (`yml`) |
| 불러오는 것 | `c`, `cpp`, `csharp` (`cs`), `dart`, `docker` (`dockerfile`), `go`, `graphql`, `ini`, `java`, `kotlin` (`kt`), `lua`, `makefile`, `objectivec` (`objc`), `php`, `ruby` (`rb`), `rust`, `scss`, `swift`, `toml` |

- 대소문자는 가리지 않습니다. 별칭은 refractor 의 것입니다.
- 기본 묶음은 `import { CodeBlock }` 에 함께 들어갑니다(약 24 kB gzip). AI 답에서 가장 자주 나오는 언어입니다.
- 불러오는 묶음은 기본에 없는 언어를 처음 그릴 때 `import()` 로 한 번 불러옵니다(약 15 kB gzip). 그때까지, 그리고 서버 HTML 과 hydration 첫 그림에서는 강조 없이 보이고, 불러오면 그 언어를 쓴 모든 CodeBlock 이 다시 칠해집니다. 서버와 클라이언트의 첫 HTML 이 같아서 hydration 이 어긋나지 않습니다.
- 두 묶음 어디에도 없는 언어는 강조 없이 보입니다. 이름(`language`)은 그대로 figcaption 에 나옵니다.
- `text`, `plain`, `plaintext`, `txt` 는 강조하지 않고 figcaption 에도 적지 않습니다.

## 색

| `data-token`  | Prism 토큰                                          | 색                     |
| ------------- | --------------------------------------------------- | ---------------------- |
| `comment`     | comment, prolog, doctype, cdata                     | `on-muted`, 기울임     |
| `keyword`     | keyword, atrule, rule, important                    | `accent` (테마 색)     |
| `string`      | string, char, attr-value, regex, url                | `success-strong`       |
| `number`      | number, boolean, constant, symbol                   | `warning-strong`       |
| `function`    | function, class-name, builtin                       | `info-strong`          |
| `property`    | property, attr-name, variable                       | `info-strong`          |
| `tag`         | tag, selector, namespace                            | `danger-strong`        |
| `punctuation` | punctuation, operator                               | `on-muted`             |
| `inserted`    | inserted (diff 의 `+`)                              | `success-strong`       |
| `deleted`     | deleted (diff 의 `-`)                               | `danger-strong`        |

- 한 조각에 여러 Prism 토큰이 겹치면 가장 안쪽 토큰, 그 안에서는 먼저 적힌 클래스를 씁니다.
- 모든 색은 `surface` 와 `muted` 바탕 위에서 두 모드 모두 4.5:1 을 넘습니다. `accent` 는 가장 낮은 노란색도 넘습니다.
- 색을 바꾸려면 `data-token` 으로 고릅니다: `className="[&_[data-token=keyword]]:text-(--ids-color-info-strong)"`.

## 줄 번호와 강조

```tsx
<CodeBlock language="tsx" lineNumbers />
<CodeBlock language="tsx" highlight={[3, 4]} />   // 1부터 세는 줄 번호
```

- 줄 번호는 `::before` 의 CSS counter 입니다(`content: counter(line) / ''`). 글자가 아니라서 골라 복사해도 섞이지 않고, 대체 텍스트가 빈 문자열이라 스크린 리더도 읽지 않습니다.
- 번호 칸의 폭은 줄 수의 자릿수(`--code-block-digits`, `ch` 단위)입니다.
- 강조한 줄은 `data-highlighted` 를 받고 바탕(outline 은 `muted`, soft 는 `surface`)과 왼쪽 2px `primary` 막대로 보입니다. 어느 바탕에서도 글자 대비가 4.5:1 을 넘게 고른 바탕입니다.
- 줄마다 `data-line` 에 1부터 센 번호가 있습니다.
- 줄의 글자와 번호는 `0.125em` 내려 그립니다. Monaspace 는 글자 위보다 아래에 여백이 많아서, 그대로 두면 강조한 줄의 바탕에서 글자가 위로 치우쳐 보입니다. 내리는 것은 그림뿐이고 줄 높이는 그대로입니다.

## 넘침

```tsx
<CodeBlock language="ts" />        // 긴 줄은 가로로 스크롤한다
<CodeBlock language="ts" wrap />   // 줄을 바꾼다
```

- 가로 스크롤은 `ScrollArea` 의 `orientation="horizontal"` 이고 `<pre>` 가 viewport 입니다. 넘치면 `<pre>` 가 Tab 멈춤(`tabIndex={0}`)을 받아 화살표 키로 스크롤합니다.
- 강조한 줄의 바탕은 스크롤한 폭 끝까지 이어집니다. `<code>` 가 가장 긴 줄의 폭(`w-max min-w-full`)입니다.
- `wrap` 이면 `white-space: pre-wrap` 과 `overflow-wrap: break-word` 입니다. 바뀐 줄은 줄 번호 뒤에서 이어집니다.
- 가로 flex 안에 두면 CodeBlock 을 담은 flex 항목에 `min-w-0` 을 줍니다. 그러지 않으면 `<pre>` 처럼 가장 긴 줄만큼 넓어집니다.
- CodeBlock 은 세로로 스크롤하지 않습니다. 긴 코드는 아래처럼 접습니다.

## 접기

```tsx
<CodeBlock language="tsx" collapsedLines={8} />                 // 8줄보다 길면 접힌 채로 시작
<CodeBlock language="tsx" collapsedLines={8} defaultExpanded />
<CodeBlock language="tsx" collapsedLines={8} expanded={open} onExpandedChange={setOpen} />
```

- 코드가 `collapsedLines` 보다 길면 그 줄 수만 보이고, 다음 줄이 흐리게 비칩니다. 짧으면 아무것도 바꾸지 않습니다.
- 아래 가운데의 `Button`(outline, tiny)이 "N줄 더 보기" 와 "접기" 를 오갑니다. `aria-expanded` 와 `aria-controls`(`<pre>`)가 붙습니다.
- 접을 때 버튼이 화면 밖으로 밀려나면 버튼이 보이게 스크롤합니다.
- 줄 수는 서버에서 셉니다. 서버 HTML 부터 접힌 채로 오고, 크기를 재지 않아 hydration 뒤에 높이가 바뀌지 않습니다.
- `wrap` 이면 바뀐 줄도 한 줄로 셉니다. 보이는 높이는 `collapsedLines` 줄 높이 그대로입니다.
- 접혀 있어도 복사 버튼은 코드 전체를 복사합니다.

## 복사

```tsx
<CodeBlock language="bash">
  {command}
  <CodeBlock.Copy aria-label="명령어 복사" />   {/* 바꿀 때만 둔다 */}
</CodeBlock>
```

- 기본 이름은 "코드 복사", 복사한 뒤 1.5초 동안 "복사했습니다" 입니다. `aria-label` 을 주면 그 이름을 그대로 씁니다.
- 복사하면 아이콘이 체크로 바뀌고 `data-copied` 가 붙으며, `role="status"` 로 "복사했습니다" 를 알립니다.
- 복사하는 것은 넘긴 코드 문자열 그대로입니다. 줄 번호도 강조도 들어가지 않습니다.
- `navigator.clipboard.writeText` 가 없는 곳(보안 컨텍스트가 아닌 http)에서는 그리지 않습니다. 서버 HTML 에도 없고, hydration 뒤에 나타납니다. 자리를 차지하지 않는 절대 위치라 레이아웃이 밀리지 않습니다.
- 버튼은 IconButton `outline`, `tiny` 입니다. `children` 에 아이콘을 넣으면 그 아이콘을 씁니다. `onClick` 은 복사 전에 불리고 `preventDefault` 하면 복사하지 않습니다.

## 모양

```tsx
<CodeBlock variant="outline" />   // 기본. 테두리 있는 표면
<CodeBlock variant="soft" />      // 옅은 바탕, 테두리 없음
```

- caption 아래 선은 `Divider`(`decorative`)입니다. `soft`에서는 그 선을 `border`가 아니라 `surface` 색으로 칠합니다. 다크 모드에서 `border`는 `muted` 바탕과 같은 색이라 보이지 않습니다.

- 모서리는 `container`(16px)입니다. 모서리 안쪽에 붙는 것은 6px 떨어진 10px 복사 버튼이라 `10 + 6` 이 `container` 에서 멈춥니다.
- 글자는 `font-mono` `text-body-b3-regular` 입니다.

## 상태

| 속성                 | 붙는 곳     | 뜻                          |
| -------------------- | ----------- | --------------------------- |
| `data-variant`       | root        | 넘긴 값                     |
| `data-language`      | root        | 넘긴 `language`             |
| `data-wrap`          | root        | `wrap`                      |
| `data-line-numbers`  | root        | `lineNumbers`               |
| `data-collapsed`     | root        | 접혀 있을 때                |
| `data-line`          | 줄          | 1부터 센 줄 번호            |
| `data-highlighted`   | 줄          | `highlight` 에 든 줄        |
| `data-token`         | 강조한 조각 | 위 색 표의 이름             |
| `data-copied`        | 복사 버튼   | 복사한 뒤 1.5초             |

## Props

| Property      | Type                                           | Default     |
| ------------- | ---------------------------------------------- | ----------- |
| `children`    | `string` (코드), 그리고 선택 파트 `CodeBlock.Copy` | -           |
| `language`    | `string`                                       | `'text'`    |
| `title`       | `ReactNode`                                    | -           |
| `lineNumbers` | `boolean`                                      | `false`     |
| `highlight`   | `number[]` (1부터 세는 줄 번호)                | -           |
| `wrap`        | `boolean`                                      | `false`     |
| `variant`     | `'outline' \| 'soft'`                          | `'outline'` |
| `collapsedLines` | `number` (접었을 때 보이는 줄 수)           | -           |
| `expanded`    | `boolean`                                      | -           |
| `defaultExpanded` | `boolean`                                  | `false`     |
| `onExpandedChange` | `(expanded: boolean) => void`             | -           |

## 파트

| 파트   | 기본 / 동작                                                         |
| ------ | ------------------------------------------------------------------- |
| `Copy` | 복사 IconButton. 없으면 기본 버튼. `CodeBlock.Copy.Props` 로 받는다 |
