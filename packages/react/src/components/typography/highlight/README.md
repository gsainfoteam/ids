# Highlight

글 안에서 검색어와 맞은 부분을 `<mark>` 로 칠합니다. 검색 결과의 제목과 설명, 걸러 낸 목록에 씁니다.

- **Select 검색과 같은 규칙.** 대소문자, 전각, 악센트를 가리지 않습니다. `gist` 는 `ＧＩＳＴ` 와, `cafe` 는 `Café` 와 맞습니다. Select 나 Menu 가 거른 항목에는 Highlight 도 칠할 곳을 찾습니다.
- **글은 그대로.** 맞추는 데만 접은 글자를 쓰고, 그리는 글자는 받은 그대로입니다.
- **검색어 여럿.** 배열로 주면 모두 칠하고, 겹치거나 맞닿은 구간은 한 `<mark>` 로 합칩니다.
- **글자로 찾습니다.** `(a+b)*`, `.`, `$1` 같은 정규식 기호도 적은 글자 그대로 찾습니다.
- **글 흐름 안.** 루트는 `<span>` 이라 제목, 문단, `Item.Title` 안에 그대로 넣습니다. 칠한 부분은 양옆으로 글자 크기의 0.125em 씩 넓어지지만 글자는 움직이지 않아, 검색어를 고칠 때 줄이 흔들리지 않습니다.
- **서버 렌더링.** 맞추기는 순수 함수라 서버와 클라이언트가 같은 HTML 을 냅니다.

```tsx
import { Highlight } from '@gsainfoteam/ids-react';

<Highlight query={query}>{post.title}</Highlight>
<Highlight query={['react', 'flutter']}>{text}</Highlight>
```

## 검색어

```tsx
<Highlight query="셔틀">2학기 셔틀 시간표</Highlight>            // [셔틀]
<Highlight query={['광주송정', '송정역']}>광주송정역행</Highlight> // [광주송정역]행
<Highlight query=" 막차 ">셔틀 막차</Highlight>                  // 앞뒤 공백은 지운다
<Highlight query="">셔틀</Highlight>                             // 칠하지 않는다
```

- `query` 는 `string | readonly string[]` 입니다. 빈 문자열과 공백뿐인 검색어는 건너뜁니다.
- 검색어 하나는 한 덩어리로 찾습니다. `'셔틀 막차'` 는 `셔틀` 과 `막차` 를 따로 찾지 않으니, 낱말마다 칠하려면 `query.split(/\s+/)` 를 줍니다.
- 한 글자(grapheme)를 반으로 칠하지 않습니다. `é` 를 `e` + 결합 악센트로 적은 글에서 `e` 를 찾으면 `é` 를 통째로 칠합니다.
- 초성 검색은 하지 않습니다. `ㅅ` 은 `셔틀` 과 맞지 않습니다.

## 모양

```tsx
<Highlight query={query}>{text}</Highlight>                 // soft: secondary 바탕, on-secondary 글자
<Highlight query={query} variant="solid">{text}</Highlight> // solid: primary 바탕, on-primary 글자
```

| Property   | Type                          | Default  |
| ---------- | ----------------------------- | -------- |
| `query`    | `string \| readonly string[]` | -        |
| `variant`  | `'soft' \| 'solid'`           | `'soft'` |
| `children` | `ReactNode` (글)              | -        |

- 두 모양 모두 바탕과 글자가 4.5:1 을 넘습니다(브랜드 색 규칙).

## Highlight.Mark

```tsx
<Highlight query={query}>
  {text}
  <Highlight.Mark className="font-semibold" />
</Highlight>

<p>신청은 <Highlight.Mark>금요일까지</Highlight.Mark> 받아요.</p>
```

- Highlight 안에 두면 맞은 부분마다 그 props(`className`, `variant`, `data-*`)를 씁니다. 내용은 맞은 글자가 채웁니다.
- 따로 쓰면 형광펜처럼 칠한 `<mark>` 하나입니다.

## 알아둘 것

- children 은 글로 읽습니다. 문자열과 숫자, Fragment 안의 글을 이어 붙이고, 다른 요소는 그 안의 글만 남깁니다. 링크나 굵은 글처럼 요소가 섞인 글은 요소마다 Highlight 를 씁니다.
- 대소문자는 `toLocaleLowerCase` 로 맞춥니다. 서버와 방문자의 기본 언어가 다르면(터키어의 `I`) 맞은 구간이 달라질 수 있습니다.
- `<mark>` 는 스크린 리더에 따라 "강조" 로 읽힙니다. 검색 결과 수는 Highlight 가 알리지 않으니, 목록 위에 `aria-live` 로 적습니다.
