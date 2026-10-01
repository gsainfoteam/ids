# ChipField

검색해서 여러 값을 고르고, 고른 값을 칩으로 보여 주는 필드입니다. 목록에 없는 값을 새로 만들 수도 있습니다.

- **칩 사이를 키보드로.** 입력 맨 앞에서 `←` 를 누르면 마지막 칩으로 가고, 칩 사이는 방향키로 오갑니다. `Backspace` 와 `Delete` 는 칩을 지운 뒤 옆 칩에 포커스를 둡니다. `Tab` 은 칩을 거치지 않고 필드를 떠납니다.
- **붙여넣기.** 쉼표, 탭, 줄바꿈이 섞인 글을 붙여넣으면 칩 여러 개가 됩니다. 이미 있는 값은 건너뛰고, 칩으로 만들 수 없는 글자는 입력에 남겨 둡니다.
- **새 값 만들기.** `creatable` 이면 목록에 없는 값도 칩이 됩니다. `validate` 로 거를 수 있고, 쉼표나 `Enter` 로 확정합니다.
- **중복 없음.** 대소문자, 전각, 악센트만 다른 값은 같은 값으로 봅니다.
- **개수 제한.** `maxCount` 에 닿으면 나머지 옵션이 비활성이 되고 목록 위에 안내가 나옵니다.
- **폼.** 칩마다 hidden input 하나가 제출되고, `required` 는 브라우저 검증이 막습니다. 입력 중인 검색어는 제출되지 않습니다.

```tsx
import { ChipField, Field } from '@gsainfoteam/ids-react';

<Field>
  <Field.Label>기술</Field.Label>
  <ChipField name="skills" placeholder="기술 검색">
    <ChipField.Item value="react">React</ChipField.Item>
    <ChipField.Item value="flutter">Flutter</ChipField.Item>
  </ChipField>
</Field>;
```

## 값

```tsx
<ChipField defaultValue={['react']}>{items}</ChipField>              // 비제어

<ChipField value={tags} onValueChange={setTags}>{items}</ChipField>  // 제어. string[]
```

- 값은 중복 없는 `string[]` 이고, 고른 순서대로 쌓입니다.
- 옵션을 다시 고르면 빠집니다. 칩의 `×` 나 `Backspace` 로도 지웁니다.

## 키보드

| 키                   | 입력에서                                    | 칩에서                           |
| -------------------- | ------------------------------------------- | -------------------------------- |
| 글자                 | 검색하고 목록을 연다                        | 입력으로 가서 이어 쓴다          |
| `↓` `↑`              | 목록을 열고 옵션을 오간다                   |                                  |
| `PageDown` `PageUp`  | 10개씩 이동                                 |                                  |
| `Enter`              | 가리킨 옵션을 넣거나 빼고, 새 값을 만든다   | 칩을 지운다                      |
| `,`                  | 쓴 글자를 칩으로 만든다                     |                                  |
| `←` (RTL 에서는 `→`) | 맨 앞에서 마지막 칩으로                     | 앞 칩으로                        |
| `→` (RTL 에서는 `←`) |                                             | 뒤 칩으로. 마지막 칩 다음은 입력 |
| `Home` `End`         | 글자 편집                                   | 첫 칩 / 입력으로                 |
| `Backspace`          | 비어 있으면 마지막 칩을 지운다              | 칩을 지우고 앞 칩으로            |
| `Delete`             |                                             | 칩을 지우고 뒤 칩으로            |
| `Esc`                | 목록을 닫는다. 닫혀 있으면 쓴 글자를 지운다 | 입력으로                         |
| `Tab`                | 목록을 닫고 다음 요소로                     | 다음 요소로                      |

- 칩은 `Tab` 순서에 들어가지 않아 필드를 한 번에 지나갈 수 있습니다.
- 한글 IME 로 조합 중인 `Enter` 는 칩을 만들지 않습니다.

## 붙여넣기

```tsx
<ChipField>{items}</ChipField>
// "React, vue\nREACT, Elm" 을 붙여넣으면
// 칩: React, Vue    입력에 남는 글자: Elm
```

- 쉼표, 탭, 줄바꿈으로 나눕니다. 표 한 줄이나 목록 한 열을 그대로 붙여넣을 수 있습니다.
- 옵션은 라벨이나 값으로 찾습니다. `creatable` 이면 목록에 없는 값도 칩이 됩니다.
- 구분자가 없는 글은 평소처럼 입력에 붙습니다.

## 새 값 만들기

```tsx
<ChipField
  creatable
  validate={(text) => isEmail(text) || '이메일 주소가 아닙니다.'}
  onCreate={(text) => saveTag(text)} // 만들 때마다, 선택에 넣기 전에
  placeholder="이메일 입력"
/>
```

