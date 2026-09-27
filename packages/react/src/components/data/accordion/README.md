# Accordion

FAQ나 설정 목록처럼 여러 섹션을 접고 펼치는 목록입니다.

- **구조가 곧 접근성.** 헤더는 `heading` 안의 `button`, 내용은 헤더 이름을 가진 `region` 입니다. `aria-expanded`, `aria-controls`, `aria-labelledby` 는 알아서 이어집니다.
- **키보드.** WAI-ARIA APG 그대로 `↑` `↓` 로 헤더를 오가고 `Home` `End` 로 끝까지 갑니다. 비활성 헤더는 건너뜁니다.
- **높이 애니메이션.** 내용을 재지 않고 내용 높이만큼 펼치고 접습니다. 움직임 줄이기 설정이면 바로 열리고 닫힙니다.
- **페이지 내 찾기.** 닫힌 섹션의 글도 `⌘F` 로 찾히고, 찾으면 그 섹션이 열립니다.
- **포커스 보존.** 포커스가 있던 섹션이 닫히면 포커스가 그 헤더로 돌아옵니다.
- **기본 chevron.** `Accordion.Indicator` 를 생략해도 헤더 끝에 chevron이 붙고, 열리면 뒤집힙니다.

```tsx
import { Accordion } from '@gsainfoteam/ids-react';

<Accordion type="single" defaultValue="shipping">
  <Accordion.Item value="shipping">
    <Accordion.Trigger>배송은 얼마나 걸리나요?</Accordion.Trigger>
    <Accordion.Content>일반 배송 2~3일, 빠른 배송 1일.</Accordion.Content>
  </Accordion.Item>
  <Accordion.Item value="returns">
    <Accordion.Trigger>반품이 가능한가요?</Accordion.Trigger>
    <Accordion.Content>구매 후 14일 안에 반품할 수 있습니다.</Accordion.Content>
  </Accordion.Item>
</Accordion>;
```

## type

```tsx
<Accordion type="single">                       {/* 하나만 연다. 열린 섹션을 다시 누르면 닫힌다 */}
<Accordion type="single" collapsible={false}>   {/* 항상 하나는 열려 있다 */}
<Accordion type="multiple">                     {/* 여러 섹션을 함께 연다 */}
```

- `collapsible={false}` 면 열린 섹션의 헤더에 `aria-disabled="true"` 가 붙습니다. 눌러도 닫히지 않지만 포커스는 받아서 화살표 키로 지나갈 수 있습니다.

## 값

```tsx
<Accordion type="single" defaultValue="shipping" />                    // 비제어
<Accordion type="single" value={open} onValueChange={setOpen} />       // 제어. 모두 닫히면 null
<Accordion type="multiple" value={opened} onValueChange={setOpened} /> // 제어. 값은 배열

type FaqId = 'shipping' | 'returns';
<Accordion<FaqId> type="single" onValueChange={(id) => track(id)} />  // id: FaqId | null
```

- 제어 모드에서는 바깥 버튼으로 한꺼번에 열고 닫을 수 있습니다: `setOpened([])`.

## 헤더 꾸미기

```tsx
<Accordion.Trigger>
  <UserIcon />                       {/* Indicator보다 앞은 앞에 놓인다 */}
  프로필 설정
  <Chip size="tiny">2</Chip>
</Accordion.Trigger>                 {/* Indicator를 생략하면 끝에 chevron */}

<Accordion.Trigger>
  <Accordion.Indicator />            {/* 앞에 두면 앞에 chevron */}
  src
</Accordion.Trigger>

<Accordion.Trigger>
  회원 혜택
  <Accordion.Indicator className="rotate-0!">
    {(item) => (item.open ? <MinusIcon /> : <PlusIcon />)}
  </Accordion.Indicator>
</Accordion.Trigger>
```

