# TextField

한 줄 입력과 그 앞뒤의 아이콘, 글자, 버튼을 한 테두리 안에 담는 필드입니다.

- **조립.** `TextField.Input` 앞에 둔 자식은 앞쪽, 뒤에 둔 자식은 뒤쪽에 놓입니다. 아이콘과 글자는 흐린 색과 아이콘 크기를 받고, 버튼은 테두리 안쪽 크기로 줄어듭니다.
- **지우기.** `TextField.Clear` 는 값이 있을 때만 보입니다. 실제 입력 이벤트로 지워서 `onChange` 와 react-hook-form이 알고, 포커스는 입력에 남습니다. Escape도 같은 일을 합니다.
- **상태는 테두리에.** 입력이 잘못되면 테두리 컨테이너에 `data-invalid` 가 붙어 danger 테두리와 포커스 링이 그려집니다. 포커스, 값 유무, 읽기 전용도 `data-*` 로 붙습니다.
- **값을 놓치지 않음.** react-hook-form의 `setValue` 나 폼 reset처럼 입력 이벤트 없이 바뀐 값도 따라가서 `data-filled` 와 Clear가 맞게 보입니다.
- **native 그대로.** 실제 `<input>` 하나라 자동 완성, IME, 폼 제출, `register()` 가 그대로 됩니다.

```tsx
import { Field, TextField } from '@gsainfoteam/ids-react';

<Field>
  <Field.Label>이메일</Field.Label>
  <TextField type="email" name="email" placeholder="name@example.com" />
</Field>;
```

## 값

```tsx
<TextField defaultValue="인포팀" />                                  // 비제어
<TextField value={name} onValueChange={setName} />                 // 제어. 문자열을 바로 받는다
<TextField value={name} onChange={(e) => setName(e.target.value)} /> // native 이벤트도 그대로 온다
```

- `onValueChange(value)` 는 `onChange` 와 같은 때에 문자열로 불립니다. TanStack Form의 `field.handleChange` 를 그대로 넘길 수 있습니다.
- 코드가 값을 바꿀 때(`setValue`, reset, 제어 값)는 부르지 않습니다.

## 조립

```tsx
<TextField aria-label="검색">
  <MagnifyingGlassIcon />               {/* Input 앞 = 앞쪽 */}
  <TextField.Input />
  <TextField.Clear />                   {/* 값이 있을 때만 보인다 */}
  <Kbd>⌘K</Kbd>                          {/* Input 뒤 = 뒤쪽 */}
</TextField>

<TextField aria-label="금액">
  <span>$</span>                         {/* Input을 생략하면 자식 뒤에 자동으로 들어간다 */}
</TextField>

<TextField aria-label="링크" readOnly defaultValue={url}>
  <TextField.Input />
  <IconButton aria-label="복사" icon={<DocumentDuplicateIcon />} onClick={copy} />
</TextField>
```

- 앞뒤 자식은 각각 `span` 으로 감쌉니다. Fragment 안의 Input도 찾지만 다른 컴포넌트 안은 찾지 않습니다.
- 버튼은 높이 28px(tiny 24px)로 줄어들고, 끝에 있으면 테두리에서 4px 떨어지도록 안쪽으로 당겨집니다.
- 여백이나 아이콘을 눌러도 입력에 포커스가 갑니다. 버튼, 링크, 라벨, 다른 입력은 자기 동작을 합니다.

## 지우기

```tsx
<TextField value={query} onValueChange={setQuery}>
  <TextField.Input />
  <TextField.Clear />                    {/* aria-label "지우기" */}
</TextField>

<TextField.Clear aria-label="검색어 지우기" />          {/* 라벨 바꾸기 */}
<TextField.Clear><XCircleIcon /></TextField.Clear>     {/* 아이콘 바꾸기 */}
<TextField.Clear asChild><button>지우기</button></TextField.Clear> {/* 버튼 직접 그리기 */}
```

| 동작                     | 결과                                                     |
| ------------------------ | -------------------------------------------------------- |
| Clear 누르기             | 값을 지우고 입력에 포커스를 둔다                          |
| `Escape` (Clear가 있을 때) | 값을 지운다. 이미 비었으면 키를 막지 않아 대화상자가 닫힌다 |