- 검색어가 옵션이나 이미 고른 값과 같으면 만들기 행이 나오지 않습니다.
- `validate` 는 `true`(또는 아무것도 반환하지 않음)면 통과, `false` 면 기본 문구, 문자열이면 그 문구로 거부합니다. 거부된 값은 만들기 행에 이유가 뜨고 칩이 되지 않습니다.
- 옵션 없이 `creatable` 만 쓰면 아래 화살표가 없는 입력이 됩니다.

## 개수 제한

```tsx
<ChipField maxCount={3}>{items}</ChipField>
```

- 제한에 닿으면 고르지 않은 옵션이 비활성이 되고, 새 값도 만들 수 없습니다.
- 목록 위의 안내 문구는 live region 이라 스크린 리더가 읽습니다. `ChipField.Limit` 으로 바꿀 수 있습니다.
- 바깥에서 준 `value` 는 자르지 않습니다.

## 구성

```tsx
<ChipField value={tags} onValueChange={setTags}>
  {/* Input 앞은 leading, 칩보다 앞에 그린다 */}
  <TagIcon />
  <ChipField.Input placeholder="분야 검색" />
  {/* Input 뒤는 trailing */}
  <ClearButton />
  <ChipField.Group heading="프론트엔드">
    <ChipField.Item value="react">React</ChipField.Item>
    <ChipField.Item value="vue" searchValue="Vue.js">
      Vue
    </ChipField.Item>
  </ChipField.Group>
  <ChipField.Item value="legacy" disabled>
    jQuery
  </ChipField.Item>
  <ChipField.Create>{(text) => `"${text}" 태그 만들기`}</ChipField.Create>
  <ChipField.Empty>일치하는 태그가 없습니다.</ChipField.Empty>
  <ChipField.Limit>세 개까지만 고를 수 있어요.</ChipField.Limit>
</ChipField>
```

- 그리는 순서는 leading, 칩, `Input`, trailing, 아래 화살표입니다.
- `Input` 을 생략하면 자식 뒤에 자동으로 들어갑니다. 한 개까지입니다.
- 옵션 part 는 위치와 상관없이 팝업으로 갑니다. `ChipField.Content` 로 감싸면 목록에 props 를 줄 수 있고, 그때는 옵션을 루트에 직접 둘 수 없습니다.
- `Item`, `Group` 은 루트, `Content`, `Group` 의 자식이나 Fragment 안에 둡니다. 다른 컴포넌트 안은 찾지 않습니다.
- `Input` 과 옵션 part 는 `asChild` 를 받습니다.

## 옵션 직접 그리기

```tsx
<ChipField.Item
  value="react"
  label="React" // 칩에 보일 글자
  className={(item) => (item.selected ? 'font-medium' : undefined)}
>
  <ReactLogo />
  React
  {/* 두면 기본 체크 대신 이것을 그린다 */}
  <ChipField.ItemIndicator>
    <CheckCircleIcon />
  </ChipField.ItemIndicator>
</ChipField.Item>
```

| Item 상태     | 뜻                                    |
| ------------- | ------------------------------------- |
| `selected`    | 고른 옵션                             |
| `highlighted` | 키보드나 마우스가 가리킨 옵션         |
| `disabled`    | 고를 수 없는 옵션. 제한에 닿았을 때도 |

## 상태와 data 속성

| 요소   | 속성                                                                                                      |
| ------ | --------------------------------------------------------------------------------------------------------- |
| 루트   | `data-open`, `data-disabled`, `data-readonly`, `data-invalid`, `data-required`, `data-full`, `data-empty` |
| 칩     | `data-chip-field-chip`, 지울 수 없는 옵션이면 `data-disabled`, 방향키가 가리키면 `data-focus-visible`     |
| Item   | `data-selected`, `data-highlighted`, `data-disabled`                                                      |
| Create | `data-highlighted`, 거부된 값이면 `data-invalid`                                                          |

- 루트의 `className` 은 `ChipField.State` 를 받는 함수도 됩니다.
- 칩은 `Chip` 이고 지우기 버튼은 `Chip.Close` 입니다. `data-chip`, `data-size` 같은 Chip 의 속성도 붙습니다.
- 지우기 버튼에 포커스가 있으면 필드 테두리에 링이 그려지고 칩은 테마 색으로 칠해집니다. 버튼 자체에는 링을 그리지 않습니다.

## 열림 상태

```tsx
<ChipField open={open} onOpenChange={setOpen}>{items}</ChipField>
<ChipField defaultOpen>{items}</ChipField>
```