- 기본 chevron은 열리면 180도 돕니다. 회전을 바꾸려면 `data-open:` 으로 덮어씁니다: `className="-rotate-90 data-open:rotate-0"`.
- `Accordion.Item`, `Trigger`, `Content`, `Indicator` 의 `className`, `style`, `children` 은 섹션 상태를 받는 함수도 됩니다.

## 키보드

| 키                | 동작                                      |
| ----------------- | ----------------------------------------- |
| `Tab`             | 다음 헤더, 또는 열린 내용 안의 컨트롤     |
| `Enter` / `Space` | 섹션 열기, 닫기                           |
| `↓` / `↑`         | 다음, 이전 헤더. 끝에서는 반대쪽으로 간다 |
| `Home` / `End`    | 처음, 마지막 헤더                         |

- 비활성 헤더는 건너뜁니다.
- 아코디언 안에 아코디언을 두면 화살표 키는 각자의 헤더 사이에서만 움직입니다.

## variant와 크기

```tsx
<Accordion variant="outline" />  // 기본. 섹션 사이에 구분선
<Accordion variant="soft" />      // 섹션마다 옅은 배경의 블록
<Accordion variant="ghost" />     // 구분선 없음. 헤더에 hover 배경
<Accordion size="tiny" />         // standard(기본) / tiny
<Accordion disabled />            // 모든 섹션 비활성
<Accordion.Item disabled />       // 섹션 하나만 비활성
```

## 상태와 data 속성

| 요소        | 속성                                                                             |
| ----------- | -------------------------------------------------------------------------------- |
| 루트        | `data-accordion`, `data-variant`, `data-size`, `data-disabled`                   |
| `Item`      | `data-state="open \| closed"`, `data-open`, `data-disabled`                      |
| `Trigger`   | `data-state`, `data-open`, `data-disabled`, `data-hovered`, `data-focus-visible` |
| `Content`   | `data-state`, `data-open`                                                        |
| `Indicator` | `data-state`, `data-open`                                                        |

함수로 받는 상태는 `{ value, open, disabled }` 이고, `Trigger` 는 `hovered`, `focusVisible` 같은 인터랙션 상태도 함께 받습니다.

## 속성

| 속성                     | 기본 / 동작                                            |
| ------------------------ | ------------------------------------------------------ |
| `type`                   | 필수. `single` / `multiple`                            |
| `value` / `defaultValue` | `single` 은 `string \| null`, `multiple` 은 `string[]` |
| `onValueChange`          | 열린 섹션이 바뀔 때                                    |
| `collapsible`            | `single` 에서만. 기본 `true`                           |
| `disabled`               | 모든 섹션 비활성                                       |
| `variant`                | `outline`(기본) / `soft` / `ghost`                     |
| `size`                   | `standard`(기본) / `tiny`                              |
| `headingLevel`           | 헤더를 감싸는 heading 수준. 기본 `3`                   |
| `Item.value`             | 필수. 섹션을 가리키는 문자열                           |
| `Item.disabled`          | 그 섹션만 비활성                                       |
| `Indicator.asChild`      | 기본 `span` 대신 자식 요소에 속성을 합친다             |
| 그 외                    | 각 부분의 native 속성. `Trigger` 는 `button` 으로 간다 |

## 알아둘 것

- 닫힌 내용도 DOM에 남습니다. `aria-controls` 가 가리킬 곳이 있어야 하기 때문입니다. 닫힌 동안은 `hidden="until-found"` 라 보이지도 읽히지도 않지만 페이지 내 찾기에는 걸립니다.
- 비활성 섹션의 닫힌 내용은 페이지 내 찾기에도 걸리지 않습니다.
- `Accordion.Content` 의 `className` 과 `style` 은 안쪽 본문으로 갑니다. 바깥 요소는 높이 애니메이션을 맡습니다.
- 제네릭은 루트의 `value`, `defaultValue`, `onValueChange` 에만 걸립니다. `Accordion.Item` 의 `value` 는 `string` 입니다.
