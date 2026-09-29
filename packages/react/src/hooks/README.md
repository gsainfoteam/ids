# hooks

여러 컴포넌트가 함께 쓰는 hook 입니다.

- `use-interactive.ts` 의 hook, 함수, 상수, 타입과 `useControllableState` 는 `src/index.ts` 가 내보내는 공개 API 입니다. 이름이나 시그니처를 바꾸면 breaking change 입니다.
- `useFormReset` 은 내보내지 않습니다.

| 파일                                                     | 내용                                                 | 쓰는 곳                                                              |
| -------------------------------------------------------- | ---------------------------------------------------- | -------------------------------------------------------------------- |
| [`use-controllable-state.ts`](#use-controllable-statets) | 제어와 비제어를 한 모양으로 다루는 state             | 값이나 열림 상태를 가진 컴포넌트 대부분                              |
| [`use-form-reset.ts`](#use-form-resetts)                 | native 폼 reset 뒤에 컴포넌트 state 를 되돌리는 hook | 자기 state 를 가진 폼 컨트롤                                         |
| [`use-interactive.ts`](#use-interactivets)               | hover, press, focus 상태와 그 `data-*` 속성          | Button 계열, Checkbox, Radio, Chip, Accordion, `internal/surface.ts` |

## use-controllable-state.ts

`value` 가 있으면 제어, 없으면 비제어로 동작하는 state 입니다. `[current, setValue]` 를 돌려줍니다.

### 쓰는 곳

- Toggle, ToggleGroup, Accordion, Alert, Calendar, Chip, ColorPicker, TimePicker, Checkbox, CheckboxGroup, ChipField, ColorField, FileField, NumberField, PasswordField, Radio, RadioGroup, Rating, Select, Slider, [`internal/temporal-field`](../internal/temporal-field/README.md)

### 쓰는 법

```ts
// components/form/radio-group/use-radio-group.ts
const [value, setValue] = useControllableState<T | null>({
  value: valueProp,
  defaultValue,
  onValueChange: onValueChange as ((next: T | null) => void) | undefined,
});
const controlled = valueProp !== undefined;

useFormReset(rootRef, () => {
  if (!controlled) setValue(defaultValue, { silent: true });   // reset 은 편집이 아니다
});
```

### 왜 이렇게

- `value !== undefined` 면 제어입니다. `null` 은 제어된 빈 값입니다(RadioGroup, TimeField 의 빈 값).
- 제어일 때 `setValue` 는 `onValueChange` 만 부릅니다. 화면은 부모가 `value` 를 바꿔야 바뀝니다.
- 새 값이 지금 값과 같으면(`isEqual`, 깊은 비교) 아무것도 하지 않습니다(`sameEvenIfRebuilt`). Slider 와 그룹은 움직이거나 누를 때마다 배열이나 Set 을 새로 만드므로, 참조만 비교하면 바뀌지 않은 값도 바뀌었다고 알립니다.
- `{ silent: true }` 는 값만 바꾸고 `onValueChange` 를 부르지 않습니다. native 폼 reset 은 change 이벤트 없이 값을 되돌리므로, 기본값을 되돌리는 컴포넌트가 일어나지 않은 편집을 알리지 않게 합니다.

### 알아둘 것

- updater 함수(`setValue((prev) => ...)`)는 React 의 state 큐가 아니라 이번 렌더의 `current` 로 계산됩니다. 한 이벤트에서 두 번 부르면 두 번째도 같은 `current` 를 봅니다.
- 비제어일 때 `defaultValue` 는 첫 렌더에서만 읽습니다. 나중에 바뀐 `defaultValue` 는 reset 핸들러가 직접 넘길 때만 반영됩니다.
- 폼 reset 으로 값을 되돌리는 컴포넌트는 모두 `silent` 로 부릅니다(Select 와 ChipField 포함). `tests/select.test.tsx` 와 `tests/chip-field.test.tsx` 가 reset 이 값을 알리지 않는지 확인합니다.

## use-form-reset.ts

`<form>` 의 native reset 뒤에 컴포넌트가 자기 state 를 기본값으로 되돌리게 하는 hook 입니다.

### 쓰는 곳

- Checkbox, CheckboxGroup, ChipField, ColorField, FileField, NumberField, OTPField, Radio, RadioGroup, Rating, Select, Slider, TelField, ToggleGroup, [`internal/temporal-field`](../internal/temporal-field/README.md)
- PasswordField 와 Field 는 `reset` 리스너를 따로 둡니다. text-control 의 `useInputValue` 도 `reset` 을 직접 듣습니다.

### 쓰는 법

```ts
// internal/temporal-field/use-temporal-field.ts
useFormReset(controlRef, () => {
  setValue(options.defaultValue, { silent: true });
  dropDraft();
  setOpen(false);
});
```

### 왜 이렇게

- native reset 은 각 컨트롤의 DOM 값을 되돌리지만, 자기 state 를 가진 컴포넌트는 옛 값을 다시 렌더합니다. 그래서 reset 을 듣고 state 를 되돌립니다.
- 폼은 `ownerForm` 으로 찾습니다. `form` 속성이 있는 요소(input, select, textarea, button)는 `element.form` 을, 폼 요소가 아닌 것(Slider 나 RadioGroup 의 `div` 루트)은 가장 가까운 `<form>` 을 씁니다.
- 핸들러는 리스너 안에서 바로 돌지 않고 `setTimeout` 으로 한 task 미룹니다(`afterBrowserRestoresValues`). 그때는 브라우저가 컨트롤 값을 되돌렸고 뒤에 등록된 리스너도 모두 돌았으므로, `event.defaultPrevented` 로 취소된 reset 을 건너뜁니다.
- 최신 `onReset` 은 ref 에 두므로 리스너는 다시 붙지 않습니다.

### 알아둘 것

- microtask 로는 부족합니다. 사용자가 직접 누른 `<button type="reset">` 에서 Chromium 은 리스너가 끝나자마자 microtask 를 돌리는데, 그때는 컨트롤 값을 되돌리기 전이고 뒤의 리스너가 아직 `preventDefault()` 를 부르지 않았습니다. 스크립트의 `form.reset()` 에서는 microtask 도 복원 뒤에 돌아서 차이가 보이지 않습니다. 그래서 테스트는 진짜 reset 버튼을 누릅니다.
- 되돌릴 값은 보통 prop(`defaultValue` 등)에서 가져옵니다. 비제어 Radio 는 브라우저가 되돌린 `input.checked` 를 읽고(`restoredByBrowser`), React 의 value tracker 에도 그 값을 알립니다(`letReactSeeRestoredValue`).
- `div` 루트는 가장 가까운 `<form>` 조상으로 찾으므로, `form="id"` 속성으로 바깥 폼에 묶인 그룹은 그 폼의 reset 을 듣지 못합니다.

## use-interactive.ts

컴포넌트가 hover, press, focus 상태를 스스로 갖게 하는 hook 과 그 헬퍼입니다. 상태를 보여 주는 규칙은 [InteractiveState](../foundations/interactive-state/README.md) 에 있습니다.

### 쓰는 곳

| 이름                                        | 쓰는 곳                                                                                                        |
| ------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| `useInteractiveProps`                       | Button 의 `use-button.ts`. Button, IconButton, Toggle, IconToggle, FloatingButton 이 이 hook 을 거친다         |
| `useInteractive`                            | Checkbox, Radio, Chip, Accordion.Trigger, [`internal/surface.ts`](../internal/README.md#surfacets)(Card, Item) |
| `interactiveDataProps`                      | Chip, Accordion.Trigger, `internal/surface.ts`, `useInteractiveProps`                                          |
| `WithInteractiveValues`, `InteractiveState` | Button, IconButton, Toggle, IconToggle, FloatingButton 의 Props                                                |
| `INTERACTIVE_STATE_DEFAULTS`                | InteractiveState foundation 스토리                                                                             |

### 쓰는 법

```tsx
// components/action/button/use-button.ts: prop 을 풀고, 핸들러와 data-* 를 한 번에 받는다
const { state, handlers, dataProps, props: resolved } = useInteractiveProps<HTMLElement, P>(props);

// components/data/accordion/trigger.tsx: 상태만 필요하면 useInteractive
const { state: interaction, handlers } = useInteractive<HTMLButtonElement>({
  disabled: item.state.disabled,
  onKeyDown: (event) => {
    onKeyDown?.(event);
    if (!event.defaultPrevented) root.onTriggerKeyDown(event);
  },
  onKeyUp,
  onFocus,
  onBlur,
  // ...
});

<button {...handlers} {...interactiveDataProps(interaction)} /* ... */ />
```

### 왜 이렇게

- 상태의 주인은 컴포넌트입니다. `onInteractionChange` 는 부모에게 상태의 사본을 알리는 콜백이고, 제어 prop 이 아닙니다.
- hover 는 `pointerType === 'mouse'` 일 때만 켭니다. 터치에서는 켜지지 않습니다.
- `focusVisible` 은 focus 때 요소가 `:focus-visible` 인지 읽어 정합니다. Enter 와 Space 의 keydown 은 active 를 켜고 keyup 은 끕니다.
- 누르는 도중이나 pointer 아래에서 disabled 가 된 컨트롤은 pointerleave, pointerup 을 받지 못합니다(native disabled button 은 pointer 이벤트를 아예 받지 않습니다). 그대로 두면 반응하지 않는 컨트롤에 hover 배경이 남으므로, `disabled` 가 켜지는 렌더에서 바로 끕니다(`disabledBefore`, `stuckWithoutPointerEvents`).
- `interactiveDataProps` 는 DOM 에 pressed, active, hovered 중 하나만 이 순서의 우선순위로 붙입니다(`pressedOverActiveOverHovered`). 같은 속성(배경 등)을 두고 클래스끼리 다투지 않게 하기 위해서입니다. render prop 이 받는 `state` 는 원래 값을 그대로 둡니다.
- `WithInteractiveValues<P>` 는 prop 을 `T | ((state) => T)` 로 넓힙니다. 이벤트 핸들러, 이미 함수인 prop, `ref`, `disabled`, `key`, `formAction`, `pressed`, `defaultPressed`, `onPressedChange`, `value` 는 넓히지 않습니다.
- `resolveInteractiveProps` 는 함수인 prop 을 state 로 풉니다. `CALLBACK_PROPS`(`on*`, `formAction`, `ref`)는 state 를 받는 함수가 아니라 콜백이므로 그대로 둡니다.
- `useInteractiveProps` 는 props 에서 옵션을 골라 `useInteractive` 에 넘기고, 나머지를 풀고, 핸들러 키(`INTERACTIVE_HANDLER_KEYS`)와 DOM 에 없는 키(`pressed`, `defaultPressed`, `onPressedChange`, `onInteractionChange`)를 뺍니다.

### 알아둘 것

- 돌려받은 `handlers` 를 요소에 펼칩니다. `useInteractiveProps` 의 `props` 에는 핸들러 키가 빠져 있어서 `props` 만 펼치면 상태가 바뀌지 않습니다. 앱이 넘긴 핸들러는 `handlers` 안에서 불립니다.
- 함수 자체를 값으로 받는 prop 을 새로 만들면 `CALLBACK_PROPS` 에 더합니다. 아니면 렌더 중에 state 를 인자로 불립니다.
- `onInteractionChange` 는 마운트할 때도 한 번 불립니다.
- DOM 속성 이름은 키를 kebab-case 로 바꾼 것입니다(`focusVisible` 은 `data-focus-visible`). CSS 패키지의 `focus-ring` 이 `[data-focus-visible]` 을 읽습니다.
