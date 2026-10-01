# OTPField

문자나 이메일로 받은 인증 코드를 한 칸에 한 글자씩 입력받는 필드입니다.

- **실제 input 하나.** 칸은 그림일 뿐이고 입력은 input 하나가 받습니다. 스크린 리더에는 컨트롤 하나, 이름 하나, 값 하나로 읽힙니다.
- **SMS 자동 완성.** `autocomplete="one-time-code"` 가 input 하나에 붙어 있어 iOS와 Android의 코드 제안이 바로 채워집니다.
- **브라우저 키보드 그대로.** 전체 선택, 단어 삭제, Shift+화살표 범위 선택, 실행 취소, iOS 길게 누르기 메뉴가 모두 동작합니다.
- **붙여넣기.** 전체 코드는 어느 칸에서든 통째로 들어가고, 일부만 붙여넣으면 선택한 칸부터 덮어씁니다. `123-456` 의 하이픈 같은 문자는 걸러집니다.
- **폼.** `name` 하나에 FormData 항목 하나입니다. 다 채우지 않으면 브라우저 검증이 제출을 막고, `<label>` 을 누르면 다음 입력 칸으로 갑니다.
- **react-hook-form, TanStack Form.** `register()` 도, 값 기반 연결도 그대로 됩니다.

```tsx
import { Field, OTPField } from '@gsainfoteam/ids-react';

<Field>
  <Field.Label>인증 코드</Field.Label>
  <OTPField length={6} name="code" onComplete={verify} />
  <Field.Hint>문자로 받은 6자리 숫자</Field.Hint>
</Field>;
```

## 입력

| 동작                    | 결과                                                        |
| ----------------------- | ----------------------------------------------------------- |
| 글자 입력               | 캐럿이 글자 위에 있으면 그 글자를 덮어쓰고 다음 칸으로 간다 |
| `←` `→`                 | 한 칸씩 이동                                                |
| `Backspace`             | 선택한 글자를 지우고 뒤 글자가 앞으로 당겨진다              |
| `⌘A` / `Ctrl+A`         | 모든 칸 선택. 이어서 입력하면 전체가 바뀐다                 |
| `⌥⌫` / `Ctrl+Backspace` | 캐럿 앞을 한 번에 지운다                                    |
| `Shift+←` `Shift+→`     | 여러 칸 선택                                                |
| `⌘Z` / `Ctrl+Z`         | 실행 취소. 붙여넣기도 되돌린다                              |
| 칸 클릭                 | 그 칸으로 캐럿 이동                                         |

```tsx
<OTPField length={6} pattern="numeric" />        // 숫자만 (기본)
<OTPField length={8} pattern="alphanumeric" />   // 영문과 숫자
<OTPField length={6} pattern={/[A-F0-9]/i} />    // 한 글자를 검사하는 정규식
```

- 허용되지 않는 글자는 DOM에 들어가기 전에 막혀서 캐럿이 움직이지 않습니다.
- 전각 숫자(`１２３`)는 반각으로 바꿔서 받습니다.
- 한글 IME 조합 중에는 조합 글자를 그대로 보여 주고, 조합이 끝나면 정리합니다.
- Tab 으로 들어오면 다음 빈 칸에 캐럿이 갑니다. Safari 는 Tab 으로 들어온 input 의 글자를 전부 선택하지만, OTPField 는 그 선택을 다음 빈 칸으로 되돌리고, 되돌리기 전에 친 글자도 그 자리에 넣습니다.

## 값

```tsx
<OTPField length={6} defaultValue="123" />                      // 비제어

<OTPField length={6} value={code} onValueChange={setCode} />     // 제어

<OTPField
  length={6}
  onValueChange={(code) => console.log(code)}  // 바뀔 때마다
  onComplete={(code) => verify(code)}          // 비어 있던 칸이 모두 찼을 때 한 번
/>
```

- `onComplete` 는 다 찬 코드의 한 글자를 고쳐도 다시 부르지 않습니다. 한 칸을 지웠다가 다시 채우면 부릅니다.
- `onChange` 는 native input 이벤트입니다. `event.target.value` 는 이미 정리된 코드입니다.

## 레이아웃

```tsx
<OTPField length={6} />                 {/* 자식이 없으면 Group 하나에 6칸 */}

<OTPField length={6}>
  <OTPField.Group>                       {/* Group 안의 칸은 테두리를 공유한다 */}
    <OTPField.Slot index={0} />
    <OTPField.Slot index={1} />
    <OTPField.Slot index={2} />
  </OTPField.Group>
  <OTPField.Separator />                 {/* 기본은 − 아이콘. children으로 바꿀 수 있다 */}
  <OTPField.Group>
    <OTPField.Slot index={3} />
    <OTPField.Slot index={4} />
    <OTPField.Slot index={5} />
  </OTPField.Group>
</OTPField>

<OTPField length={4}>
  <OTPField.Slot index={0} />            {/* Group 없이 두면 칸마다 떨어진다 */}
  <OTPField.Slot index={1} />
  <OTPField.Slot index={2} />
  <OTPField.Slot index={3} />
</OTPField>
```

