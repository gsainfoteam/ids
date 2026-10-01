# Tabs

한 자리에서 관련된 내용을 여러 패널로 나누고, 한 번에 한 패널만 보여 줍니다. 설정 페이지의 분류, 상품 상세의 정보, 리뷰, Q&A 같은 곳에 씁니다.

- **구조가 곧 접근성.** 목록은 `tablist`, 탭은 `tab`, 내용은 `tabpanel` 입니다. `aria-selected`, `aria-controls`, `aria-labelledby` 는 같은 `value` 로 알아서 이어집니다.
- **키보드 한 번에 한 칸.** 탭 목록 전체가 Tab 한 칸이고 고른 탭에 멈춥니다. 안에서는 화살표, Home, End 로 옮기고, 끝에서 처음으로 돌아가며, 비활성 탭은 건너뜁니다.
- **자동과 수동.** 기본은 화살표로 옮기면 바로 고릅니다. `activationMode="manual"` 이면 Enter 나 Space 로 고릅니다.
- **타입으로 막는 잘못된 값.** children 을 함수로 쓰면 탭 값의 타입으로 좁힌 `List`, `Trigger`, `Content` 를 받습니다.
- **세 가지 모양.** 선(`underline`), 채움(`pill`), 상자(`enclosed`). `pill` 은 `variant` 로 채움 강도를 고릅니다.

```tsx
import { Tabs } from '@gsainfoteam/ids-react';

<Tabs defaultValue="overview">
  <Tabs.List aria-label="상품 정보">
    <Tabs.Trigger value="overview">개요</Tabs.Trigger>
    <Tabs.Trigger value="reviews">리뷰</Tabs.Trigger>
    <Tabs.Trigger value="qna">Q&A</Tabs.Trigger>
  </Tabs.List>
  <Tabs.Content value="overview">상품 설명</Tabs.Content>
  <Tabs.Content value="reviews">리뷰 목록</Tabs.Content>
  <Tabs.Content value="qna">질문과 답변</Tabs.Content>
</Tabs>;
```

## 값

```tsx
<Tabs defaultValue="overview" />                   // 비제어
<Tabs value={tab} onValueChange={setTab} />        // 제어
<Tabs onValueChange={(tab) => track(tab)} />       // 값이 없으면 첫 번째 활성 탭을 보여 준다
```

- `value` 도 `defaultValue` 도 없으면 첫 번째 활성 탭을 보여 줍니다. 이때 `onValueChange` 는 부르지 않습니다. 서버 HTML 에는 고른 탭이 없으므로 `defaultValue` 를 주는 편이 좋습니다.
- 고른 탭을 다시 눌러도 `onValueChange` 는 불리지 않습니다.

## 타입으로 좁힌 파트

```tsx
type Section = 'docs' | 'api';
const [section, setSection] = useState<Section>('docs');

<Tabs value={section} onValueChange={setSection}>  {/* T 는 value 에서 추론 */}
  {({ List, Trigger, Content }) => (
    <>
      <List aria-label="문서">
        <Trigger value="docs">문서</Trigger>
        <Trigger value="api">API</Trigger>
        {/* <Trigger value="xyz" /> 는 컴파일 오류 */}
      </List>
      <Content value="docs">...</Content>
      <Content value="api">...</Content>
    </>
  )}
</Tabs>

<Tabs<Section> defaultValue="docs">...</Tabs>       {/* 비제어면 타입을 직접 적는다 */}
```

- `defaultValue` 에서는 타입을 추론하지 않습니다. `"docs"` 한 값으로 좁혀져 나머지 탭이 오류가 나기 때문입니다.
- `Tabs.List`, `Tabs.Trigger`, `Tabs.Content` 를 그대로 써도 됩니다. 이때 `value` 는 `string` 입니다.

## 키보드

| 키              | 동작                                                                  |
| --------------- | --------------------------------------------------------------------- |
| `Tab`           | 고른 탭으로. 목록 안에서 한 번 더 누르면 고른 내용(`tabpanel`)으로    |
| `→` `←`         | 다음, 이전 탭 (가로). `automatic` 이면 함께 고른다                    |
| `↓` `↑`         | 다음, 이전 탭 (세로). `automatic` 이면 함께 고른다                    |
| `Home` `End`    | 처음, 끝 탭                                                           |
| `Enter` `Space` | 포커스한 탭을 고른다 (`manual` 에서 쓴다)                             |

- 끝에서 처음으로 돌아갑니다. `loop={false}` 면 끝에서 멈춥니다.
- 비활성 탭(`disabled`)과 `inert` 나 CSS 로 숨겨 포커스를 받을 수 없는 탭은 건너뜁니다.
- 가로 탭은 좌우 화살표만, 세로 탭은 위아래 화살표만 가로챕니다. 다른 방향 화살표와 수식 키를 누른 화살표는 브라우저에 맡깁니다.
- 오른쪽에서 왼쪽으로 쓰는 화면에서는 `←` 와 `→` 가 바뀝니다.
- `manual` 에서 화살표로 옮기고 고르지 않은 채 목록을 나갔다 돌아오면 고른 탭으로 돌아옵니다.

