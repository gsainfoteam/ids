# SegmentedControl

트랙 위에 칸을 나란히 놓고 그중 하나를 고르는 값 입력입니다. 보기 방식(목록, 격자), 차트 단위(일, 주, 월)처럼 선택지가 두세 개이고 바로 보여야 할 때 씁니다.

- **패널을 오가면 `Tabs variant="segmented"`.** 같은 트랙과 칸으로 그리면서 `tablist`, `tab`, `tabpanel` 과 `aria-controls` 를 이어 줍니다. 로그인 방법처럼 고른 모드마다 다른 내용을 보여 줄 때 씁니다. SegmentedControl 은 값(차트 단위, 보기 방식)을 고르는 `radiogroup` 입니다.
- **선택지가 많거나 길면** `RadioGroup` 이나 `Select` 가 낫습니다. 여러 개를 고르면 `ToggleGroup selectionMode="multiple"` 입니다.
- **native 라디오 그대로.** 칸마다 같은 `name` 의 `<input type="radio">` 가 있어 키보드, `required`, 폼 초기화, react-hook-form 이 RadioGroup 과 같습니다.
- **타입이 좁혀진 항목.** 렌더 함수의 `Item` 은 `value` 가 컨트롤의 타입으로 좁혀집니다.

```tsx
import { SegmentedControl } from '@gsainfoteam/ids-react';

type Period = 'day' | 'week' | 'month';

<SegmentedControl<Period> value={period} onValueChange={setPeriod} aria-label="기간">
  {({ Item }) => (
    <>
      <Item value="day">일</Item>
      <Item value="week">주</Item>
      <Item value="month">월</Item>
    </>
  )}
</SegmentedControl>;
```

## 항목

```tsx
<SegmentedControl defaultValue="list" aria-label="보기">
  <SegmentedControl.Item value="list">
    <Bars3Icon />
    목록
  </SegmentedControl.Item>
  <SegmentedControl.Item value="grid" aria-label="격자">   {/* 아이콘만 있으면 이름을 준다 */}
    <Squares2X2Icon />
  </SegmentedControl.Item>
  <SegmentedControl.Item value="calendar" disabled>달력</SegmentedControl.Item>
</SegmentedControl>
```

- 자식은 `SegmentedControl.Item` 만 둡니다. 다른 요소가 있으면 개발 모드에서 콘솔에 알립니다. Fragment 와 `false` 같은 빈 자리는 괜찮습니다.
- 칸의 글자와 아이콘은 Item 의 children 입니다. Item 은 `<label>` 이라 칸 어디를 눌러도 고릅니다.
- `aria-label`, `onChange`, `onFocus` 같은 그 밖의 속성은 Item 안의 라디오로 갑니다. `className`, `style` 은 칸(`<label>`)으로 갑니다.
- 컨트롤 안에 컨트롤을 넣지 않습니다. `variant` 도 없습니다. 모양은 하나입니다.

## 값

```tsx
<SegmentedControl defaultValue="week" />                     // 비제어
<SegmentedControl value={period} onValueChange={setPeriod} /> // 제어
<SegmentedControl value={null} />                            // 제어, 아무 칸도 고르지 않음
```

- `onValueChange` 는 사용자가 고를 때만 불립니다. 부모가 바꾼 값이나 폼 초기화는 알리지 않습니다.
- 한 번 고르면 선택을 비울 수 없습니다. native 라디오 그룹과 같습니다.

## 키보드

| 키           | 동작                                           |
| ------------ | ---------------------------------------------- |
| `Tab`        | 고른 칸으로 들어간다. 없으면 첫 칸             |
| `→` `↓`      | 다음 칸으로 옮기면서 고른다. 끝에서 처음으로   |
| `←` `↑`      | 이전 칸으로 옮기면서 고른다                    |
| `Home` `End` | 처음 / 마지막 칸으로 옮기면서 고른다           |
| `Space`      | 포커스된 칸을 고른다                           |

- 비활성 칸은 어느 키로도 건너뜁니다.
- `readOnly` 면 포커스만 옮겨지고 선택은 그대로입니다.

## 크기

```tsx
<SegmentedControl size="tiny" />              // standard(기본) / tiny. 생략하면 Field 를 따른다
<SegmentedControl orientation="vertical" />   // horizontal(기본) / vertical. aria-orientation 도 붙는다
```

