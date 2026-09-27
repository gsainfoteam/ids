# Button

누르면 명령을 실행하는 버튼입니다.

- **실수로 제출하지 않음.** `type` 을 생략하면 `button` 이라 폼 안에 두어도 폼을 제출하지 않습니다.
- **강도는 variant, 의미는 colorScheme.** `danger` 같은 색은 `variant` 와 따로 고르고, `solid` `soft` `outline` `ghost` 가 모두 그 색을 따릅니다. 포커스 링도 같은 색입니다.
- **로딩은 합성.** `disabled` 와 `<Spinner />` 를 넣으면 스피너가 아이콘 자리에 아이콘 크기로 들어가고, `focusableWhenDisabled` 를 켜면 누른 버튼이 로딩 중에도 포커스를 지킵니다.
- **asChild.** 링크나 라우터 `Link` 를 버튼 모양으로 그립니다. 링크는 링크로 남고, 비활성이면 이동하지 않습니다.
- **상태 기반 스타일.** hover, active, focus-visible 이 `data-*` 로 붙고, `className` `style` `children` 은 상태를 받는 함수도 됩니다.
- **그룹.** `ButtonGroup` 안에서는 그룹의 `size` 를 따르고, 버튼에 직접 준 `size` 가 이깁니다.

```tsx
import { Button } from '@gsainfoteam/ids-react';

<Button onClick={save}>저장</Button>;
```

## variant 와 colorScheme

```tsx
<Button>저장</Button>                                       // solid, primary (기본)
<Button variant="soft">임시 저장</Button>
<Button variant="outline">취소</Button>                     // primary 의 outline, ghost 는 무채색
<Button variant="ghost">더보기</Button>
<Button colorScheme="danger">삭제</Button>                  // 색만 바뀐다
<Button colorScheme="danger" variant="ghost">삭제</Button>  // 글자만 danger, 올리면 옅은 danger
<Button colorScheme="neutral">계속</Button>                 // 검은 버튼. 다크 모드에서는 흰 버튼
```

| colorScheme                         | solid        | soft         | outline, ghost |
| ----------------------------------- | ------------ | ------------ | -------------- |
| `primary` (기본)                    | 테마 색 채움 | 옅은 테마 색 | 무채색         |
| `neutral`                           | 글자색 채움  | 옅은 회색    | 무채색         |
| `danger` `success` `warning` `info` | 상태 색 채움 | 옅은 상태 색 | 글자만 상태 색 |

- 상태 색에서는 포커스 링과 포커스된 테두리도 그 색입니다. `primary` 와 `neutral` 은 테마 색 링입니다.
- 옅은 배경 위의 글자는 상태 색의 진한 단계(`*-strong`)라 밝은 노랑 `warning` 도 읽힙니다.

## 아이콘

```tsx
<Button>
  <PlusIcon />        {/* 앞에 둔 아이콘: 그쪽 안쪽 여백이 줄어든다 */}
  새 글
</Button>

<Button>
  다음
  <ArrowRightIcon />  {/* 뒤에 둔 아이콘: 그쪽 안쪽 여백이 줄어든다 */}
</Button>
```

- 크기를 주지 않은 아이콘은 버튼 크기를 따릅니다. `standard` 16px, `tiny` 14px.
- 아이콘만 있는 버튼은 `IconButton` 을 씁니다. 정사각형이 되고 아이콘에서 이름을 찾습니다.

## 로딩

```tsx
<Button disabled={saving} focusableWhenDisabled aria-busy={saving} onClick={save}>
  {saving && <Spinner decorative />} {/* 아이콘 자리에 아이콘 크기로 들어간다 */}
  {saving ? '저장 중' : '저장'}
</Button>
```

- `loading` prop 은 없습니다. 문구와 스피너 위치를 직접 고릅니다.
- `focusableWhenDisabled` 를 켜면 `disabled` 속성 대신 `aria-disabled` 가 붙습니다. 포커스와 탭 순서는 그대로 두고 클릭, Enter, Space, 폼 제출만 막습니다.
- `aria-busy` 가 참이면 커서가 금지 표시 대신 진행 중 표시가 됩니다.
- 문구가 이미 "저장 중" 이라고 말하므로 Spinner 는 `decorative` 로 둡니다.
- 문구가 바뀌면서 너비가 흔들리면 `className="min-w-24"` 처럼 최소 너비를 줍니다.

## asChild

