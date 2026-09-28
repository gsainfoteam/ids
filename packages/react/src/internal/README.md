# internal

여러 컴포넌트가 함께 쓰지만 패키지 밖으로 내보내지 않는 코드입니다.

- `src/index.ts` 가 내보내지 않으므로 이름과 모양을 바꿔도 공개 API 는 그대로입니다. 대신 이 코드를 쓰는 컴포넌트의 동작이 함께 바뀝니다.
- 한 컴포넌트만 쓰는 로직은 여기 두지 않고 그 컴포넌트 폴더의 `use-<component>.ts` 에 둡니다.
- hook 은 [`hooks/`](../hooks/README.md), 범용 함수는 [`utils/`](../utils/README.md) 에 있습니다.

## 모듈 목록

| 모듈                                             | 내용                                                                | 쓰는 곳                                                                                                        |
| ------------------------------------------------ | ------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| [`arc.tsx`](#arctsx)                             | 원호 SVG 와 그 치수                                                 | Spinner, Progress                                                                                              |
| [`control-surface.ts`](#control-surfacets)       | 버튼류 컨트롤의 클래스 조각과 color scheme 변수                     | Button, IconButton, Toggle, IconToggle, FloatingButton                                                         |
| [`date-locale.ts`](#date-localets)               | 문자열 locale 해석, locale 의 시간제와 날짜 순서                    | Calendar, TimePicker, DateField, TimeField, DateTimeField, `temporal-field/`                                   |
| [`field-popup/`](./field-popup/README.md)        | 필드가 여는 팝업(popover, drawer), 목록 스타일, 파트 헬퍼           | Select, ChipField, ColorField, `temporal-field/`, FileField, TimePicker                                        |
| [`field-surface.ts`](#field-surfacets)           | 텍스트류 필드의 상자와 상자 안 버튼의 클래스 조각                   | `text-control/`, `temporal-field/`, `field-popup/`, Select, ColorField, FileField, PasswordField, TextArea     |
| [`form-bridge.ts`](#form-bridgets)               | 폼 라이브러리 bridge 가 Field 의 컨트롤에 값을 잇는 공용 함수       | `react-hook-form.tsx`, `tanstack-form.tsx`                                                                     |
| [`form-value.tsx`](#form-valuetsx)               | native input 이 없는 컨트롤을 FormData 와 제약 검증에 넣는 컴포넌트 | Select, ChipField, ColorField, FileField, Slider, Rating, CheckboxGroup, ToggleGroup, `temporal-field/`        |
| [`icon-label.ts`](#icon-labelts)                 | 아이콘만 있는 컨트롤의 이름을 아이콘에서 찾는 hook                  | IconButton, IconToggle, FloatingButton                                                                         |
| [`icon-square.ts`](#icon-squarets)               | 아이콘만 있는 정사각형 컨트롤의 크기                                | IconButton, IconToggle                                                                                         |
| [`messages.ts`](#messagests)                     | 컴포넌트가 스스로 그리는 문구 전부와 기본 locale                    | 문구를 그리는 모든 컴포넌트, `date-locale.ts`                                                                  |
| [`pressable.ts`](#pressablets)                   | `div` 가 `button` 처럼 눌리게 하는 hook                             | Button, `surface.ts`                                                                                           |
| [`slider-surface.ts`](#slider-surfacets)         | 슬라이더 트랙의 가장자리와 thumb 모양                               | Slider, ColorPicker                                                                                            |
| [`state-props.ts`](#state-propsts)               | state 를 받는 `className`, `style`, `children` 의 타입과 풀이 함수  | Accordion, Avatar, AvatarGroup, Badge, Card, Chip, Item, ColorPicker, Select, ChipField, ColorField, FileField |
| [`surface.ts`](#surfacets)                       | 통째로 누르는 카드와 목록 행의 hook                                 | Card, Item, Chip                                                                                               |
| [`temporal-field/`](./temporal-field/README.md)  | 날짜, 시간 필드의 본체                                              | DateField, TimeField, DateTimeField                                                                            |
| [`text-control/`](./text-control/README.md)      | 글자 입력 필드의 셸, Clear, 값 추적 hook                            | TextField, PasswordField, NumberField, TelField, TextArea                                                      |
| [`toggle-surface.ts`](#toggle-surfacets)         | 켜진 모양을 그리는 toggle variant                                   | Toggle, IconToggle                                                                                             |
| [`use-checked-writes.ts`](#use-checked-writests) | 바깥 코드가 `input.checked` 에 직접 쓴 값을 알아채는 hook           | Checkbox, Radio                                                                                                |

## arc.tsx

Spinner 와 원형 Progress 가 그리는 원호의 SVG 와 치수입니다.

### 쓰는 곳

- Spinner: `Arc` 를 그대로 그립니다.
- Progress 원형: `Track`, `Indicator` 파트가 `<circle>` 을 직접 그리고 `ARC_RADIUS`, `ARC_CIRCUMFERENCE` 만 가져갑니다.

### 쓰는 법

```tsx
// components/feedback/spinner/index.tsx
<Arc
  {...rest}
  ref={mergedRef}
  ratio={0.25}                  // 둘레의 1/4 만 그린다
  width={SIZE_WHEN_UNSTYLED}    // '1em'. 클래스가 아니라 속성
  height={SIZE_WHEN_UNSTYLED}
  className={root({ className: resolvedClassName })}
  trackClassName={track()}
/>

// components/feedback/progress/index.tsx (Progress.Indicator, circular)
<circle
  cx="12"
  cy="12"
  r={ARC_RADIUS}
  strokeWidth="3"
  strokeDasharray={ARC_CIRCUMFERENCE}
  strokeDashoffset={ARC_CIRCUMFERENCE * (1 - (ratio ?? 0.25))}
  className={styles.indicatorCircle({ className: resolvedClassName })}
/>
```

### 왜 이렇게

- `Arc` 는 크기와 애니메이션을 정하지 않고 호출하는 쪽에 맡깁니다. Spinner 가 `size-*` 클래스를 가지면 버튼의 아이콘 크기 규칙(`[&_svg:not([class*='size-'])]`, [control-surface.ts](#control-surfacets))이 그 Spinner 를 건너뜁니다.
- 그래서 Spinner 는 기본 크기를 `width`, `height` 속성(`1em`)으로 줍니다. 버튼 안에서는 위 규칙의 CSS 가 이 속성을 이깁니다.
- 표시 원은 `origin-center -rotate-90` 으로 12시에서 시작합니다. `strokeDashoffset` 을 `둘레 * (1 - ratio)` 로 두면 `ratio` 만큼만 그려집니다.
- Progress 의 원형은 Track 과 Indicator 가 따로 쓰는 파트라서, 두 원을 한 번에 그리는 `Arc` 대신 치수만 가져갑니다. 같은 상수를 써서 Spinner 와 같은 원이 됩니다.

### 알아둘 것

- `ARC_RADIUS`, `strokeWidth`(3), `viewBox`(`0 0 24 24`)를 바꾸면 Progress 도 같이 고칩니다. Progress 는 `strokeWidth` 와 `viewBox` 를 따로 적습니다.
- `Arc` 에 `size-*` 나 `animate-*` 클래스를 넣지 않습니다. 둘 다 `Spinner.Style` 이 정합니다.

## control-surface.ts

버튼류 컨트롤이 자기 `tv` 에 넣는 클래스 조각입니다. `base`, `size`, `variant`, `colorScheme` 네 묶음입니다.

### 쓰는 곳

| 컴포넌트       | 가져가는 조각                                                                    |
| -------------- | -------------------------------------------------------------------------------- |
| Button         | `base`, `size`, `variant`, `colorScheme`                                         |
| Toggle         | `base`, `size`, `colorScheme`. variant 는 [toggle-surface.ts](#toggle-surfacets) |
| IconButton     | `base`, `variant`, `colorScheme`. 크기는 [icon-square.ts](#icon-squarets)        |
| IconToggle     | `base`, `colorScheme`. variant 는 toggle-surface, 크기는 icon-square             |
| FloatingButton | `base`, `colorScheme`. variant 는 자기 `opaqueFills`                             |

### 쓰는 법

```tsx
// components/action/button/index.tsx
export const Style = tv({
  base: controlSurface.base,
  variants: {
    variant: controlSurface.variant,
    colorScheme: controlSurface.colorScheme,
    size: controlSurface.size,
  },
  defaultVariants: { variant: 'solid', colorScheme: 'primary', size: 'standard' },
});

// components/action/icon-toggle/index.tsx
export const Style = tv({
  base: [controlSurface.base, iconSquare.base],
  variants: {
    variant: toggleSurface.variant,
    colorScheme: controlSurface.colorScheme,
    size: iconSquare.size,
  },
  defaultVariants: { variant: 'ghost', colorScheme: 'primary', size: 'standard' },
});
```

### 왜 이렇게

- color scheme 은 CSS 변수만 정하고 variant 는 그 변수만 읽습니다. variant 4 개와 scheme 6 개의 조합마다 클래스를 따로 쓰지 않아도 모든 조합이 맞습니다.

| 변수                | 쓰는 곳                                                                        |
| ------------------- | ------------------------------------------------------------------------------ |
| `--control-fill`    | solid 배경, soft 의 옅은 배경                                                  |
| `--control-on-fill` | solid 배경 위의 글자                                                           |
| `--control-accent`  | soft 글자. status scheme 은 옅은 배경에서도 읽히는 `-strong` 색                |
| `--control-quiet`   | outline, ghost 글자. primary 와 neutral 은 `on-surface`, 나머지는 `-strong` 색 |
| `--control-hover`   | outline, ghost 의 hover 배경. muted, 또는 status 색 10%                        |
| `--control-ring`    | focus ring 과 focus 때의 테두리. neutral 도 primary                            |

- scheme 색은 solid 와 soft 만 씁니다. outline 과 ghost 는 primary 에서도 neutral 이고, 브랜드 색은 focus 에 남깁니다. shadcn/ui 가 primary 버튼 옆의 보조 버튼을 조용하게 두는 방식입니다.
- `base` 에는 primary 의 변수를 담은 `fallbackScheme` 이 들어 있습니다. `colorScheme` 을 받지 않는 컴포넌트도 여섯 변수가 모두 정의돼야 하기 때문입니다. `colorScheme` 을 주면 `cn` 이 같은 변수의 뒤쪽 값만 남깁니다.
- `focus-ring` 은 ring 을 primary 로 칠합니다. `ringFollowsScheme` 이 cascade 에서 뒤에 와서 ring 과 focus 테두리를 `--control-ring` 으로 바꿉니다.
- `trimBesideIconOrSpinner`: 라벨 옆의 아이콘은 그쪽 가장자리에 이미 시각적 무게를 더하므로, 아이콘이 있는 쪽의 padding 을 줄입니다. standard 는 `px-4` 에서 `ps-3`/`pe-3`, tiny 는 `px-3` 에서 `ps-2.5`/`pe-2.5` 입니다.
- Spinner 도 svg 이고, Spinner 가 함께 그리는 `role="status"` span 과 `aria-hidden` 장식도 가장자리의 아이콘으로 칩니다. 그래서 로딩 중에 아이콘을 Spinner 로 바꿔도 라벨이 움직이지 않습니다.
- `size-*` 클래스가 없는 svg 는 아이콘 토큰 크기(`--ids-size-icon-standard`, `--ids-size-icon-tiny`)를 따릅니다.
- 로딩은 disabled 와 `<Spinner />` 를 합친 상태입니다. `aria-busy` 인 컨트롤은 거절이 아니라 작업 중으로 보여야 하므로 `cursor-progress` 를 쓰고, `cursor-not-allowed` 는 `not-aria-busy` 일 때만 씁니다.

### 알아둘 것

- 클래스는 모두 `cn('...')` 안의 리터럴입니다. 접두사와 크기를 조합해 만든 클래스는 Tailwind 가 생성하지 않고, 경고 없이 적용되지 않습니다. `trimBesideIconOrSpinner` 가 standard 와 tiny 를 따로 적는 이유입니다.
- scheme 을 더하면 여섯 변수를 모두 정의합니다. 빠진 변수는 `fallbackScheme` 의 primary 값으로 남습니다.
- `schemes` 는 `satisfies Record<ControlColorScheme, string>` 이라 `ControlColorScheme` 과 `schemes` 중 한쪽만 고치면 타입 검사가 실패합니다.
- 아이콘만 있는 컨트롤은 `size` 대신 `iconSquare.size` 를 씁니다. `size` 의 padding 과 trim 이 정사각형을 깹니다.

## date-locale.ts

문자열 locale 을 date-fns `Locale` 로 바꾸고, locale 의 시간제와 날짜 순서를 읽는 함수입니다.

### 쓰는 곳

- `resolveLocale`: Calendar, TimePicker, DateField, TimeField, DateTimeField
- `hourCycleOf`: TimePicker 의 `time.ts` (`resolveTimeFormat`)
- `periodFirst`: TimePicker, [temporal-field](./temporal-field/README.md#formatts) 의 `format.ts`
- `patternHourCycle`: temporal-field 의 `format.ts`
- `tokensOf`, `shortDatePattern`: DateField 의 `parse.ts`

### 쓰는 법

```ts
// components/form/time-field/index.tsx
const dateLocale = resolveLocale(locale);        // 'ko-KR' 같은 문자열 또는 date-fns Locale
const display = formatter(
  format === undefined || formatNamesHourCycle
    ? timePattern(dateLocale, precision, resolveTimeFormat(cycle, dateLocale))
    : format,
  dateLocale,
);

// components/data/time-picker/time.ts
export const resolveTimeFormat = (value: TimeFormat | undefined, locale: Locale): TimeFormat =>
  value ?? hourCycleOf(locale);

// components/form/date-field/parse.ts
const orderOf = (locale: Locale) =>
  uniq(tokensOf(shortDatePattern(locale)).match(/[yMd]/g) ?? ['y', 'M', 'd']) as Part[];
```

### 왜 이렇게

- `resolveLocale` 은 `ko`, `ko-KR`, `en`, `en-US` 네 태그만 문자열로 찾습니다(`builtIn`). date-fns locale 전체를 표로 두면 쓰지 않는 locale 까지 모든 앱 번들에 들어갑니다. 다른 언어는 앱이 `Locale` 객체를 직접 import 해서 넘깁니다.
- 인자를 생략하면 `messages.locale`(`'ko-KR'`)을 씁니다.
- `hourCycleOf` 는 사람들이 기대하는 시간제를 CLDR, 곧 브라우저의 `Intl` 에서 읽습니다(`intlHourCycle`). `ko` 는 `Intl` 에서 12시간제(`h12`)인데 date-fns `ko` 의 짧은 시간 패턴은 `HH:mm` 입니다. 패턴(`patternHourCycle`)은 `Intl` 이 모르는 locale 코드일 때만 씁니다.
- `patternHourCycle` 은 locale 자신의 짧은 시간 패턴이 쓰는 시간제입니다. date-fns 의 `p` 는 이 시간제일 때만 그대로 쓸 수 있습니다.
- `periodFirst`: 한국어와 중국어는 오전/오후를 시 앞에 씁니다. 24시간제 locale 을 12시간제로 보여 줄 때는 오전/오후가 들어 있는 첫 시간 패턴(`patternWithPeriod`, short, long, full 순)에서 순서를 가져옵니다. `ko` 는 short 가 `HH:mm` 이라 long 인 `a H:mm:ss z` 에서 읽습니다.
- `tokensOf` 는 작은따옴표로 감싼 글자(`QUOTED_LITERAL`)를 지우고 패턴을 읽습니다. 따옴표 안은 토큰이 아니라 글자 그대로입니다. 예를 들어 `sv`, `nb` 의 full 시간 패턴 `'kl'. HH:mm:ss zzzz` 에서 `kl` 의 `k` 는 시 토큰과 같은 글자입니다.
- `shortDatePattern` 은 locale 의 숫자 날짜입니다. `ko` 는 `y.MM.dd`, `en-US` 는 `MM/dd/yyyy`, `de` 는 `dd.MM.y` 입니다.

### 알아둘 것

- `builtIn` 에 없는 문자열을 넘기면 `resolveLocale` 이 `IdsError` 를 던집니다(`invariant`). 개발 빌드에서만 알리는 경고가 아닙니다.
- `formatLong` 이 없는 `Locale` 에서는 패턴이 빈 문자열이라 `patternHourCycle` 은 `'24h'`, `periodFirst` 는 `false` 를 돌려줍니다.

## field-surface.ts

텍스트류 필드의 상자(`fieldSurface`)와, 그 상자 안에 놓이는 ghost IconButton(`fieldAction`)의 클래스 조각입니다.

### 쓰는 곳

- `fieldSurface`: [text-control](./text-control/README.md) 의 `textControlStyle`, [temporal-field](./temporal-field/README.md), [field-popup](./field-popup/README.md) 의 `fieldTrigger`(Select, ChipField, ColorField, FileField 가 가져감), TextArea
- `fieldAction.padded`: text-control 의 `action` 슬롯(각 필드의 Clear, NumberField 의 `Increment`, `Decrement`), PasswordField 의 보기 버튼
- `fieldAction.unpadded`: Select, ColorField, FileField 의 Clear, temporal-field 의 Clear 와 달력 버튼
- `FieldSurfaceVariant`: TextField, NumberField, TelField, PasswordField, TextArea, field-popup 의 `FieldTriggerVariant`

### 쓰는 법

```ts
// internal/text-control/index.tsx: 상자가 padding 을 가진다
export const textControlStyle = tv({
  slots: {
    root: ['inline-flex w-full min-w-0 cursor-text items-center', fieldSurface.base],
    action: fieldAction.base,
  },
  variants: {
    variant: {
      outline: { root: fieldSurface.variant.outline },
      soft: { root: fieldSurface.variant.soft },
      ghost: { root: fieldSurface.variant.ghost },
    },
    size: {
      standard: { root: fieldSurface.size.standard, action: fieldAction.padded.standard },
      tiny: { root: fieldSurface.size.tiny, action: fieldAction.padded.tiny },
    },
  },
});

// components/form/select/index.tsx: trigger 가 상자를 채우고 padding 을 가진다
size: {
  standard: { root: 'h-(--ids-size-control-standard) ...', trigger: 'gap-2 px-3', clear: fieldAction.unpadded.standard },
  tiny: { root: 'h-(--ids-size-control-tiny) ...', trigger: 'gap-1.5 px-2.5', clear: fieldAction.unpadded.tiny },
},
```

### 왜 이렇게

- TextField 의 컨테이너, Select 와 날짜 필드의 trigger, ChipField 가 모두 같은 상자를 그립니다. `variant` 는 강도만 정합니다: `outline` 은 테두리와 surface 배경, `soft` 는 muted 배경, `ghost` 는 배경과 테두리가 없습니다.
- focus 와 invalid 색은 여기서 정하지 않습니다. `focus-ring` 이 이 파일이 그린 `inset-ring` 테두리의 색을 바꾸므로 그 상태를 되풀이해 적지 않습니다.
- `soft` 와 `ghost` 도 투명한 `inset-ring-1` 을 그립니다. `focus-ring` 은 inset ring 의 색만 바꾸므로, 폭이 있는 inset ring 이 있어야 focus 와 invalid 테두리가 보입니다.
- `fieldAction` 은 상자 안의 버튼(Clear, 보기 버튼, stepper, 달력 버튼)입니다. standard 는 36px 상자에 28px(`size-7`), tiny 는 32px 상자에 24px(`size-6`)라서 위아래로 4px 씩 남습니다. 양 끝의 버튼도 테두리에서 4px 떨어지도록 geometry 가 두 가지입니다.

| geometry   | 상자                                                           | 끝의 버튼                                                                                              |
| ---------- | -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| `padded`   | 상자가 padding 을 가진다 (TextField 등)                        | 음수 margin 으로 padding 안에 들어간다. standard 는 12px(`px-3`) 중 8px, tiny 는 10px(`px-2.5`) 중 6px |
| `unpadded` | trigger 가 상자 끝까지 차서 상자에 padding 이 없다 (Select 등) | 들어갈 padding 이 없으므로 `me-1`, `first:ms-1` 로 4px 를 둔다                                         |

- trigger 가 상자 끝까지 차는 것은 상자 어디를 눌러도 팝업이 열리게 하기 위해서입니다.
- `fieldAction.base` 는 hovered, active, pressed 를 각각 적습니다. `interactiveDataProps` 가 셋 중 하나만 붙이기 때문입니다(pressed > active > hovered).

### 알아둘 것

- padding 을 가진 상자에는 `padded`, trigger 가 채우는 상자에는 `unpadded` 를 씁니다. 바꿔 쓰면 `padded` 는 테두리 너머로 밀리고, `unpadded` 는 padding 만큼 안쪽에 떠 보입니다.
- `size-7`, `size-6` 과 음수 margin 은 control 높이 토큰(36px, 32px)과 상자 padding 에 맞춘 값입니다. 둘 중 하나를 바꾸면 이 값도 다시 계산합니다.
- disabled 필드는 루트에서 이미 흐려집니다(`data-disabled:opacity-50`). ColorField 와 FileField 는 disabled Clear 가 한 번 더 흐려지지 않도록 `alreadyDimmedByField`(`data-disabled:opacity-100`)를 더합니다.

## form-bridge.ts

폼 라이브러리 bridge(react-hook-form, TanStack Form)가 `Field` 의 컨트롤에 값을 잇는 공용 함수입니다.

### 쓰는 곳

- `src/react-hook-form.tsx`: `NativeField`(`register()` 를 잇는 `mergeBinding`)와 `ControlledField`(`value`, `checked` 모드).
- `src/tanstack-form.tsx`: 모든 모드.

### 쓰는 법

```tsx
// src/tanstack-form.tsx
bindControl={(original, control) =>
  mergeBinding(withoutDefaults(original), {
    name: field.name,
    [controlMode]: keepInputControlled(value, controlMode),
    onBlur: field.handleBlur,
    ...valueReports(control, controlMode, (next) => field.handleChange(next), {
      readsNativeEvents: false,
    }),
  })
}
```

### 왜 이렇게

- `mergeBinding`: 자식(소비자)의 핸들러가 먼저 돌고 라이브러리의 핸들러가 뒤에 항상 돕니다(`consumerFirstLibraryAlways`). 소비자가 `preventDefault` 해도 라이브러리는 값을 놓치지 않습니다. ref 는 `mergeRefs` 로 합칩니다.
- `withoutDefaults`: 값의 주인이 라이브러리라서 자식의 `defaultValue`, `defaultChecked` 를 뺍니다. 남기면 React 가 controlled 와 uncontrolled 를 섞었다고 경고합니다.
- `keepInputControlled`: 값이 `undefined` 면 `''`(checked 모드는 `false`)를 넘깁니다. `undefined` 를 넘기면 입력이 uncontrolled 로 바뀝니다.
- `valueReports`:
  - native `input`, `select` 는 `onChange` 로 알립니다. react-hook-form 은 change 이벤트를 직접 읽고(`readsNativeEvents: true`), TanStack Form 은 이벤트에서 꺼낸 `value` 나 `checked` 를 받습니다(`false`).
  - 컴포넌트는 `onValueChange`(checked 모드는 `onCheckedChange`)로 알립니다. 컴포넌트가 함께 넘기는 change 이벤트는 화면의 글자(`1,234`)를 담을 수 있어 값으로 쓰지 않습니다(`reportValueNotForwardedEvent`).
  - 한 편집이 두 콜백으로 와도 라이브러리에는 한 번만 갑니다(`reportOncePerEdit`).

### 알아둘 것

- 새 폼 라이브러리 bridge 도 이 네 함수로 `bindControl` 을 짭니다. 라이브러리마다 다른 것은 상태(`invalid`, `dirty`, `touched`, 오류 메시지)를 읽는 곳과 `readsNativeEvents` 뿐입니다.
- 이 파일은 폼 라이브러리를 import 하지 않습니다. 라이브러리는 각 entry(`/react-hook-form`, `/tanstack-form`)만 불러오는 optional peer 입니다.

## form-value.tsx

native input 이 없는 컨트롤(버튼 trigger, listbox, 버튼으로 그린 선택지 묶음)을 FormData 와 브라우저 제약 검증에 넣는 컴포넌트입니다.

### 쓰는 곳

- 값(`name`)과 `required`: Select, ChipField, ColorField, Rating, ToggleGroup, [temporal-field](./temporal-field/README.md)
- 값만: Slider
- `required` 만: CheckboxGroup, FileField. 값은 각 Checkbox 와 `<input type="file">` 이 이미 FormData 에 넣습니다.
- `message`: CheckboxGroup, Rating (`requiredMessage` prop)

### 쓰는 법

```tsx
// components/form/select/index.tsx: Select.Style 의 root 슬롯은 ['relative', fieldTrigger.base]
<div ref={rootRef} data-select="" className={styles.root({ className: resolveState(className, state) })}>
  {triggers.length ? triggers : <SelectTrigger />}
  {clears}
  <FormValue
    name={name}
    form={form}
    value={s.selected}
    required={required && !readOnly}
    disabled={disabled}
    anchor={select.triggerRef}      // 제출이 막히면 포커스를 받을 컨트롤
  />
</div>

// components/form/checkbox-group/index.tsx: name 없이 required 와 문구만
<FormValue
  value={value}
  form={form}
  required={required && !readOnly}
  disabled={disabled}
  anchor={anchorRef}
  message={requiredMessage}         // 기본값 messages.checkboxGroup.required
/>
```

### 왜 이렇게

- 값은 숨은 input(`type="hidden"`)이 FormData 로 보냅니다. 값이 여럿이면 값마다 하나씩 그립니다.
- 숨은 input 은 제약 검증을 받지 않습니다. 그래서 `required` 는 이름 없는 두 번째 input(`data-form-value-validator`)이 맡습니다.
- 이 input 은 컨트롤을 투명하게 덮습니다(`absolute inset-0`). 브라우저는 필수 입력 말풍선을 이 input 에 붙이므로 말풍선이 컨트롤 위에 뜹니다.
- 브라우저가 말풍선을 보여 주려고 이 input 에 포커스를 주면 `passFocusToControl` 이 포커스를 `anchor` 로 넘깁니다.
- `readOnly` 와 `disabled` 도 검증을 막습니다. 그래서 React 가 제어 input 에 요구하는 `onChange` 는 `readOnly` 대신 빈 함수(`readOnlyWouldBarValidation`)로 줍니다.
- `message` 를 주면 `setCustomValidity` 로 브라우저 문구를 바꿉니다. 브라우저 문구는 글 상자를 위한 말이라 체크박스 묶음이나 평점에는 맞지 않습니다.
- 빈 문자열은 값으로 치지 않습니다(`filled`). RULES.md 의 Forms 규칙대로 `FormValue` 는 빈 문자열을 제출하지 않습니다.

### 알아둘 것

- 컴포넌트의 `relative` 루트 안에 렌더합니다. 아니면 검증 input 이 가장 가까운 positioned 조상을 덮습니다.
- `name` 이 없으면 숨은 input 을 그리지 않습니다. 다른 input 이 이미 값을 보내는 컴포넌트는 `name` 을 빼고 씁니다.
- `disabled` 면 검증 input 을 그리지 않습니다.
- Field 는 `data-form-value-validator` 가 붙은 input 을 값 계산에서 빼고 유효성만 읽습니다(`components/form/field/control-state.ts` 의 `mirrorsGuardedValue`). 속성 이름을 바꾸면 Field 쪽도 고칩니다. 테스트와 스토리도 이 속성으로 검증 input 을 찾습니다.

## icon-label.ts

아이콘만 있는 컨트롤의 접근 가능한 이름(`aria-label`)을 아이콘에서 찾는 hook(`useIconLabel`)과 그 헬퍼입니다.

### 쓰는 곳

- IconButton, IconToggle: 늘 아이콘을 넘깁니다.
- FloatingButton: 라벨 글자가 없을 때만 아이콘을 넘깁니다(`iconOnly ? button.content : undefined`).

### 쓰는 법

```tsx
// components/action/icon-button/index.tsx
const glyph = icon ?? content;
const label = useIconLabel('IconButton', glyph, rest, element?.props as object | undefined);

return render(
  { ...rest, 'aria-label': label ?? rest['aria-label'] /* ... */ },
  glyph,
);

// components/action/floating-button/use-floating-button.ts
const label = useIconLabel(
  'FloatingButton',
  iconOnly ? button.content : undefined,       // 라벨이 보이면 찾을 이름이 없다
  rest,
  button.element?.props as object | undefined,
);
```

### 왜 이렇게

- 이름은 아이콘 요소의 `aria-label` 이나 `title`, 컴포넌트의 `displayName`, 함수 이름 순서로 찾습니다. 요소에서 못 찾으면 그 자식으로 내려가고, 글자는 건너뜁니다.
- 컴포넌트 이름은 읽을 수 있는 말로 바꿉니다(`humanizeIconName`). `ChevronDownIcon` 은 "Chevron down", `XMarkIcon` 은 "X mark", tabler 의 `IconPlus` 는 "Plus" 입니다.
- 함수 이름은 `UNMINIFIED_ICON_NAME`(`Icon` 으로 끝나는 PascalCase)에 맞을 때만 믿습니다. production minifier 는 함수 이름을 바꿉니다(Vite 기본 빌드에서 heroicons 의 `PlusIcon` 은 `jt` 같은 이름이 됩니다). 그래서 minify 된 빌드에서는 틀린 이름을 붙이는 대신 이름을 비워 둡니다.
- `displayName` 은 문자열 리터럴이라 minify 뒤에도 남습니다(lucide 는 `'Plus'` 를 넣습니다).
- `forwardRef` 는 함수를 `render` 에, `memo` 는 감싼 컴포넌트를 `type` 에 둡니다. `componentName` 은 둘을 두 단계까지 따라갑니다(`forwardRefRender`, `memoWrapped`).
- 함수 이름에서 얻은 이름은 개발 빌드에서는 되지만 minify 된 production 빌드에서는 조용히 사라집니다. 그래서 페이지에서 처음 한 번 경고합니다(`warnFunctionNameLabel`). 이름을 전혀 못 찾아도 개발 빌드에서 경고합니다.
- `needsNoLabel`: 컨트롤이나 `asChild` 로 그리는 요소가 이미 이름(`aria-label`, `aria-labelledby`, `title`)을 가지면 찾지 않습니다. `icon` 이 `undefined` 면 지금은 아이콘만 있는 컨트롤이 아니라는 뜻(`notIconOnlyRightNow`)이라 찾지 않습니다.

### 알아둘 것

- heroicons 는 `displayName` 이 없어서 production 빌드에서는 함수 이름 경로로 이름을 얻지 못합니다. 개발 경고가 앱에 `aria-label` 을 요구하는 이유입니다.
- 반환값이 `undefined` 면 컴포넌트는 `rest['aria-label']` 을 그대로 씁니다.
- 경고는 `isDevelopment` 로만 켭니다([utils/README](../utils/README.md#devts)).

## icon-square.ts

아이콘만 있는 컨트롤을 높이와 폭이 같은 정사각형으로 만드는 클래스 조각입니다.

### 쓰는 곳

- IconButton, IconToggle: `base` 는 `controlSurface.base` 와 함께, `size` 는 `iconSquare.size`

### 쓰는 법

```tsx
// components/action/icon-button/index.tsx
export const Style = tv({
  base: [controlSurface.base, iconSquare.base],
  variants: {
    variant: controlSurface.variant,
    colorScheme: controlSurface.colorScheme,
    size: iconSquare.size,
  },
});
```

### 왜 이렇게

- control surface 의 `base` 와 variant 는 쓰지만 `size` 는 쓰지 않습니다. `size` 의 가로 padding 과 아이콘 쪽 trim 이 정사각형을 깹니다.
- 안의 svg 는 모두 아이콘 크기(`[&_svg]:size-(--ids-size-icon-*)`)를 따릅니다. 아이콘 자리에 들어간 Spinner 도 같습니다.

### 알아둘 것

- `[&_svg]` 는 svg 에 붙은 `size-*` 클래스보다 우선합니다. 생성된 선택자(`.cls svg`)의 specificity 가 더 높습니다. control surface 의 `[&_svg:not([class*='size-'])]` 와 달리 아이콘의 크기 클래스를 따르지 않습니다.

## messages.ts

컴포넌트가 스스로 그리는 문구(라벨, placeholder, 검증 문구, 스크린 리더 안내)와 기본 locale 을 모은 객체입니다.

### 쓰는 곳

- Alert, AvatarGroup, Calendar, CheckboxGroup, Chip, ChipField, ColorField, ColorPicker, DateField, DateTimeField, FileField, Input, Kbd, NumberField, OTPField, PasswordField, Rating, Select, Slider, Spinner, TelField, TextArea, TimeField, TimePicker, [text-control](./text-control/README.md)
- `messages.locale`: [date-locale.ts](#date-localets) 의 `resolveLocale` 기본값

### 쓰는 법

```ts
// components/form/select/index.tsx: prop 이 없을 때의 기본값
'aria-label': props['aria-label'] ?? messages.select.clear,

// components/form/rating/index.tsx
requiredMessage = messages.rating.required,

// components/form/number-field/use-number-field.ts: 값을 끼우는 문구는 함수
messages.numberField.rangeUnderflow(format(min))
```

### 왜 이렇게

- 컴포넌트가 스스로 그리는 문자열은 모두 여기 둡니다. 나중에 locale provider 를 붙일 때 이 객체만 바꾸면 됩니다.
- 대부분의 문구는 prop(`aria-label`, `requiredMessage`, `incrementLabel` 등)이 대신할 수 있습니다. prop 이 없는 문구(`numberField.rangeUnderflow`, `telField.invalid`, `colorPicker.saturation` 등)는 이 객체에서만 바뀝니다.
- `locale`(`'ko-KR'`)은 date-fns locale 의 기본값입니다. 컴포넌트에 `locale` 을 따로 주지 않으면 월, 요일, 오전/오후 이름이 이 locale 에서 오므로, 나머지 문구와 같은 언어로 읽힙니다.

### 알아둘 것

- 새 문구는 컴포넌트 이름의 키 아래에 둡니다(`messages.select.clear`). 값을 끼워야 하면 함수로 둡니다(`messages.select.more`).
- 문구를 컴포넌트 안에 문자열로 직접 쓰지 않습니다. 이 객체를 바꾸는 것만으로 모든 문구가 바뀌어야 합니다.

## pressable.ts

`div` 같은 요소가 `button` 처럼 Enter 와 Space 로 눌리게 하는 hook(`usePressable`)과, 클릭이 안쪽 컨트롤에서 시작했는지 보는 함수(`isFromNestedControl`)입니다.

### 쓰는 곳

- [surface.ts](#surfacets) 의 `useSurface`: 누를 수 있는 Card, Item
- Button: `asChild` 자식이 `button` 도 `a` 도 아닌 HTML 요소일 때(`kind === 'element'`)

### 쓰는 법

```ts
// components/action/button/use-button.ts
const press = usePressable<HTMLElement>({
  enabled: kind === 'element',          // <Button asChild><div /></Button>
  disabled: softDisabled,
  onClick: softDisabled ? blockActivation : onClick,
  onKeyDown,
  onKeyUp: handlers.onKeyUp,
  onBlur: handlers.onBlur,
});
```

### 왜 이렇게

- 카드나 목록 행은 `div` 입니다. `<button>` 은 제목, 블록 요소, 다른 컨트롤을 담을 수 없습니다. 그래서 브라우저가 button 에 해 주는 일을 `div` 에서 대신합니다. `role="button"` 과 `tabIndex={0}` 을 붙이고, disabled 면 `aria-disabled` 를 붙이고 Tab 순서에서 뺍니다.

| 입력                        | 동작                                                 |
| --------------------------- | ---------------------------------------------------- |
| Enter keydown               | 바로 누른다. 누르고 있으면 반복한다                  |
| Space keydown               | 페이지 스크롤만 막는다                               |
| Space keyup                 | 누른다. keydown 뒤에 포커스가 떠났으면 누르지 않는다 |
| 안쪽 컨트롤에서 시작한 클릭 | `onClick` 을 부르지 않는다                           |

- `NESTED_CONTROL` 은 사용자가 따로 조작하는 요소입니다(링크, 버튼, 폼 요소, `role="checkbox"` 같은 위젯 역할, `tabindex` 가 -1 이 아닌 요소). 여기서 시작한 클릭은 그 요소의 것입니다. 이 검사가 없으면 행 안의 버튼을 눌렀을 때 행의 동작도 같이 돕니다.
- 키는 `event.target === event.currentTarget` 일 때만 처리합니다. 안쪽 컨트롤에 포커스가 있을 때 누른 키는 그 컨트롤의 것입니다.
- 호출한 쪽의 `onKeyDown` 을 먼저 부르고, 거기서 `preventDefault()` 하면 누르지 않습니다.

### 알아둘 것

- `enabled` 가 `false` 면 받은 핸들러를 그대로 돌려주고 `role` 도 붙이지 않습니다. `asChild` 로 링크를 그리는 Card 는 링크의 동작을 그대로 씁니다.
- `NESTED_CONTROL` 에 없는 역할의 요소는 행의 클릭을 막지 못합니다. 새 역할의 컨트롤을 행 안에 두면 목록에 더합니다.

## slider-surface.ts

슬라이더 트랙의 가장자리와 thumb 모양을 정하는 클래스 조각입니다. ColorPicker 의 색 영역은 두 방향으로 움직이는 슬라이더라서 같은 모양을 씁니다.

### 쓰는 곳

- Slider: 트랙과 채운 구간에 `edge`, thumb 에 `thumb`
- ColorPicker: 색 영역에 `edge`, 영역의 thumb 에 `thumb`. 색조와 투명도 슬라이더는 Slider 그대로입니다.

### 쓰는 법

```tsx
// components/form/slider/index.tsx
track: [sliderSurface.edge, 'relative rounded-full bg-(--ids-color-muted)'],
thumb: [
  sliderSurface.thumb,
  'group/thumb absolute block size-(--slider-thumb)',
  'bg-(--ids-color-primary) group-data-invalid/slider:bg-(--ids-color-danger)',
],
```

### 왜 이렇게

- `thumb` 은 채움색을 정하지 않습니다. Slider 는 primary(invalid 면 danger)로, ColorPicker 는 고른 색으로 채웁니다(inline `backgroundColor`).
- 흰 2px 테두리와 어두운 1px 그림자 테두리가 thumb 을 어떤 트랙 위에서도 떼어 보이게 합니다. 무지개, 체커보드, 채운 구간 위에서 모두 보여야 해서 light 와 dark 모드 모두 흰색입니다.
- `edge` 는 `inset-ring` 이라 크기를 바꾸지 않고 트랙의 그라데이션 위에 그려집니다. 채운 구간은 트랙의 가장자리를 덮으므로 Slider 는 채운 구간에도 `edge` 를 줍니다.

### 알아둘 것

- thumb 의 포커스 링(`focus-ring`)은 이 그림자와 함께 그려집니다. thumb 에 `shadow-*` 를 따로 주면 이 그림자를 덮어 테두리가 사라집니다.

## state-props.ts

파트의 `className`, `style`, `children` 이 파트의 state 를 받는 함수일 수도 있게 하는 타입과 풀이 함수입니다.

### 쓰는 곳

- `resolveState`, `StateValue`: Avatar, AvatarGroup, Badge, Card, Chip, Item
- `resolveState`, `StateRenderProps`: Accordion
- `resolveState`: Select, ChipField, ColorField, FileField, ColorPicker

### 쓰는 법

```tsx
// components/data/badge/index.tsx
className?: StateValue<string | undefined, State>;
style?: StateValue<CSSProperties | undefined, State>;

<span
  {...rest}
  data-badge=""
  className={styles.root({ className: resolveState(className, state) })}
  style={resolveState(style, state)}
>
```

### 왜 이렇게

- Base UI 의 관례입니다. 앱이 상태의 사본을 따로 들고 있지 않아도 파트의 상태에 따라 클래스, 스타일, 내용을 가를 수 있습니다.

### 알아둘 것

- `resolveState` 는 함수면 무조건 state 를 넣어 부릅니다. 함수 자체가 값인 prop 에는 쓰지 않습니다.

## surface.ts

카드나 목록 행처럼 통째로 누르는 표면의 hook 입니다. `useSurface`(누르기와 인터랙션 상태), `useLabelling`(이름과 설명 연결), `useRegisteredId`(파트의 id 등록) 세 개입니다.

### 쓰는 곳

- Card(`use-card.ts`), Item(`use-item.ts`): `useSurface`, `useLabelling`
- Card.Title, Card.Description, Item.Title, Item.Description, Chip.Label: `useRegisteredId(setTitleId, id)` 처럼 등록 함수와 함께
- Chip.Close: `useRegisteredId(undefined, id)` 로 안정된 id 만 받습니다.

### 쓰는 법

```tsx
// components/data/card/use-card.ts
export function useCard<E extends HTMLElement>(options: UseSurfaceOptions<E>) {
  return { ...useSurface<E>(options), ...useLabelling(options.interactive) };
}

// components/data/card/index.tsx
const { interaction, props, dataProps, labelling, register } = useCard<HTMLDivElement>({
  interactive,
  asChild,
  disabled,
  handlers: { onClick, onKeyDown, onKeyUp, onFocus, onBlur, onPointerEnter /* ... */ },
});

<CardContext value={{ styles, ...register }}>
  <Root {...rest} {...props} {...labelling} {...dataProps}>...</Root>
</CardContext>

export function Title({ className, id, ...props }: Title.Props) {
  const { styles, setTitleId } = useCardContext('Card.Title');
  const titleId = useRegisteredId(setTitleId, id);
  return <Part {...props} id={titleId} kind="title" className={styles.title({ className })} />;
}
```

### 왜 이렇게

- `onClick` 이 있는 `div` 는 [pressable.ts](#pressablets) 로 button 이 됩니다. `asChild` 면 자식(보통 링크)이 자기 의미를 그대로 갖고 인터랙션 상태만 얻습니다(`enabled: interactive && !asChild`).
- 누를 수 없는 표면은 hover 나 press 가 없으므로 `data-hovered` 같은 속성을 붙이지 않습니다(`dataProps` 가 빈 객체).
- 누를 수 있는 표면은 Title 을 이름으로, Description 을 설명으로 씁니다(`aria-labelledby`, `aria-describedby`). 연결하지 않으면 안의 버튼 글자까지 모든 글자가 하나의 긴 이름으로 읽힙니다.
- 파트는 마운트돼 있는 동안만 id 를 등록합니다(layout effect 에서 등록, cleanup 에서 `undefined`). 그래서 표면은 실제로 있는 파트만 가리킵니다.

### 알아둘 것

- 누를 수 없는 표면은 `labelling` 이 빈 객체라 Title 이 있어도 `aria-labelledby` 를 붙이지 않습니다.
- Item 은 `useSurface` 결과에 `aria-pressed` 를 더합니다(`selected` 가 있고 `current` 가 아닐 때).

## toggle-surface.ts

켜고 끄는 컨트롤의 variant 클래스입니다. variant 는 켜진(pressed) 모양을 정합니다.

### 쓰는 곳

- Toggle: `variant`. 크기는 `controlSurface.size`
- IconToggle: `variant`. 크기는 `iconSquare.size`

### 쓰는 법

```tsx
// components/action/toggle/index.tsx
export const Style = tv({
  base: controlSurface.base,
  variants: {
    variant: toggleSurface.variant,
    colorScheme: controlSurface.colorScheme,
    size: controlSurface.size,
  },
  defaultVariants: { variant: 'ghost', colorScheme: 'primary', size: 'standard' },
});
```

### 왜 이렇게

- toggle 은 꺼져 있을 때 조용합니다. 꺼진 상태의 배경은 모두 투명하고 outline 만 테두리를 그립니다.

| variant            | 켜짐(`data-pressed`)                                |
| ------------------ | --------------------------------------------------- |
| `ghost`, `outline` | neutral hover 배경(`--control-hover`)               |
| `soft`             | scheme 의 옅은 배경과 `--control-accent` 글자       |
| `solid`            | scheme 배경과 `--control-on-fill` 글자, `shadow-xs` |

- 색은 [control-surface.ts](#control-surfacets) 의 scheme 변수에서 옵니다.
- 크기는 따로 두지 않습니다. 라벨이 있는 Toggle 은 Button 과 같은 padding 을 갖고, IconToggle 은 icon-square 로 정사각형이 됩니다.
- hovered, active, pressed 를 각각 적습니다. `interactiveDataProps` 가 셋 중 하나만 붙이므로(pressed > active > hovered), 켜진 toggle 에 마우스를 올려도 켜진 모양이 유지됩니다.

### 알아둘 것

- 꺼진 outline 은 `bg-transparent` 입니다. Button 의 outline(`bg-(--ids-color-surface)`)과 다릅니다.

## use-checked-writes.ts

react-hook-form 의 `register()` 처럼 바깥 코드가 `input.checked` 에 직접 쓴 값을 알아채는 hook 입니다. 컴포넌트 자신의 쓰기는 알리지 않도록 `silently` 함수를 돌려줍니다.

### 쓰는 곳

- Checkbox(`use-checkbox.ts`), Radio(`use-radio.ts`)

### 쓰는 법

```ts
// components/form/checkbox/use-checkbox.ts
const silently = useCheckedWrites(inputRef, checked === true, (next) => {
  if (next !== (latest.current === true)) setChecked(next);
});

useFormReset(inputRef, () => {
  // ...
  silently(() => {
    input.checked = checkedAfterReset === true;   // 자기 쓰기는 알리지 않는다
  });
});
```

### 왜 이렇게

- `register()` 와 input 을 쥔 다른 코드는 reset, `setValue` 때 `input.checked` 를 직접 씁니다. React 는 이 쓰기를 모릅니다. 그래서 input 인스턴스의 `checked` setter 를 감싸 쓰기를 알립니다.
- React 도 commit 때 렌더한 상태를 같은 setter 로 쓰고, microtask 가 돌기 전에 다시 쓸 수도 있습니다. `register()` 는 commit 중에 ref callback 에서 쓰고, 다른 곳의 layout effect 가 일으킨 동기 re-render 가 옛 상태를 그 위에 다시 칠할 수 있습니다. 그래서 쓰기가 끝난 뒤의 DOM 값은 누가 썼는지 알려 주지 않습니다.
- 대신 쓴 값을 하나씩 모아(`writesToWeigh`) 그 쓰기가 속한 commit 의 렌더 상태(`renderedAtCommit`)와 견줍니다(`weighWritesAgainst`). React 가 렌더한 값과 다른 값은 React 가 쓴 것이 아니고, 그중 마지막 값(`lastWriteNotFromReact`)을 알립니다.
- 매 commit 의 layout effect 가 그때까지 모인 쓰기를 견줍니다. ref 는 input 을 렌더하는 컴포넌트의 layout effect 보다 먼저 붙으므로, 이번 commit 에서 ref callback 이 쓴 값은 이미 모여 있습니다.
- commit 밖의 쓰기는 그 쓰기를 한 작업이 끝난 뒤 microtask 에서 견줍니다(`firstSinceLastWeighing`).
- `register()` 는 input 을 마운트하는 바로 그 commit 에서, 어떤 effect 도 setter 를 감싸기 전에 기본값을 씁니다. 그래서 감싸기는 ref 가 붙은 뒤에 도는 layout effect 에서 하고, 그때 찾은 값(`writtenBeforeWrapping`)을 한 번 알립니다. passive effect 였다면 그 사이의 re-render 가 옛 상태를 먼저 칠합니다.

### 알아둘 것

- 마운트할 때 DOM 값이 한 번 그대로 알려집니다. `onWrite` 는 지금 상태와 같은 값을 무시해야 합니다. Checkbox 는 `indeterminate` 를 `false` 로 덮지 않도록 `latest.current === true` 와 비교합니다.
- 컴포넌트가 `input.checked` 에 직접 쓸 때는 반드시 `silently(() => ...)` 안에서 씁니다. 그 안의 쓰기는 `writingSilently` 로 표시돼 모으지 않습니다. 밖에서 쓰면 자기 쓰기가 바깥 쓰기로 알려져 `onCheckedChange` 가 불립니다.
- cleanup 은 인스턴스에 있던 descriptor 를 되돌리고, 없었으면 인스턴스 속성을 지워 prototype 의 setter 로 돌아갑니다.
- 브라우저의 폼 reset 은 JS setter 를 거치지 않으므로 이 hook 이 보지 못합니다. reset 은 [`useFormReset`](../hooks/README.md#use-form-resetts) 이 맡습니다.