## 칸 직접 그리기

```tsx
<OTPField.Slot
  index={0}
  className={(slot) => (slot.isFilled ? 'bg-primary text-on-primary' : undefined)}
>
  {(slot) => (slot.isFilled ? '✓' : slot.hasFakeCaret && <OTPField.Caret />)}
</OTPField.Slot>
```

| 상태           | 뜻                                  |
| -------------- | ----------------------------------- |
| `index`        | 칸 순서                             |
| `char`         | 칸의 글자. 비었으면 `undefined`     |
| `isActive`     | 캐럿이나 선택 범위가 이 칸에 있다   |
| `isFilled`     | 글자가 있다                         |
| `hasFakeCaret` | 활성인 빈 칸이라 캐럿을 그려야 한다 |

- 칸에는 같은 상태가 `data-active`, `data-filled` 로도 붙어 CSS만으로 꾸밀 수 있습니다.
- 루트에는 `data-focused`, `data-complete`, `data-invalid`, `data-disabled`, `data-readonly` 가 붙습니다.

## 마스크와 자리 표시

```tsx
<OTPField length={4} mask />                    // 채운 칸을 점으로
<OTPField length={4} mask="*" />                // 원하는 글자로
<OTPField length={6} placeholder="000000" />    // 빈 칸마다 한 글자씩
```

- 마스크는 칸에 그리는 모양만 바꿉니다. input은 `type="text"` 그대로라 비밀번호 관리자가 끼어들지 않습니다.

## 폼

```tsx
<form onSubmit={submit}>
  <Field>
    <Field.Label>인증 코드</Field.Label>
    <OTPField length={6} name="code" required />
  </Field>
  <button type="submit">확인</button> {/* FormData: code=123456 */}
  <button type="reset">초기화</button> {/* defaultValue로 돌아간다 */}
</form>
```

- input에 `pattern=".{6}"` 이 붙어서 3자리만 넣고 제출하면 브라우저가 막습니다.
- `required`, `disabled`, `readOnly`, `form`, `autoFocus` 는 input의 native 속성 그대로입니다.

## react-hook-form

```tsx
import { Field } from '@gsainfoteam/ids-react/react-hook-form';

<Field name="code">
  {' '}
  {/* register() 로 연결된다 */}
  <Field.Label>인증 코드</Field.Label>
  <OTPField length={6} />
  <Field.Error />
</Field>;
```

- `reset()` 과 `setValue()` 가 DOM 값을 직접 바꿔도 칸이 따라 바뀝니다.
- `controlMode="value"` 로 제어 연결해도 됩니다.

## TanStack Form

```tsx
<form.Field name="code">
  {(field) => (
    <OTPField
      length={6}
      value={field.state.value}
      onValueChange={field.handleChange}
      onBlur={field.handleBlur}
    />
  )}
</form.Field>
```

## 크기와 variant

```tsx
<OTPField variant="soft" />     // outline(기본) / soft
<OTPField size="tiny" />        // standard(36px) / tiny(32px). 생략하면 Field를 따른다
<OTPField invalid />            // 테두리와 포커스 링이 danger 색
```

## 속성

| 속성                     | 기본 / 동작                                                           |
| ------------------------ | --------------------------------------------------------------------- |
| `length`                 | 필수. 1~12                                                            |
| `value` / `defaultValue` | 코드 문자열. 허용되지 않는 글자는 빠진다                              |
| `onValueChange`          | 코드가 바뀔 때                                                        |
| `onComplete`             | 모든 칸이 처음 찼을 때                                                |
| `pattern`                | `numeric`(기본) / `alphanumeric` / 한 글자를 검사하는 `RegExp`        |
| `mask`                   | `true` 면 점, 문자열이면 그 글자                                      |
| `placeholder`            | 빈 칸에 한 글자씩                                                     |
| `invalid`                | `aria-invalid` 와 danger 색                                           |
| `variant`                | `outline`(기본) / `soft`                                              |
| `size`                   | `standard` / `tiny`. 생략하면 `Field` 크기                            |
| `className` / `style`    | 루트로 간다                                                           |
| `ref`                    | 실제 input                                                            |
| 그 외 native 속성        | 실제 input으로 간다 (`name`, `id`, `required`, `onBlur`, `aria-*` 등) |

## 알아둘 것

- `aria-label`, `aria-labelledby`, `id` 가 모두 없으면 `인증 코드` 라는 이름이 붙습니다. `Field.Label` 을 쓰면 라벨이 이름이 됩니다.
- 칸은 `aria-hidden` 이라 스크린 리더는 input 하나만 읽습니다.
- 칸 위에 투명한 input이 덮여 있습니다. 칸에 `onClick` 을 달아도 이벤트는 input이 받습니다.
- input 글자 크기는 16px로 고정입니다. iOS가 포커스할 때 화면을 확대하지 않게 하기 위해서입니다.