```tsx
<Button asChild>
  <a href="/docs">문서 보기</a>        {/* <a> 가 버튼 모양이 된다. 역할은 링크 그대로 */}
</Button>

<Button asChild variant="outline">
  <Link href="/settings">설정</Link>   {/* 라우터 Link 도 된다. props 와 ref 를 전달해야 한다 */}
</Button>

<Button asChild disabled>
  <a href="/docs">준비 중</a>           {/* href 를 떼고 탭 순서에서 빼며 클릭을 막는다 */}
</Button>
```

- 자식의 `onClick` 이 먼저 돌고, 자식이 `preventDefault` 하면 Button 의 `onClick` 은 돌지 않습니다.
- 자식의 `className` 과 `style` 이 마지막에 붙어 이깁니다.
- `<a>` 와 `<button>` 이 아닌 요소(`span`, `div`)는 `role="button"` 과 `tabIndex={0}` 을 받고 Enter 와 Space 로 눌립니다.
- 라우터 `Link` 처럼 무엇을 그릴지 모르는 컴포넌트는 비활성이어도 `href` 를 떼지 않고 클릭만 막습니다.

## 키보드

| 키      | 동작                                                                    |
| ------- | ----------------------------------------------------------------------- |
| `Enter` | 누른다                                                                  |
| `Space` | 뗄 때 누른다. 누르고 있는 동안 화면이 스크롤되지 않는다                 |
| `Tab`   | 다음 요소로. 비활성 버튼은 건너뛴다 (`focusableWhenDisabled` 면 남는다) |

## 상태

```tsx
<Button
  variant={(state) => (state.hovered ? 'solid' : 'outline')}
  className={(state) => (state.focusVisible ? 'ring-2' : undefined)}
>
  {(state) => (state.active ? '누르는 중' : '저장')}
</Button>
```

| 상태           | data 속성            | 뜻                                 |
| -------------- | -------------------- | ---------------------------------- |
| `hovered`      | `data-hovered`       | 마우스가 올라가 있다               |
| `active`       | `data-active`        | 누르고 있다 (포인터, Enter, Space) |
| `focused`      | `data-focused`       | 포커스가 있다                      |
| `focusVisible` | `data-focus-visible` | 키보드로 포커스했다                |
| `disabled`     | `data-disabled`      | 비활성                             |

- `data-hovered` 와 `data-active` 는 한 번에 하나만 붙고 `active` 가 앞섭니다. 같은 배경을 두고 다투지 않게 하기 위해서입니다.
- 루트에는 `data-variant` 와 `data-size` 도 붙습니다.
- `onInteractionChange(state)` 는 상태를 부모에 알려 줄 뿐 제어 prop 이 아닙니다.

## 폼

```tsx
<form onSubmit={submit}>
  <Button variant="outline" onClick={preview}>
    미리보기
  </Button>{' '}
  {/* type="button": 제출하지 않는다 */}
  <Button type="submit">제출</Button>
</form>
```

- `form`, `formAction`, `name`, `value` 는 native 속성 그대로입니다.

## 속성

| 속성                           | 기본 / 동작                                                             |
| ------------------------------ | ----------------------------------------------------------------------- |
| `variant`                      | `solid`(기본) / `soft` / `outline` / `ghost`                            |
| `colorScheme`                  | `primary`(기본) / `neutral` / `danger` / `success` / `warning` / `info` |
| `size`                         | `standard`(36px, 기본) / `tiny`(32px). 그룹 안에서는 그룹 크기          |
| `type`                         | `button`                                                                |
| `disabled`                     | native `disabled`                                                       |
| `focusableWhenDisabled`        | `false`. 켜면 비활성이어도 포커스와 탭 순서를 지킨다                    |
| `asChild`                      | `false`. 자식 요소 하나를 버튼으로 그린다                               |
| `className` `style` `children` | 값, 또는 상태를 받는 함수                                               |
| `onInteractionChange`          | 상호작용 상태가 바뀔 때                                                 |
| `ref`                          | 실제 `button`. `asChild` 면 자식 요소                                   |
| 그 외 native 속성              | `button` 으로 간다                                                      |

## 알아둘 것

- 버튼 안에 버튼을 넣으면 개발 모드에서 콘솔에 경고합니다. 버튼은 버튼을 품을 수 없어서 브라우저가 바깥 버튼을 쪼갭니다. 여러 버튼은 `ButtonGroup` 으로 묶습니다.
- 아이콘만 든 Button 도 개발 모드에서 `IconButton` 을 권합니다.
- hover 는 마우스에서만 붙습니다. 스타일을 덮어쓸 때 `:hover` 대신 `data-hovered` 를 쓰면 터치한 뒤 hover 가 남지 않습니다.
