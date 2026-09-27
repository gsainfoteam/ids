# FloatingButton

- 화면 모서리에 고정되는 주 행동 버튼
- 아이콘만 있으면 원형, 보이는 텍스트가 있으면 확장형
- `placement`로 네 모서리 중 하나에 둔다
- `asChild`로 링크(`a`)로도 렌더한다

```tsx
import { PlusIcon } from '@heroicons/react/24/outline';
import { FloatingButton } from '@gsainfoteam/ids-react';

<FloatingButton aria-label="새 글 작성" onClick={openComposer}>
  <PlusIcon />
</FloatingButton>;
```

## 형태

```tsx
<FloatingButton aria-label="새 글 작성"><PlusIcon /></FloatingButton>  // 아이콘만 있으면 원형
<FloatingButton><PlusIcon />새 글 작성</FloatingButton>               // 보이는 텍스트가 있으면 확장형
<FloatingButton iconOnly><MyGlyph /></FloatingButton>                // 자식 내용을 판별할 수 없으면 직접 지정
<FloatingButton size="tiny" aria-label="추가"><PlusIcon /></FloatingButton> // 56px -> 44px
```

## 위치

```tsx
<FloatingButton placement="bottom-right" /> // 기본
<FloatingButton placement="bottom-left" />
<FloatingButton placement="top-left" />
<FloatingButton placement="top-right" />
// viewport 가장자리에서 24px + safe-area 여백. z-index 40
```

## 색

```tsx
<FloatingButton variant="solid" />   // 기본
<FloatingButton variant="surface" />
<FloatingButton tone="weak" />       // default(기본) / weak / contrast
```

## 이름

```tsx
<FloatingButton aria-label="추가"><PlusIcon /></FloatingButton>        // 가장 우선
<FloatingButton><PlusIcon title="추가" /></FloatingButton>             // 아이콘의 title / aria-label도 쓴다
<FloatingButton><PlusIcon /></FloatingButton>                          // 이름 없음: 개발 빌드에서 경고
```

## asChild

```tsx
<FloatingButton asChild>
  <a href="/compose">                 {/* button 또는 a만. props와 ref를 그 요소에 전달해야 한다 */}
    <PlusIcon />새 글 작성
  </a>
</FloatingButton>

<FloatingButton asChild disabled>
  <a href="/compose">새 글 작성</a>    {/* href와 탭 정지점을 없애고 클릭, Enter/Space를 막는다 */}
</FloatingButton>
// onClick은 child, root 순서. child가 preventDefault하면 root는 실행되지 않는다
```

## 진행 상태

- 로딩, 스크롤 숨김, 비동기 작업은 앱에서 제어한다

```tsx
<FloatingButton disabled={pending} aria-label={pending ? '저장 중' : '저장'}>
  {pending ? <Spinner decorative /> : <CheckIcon />}
</FloatingButton>
```

## 속성

| 속성                    | 기본 / 동작                                           |
| ----------------------- | ----------------------------------------------------- |
| `placement`             | `bottom-right`. `top-left` / `top-right` / `bottom-left` |
| `variant`               | `solid`(기본) / `surface`                             |
| `tone`                  | `default`(기본) / `weak` / `contrast`                 |
| `size`                  | `standard`(56px, 기본) / `tiny`(44px)                 |
| `iconOnly`              | 보이는 텍스트 유무로 자동 판별                        |
| `type`                  | `button`. 폼을 제출하지 않는다                        |
| `disabled`              | native 비활성. `asChild` 링크는 위처럼 차단           |
| `ref`                   | 실제 `button` 또는 `a`                                |
| render props / `onInteractionChange` | `Button`과 같다                          |

## 알아둘 것

- `fixed` 위치라서 `transform`이 있는 조상 안에 두면 그 조상이 기준이 된다. 앱 최상위에 둔다.
- 모달보다 아래에 오도록 앱의 z-index 체계를 맞춘다(기본 40).
- 같은 `placement`에 버튼이 둘 이상 있으면 개발 빌드에서 경고한다.
- 아이콘 컴포넌트 이름으로 의미를 추정하지 않는다. 아이콘만 쓰면 이름을 직접 준다.
- `ThemeProvider` 아래에서 쓴다.
- reduced-motion에서는 색과 그림자 전환이 빠진다.
