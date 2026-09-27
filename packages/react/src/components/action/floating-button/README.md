# FloatingButton

화면 모서리에 떠 있는 주 동작 버튼입니다. 글 작성, 새 항목 추가처럼 화면에서 가장 자주 하는 일에 씁니다.

- **모양 자동.** 아이콘만 있으면 56px 원, 보이는 글자가 있으면 모서리 12px 인 확장형입니다.
- **이름 자동.** 아이콘만 있고 `aria-label` 이 없으면 IconButton 처럼 아이콘에서 이름을 찾습니다.
- **기기 가장자리.** 모서리에서 24px 에 노치와 홈 표시줄의 safe area 를 더한 만큼 떨어집니다. 오른쪽에서 왼쪽으로 쓰는 화면에서는 좌우가 바뀝니다.
- **떠 있는 배경.** 스크롤되는 내용 위에 있으므로 `soft` 와 hover 까지 모든 배경이 불투명합니다.
- **조용한 움직임.** 누를 때 살짝 줄어들고 hover 에 그림자가 커집니다. 움직임 줄이기 설정에서는 줄어들지 않고 전환 애니메이션도 없습니다. 인쇄할 때는 나오지 않습니다.

```tsx
import { FloatingButton } from '@gsainfoteam/ids-react';
import { PlusIcon } from '@heroicons/react/24/outline';

<FloatingButton aria-label="새 글 작성" onClick={openComposer}>
  <PlusIcon />
</FloatingButton>;
```

## 모양

```tsx
<FloatingButton aria-label="새 글 작성"><PlusIcon /></FloatingButton>  // 아이콘만: 원형
<FloatingButton><PlusIcon />새 글 작성</FloatingButton>                // 글자 있음: 확장형
<FloatingButton iconOnly><Trans id="compose" /></FloatingButton>      // 글자를 읽을 수 없는 내용은 직접 지정
<FloatingButton size="tiny" aria-label="추가"><PlusIcon /></FloatingButton>  // 56px -> 44px
```

- 확장형은 아이콘 쪽 안쪽 여백이 조금 줄어듭니다.
- 크기를 주지 않은 아이콘은 `standard` 24px, `tiny` 20px 입니다.

## 위치

```tsx
<FloatingButton placement="bottom-right" />  // 기본
<FloatingButton placement="bottom-left" />
<FloatingButton placement="top-left" />
<FloatingButton placement="top-right" />
```

- `left` 와 `right` 는 읽는 방향을 따릅니다. 오른쪽에서 왼쪽으로 쓰는 화면에서 `bottom-right` 는 왼쪽 아래, 곧 끝쪽입니다.
- safe area 는 `viewport-fit=cover` 인 페이지에서만 0 이 아닙니다.
- `z-index` 는 40 입니다. 모달이 위에 오도록 앱의 층을 맞춥니다.

## 색

```tsx
<FloatingButton />                                   // solid, primary (기본)
<FloatingButton variant="soft" />                     // 옅은 테마 색. 불투명하다
<FloatingButton variant="outline" />                  // 바탕색과 테두리
<FloatingButton colorScheme="neutral" />              // 검은 버튼. 다크 모드에서는 흰 버튼
<FloatingButton colorScheme="danger" variant="soft" />
```

## 이름

```tsx
<FloatingButton aria-label="새 글 작성"><PlusIcon /></FloatingButton>  // 가장 우선
<FloatingButton><PlusIcon title="새 글" /></FloatingButton>             // 아이콘의 title, aria-label
<FloatingButton><PlusIcon /></FloatingButton>                           // 컴포넌트 이름: "Plus"
```

- 규칙과 주의할 점은 IconButton 과 같습니다. 함수 이름에서 찾은 이름은 production 빌드에서 사라질 수 있으니 배포하는 화면에는 `aria-label` 을 줍니다.

## 로딩

```tsx
<FloatingButton disabled={uploading} focusableWhenDisabled aria-busy={uploading}>
  {uploading ? <Spinner decorative /> : <ArrowUpTrayIcon />}  {/* 스피너가 아이콘 크기로 들어간다 */}
  {uploading ? '업로드 중' : '업로드'}
</FloatingButton>
```

- 스크롤에 따라 숨기기, 비동기 작업은 앱이 정합니다.

## asChild

```tsx
<FloatingButton asChild>
  <a href="/compose">                  {/* 링크로 그린다 */}
    <PlusIcon />새 글 작성
  </a>
</FloatingButton>

<FloatingButton asChild disabled>
  <a href="/compose">새 글 작성</a>     {/* href 와 탭 순서를 떼고 클릭, Enter, Space 를 막는다 */}
</FloatingButton>
```

- 자식의 `onClick` 이 먼저 돌고, 자식이 `preventDefault` 하면 FloatingButton 의 `onClick` 은 돌지 않습니다.

## 속성

| 속성                    | 기본 / 동작                                                         |
| ----------------------- | ------------------------------------------------------------------- |
| `placement`             | `bottom-right`(기본) / `bottom-left` / `top-left` / `top-right`     |
| `variant`               | `solid`(기본) / `soft` / `outline`                                  |
| `colorScheme`           | `primary`(기본) / `neutral` / `danger` / `success` / `warning` / `info` |
| `size`                  | `standard`(56px, 기본) / `tiny`(44px)                               |
| `iconOnly`              | 보이는 글자가 있는지로 자동으로 정한다                              |
| `type`                  | `button`. 폼을 제출하지 않는다                                      |
| `asChild`               | 자식 요소 하나(링크)를 버튼으로 그린다                              |
| `focusableWhenDisabled` | 비활성이어도 포커스와 탭 순서를 지킨다                              |
| `ref`                   | 실제 `button`, `asChild` 면 자식 요소                               |
| 그 외                   | Button 과 같다 (상태 함수 prop, `data-*`, `onInteractionChange`)    |

## 알아둘 것

- `position: fixed` 라서 `transform` 이 있는 조상 안에 두면 그 조상이 기준이 됩니다. 앱 최상위에 둡니다.
- 같은 자리에 둔 버튼 둘이 겹치면 개발 모드에서 콘솔에 경고합니다.
- 비활성 버튼은 다른 버튼처럼 반투명해집니다.
