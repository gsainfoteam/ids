# utils

컴포넌트와 `internal/` 이 함께 쓰는 함수입니다. 범용 helper 는 여기에 만들지 않고 `es-toolkit` 에서 가져옵니다(RULES.md).

- `utils/index.ts` 는 `children`, `cn`, `invariant`, `merge`, `tv` 를 다시 내보냅니다. `dev.ts` 는 barrel 에 없어서 `utils/dev` 에서 직접 가져옵니다.
- `invariant` 와 `IdsError` 는 `src/index.ts` 도 내보내는 공개 API 입니다.
- `cn` 패키지와 `tailwind-variants` 는 이 폴더만 import 합니다. 컴포넌트는 `utils` 의 `cn`, `tv`, `VariantProps` 를 씁니다.

| 파일                           | 내용                                                  | 쓰는 곳                                                |
| ------------------------------ | ----------------------------------------------------- | ------------------------------------------------------ |
| [`cn.ts`](#cnts)               | IDS 설정을 더한 class merge 함수                      | 모든 `tv` 결과, `mergeProps`, 클래스 조각, 스토리      |
| [`tv.ts`](#tvts)               | 결과를 `cn` 으로 다시 합치는 `tailwind-variants/lite` | 모든 컴포넌트의 `Style`                                |
| [`merge.ts`](#mergets)         | props, 이벤트 핸들러, ref, style 합치기               | Slot, `asChild` 파트, 필드 hook, ref 를 합치는 모든 곳 |
| [`children.ts`](#childrents)   | Fragment 를 풀어 자식을 평평하게 만드는 함수          | 자식에서 파트를 찾는 컴포넌트                          |
| [`invariant.ts`](#invariantts) | 잘못된 사용에 `IdsError` 를 던지는 assert             | 거의 모든 컴포넌트와 `internal/`                       |
| [`dev.ts`](#devts)             | 개발 빌드인지 알려 주는 `isDevelopment`               | 개발 경고를 내는 모든 곳                               |

## cn.ts

`cn` 패키지(`clsx` 와 `tailwind-merge` 대신 쓰는 것)에 IDS 의 클래스 규칙을 더한 class merge 함수입니다. 충돌하면 뒤에 온 클래스가 이깁니다.

### 쓰는 곳

- [`tv.ts`](#tvts) 의 모든 결과, [`merge.ts`](#mergets) 의 `className` 합치기
- `internal/` 의 클래스 조각(`cn('...')` 값의 객체), 컴포넌트와 스토리에서 클래스를 변수와 합치는 곳

### 쓰는 법

```ts
// internal/field-surface.ts: 공유 조각은 cn('...') 값의 객체
export const fieldAction = {
  base: cn(
    'shrink-0 text-(--ids-color-on-muted)',
    'data-hovered:text-(--ids-color-on-surface) data-active:text-(--ids-color-on-surface)',
    'data-pressed:text-(--ids-color-on-surface)',
  ),
  // ...
};

// internal/arc.tsx: 클래스와 변수를 합칠 때도 템플릿 문자열이 아니라 cn
className={cn('origin-center -rotate-90', indicatorClassName)}
```

### 왜 이렇게

| 설정                                                               | 없으면                                                                                 |
| ------------------------------------------------------------------ | -------------------------------------------------------------------------------------- |
| `theme.radius: ['standard', 'indicator']`                          | `rounded-standard` 와 `rounded-full` 이 충돌로 잡히지 않아 둘 다 남는다                |
| `font-size` 에 IDS 글자 스타일(`text-body-*`, `text-caption-*` 등) | `text-body-b3-regular` 를 글자색으로 읽어 앞의 `text-(--ids-color-on-muted)` 를 지운다 |
| `concentric-p` 가 `p-*`, `rounded-*` 와 충돌                       | `p-4 concentric-p-3` 이 둘 다 남는다                                                   |

- `concentric-p-*` 는 padding 과 radius 를 함께 정하므로 앞의 `p-*`, `rounded-*` 를 지웁니다.
- 반대 방향은 일부러 두지 않습니다. 뒤에 온 `p-6` 이 concentric radius 를 지우면 안 됩니다. `concentric-p-3 px-4` 는 radius 는 concentric 값을, 가로 padding 은 `px-4` 를 씁니다.
- Tailwind IntelliSense 는 `cn`, `tv`, `cva` 안의 문자열만 읽습니다(`.vscode/settings.json` 의 `tailwindCSS.classFunctions`). 그래서 클래스 문자열은 모두 `cn()`, `tv()`, JSX `className` 안에 씁니다(RULES.md).

### 알아둘 것

- 글자 스타일(`text-body-b3-regular` 등)은 줄 높이를 함께 가지므로, 그 앞에 둔 `leading-*` 는 지워집니다. `text-body-b3-regular leading-none` 순서로 씁니다.
- 새 radius 이름이나 글자 스타일 접두사를 토큰에 더하면 여기에도 더합니다. 아니면 충돌을 알아보지 못합니다.
- 결과는 빈 문자열일 수 있습니다(`cn(undefined)` 는 `''`). `tv` 는 이것을 `undefined` 로 바꿉니다.

## tv.ts

`tailwind-variants` 의 lite build 결과를 `cn` 으로 다시 합치는 `tv` 입니다.

### 쓰는 곳

- 모든 컴포넌트의 `Style`, `internal/` 의 `textControlStyle`, `temporalFieldStyle`, `popupStyle`
- `extend`: PasswordField, NumberField, TelField 가 `textControlStyle` 을 넓힙니다.

### 쓰는 법

```ts
// components/form/password-field/index.tsx
export const Style = tv({
  extend: textControlStyle,
  slots: {
    toggle: [fieldAction.base, 'data-pressed:bg-transparent'],
    capsLock: 'inline-flex shrink-0 items-center text-(--ids-color-on-muted)',
  },
  variants: {
    size: {
      standard: { toggle: fieldAction.padded.standard, capsLock: '[&_svg]:size-(--ids-size-icon-standard)' },
      tiny: { toggle: fieldAction.padded.tiny, capsLock: '[&_svg]:size-(--ids-size-icon-tiny)' },
    },
  },
});
```

### 왜 이렇게

- lite build 는 클래스를 이어 붙이기만 합니다(`p-2 p-4` 가 그대로 남습니다). 모든 결과를 `cn` 에 통과시켜서 앱이 넘긴 `className` 까지 한 엔진, 한 설정이 충돌을 풉니다.
- 빈 결과는 `undefined` 로 둡니다(`mergeWithoutEmptyAttribute`). full build 와 같게 빈 `class=""` 를 렌더하지 않습니다.
- `extend` 는 부모 style 에서 `base`, `slots`, `variants` 를 읽습니다. 그래서 감싼 함수에 원래 설정을 복사해 둡니다(`keepConfigForExtend`). 복사하지 않으면 `extend: textControlStyle` 이 부모의 슬롯을 경고 없이 잃습니다.

### 알아둘 것

- `tailwind-variants` 를 직접 import 하지 않습니다. 직접 쓰면 결과가 `cn` 을 거치지 않습니다.

## merge.ts

props 를 합치는 함수입니다: `mergeProps`, `mergeEventHandlers`, `mergeRefs`, `mergeObjects`, `mergeChildren`.

### 쓰는 곳

- `mergeProps`: Slot, 각 컴포넌트의 `asChild` 파트, field-popup 의 `part()`, text-control 의 Clear, 필드 hook(`use-text-field.ts` 등)
- `mergeRefs`: ref 를 둘 이상 붙이는 곳(Spinner, Button, 그룹 컴포넌트, 필드 hook, text-control 의 `useMergedRef`)
- `mergeEventHandlers`: Alert, Calendar, ColorField, ColorPicker, Label
- `mergeObjects`: `mergeProps` 의 `style`
- `mergeChildren`: 지금 부르는 곳이 없습니다.

### 쓰는 법

```tsx
// components/utility/slot/index.tsx: 자식의 props 가 base, Slot 의 props 가 next
return cloneElement(children, mergeProps(children.props as Record<string, unknown>, slotProps));

// components/feedback/spinner/index.tsx: 렌더마다 새 ref 함수가 생기지 않게 감싼다
const mergedRef = useCallback(
  (node: SVGSVGElement | null) => mergeRefs(svgRef, ref)(node),
  [ref],
);
```

### 왜 이렇게

`mergeProps(base, next)` 가 키마다 합치는 방법입니다.

| 키          | 방법                                                                                                         |
| ----------- | ------------------------------------------------------------------------------------------------------------ |
| `className` | `cn(base, next)`. 충돌하면 next                                                                              |
| `style`     | 얕게 합친다. 같은 속성은 next                                                                                |
| `ref`       | `mergeRefs(base, next)`                                                                                      |
| `on[A-Z]*`  | `mergeEventHandlers(base, next)`. base 를 먼저 부르고, base 가 `preventDefault()` 하면 next 는 부르지 않는다 |
| 그 밖       | `next ?? base`                                                                                               |

- 그래서 `asChild` 파트는 `mergeProps(사용자나 자식의 props, 내부 props)` 순서로 부릅니다. 내부 wiring(`role`, `aria-*`)이 이기고, 사용자 핸들러가 먼저 돌며 `preventDefault()` 로 내부 동작을 막을 수 있습니다.
- `mergeRefs` 는 React 19 의 ref cleanup 을 돌려줍니다. cleanup 을 돌려주지 않는 callback ref 는 cleanup 때 `ref(null)` 로, object ref 는 `current = null` 로 뗍니다.

### 알아둘 것

- `mergeRefs(...)` 와 ref 가 든 `mergeProps(...)` 는 부를 때마다 새 ref 함수를 만듭니다. 렌더 중에 그대로 `ref` 로 넘기면 React 가 렌더마다 ref 를 떼었다 붙입니다. `useCallback` 으로 감싸거나(Spinner, Button) text-control 의 [`useMergedRef`](../internal/text-control/README.md#use-merged-refts) 를 씁니다.
- `next ?? base` 라서 next 의 `undefined`, `null` 은 base 를 지우지 못합니다. `false` 와 `''` 는 base 를 덮습니다.

## children.ts

자식 목록에서 Fragment 를 풀어 평평한 배열로 만드는 `flattenFragments` 입니다.

### 쓰는 곳

- [text-control](../internal/text-control/README.md) 의 `splitAroundInput`, Accordion, Alert, Avatar, AvatarGroup(`arrange.ts`), Chip, ChipField, Progress, TextArea

### 쓰는 법

```ts
// internal/text-control/index.tsx
const items = flattenFragments(children);
const indexes = items.flatMap((child, index) =>
  isValidElement(child) && child.type === Input ? [index] : [],
);
```

### 왜 이렇게

- Fragment 만 풉니다. 다른 컴포넌트는 파트를 찾으려고 실행해 보지 않습니다.
- key 앞에 Fragment 경로(`fragmentPath`)를 붙여서, 서로 다른 Fragment 에서 온 형제의 key 가 겹치지 않습니다. `[<><a /><b /></>, <><c /></>]` 은 `0:.0`, `0:.1`, `1:.0` 이 됩니다.

### 알아둘 것

- 앱이 파트를 자기 컴포넌트로 감싸면 파트로 찾지 못합니다.
- 파트를 찾는 컴포넌트(TextField, Select, ChipField, FileField, ColorField, ColorPicker, TimePicker, Rating, 날짜와 시간 필드)는 모두 이 함수로 Fragment 를 풉니다.

## invariant.ts

잘못된 사용을 만나면 `IdsError` 를 던지는 assert 함수와 그 에러 클래스입니다.

### 쓰는 곳

- 거의 모든 컴포넌트와 `internal/`: 파트 개수, `asChild` 자식, context 밖의 파트, 값의 형식
- `src/index.ts` 가 `IdsError`, `invariant` 를 내보냅니다.

### 쓰는 법

```ts
// internal/temporal-field/index.tsx
function useTemporal(part: string) {
  const context = use(TemporalContext);
  invariant(context, `${part} must be inside its field.`);
  return context;                        // asserts condition 이라 여기서 null 이 아니다
}
```

### 왜 이렇게

- `asserts condition` 이라 TypeScript 가 호출 뒤의 값을 좁힙니다.
- 메시지 앞에 `[IDS] ` 를 붙이고 `name` 은 `'IdsError'` 입니다. `Object.setPrototypeOf` 는 Error 를 상속한 클래스에서도 `instanceof IdsError` 가 맞게 합니다.

### 알아둘 것

- production 에서도 던집니다. 개발 빌드에서만 알릴 일은 `isDevelopment` 와 `console.warn` 으로 씁니다.
- 메시지에 `[IDS]` 를 적지 않습니다. `IdsError` 가 붙입니다. `console.warn` 은 직접 `[IDS] Component: ` 로 시작합니다.
- 공개 API 라서 앱이 `instanceof IdsError` 로 잡을 수 있습니다.

## dev.ts

개발 빌드인지 알려 주는 `isDevelopment` 상수입니다.

### 쓰는 곳

- 개발 경고를 내는 모든 곳: [`internal/icon-label.ts`](../internal/README.md#icon-labelts), `react-hook-form.tsx`, Button, FloatingButton, Toggle, ToggleGroup, Accordion, Avatar, AvatarGroup, Badge, Chip, Alert, Progress, ChipField, Field, Input, PasswordField, Rating, Select, Slider, Spacer, Label, Group, ThemeProvider
- 개발 경고를 확인하는 스토리(Button, IconButton, IconToggle 등)

### 쓰는 법

```ts
// components/action/floating-button/use-floating-button.ts
useLayoutEffect(() => {
  const node = nodeRef.current;
  if (!isDevelopment || !node || node.hidden) return;
  // ... 같은 자리의 FloatingButton 이 겹치면 console.warn
}, [nodeRef, placement]);
```

### 왜 이렇게

- Vite 는 라이브러리 빌드에서 `import.meta.env.DEV` 를 `false` 로 굳힙니다. 그러면 배포 패키지의 개발 경고가 모두 사라집니다.
- `process.env.NODE_ENV` 는 앱의 bundler 가 바꿉니다. 그래서 경고는 앱의 개발 빌드에서 보이고 production 빌드에서 빠집니다.
- bundler 없이 불러오면 `process` 가 없습니다. `try`/`catch` 가 이 경우를 production 으로 칩니다.

### 알아둘 것

- `process.env.NODE_ENV` 를 이 모양 그대로 둡니다. bundler 는 이 표현식을 글자 그대로 찾아 바꾸므로 `const { env } = process` 처럼 풀어 쓰면 바뀌지 않습니다.
- 값은 모듈을 불러올 때 한 번 읽습니다.
