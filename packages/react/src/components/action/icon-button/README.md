# IconButton

아이콘 하나만 보여 주는 정사각형 버튼입니다. 툴바, 카드 모서리, 헤더 메뉴에 씁니다.

- **이름 자동.** `aria-label` 을 생략하면 아이콘에서 이름을 찾습니다. `<PlusIcon />` 은 "Plus" 가 됩니다. 직접 준 이름이 항상 이깁니다.
- **정확한 정사각형.** 아이콘이 무엇이든 높이와 너비가 컨트롤 크기와 같습니다. `standard` 36px, `tiny` 32px.
- **로딩은 합성.** `icon` 을 `<Spinner />` 로 바꾸고 `disabled` 를 켜면 스피너가 아이콘 크기로 들어가 버튼이 흔들리지 않습니다.
- **Button 과 같은 동작.** `variant`, `colorScheme`, `asChild`, `focusableWhenDisabled`, 상태 함수 prop, `data-*` 가 모두 Button 과 같습니다. `variant` 기본값만 `ghost` 입니다.

```tsx
import { IconButton } from '@gsainfoteam/ids-react';
import { XMarkIcon } from '@heroicons/react/16/solid';

<IconButton icon={<XMarkIcon />} aria-label="닫기" onClick={close} />;
```

## 이름

```tsx
<IconButton icon={<XMarkIcon />} aria-label="닫기" />     // 가장 우선
<IconButton icon={<TrashIcon title="휴지통으로" />} />      // 아이콘의 title, aria-label 이 그다음
<IconButton icon={<PlusIcon />} />                          // 컴포넌트 이름: "Plus"
<IconButton icon={<PlusIcon />} aria-labelledby="title" />  // aria-labelledby, title 이 있으면 찾지 않는다
```

- 컴포넌트 이름은 `displayName` 을 먼저 보고, 없으면 `Icon` 으로 끝나는 함수 이름을 봅니다. `ChevronDownIcon` 은 "Chevron down", lucide 의 `ArrowUpRight` 는 "Arrow up right" 가 됩니다.
- 자동 이름은 영어입니다. 화면이 한국어면 `aria-label` 을 한국어로 줍니다.
- 이름을 찾지 못하면 개발 모드에서 콘솔에 경고합니다.

## 로딩

```tsx
<IconButton
  icon={saving ? <Spinner decorative /> : <CheckIcon />} // 스피너가 아이콘 크기로 들어간다
  disabled={saving}
  focusableWhenDisabled // 누른 버튼이 포커스를 지킨다
  aria-busy={saving}
  aria-label={saving ? '저장 중' : '저장'}
/>
```

## asChild

```tsx
<IconButton asChild aria-label="GitHub">
  <a href="https://github.com/gsainfoteam">
    <GitHubIcon />                                          {/* 링크 안의 아이콘을 그대로 쓴다 */}
  </a>
</IconButton>

<IconButton asChild icon={<ArrowTopRightOnSquareIcon />}>
  <a href="/docs" aria-label="문서 열기" />                {/* icon 을 주면 링크의 내용이 된다 */}
</IconButton>
```

- 링크에 직접 쓴 `aria-label` 도 이름으로 칩니다.

## 크기, variant, colorScheme

```tsx
<IconButton icon={<PlusIcon />} aria-label="추가" />                        // ghost, standard (기본)
<IconButton icon={<PlusIcon />} aria-label="추가" variant="outline" size="tiny" />
<IconButton icon={<TrashIcon />} aria-label="삭제" colorScheme="danger" />  // 아이콘만 danger 색
```

- 크기를 주지 않은 아이콘은 `standard` 16px, `tiny` 14px 입니다.
- `ButtonGroup` 안에서는 그룹의 `size` 를 따르고, 직접 준 `size` 가 이깁니다.

## 상태

```tsx
<IconButton
  aria-label="좋아요"
  icon={(state) => (state.hovered ? <HeartIcon /> : <HeartOutlineIcon />)}
/>
```

- `icon` 과 `aria-label` 도 상태를 받는 함수가 됩니다. 상태와 `data-*` 는 Button 과 같습니다.

## 속성

| 속성                    | 기본 / 동작                                                             |
| ----------------------- | ----------------------------------------------------------------------- |
| `icon`                  | 필수. `asChild` 면 생략하고 자식 안에 둘 수 있다                        |
| `aria-label`            | 생략하면 아이콘에서 찾는다                                              |
| `variant`               | `ghost`(기본) / `solid` / `soft` / `outline`                            |
| `colorScheme`           | `primary`(기본) / `neutral` / `danger` / `success` / `warning` / `info` |
| `size`                  | `standard`(36px, 기본) / `tiny`(32px). 그룹 안에서는 그룹 크기          |
| `asChild`               | 자식 요소 하나를 정사각형 버튼으로 그린다                               |
| `focusableWhenDisabled` | 비활성이어도 포커스와 탭 순서를 지킨다                                  |
| 그 외                   | Button 과 같다                                                          |

## 알아둘 것

- 함수 이름에서 찾은 이름은 production 빌드에서 사라질 수 있습니다. Vite 같은 번들러의 minifier 가 `PlusIcon` 을 `jt` 같은 이름으로 바꾸기 때문입니다. 그때는 이름을 붙이지 않습니다. 배포하는 화면의 버튼에는 `aria-label` 을 주거나 `displayName` 이 있는 아이콘을 씁니다. 개발 모드에서 처음 한 번 알려 줍니다.
- 글자가 필요하면 Button 에 아이콘과 글자를 함께 넣습니다.
- children 을 넘기면 에러가 납니다. 아이콘은 `icon` 으로 줍니다.