## 모양

```tsx
<Tabs appearance="underline" />                  // 기본. 고른 탭 아래 accent 선
<Tabs appearance="pill" variant="soft" />        // 고른 탭을 채운다. variant 기본은 soft
<Tabs appearance="enclosed" />                   // 고른 탭이 내용 쪽으로 열린 상자
<Tabs orientation="vertical" />                  // 목록이 앞에, 내용이 옆에
<Tabs size="tiny" />                             // standard(기본) / tiny
```

- `variant` 는 `pill` 에서만 받습니다(`ghost` `outline` `soft` `solid` `glossy`). 다른 모양에 주면 타입 오류입니다.
- 고르지 않은 탭은 흐린 글자(`on-muted`), 고른 탭은 본문 글자(`on-surface`)입니다. `pill` 의 `soft` 는 `secondary`, `solid` 와 `glossy` 는 `primary` 로 채웁니다.
- `enclosed` 의 고른 탭은 `surface` 로 칠해 목록 선을 덮습니다. `surface` 가 아닌 배경 위에서는 탭 색을 `className` 으로 맞춥니다.
- 탭을 목록 폭에 나눠 채우려면 `Tabs.List` 에 `w-full`, 각 `Tabs.Trigger` 에 `flex-1` 을 줍니다.

```tsx
<Tabs.Trigger value="profile">
  <UserIcon />       {/* 아이콘은 크기에 맞춰진다 */}
  프로필
</Tabs.Trigger>
```

## 내용 남겨 두기

```tsx
<Tabs.Content value="write" forceMount>  {/* 고르지 않아도 숨긴 채 남는다 */}
  <TextField aria-label="댓글" />
</Tabs.Content>
```

- 고르지 않은 `Tabs.Content` 는 기본으로 그리지 않습니다. 탭을 옮기면 안의 상태가 사라집니다.
- `forceMount` 면 `hidden="until-found"` 로 숨긴 채 남아 입력값과 스크롤이 그대로 있습니다. 브라우저의 페이지 안 찾기가 숨은 글을 찾으면 그 탭을 고릅니다(Chromium).
- 탭의 `aria-controls` 는 그려진 내용만 가리킵니다. 고른 탭과 `forceMount` 인 탭입니다.

## 상태

```tsx
<Tabs.Trigger value="a" className={({ selected }) => (selected ? 'font-semibold' : '')}>
  {({ selected }) => (selected ? '보는 중' : '보기')}
</Tabs.Trigger>
```

- `Tabs.Trigger` 와 `Tabs.Content` 의 `className`, `style`, `children` 은 상태 함수를 받습니다. Trigger 는 `selected` 와 `hovered`, `focusVisible` 같은 상호작용 상태, Content 는 `selected` 를 줍니다.
- `Tabs` 의 `className` 과 `style` 은 `value`, `orientation`, `appearance`, `size` 를 받습니다. `Tabs` 의 함수 children 은 상태가 아니라 파트를 받습니다.
- `data-selected` 가 고른 탭과 내용에, `data-orientation` 이 모든 파트에 붙습니다. 루트에는 `data-appearance`, `data-variant`(pill), `data-size`, `data-activation-mode` 가 붙습니다.

## 속성

| 속성                     | 기본 / 동작                                                      |
| ------------------------ | ---------------------------------------------------------------- |
| `value` / `defaultValue` | 고른 탭의 값. 없으면 첫 번째 활성 탭                             |
| `onValueChange`          | 탭을 고를 때 새 값으로                                           |
| `appearance`             | `underline`(기본) / `pill` / `enclosed`                          |
| `variant`                | `pill` 에서만. `soft`(기본) / `ghost` / `outline` / `solid` / `glossy` |
| `orientation`            | `horizontal`(기본) / `vertical`                                  |
| `activationMode`         | `automatic`(기본) / `manual`                                     |
| `loop`                   | `true`. 화살표가 끝에서 처음으로 돌아간다                        |
| `size`                   | `standard`(기본) / `tiny`                                        |
| `Tabs.List`              | `tablist`. 이름은 `aria-label` 로 준다                           |
| `Tabs.Trigger`           | `value`(필수), `disabled`                                        |
| `Tabs.Content`           | `value`(필수), `forceMount`                                      |

## 알아둘 것

- 내용이 없는 탭, 탭이 없는 내용, 어느 탭과도 맞지 않는 `value` 는 개발 모드에서 콘솔에 경고합니다.
- 비활성 탭은 포커스를 받지 않습니다. APG 는 비활성 탭에 포커스를 허용하지만, IDS 의 다른 roving 그룹과 같이 건너뜁니다.
- 탭이 많아 목록이 넘쳐도 스크롤하지 않습니다. 좁은 화면에서는 탭 수를 줄이거나 `size="tiny"` 를 씁니다.
- Tabs 안에 Tabs 를 두어도 화살표는 각자의 목록 안에서만 움직입니다.