- 가로 트랙은 칸 내용 폭만큼만 차지하고, 세로 트랙은 부모 폭을 채웁니다.
- 트랙은 다른 컨트롤과 같은 높이입니다. 칸이 8px 낮고 트랙이 `concentric-p-1` 로 둘러쌉니다.

## 모양

- 모양은 segmented `Tabs` 와 같습니다. 트랙은 `bg-neutral-soft`, 고른 칸은 `bg-segment` 카드에 `shadow-xs` 입니다. 카드는 밝은 모드에서 `bg-base`, 어두운 모드에서 트랙보다 한 단계 밝은 `bg-neutral` 입니다.
- 글자는 고르지 않은 칸이 `text-neutral`, 고른 칸이 `text-neutral-strong` 입니다.
- 고르지 않은 칸의 hover 와 press 는 state layer 입니다. 글자색은 바뀌지 않습니다.
- 키보드 포커스는 칸에 ring 을 그립니다. `aria-invalid` 면 트랙에 `border-danger-strong` 테두리가 붙습니다.

## 상태

```tsx
<SegmentedControl value={period} onValueChange={setPeriod} />  // 고른 칸은 value 로 읽는다
```

- 고른 값은 `value` 와 `onValueChange` 로 읽습니다. 비제어여도 `onValueChange` 가 새 값을 알립니다.
- `disabled`, `readOnly`, `required`, `aria-invalid`, `size`, `orientation` 은 앱이 넘긴 속성이라 앱이 이미 압니다.
- 칸의 hover, press, 키보드 포커스는 읽을 방법이 없습니다. `className` 과 `style` 은 상태 함수를 받지 않습니다.

## 폼

```tsx
<form>
  <Field required>
    <Field.Label>기간</Field.Label>
    <SegmentedControl<Period> name="period" defaultValue="week">   {/* FormData: period=week */}
      {({ Item }) => ...}
    </SegmentedControl>
  </Field>
  <button type="reset">초기화</button>                              {/* defaultValue 로 돌아간다 */}
</form>
```

- 필수 검사는 native 라디오가 합니다. 아무 칸도 고르지 않으면 FormData 에 항목이 없습니다.
- `name` 을 주지 않으면 컨트롤이 하나 만듭니다. 폼으로 제출하려면 `name` 을 줍니다.

## react-hook-form

```tsx
import { Field } from '@gsainfoteam/ids-react/react-hook-form';

<Field name="period" controlMode="value" registerOptions={{ required: '기간을 고르세요.' }}>
  <Field.Label>기간</Field.Label>
  <SegmentedControl<Period>>{({ Item }) => ...}</SegmentedControl>
  <Field.Error />
</Field>
```

- `ref` 는 루트 `<fieldset>` 입니다. `focus()` 를 부르면 고른 칸, 없으면 첫 칸으로 포커스가 갑니다. react-hook-form 이 오류 때 부르는 것도 이 `focus()` 입니다.

## 속성

| 속성                     | 기본 / 동작                                           |
| ------------------------ | ----------------------------------------------------- |
| `value` / `defaultValue` | 고른 값, 없으면 `null`                                |
| `onValueChange`          | 사용자가 고를 때                                      |
| `name` / `form`          | 칸의 라디오가 함께 쓰는 이름과 `form` 속성            |
| `size`                   | `standard`(기본) / `tiny`                             |
| `orientation`            | `horizontal`(기본) / `vertical`                       |
| `disabled`               | 모든 칸 비활성                                        |
| `readOnly`               | 선택을 바꿀 수 없다                                   |
| `required`               | 하나를 골라야 제출된다                                |
| `aria-invalid` | 오류 표시(danger 색). Field 안이면 Field 가 넘긴다 |
| `children`               | `({ Item }) => ReactNode` 또는 `SegmentedControl.Item` 들 |
| 그 외 속성               | 루트로 간다 (`id`, `aria-label`, `className` 등)      |

`SegmentedControl.Item` 은 `value`, `disabled`, `children`, `className`, `style` 을 받고, 나머지는 안의 라디오로 갑니다.

## 알아둘 것

- 루트는 `<fieldset role="radiogroup">` 이고 `tabIndex={-1}` 입니다. Tab 순서에는 들어가지 않고, 포커스를 받으면 칸으로 넘깁니다.
- 한 컨트롤에 같은 `value` 를 두 번 쓰지 않습니다. 둘 다 고른 것처럼 보입니다.
- 이름은 `aria-label` 이나 `Field.Label` 로 줍니다.
