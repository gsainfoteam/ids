# Link

글자로 된 링크입니다. native `<a>` 위에 서비스마다 같아야 할 색, 밑줄, 포커스 링을 얹습니다.

- **두 가지 색.** 글 속 링크는 브랜드 글자색 `accent`, 바닥글이나 표 칸처럼 링크가 모인 자리는 둘레 글자색을 따르는 `neutral`.
- **두 가지 밑줄.** 늘 긋는 `always` 와 가리킬 때만 긋는 `hover`.
- **라우터 링크와 합성.** TanStack Router 는 `createLink(Link)`, Next.js 와 React Router 는 `asChild` 로 씁니다.
- **새 탭.** `target="_blank"` 면 `rel="noopener noreferrer"` 와 새 탭 아이콘, 스크린 리더용 "(새 탭에서 열림)" 이 붙습니다.

```tsx
import { Link } from '@gsainfoteam/ids-react';

<Link href="/notices">공지</Link>
<Link href="https://gist.ac.kr" target="_blank">GIST</Link>
<Link href="/privacy" colorScheme="neutral" underline="hover">개인정보 처리방침</Link>
```

## 언제 쓰나

- 글 속 링크, 폼 아래 "비밀번호 찾기", "회원가입" 같은 안내 링크, 바닥글 목록, 표 칸의 제목.
- 눈에 띄어야 할 행동(시작하기, 글쓰기)은 `Button asChild` 로 감싼 `<a>` 입니다.
- 행이나 카드 전체가 링크면 `Item asChild`, `Card asChild` 입니다.

## 색

```tsx
<Link colorScheme="accent" />    // 기본. 브랜드 글자색(--ids-color-accent)
<Link colorScheme="neutral" />   // 둘레 글자색을 따르고, 가리키면 on-surface
```

- `accent` 는 모든 테마에서 바탕과 4.5:1 을 넘는 브랜드 글자색입니다. `primary` 를 글자색으로 쓰지 않습니다.
- `neutral` 은 `Card.Description` 처럼 흐린 글자 안에 두면 그 색을 따릅니다.

## 밑줄

```tsx
<Link underline="always" />   // 기본. 옅은 밑줄, 가리키면 진해진다
<Link underline="hover" />    // 가리키거나 키보드로 포커스하면 긋는다
```

- 글 속 링크는 `always` 입니다. 색만으로 링크를 가르면 색을 구별하지 못하는 사람이 놓칩니다.
- `hover` 는 바닥글 목록, 표 칸처럼 자리만 보고도 링크인 곳에 씁니다.

## 새 탭

```tsx
<Link href="https://gist.ac.kr" target="_blank">GIST</Link>
// <a target="_blank" rel="noopener noreferrer">GIST<svg aria-hidden /><span class="sr-only"> (새 탭에서 열림)</span></a>

<Link href="https://gist.ac.kr" target="_blank" rel="noopener">GIST</Link>   // 준 rel 을 그대로 쓴다
```

- 따로 `external` 속성은 없습니다. `target="_blank"` 로 판단합니다.
- 안내 문구는 `link.newTab` 키로 번역됩니다.

## 라우터 링크

### TanStack Router: `createLink`

```tsx
import { Link } from '@gsainfoteam/ids-react';
import { createLink, linkOptions } from '@tanstack/react-router';

export const AppLink = createLink(Link);

<AppLink to="/posts/$postId" params={{ postId }} preload="intent">글 보기</AppLink>
<AppLink to="/privacy" colorScheme="neutral" underline="hover">개인정보 처리방침</AppLink>

const notices = linkOptions({ to: '/notices', search: { page: 1 } });
<AppLink {...notices}>공지</AppLink>
```

- `to`, `params`, `search` 는 라우트 트리로 타입 검사됩니다. 없는 경로는 타입 오류입니다.
- 앱에서 한 번 만들어 두고 씁니다. IDS 는 라우터에 의존하지 않습니다.
- 라우터가 `href`, `onClick`, `ref`, `aria-current` 를 넘기고, 함수 children 도 먼저 풀어서 넘깁니다.

### Next.js, React Router: `asChild`

```tsx
import NextLink from 'next/link';

<Link asChild>
  <NextLink href="/notices">공지</NextLink>
</Link>

<Link asChild>
  <NextLink href="https://gist.ac.kr" target="_blank">GIST</NextLink>   {/* 자식의 target 도 읽는다 */}
</Link>
```

- 자식 요소 하나에 Link 의 class 와 속성을 합칩니다. 새 탭 아이콘은 자식 안 끝에 붙습니다.
- 자식은 `<a>` 를 그리는 컴포넌트여야 합니다.
- 자식의 함수 children (`{({ isActive }) => ...}`) 은 그대로 둡니다.
- `className` 은 문자열만 합칩니다. React Router `NavLink` 의 `className` 함수는 받지 않습니다.

## 속성

| 속성          | 기본 / 동작                                                   |
| ------------- | ------------------------------------------------------------- |
| `colorScheme` | `accent`(기본) / `neutral`                                    |
| `underline`   | `always`(기본) / `hover`                                      |
| `asChild`     | 자식 요소 하나를 링크로 그린다 (라우터 링크)                  |
| `target`      | `_blank` 면 새 탭 아이콘과 안내가 붙는다                      |
| `rel`         | 생략하고 `target="_blank"` 면 `noopener noreferrer`           |
| 그 외 속성    | `<a>` 로, `asChild` 면 자식 요소로 간다                       |

- 요소에는 `data-link`, `data-color-scheme`, `data-underline` 이, 새 탭 아이콘에는 `data-link-new-tab` 이 붙습니다.
- 글자 크기는 둘레를 따릅니다. 크기를 바꾸려면 감싼 문단의 글자 크기를 바꿉니다.