- 입력을 클릭하거나 글자를 치면 열리고, 옵션을 골라도 열린 채로 남습니다.
- 목록은 위나 아래에 옵션이 더 남으면 그 가장자리를 흐립니다([ScrollArea `fade="y"`](../../layout/scroll-area/README.md#가장자리-흐림)). 방향키로 옮긴 옵션은 흐린 띠 밖에 멈춥니다.
- 640px 보다 좁은 화면에서 `mobileVariant="drawer"`(기본) 는 모달 하단 시트로 엽니다. 필드의 입력이 시트 뒤로 가려지므로 시트 위에 같은 검색어를 쓰는 검색창이 있고, 닫으면 필드의 입력으로 포커스가 돌아옵니다.
- 시트의 검색창은 `Select.SearchField` 와 같은 `TextField` 입니다. 테두리와 링 없이 아래 선만 그립니다.

## 폼

```tsx
<form onSubmit={submit}>
  {/* FormData: skills=react&skills=flutter */}
  <ChipField name="skills" required>
    {items}
  </ChipField>
  <button type="reset">초기화</button>
</form>
```

- 칩이 없는데 `required` 면 브라우저가 제출을 막고 입력으로 포커스를 보냅니다.
- `disabled` 면 제출되지 않고, `readOnly` 면 제출되지만 칩을 지울 수 없고 검증하지 않습니다.
- 초기화는 값을 `defaultValue` 로, 검색어를 빈 값으로 되돌립니다.

## react-hook-form, TanStack Form

```tsx
import { Field } from '@gsainfoteam/ids-react/react-hook-form';

<Field
  name="tags"
  controlMode="value"
  registerOptions={{ validate: (tags) => tags.length > 0 || '하나 이상 고르세요.' }}
>
  <Field.Label>태그</Field.Label>
  <ChipField>{items}</ChipField>
  <Field.Error />
</Field>;
```

```tsx
<form.Field name="tags">
  {(field) => (
    <ChipField value={field.state.value} onValueChange={field.handleChange}>
      {items}
    </ChipField>
  )}
</form.Field>
```

- 오류가 나면 입력으로 포커스가 갑니다.

## 크기와 variant

```tsx
<ChipField variant="soft" />   // outline(기본) / soft / ghost
<ChipField size="tiny" />      // standard / tiny. 생략하면 Field 를 따른다
<ChipField invalid />          // 테두리와 포커스 링이 danger 색
```

- 칩이 많으면 줄을 바꾸고, 필드 높이는 컨트롤 높이부터 늘어납니다.

## 속성

| 속성                                    | 기본 / 동작                                                |
| --------------------------------------- | ---------------------------------------------------------- |
| `value` / `defaultValue`                | 중복 없는 `string[]` / `[]`                                |
| `onValueChange`                         | 칩이 바뀔 때                                               |
| `open` / `defaultOpen` / `onOpenChange` | 목록의 열림 상태                                           |
| `creatable`                             | 목록에 없는 값을 만든다                                    |
| `validate`                              | 만들 값을 검사한다                                         |
| `onCreate`                              | 값을 만들 때마다                                           |
| `maxCount`                              | 0 이상 정수. 새로 고르기와 만들기를 막는다                 |
| `removeLabel`                           | 칩 지우기 버튼 이름. 기본 `${label} 삭제`                  |
| `variant`                               | `outline`(기본) / `soft` / `ghost`                         |
| `size`                                  | `standard` / `tiny`. 생략하면 `Field` 크기                 |
| `mobileVariant`                         | `drawer`(기본): 640px 미만에서 모달 하단 시트 / `popover`  |
| `invalid`                               | `aria-invalid` 와 danger 색. 명시한 `aria-invalid` 가 우선 |
| `disabled` / `readOnly`                 | 고르기, 만들기, 지우기를 막는다                            |
| `name` / `form`                         | 칩마다 hidden input                                        |
| `required`                              | 브라우저 검증                                              |
| `className` / `style`                   | 루트                                                       |
| `ref`, 그 외 native 속성                | 검색 input. 기본 `placeholder="항목 추가…"`                |

## 알아둘 것

- 루트와 `ChipField.Input` 에 같은 속성을 주면 `Input` 이 이깁니다. `onKeyDown` 같은 핸들러는 루트, `Input` 순서로 모두 실행한 뒤 내장 키보드 처리가 돕니다. `preventDefault()` 하면 내장 처리를 건너뜁니다.
- `ChipField.Input` 의 `onChange` 는 검색어 입력 이벤트입니다. 고른 값은 루트의 `onValueChange` 로 받습니다.
- 목록에 아직 없는 값의 칩은 값 그대로 보입니다. 새로 만든 값의 저장이나 ID 변환은 앱이 맡습니다.
- 컨테이너의 빈 곳을 클릭하면 입력에 포커스하고 목록을 엽니다.