- 지우기는 실제 편집으로 처리됩니다. `onChange`, `onValueChange('')`, react-hook-form `register()` 가 모두 받습니다.
- Clear는 탭 순서에 없습니다. 키보드에서는 Escape나 전체 선택 후 삭제가 같은 일을 합니다.
- 읽기 전용이거나 비활성이면 나타나지 않습니다.

## 상태

```tsx
<TextField className={(state) => (state.focused ? 'shadow-md' : undefined)} />
```

| 속성                        | 뜻                                             |
| --------------------------- | ---------------------------------------------- |
| `data-focused`              | 포커스가 필드 안에 있다                        |
| `data-filled`               | 값이 있다                                      |
| `data-invalid`              | `invalid`, `aria-invalid`, 또는 Field의 오류   |
| `data-disabled`             | 비활성                                         |
| `data-readonly`             | 읽기 전용                                      |
| `data-size`, `data-variant` | 크기와 variant                                 |

- 테두리 컨테이너(`data-text-field`)에 붙습니다. 실제 input에는 `data-field-input` 이 붙어 포커스 링이 컨테이너에 그려집니다.
- `className` 과 `style` 은 이 상태를 받는 함수도 됩니다.

## 속성 우선순위

```tsx
<TextField id="q" name="a" onChange={root}>
  <TextField.Input name="b" onChange={input} />
</TextField>
// id="q", name="b": 값은 Input > root > asChild 자식
// onChange: 자식, root, Input 순서로 모두 실행 (Field와 RHF가 root에 건 핸들러 유지)
// ref는 root에 줘도 실제 input을 가리킨다
```

## asChild

```tsx
<TextField name="q">
  <TextField.Input asChild>
    <MyInput />                          {/* props와 ref를 native input에 넘겨야 한다 */}
  </TextField.Input>
</TextField>
```

## 크기와 variant

```tsx
<TextField variant="soft" />             // outline(기본) / soft / ghost
<TextField size="tiny" />                // standard(36px) / tiny(32px)

<Field size="tiny">
  <Field.Label>이름</Field.Label>
  <TextField />                          {/* size를 생략하면 Field를 따른다 */}
</Field>
```

## 속성

| 속성                     | 기본 / 동작                                                   |
| ------------------------ | ------------------------------------------------------------- |
| `value` / `defaultValue` | native 그대로                                                 |
| `onValueChange`          | `(value: string) => void`. `onChange` 와 같은 때에 불린다      |
| `onChange`               | native change 이벤트                                          |
| `variant`                | `outline`(기본) / `soft` / `ghost`                            |
| `size`                   | `standard` / `tiny`. 생략하면 `Field` 크기, 없으면 `standard` |
| `invalid`                | `aria-invalid` 와 danger 테두리. 명시한 `aria-invalid` 가 우선 |
| `disabled`               | 컨테이너와 input에 함께 적용. Input의 값이 우선                |
| `className` / `style`    | 컨테이너로 간다. 상태를 받는 함수도 된다. Input에 주면 input으로 간다 |
| 그 외 native 속성, ref    | 실제 input으로 간다                                           |
| `TextField.Clear`        | `aria-label`, `children`(아이콘), `asChild`                    |

## 알아둘 것

- HTML `size` 속성은 IDS `size` 가 차지하므로 쓸 수 없습니다. 폭은 `className` 으로 정합니다.
- `value` 를 주고 `onChange`, `onValueChange`, `readOnly` 가 모두 없으면 에러가 납니다.
- `TextField.Input` 을 둘 이상 두거나, Input에 children을 주거나, `asChild` 자식이 input이 아니면 에러가 납니다.
- `id` 가 없으면 만들어 붙입니다. Clear의 `aria-controls` 가 이 id를 가리킵니다.
- 브라우저가 search 입력에 그리는 지우기 버튼과 Edge가 비밀번호 입력에 그리는 보기 버튼은 숨깁니다. 필드의 파트가 그 일을 합니다.
