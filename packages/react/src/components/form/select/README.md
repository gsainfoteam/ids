# Select

목록에서 옵션을 하나 또는 여러 개 고르는 버튼형 필드입니다.

- **WAI-ARIA 키보드.** 포커스는 트리거에 남고 방향키, Home, End, PageUp, PageDown 으로 옵션을 가리킵니다. 글자를 치면 그 글자로 시작하는 옵션으로 가고, 같은 글자를 반복하면 차례로 돕니다.
- **체크 표시.** 고른 옵션 끝에 체크가 붙습니다. 가리킨 옵션은 muted 배경입니다.
- **검색.** `Select.SearchField` 를 넣으면 목록을 거릅니다. 대소문자, 전각, 악센트를 무시하고, 결과가 없으면 스크린 리더에 알립니다.
- **여러 개 선택.** 팝업이 열린 채로 토글되고, 값은 목록 순서로 정렬됩니다. 트리거에는 `사과, 체리 +2` 처럼 보입니다.
- **폼.** `name` 으로 값마다 hidden input 이 생기고, `required` 는 브라우저 검증이 막습니다. `<button type="reset">` 은 `defaultValue` 로 되돌립니다.
- **팝업.** 아래 공간이 모자라면 위로 열리고, 트리거가 보이는 동안은 화면 밖으로 나가지 않습니다. 열면 선택한 옵션이 가운데로 스크롤됩니다. 좁은 화면에서는 모달 하단 시트로 열 수 있습니다.

```tsx
import { Field, Select } from '@gsainfoteam/ids-react';

<Field>
  <Field.Label>과일</Field.Label>
  <Select name="fruit" placeholder="과일을 고르세요">
    <Select.Item value="apple">사과</Select.Item>
    <Select.Item value="cherry">체리</Select.Item>
  </Select>
</Field>;
```

## 값

```tsx
<Select defaultValue="apple">{items}</Select>                   // 비제어

<Select value={fruit} onValueChange={setFruit}>{items}</Select>  // 제어. 선택 없음은 null

// 여러 개는 string[]. 선택 없음은 []
<Select selectionMode="multiple" value={fruits} onValueChange={setFruits}>
  {items}
</Select>
```

- 옵션 사이를 오가기만 해서는 값이 바뀌지 않습니다. `Enter`, `Space`, 클릭으로 골라야 `onValueChange` 가 불립니다.
- 바깥에서 `value` 를 바꿔도 `onValueChange` 는 불리지 않습니다.

## 키보드

| 키                  | 닫혀 있을 때                     | 열려 있을 때                                              |
| ------------------- | -------------------------------- | --------------------------------------------------------- |
| `↓` `↑`             | 열고 선택한 옵션을 가리킨다      | 다음 / 이전 옵션. 끝에서 멈춘다                           |
| `Enter` `Space`     | 열고 선택한 옵션을 가리킨다      | 가리킨 옵션을 고른다. 하나만 고르면 닫힌다                |
| `Home` `End`        | 열고 첫 / 마지막 옵션을 가리킨다 | 첫 / 마지막 옵션. 검색창에서는 글자 편집                  |
| `PageUp` `PageDown` |                                  | 10개씩 이동                                               |
| 글자                | 열고 그 글자로 시작하는 옵션으로 | 그 글자로 시작하는 옵션으로. 같은 글자 반복은 차례로 돈다 |
| `Alt+↑`             |                                  | 가리킨 옵션을 고르고 닫는다                               |
| `Esc`               |                                  | 닫고 트리거로 포커스. 값은 그대로                         |
| `Tab`               |                                  | 닫고 다음 요소로. 가리킨 옵션은 고르지 않는다             |

- 비활성 옵션은 건너뜁니다.
- 빠르게 친 글자는 이어서 찾습니다. `new d` 처럼 중간의 `Space` 도 글자로 칩니다.
- 한글 IME 조합 중인 키는 무시합니다.

## 검색

```tsx
<Select>
  <Select.SearchField placeholder="분야 검색" /> {/* 팝업 맨 위. 열리면 포커스가 여기로 */}
  <Select.Item value="react">React</Select.Item>
  {/* searchValue: 라벨에 없는 검색어도 찾는다 */}
  <Select.Item value="flutter" searchValue="Flutter Dart">
    Flutter
  </Select.Item>
  <Select.Empty>결과 없음</Select.Empty> {/* 생략하면 "검색 결과가 없습니다." */}
</Select>
```

- 검색하면 첫 결과를 가리키고, 구분선은 숨깁니다.
- `Select.Empty` 는 늘 마운트된 live region 이라 결과가 비는 순간 스크린 리더가 읽습니다.
- `Select.SearchField` 는 테두리와 링 없이 아래 선만 그린 `TextField` 입니다. 돋보기나 여백을 눌러도 포커스가 입력에 남고, 받은 속성은 input 으로 갑니다.

