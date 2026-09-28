# text-control

글자를 입력받는 필드(TextField, PasswordField, NumberField, TelField, TextArea)가 함께 쓰는 셸, Clear, hook 입니다.

| 파일                                         | 내용                                                                                                                             |
| -------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| [`index.tsx`](#indextsx)                     | context, 상태 속성, 자식 나누기, `Adornments`, `TextControlClear`, `insetButtons`, `textControlStyle`, 다른 파일의 다시 내보내기 |
| [`use-text-control.ts`](#use-text-controlts) | 셸의 포커스, 셸 누르기, Escape 로 지우기                                                                                         |
| [`use-input-value.ts`](#use-input-valuets)   | input 의 DOM 값을 따라가는 hook                                                                                                  |
| [`use-merged-ref.ts`](#use-merged-refts)     | ref 를 렌더마다 새로 만들지 않고 합치는 hook                                                                                     |
| [`clear-input.ts`](#clear-inputts)           | 진짜 편집으로 값을 지우고 바꾸는 함수                                                                                            |

## 쓰는 곳

| 가져가는 것                                                                                                                  | 쓰는 곳                                                   |
| ---------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| `textControlStyle`, `TextControlContext`, `TextControlClear`, `Adornments`, `splitAroundInput`, `countOf`, `stateAttributes` | TextField, PasswordField, NumberField, TelField           |
| `insetButtons`, `stateAttributes`                                                                                            | TextArea                                                  |
| `useTextControl`, `useMergedRef`, `isInvalid`                                                                                | TextField, PasswordField, NumberField, TelField, TextArea |
| `useInputValue`                                                                                                              | TextField, PasswordField, TextArea                        |
| `replaceInput`                                                                                                               | TelField                                                  |

- TextField 는 `textControlStyle` 을 그대로 `TextField.Style` 로 쓰고, PasswordField, NumberField, TelField 는 `tv({ extend: textControlStyle })` 로 넓힙니다.
- 네 필드의 `Clear` 는 모두 `TextControlClear` 입니다.
- 상자의 클래스는 [`fieldSurface`](../README.md#field-surfacets), 상자 안 버튼은 `fieldAction.padded` 입니다.

## index.tsx

### 쓰는 법

```tsx
// components/form/text-field/index.tsx
const { items, leading, input, trailing } = splitAroundInput<TextField.Input.Props>(
  children,
  TextField.Input,
  () => <TextField.Input />,
  'TextField',
);
const field = useTextField({
  rootProps,
  input: input.props,
  disabled,
  invalid,
  onValueChange,
  clearable: countOf(items, TextField.Clear) > 0,
});
const state: TextFieldState = { size, variant, ...field.state };
const styles = TextField.Style({ variant, size });

<TextControlContext value={{ state, inputId: field.inputProps.id, clear: field.clear, styles }}>
  <div data-text-field="" {...stateAttributes(state)} {...field.rootProps} className={styles.root(/* ... */)}>
    <Adornments items={leading} own={[TextField.Clear]} marker="text-field" className={styles.adornment()} />
    {input}
    <Adornments items={trailing} own={[TextField.Clear]} marker="text-field" className={styles.adornment()} />
  </div>
</TextControlContext>
```

### 왜 이렇게

- `splitAroundInput`: Input 앞의 자식은 앞쪽 장식, 뒤의 자식은 뒤쪽 장식입니다. Input 이 없으면 모든 자식이 앞쪽이고 Input 은 맨 뒤에 그립니다(`fallback`). 자식은 `flattenFragments` 로 풀어서 key 가 겹치지 않습니다.
- `Adornments`: 앱이 넣은 내용은 `<span data-${marker}-adornment>` 로 감싸, 아이콘과 글자가 muted 색과 아이콘 크기를 받습니다. 필드 자신의 파트(`own`, 예: Clear)는 스스로 크기를 정하므로 감싸지 않습니다.
- `TextControlClear` 는 값이 있고 disabled, readOnly 가 아닐 때만 그립니다.
- Clear 는 검색 필드의 지우기 버튼처럼 Tab 순서에서 빠집니다(`tabIndex: -1`). 키보드로는 Escape 와 전체 선택 뒤 지우기가 같은 일을 합니다.
- Clear 를 눌러도 포커스는 input 에 남습니다(`keepFocusInInput`: 주 버튼 `pointerdown` 의 `preventDefault()`).
- `insetButtons`: 장식에 둔 `button` 을 필드 파트의 높이(standard 28px, tiny 24px)로 줄입니다. 아이콘 버튼은 필수인 `aria-label` 을 가지므로 거의 정사각형으로 두고(`px-1`, `min-w-7`), 글자 버튼(`aria-label` 없음)은 라벨 둘레에 padding(`px-2.5`, tiny 는 `px-2`)을 둡니다.
- `textControlStyle` 의 `size` 는 버튼이 든 장식을 양 끝에서 padding 안으로 당깁니다(`has-[button]:first:-ms-2` 등). 버튼이 위아래에 남긴 만큼 좌우에서도 테두리와 4px 떨어집니다.
- input 에서는 브라우저가 search, password input 에 그리는 자체 지우기, 보기 버튼(`::-webkit-search-cancel-button`, `::-ms-clear`, `::-ms-reveal`)을 숨깁니다. 필드의 파트가 대신합니다.
- `isInvalid`: `aria-invalid` 는 `'grammar'`, `'spelling'` 도 받습니다. `null`, `undefined`, `false`, `'false'` 가 아니면 invalid 입니다.

### 알아둘 것

- Input 은 하나까지입니다(`invariant`). 앱의 컴포넌트로 감싼 Input 은 Input 으로 찾지 못하고, 기본 Input 이 하나 더 그려집니다.
- `data-field-input` 은 셸이 아니라 input 에 붙습니다(각 필드의 hook). 셸의 `focus-ring` 이 이 input 의 포커스를 보고 ring 을 그립니다.
- `stateAttributes` 의 `data-*` 는 필드 README 에 적힌 공개 상태 속성입니다. 이름을 바꾸면 그 README 도 고칩니다.
- `data-text-control-clear` 로 테스트가 Clear 를 찾습니다.

## use-text-control.ts

### 쓰는 법

```ts
// components/form/text-field/use-text-field.ts
const control = useTextControl({ inputRef, disabled, readOnly, clearable });

const inputProps = {
  ...native,
  onKeyDown: (event: KeyboardEvent<HTMLInputElement>) => {
    native.onKeyDown?.(event);
    control.onEscape(event);
  },
};

return {
  inputProps,
  rootProps: control.rootProps,            // 셸 div 에 펼친다
  clear: control.clear,                    // TextControlContext 로 Clear 에 간다
  state: { disabled, readOnly, invalid: isInvalid(ariaInvalid), focused: control.focused, filled },
};
```

### 왜 이렇게

- `focused` 는 포커스가 셸 안 어디에든 있으면 `true` 입니다. 포커스가 셸 밖으로 나갈 때만 `false` 가 됩니다.
- 셸의 padding 이나 아이콘을 눌러도 input 에 포커스가 갑니다(`pressAnywhereFocusesInput`). 일반 input 은 상자 어디를 눌러도 포커스가 가기 때문입니다. 스스로 누르기를 처리하는 요소(`HANDLES_ITS_OWN_PRESS`: button, a, input, textarea, select, label, `[role=button]`)는 건드리지 않습니다.
- Clear 파트가 있으면(`clearable`) Escape 가 검색 필드처럼 값을 지웁니다.
- 빈 필드에서는 Escape 를 그대로 흘려보냅니다(`escapeLeftForEnclosingPopup`). 바깥의 dialog 나 팝업이 닫힐 수 있어야 합니다. IME 조합 중인 Escape 도 무시합니다.

### 알아둘 것

- `onEscape` 는 각 필드가 input 의 `onKeyDown` 에서 앱의 핸들러 뒤에 부릅니다. 앱의 핸들러가 `preventDefault()` 하면 지우지 않습니다.
- TextArea 는 `clearable` 을 넘기지 않아 Escape 로 지우지 않습니다.

## use-input-value.ts

### 쓰는 법

```ts
// components/form/text-field/use-text-field.ts
const observed = useInputValue(
  inputRef,
  String(native.value ?? native.defaultValue ?? ''),
  notify ?? undefined,                     // FieldNotifyContext: Field 가 값을 다시 읽는다
);
const filled = (native.value != null ? String(native.value) : observed.value) !== '';

onChange: (event: ChangeEvent<HTMLInputElement>) => {
  observed.rereadInOnChangeBatch();
  native.onChange?.(event);
},
```

### 왜 이렇게

- React 가 제어 값을 쓸 때, react-hook-form 의 `reset()` 과 `setValue()` 가 `input.value` 를 직접 쓸 때, native 폼 reset 이 기본값을 되돌릴 때 모두 input 이벤트가 없습니다. 그래서 input 인스턴스의 `value` setter 를 감싸 모든 쓰기를 봅니다.
- React 의 value tracker 도 인스턴스의 `value` 속성입니다. 그래서 바꿔치지 않고 감싸며(`reactValueTracker`), cleanup 에서 되돌립니다.
- setter 쓰기와 폼 reset 은 microtask 뒤에 읽고(`syncOnceSettled`) `onExternalChange` 를 부릅니다. 매 렌더 뒤(layout effect)에도 읽습니다.
- 타이핑은 input 의 React `onChange` 에서 읽습니다(`rereadInOnChangeBatch`). input 에 native `input` 리스너를 달아 거기서 setState 하면, 브라우저가 보낸 이벤트에서는 리스너마다 microtask 가 돌아 React 의 리스너보다 먼저 렌더됩니다. 제어 input 은 옛 `value` 로 다시 그려지고, React 는 값이 그대로라고 보아 `onChange` 를 부르지 않습니다. 타이핑이 사라집니다.
- `onExternalChange` 는 이벤트 없이 바뀐 값을 Field 에 알립니다. Field 가 `data-filled`, `data-dirty` 를 유지합니다(RULES.md 의 Callbacks).

### 알아둘 것

- 브라우저의 폼 reset 은 JS setter 를 거치지 않습니다. reset 은 `reset` 이벤트로만 압니다.
- 스크립트가 부른 reset(`form.reset()`, 테스트)에서는 microtask 가 복원된 값을 읽습니다. 사용자가 reset 버튼을 누르면 Chromium 은 이 microtask 를 값 복원 전에 돌립니다([`useFormReset`](../../hooks/README.md#use-form-resetts)).
- NumberField 와 TelField 는 이 hook 을 쓰지 않고 값을 자기 state 로 가집니다.

## use-merged-ref.ts

### 쓰는 법

```ts
// components/form/number-field/use-number-field.ts
const ref = useMergedRef(inputRef, childProps?.ref, rootProps.ref, own.ref, assertInput);

function assertInput(node: HTMLInputElement) {
  invariant(node.tagName === 'INPUT', '`<NumberField.Input asChild>` must forward its ref to an input.');
}
```

### 왜 이렇게

- `mergeProps` 는 렌더마다 새 ref 함수를 만들고, React 는 함수가 바뀐 ref 를 떼었다 다시 붙입니다. 그러면 소비자의 ref callback 이 키 입력마다 불립니다. 그래서 ref 들 자체를 의존성으로 한 `useCallback` 으로 합칩니다.
- 합치는 ref 는 필드 내부 ref, `asChild` 자식의 ref, 루트에 준 ref, Input 파트의 ref 입니다.
- `check` 는 붙을 때마다 불립니다. `asChild` 자식이 ref 를 진짜 input(TextArea 는 textarea)에 넘기는지 확인합니다.
- React 19 이전 방식의 wrapper(react-textarea-autosize 의 composed ref)는 ref 가 돌려준 cleanup 을 버리고 `null` 을 넘겨 뗍니다. 그래서 `null` 이 오면 그때 cleanup 을 돌립니다(`wrapperIgnoredCleanup`).
- cleanup 은 한 번만 돕니다. React 가 돌려받은 cleanup 을 부르든 wrapper 가 `null` 을 넘기든 먼저 온 쪽이 돌리고, 나중 쪽은 아무것도 하지 않습니다(`detach.current !== run`).

## clear-input.ts

### 쓰는 법

```ts
// internal/text-control/use-text-control.ts
const clear = () => {
  const input = inputRef.current;
  if (input && !disabled && !readOnly) clearInput(input);
};

// components/form/tel-field/use-tel-field.ts: 국제 번호 전체를 붙여넣으면
event.preventDefault();
replaceInput(event.currentTarget, pasted);
```

### 왜 이렇게

- 지우기와 바꾸기는 진짜 편집으로 합니다. 그래야 React 의 `onChange`, react-hook-form 의 `register()`, native 리스너가 모두 봅니다.
- `execCommand` 로 편집하면(`editOnUndoStack`) 브라우저의 실행 취소 스택에 남아 Cmd+Z 로 글자가 돌아옵니다.
- `execCommand` 는 포커스가 있는 요소를 편집하므로, `focus()` 가 실제로 된 경우(`focusTook`)에만 씁니다.
- `execCommand` 가 없으면(jsdom, 일부 내장 엔진) prototype 의 `value` setter 로 쓰고 input 이벤트를 직접 보냅니다(`editWithInputEvent`). prototype setter 는 React 의 value tracker 가 가로채지 않으므로 React 가 이 편집을 변경으로 봅니다.
- 직접 보내는 이벤트의 `inputType`(`deleteContentBackward`, `insertReplacementText`)은 브라우저의 이벤트처럼 편집의 종류를 알립니다.

### 알아둘 것

- 두 함수 모두 먼저 input 에 포커스를 줍니다(`preventScroll`). 부른 뒤에는 포커스가 input 에 있습니다.
- `value = ''` 처럼 인스턴스에 직접 쓰지 않습니다. React 의 value tracker 가 그 값을 기억해서 `onChange` 가 불리지 않습니다.