## 여러 개 선택과 지우기

```tsx
<Select selectionMode="multiple" defaultValue={['apple', 'cherry']}>
  <Select.Clear />                               {/* 값이 있을 때만 보인다. [] 로 비운다 */}
  {items}
</Select>

<Select defaultValue="apple">
  <Select.Clear aria-label="과일 지우기" />      {/* 하나만 고를 때는 null 로 되돌린다 */}
  {items}
</Select>
```

- 지운 뒤에는 트리거로 포커스가 갑니다. `readOnly` 면 지우기 버튼이 보이지 않습니다.
- `Select.Clear` 는 필드 안의 ghost `IconButton` 입니다. `Tab` 으로 따로 갈 수 있고, 포커스 링도 따로 그립니다. children 은 글리프, `asChild` 면 그릴 버튼입니다.
- 트리거에는 두 개까지 라벨을 보이고 나머지는 `+2` 처럼 셉니다. 라벨이 잘려도 숫자는 잘리지 않습니다.

## 구성

```tsx
<Select defaultValue="kimchi">
  {/* Trigger 를 생략하면 Value + Icon */}
  <Select.Trigger>
    <Select.Value placeholder="없음" />
    <Select.Icon /> {/* 기본은 아래 화살표 */}
  </Select.Trigger>
  {/* Content 를 생략하면 나머지 자식을 감싼다 */}
  <Select.Content className="max-h-60">
    <Select.Group heading="한식">
      <Select.Item value="kimchi">김치찌개</Select.Item>
    </Select.Group>
    <Select.Separator /> {/* 스크린 리더에는 숨긴다 */}
    <Select.Group heading="양식">
      <Select.Item value="pasta">파스타</Select.Item>
      <Select.Item value="risotto" disabled>
        리소토
      </Select.Item>
    </Select.Group>
  </Select.Content>
</Select>
```

- `Item`, `Group` 은 `Content` 나 루트의 자식, 또는 Fragment 안에 둡니다. 다른 컴포넌트 안은 찾지 않습니다.
- `Select.Separator` 는 `decorative` 인 `Divider` 입니다. listbox 에는 옵션과 그룹만 둘 수 있어 스크린 리더에는 숨깁니다.
- `Trigger`, `Clear`, `Content` 는 각각 하나까지입니다. 옵션은 `Content` 안이나 루트 중 한 곳에만 둡니다.
- 모든 part 가 `asChild` 를 받습니다. 자식은 props 와 ref 를 해당 element 에 전달해야 합니다.

## 옵션 직접 그리기

```tsx
<Select.Item
  value="doing"
  label="진행 중"                                 // 트리거와 typeahead 가 쓰는 글자
  className={(item) => (item.selected ? 'font-medium' : undefined)}
>
  <StatusDot />
  진행 중
  <Select.ItemIndicator>                         {/* 두면 기본 체크 대신 이것을 그린다 */}
    <CheckCircleIcon />
  </Select.ItemIndicator>
</Select.Item>

<Select.Trigger>
  <Select.Value>{(value) => `${value.labels.length}개 선택`}</Select.Value>
</Select.Trigger>
```

| Item 상태     | 뜻                            |
| ------------- | ----------------------------- |
| `selected`    | 고른 옵션                     |
| `highlighted` | 키보드나 마우스가 가리킨 옵션 |
| `disabled`    | 고를 수 없는 옵션             |

- Item 의 `className` 과 `children` 은 위 상태를 받는 함수도 됩니다. Value 의 `children` 은 `{ value, labels, placeholder }` 를 받습니다.
- 루트와 Trigger 의 `className` 은 `Select.State` 를 받는 함수도 됩니다.

## 상태와 data 속성

| 요소   | 속성                                                                                                                            |
| ------ | ------------------------------------------------------------------------------------------------------------------------------- |
| 루트   | `data-open`, `data-disabled`, `data-readonly`, `data-invalid`, `data-required`, `data-placeholder`, `data-size`, `data-variant` |
| 트리거 | `data-popup-open`, `data-placeholder`, `data-readonly`                                                                          |
| Item   | `data-selected`, `data-highlighted`, `data-disabled`                                                                            |
| 팝업   | `data-presentation` (`popover` / `drawer`), `data-side` (`top` / `bottom`)                                                      |

## 열림 상태

```tsx
<Select open={open} onOpenChange={setOpen}>{items}</Select>  // 제어
<Select defaultOpen>{items}</Select>                         // 처음부터 열림
```

- `Esc`, 바깥 클릭, 선택으로 닫힐 때도 `onOpenChange(false)` 가 불립니다.
- `disabled` 나 `readOnly` 면 `open` 이어도 열리지 않습니다.

## 팝업

```tsx
<Select mobileVariant="drawer">{items}</Select> // 640px 미만에서 하단 시트
```

- 팝업은 브라우저 top layer 에 떠서 `overflow: hidden` 부모에 잘리지 않고, 테마는 그대로 이어받습니다.
- 폭은 트리거 이상, 최소 240px 입니다. 아래 공간이 모자라면 위로 열리고, 목록을 걸러 높이가 바뀌어도 열린 쪽을 지킵니다. 페이지를 스크롤하면 트리거를 따라가고, 트리거가 화면을 벗어나면 함께 벗어납니다.
- 옵션을 옮겨 다니면 팝업 안만 스크롤하고 문서는 스크롤하지 않습니다.
- 하단 시트는 모달입니다. 배경이 어두워지고 뒤의 페이지는 클릭을 받지 않으며, 배경을 누르면 닫히고 트리거로 포커스가 돌아갑니다. 포커스는 시트 안에 머물고 페이지 스크롤이 잠깁니다. 화면 키보드가 올라오면 그 위로 올라갑니다. 검색창이 없으면 목록이 포커스를 받습니다.

## 폼

```tsx
<form onSubmit={submit}>
  {/* FormData: fruit=apple */}
  <Select name="fruit" required>
    {items}
  </Select>
  {/* FormData: tags=a&tags=b */}
  <Select name="tags" selectionMode="multiple">
    {items}
  </Select>
  <button type="reset">초기화</button> {/* defaultValue 로 */}
</form>
```

- `required` 인데 비어 있으면 브라우저가 제출을 막고, 검증 메시지를 필드에 붙인 뒤 트리거로 포커스를 보냅니다.
- `disabled` 면 제출되지 않고, `readOnly` 면 제출되지만 검증하지 않습니다.
- 초기화는 값을 `defaultValue` 로 되돌리고 `onValueChange` 도 부릅니다.
- `form` 속성으로 바깥 form 에 연결할 수 있습니다.

## react-hook-form, TanStack Form

```tsx
import { Field } from '@gsainfoteam/ids-react/react-hook-form';

const methods = useForm({ defaultValues: { fruit: null, tags: [] } }); // 하나는 null, 여러 개는 []

<Field name="fruit" controlMode="value" registerOptions={{ required: '과일을 고르세요' }}>
  <Field.Label>과일</Field.Label>
  <Select>{items}</Select>
  <Field.Error />                                {/* 오류가 나면 트리거로 포커스 */}
</Field>

<form.Field name="fruit">
  {(field) => <Select value={field.state.value} onValueChange={field.handleChange}>{items}</Select>}
</form.Field>
```

## 크기와 variant

```tsx
<Select variant="soft" />   // outline(기본) / soft / ghost
<Select size="tiny" />      // standard(36px) / tiny(32px). 생략하면 Field 를 따른다
<Select invalid />          // 테두리와 포커스 링이 danger 색
```

## 속성

| 속성                     | 기본 / 동작                                                         |
| ------------------------ | ------------------------------------------------------------------- |
| `selectionMode`          | `single`(기본): `string \| null` / `multiple`: `string[]`           |
| `value` / `defaultValue` | 생략하면 비제어. 기본 `null` / `[]`                                 |
| `onValueChange`          | 고르거나 지울 때, 초기화할 때                                       |
| `open` / `defaultOpen`   | 열림 상태                                                           |
| `onOpenChange`           | 열리고 닫힐 때                                                      |
| `placeholder`            | `선택하세요`                                                        |
| `variant`                | `outline`(기본) / `soft` / `ghost`                                  |
| `size`                   | `standard` / `tiny`. 생략하면 `Field` 크기                          |
| `mobileVariant`          | `popover`(기본) / `drawer`: 640px 미만에서 모달 하단 시트           |
| `invalid`                | `aria-invalid` 와 danger 색. 명시한 `aria-invalid` 가 우선          |
| `disabled` / `readOnly`  | 열기와 선택을 막는다                                                |
| `name` / `form`          | 값마다 hidden input                                                 |
| `required`               | 브라우저 검증                                                       |
| `className` / `style`    | 루트. `className` 은 상태를 받는 함수도 된다                        |
| `ref`, 그 외 native 속성 | 트리거 button (`id`, `aria-*`, `autoFocus`, `onFocus`, `onBlur` 등) |

## 알아둘 것

- 이름은 `Field.Label` 이나 `aria-label` 로 줍니다. 목록도 같은 이름으로 읽힙니다.
- `onBlur` 는 포커스가 트리거와 팝업을 모두 벗어날 때만 불립니다.
- `Item` 의 `value` 는 필수이고 고유해야 합니다. 빈 문자열도 값이지만 제출되지 않고, `required` 에서는 빈 값으로 봅니다.
- 옵션이 아직 없는 값은 트리거에 값 그대로 보입니다.
