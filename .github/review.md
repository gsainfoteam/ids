# 리뷰 지침

규칙의 원본은 `AGENTS.md`(`RULES.md`)입니다. 아래는 그 규칙 가운데 lint, 타입 검사, 테스트가 잡지 못해 리뷰에서 봐야 하는 것입니다.
변경된 코드가 규칙을 어기면 `[규칙]`, 규칙대로 짰지만 동작이 틀리면 `[버그]`로 답니다.

## 공통

### 코드

- 주석. tool directive(`eslint-disable`, `@ts-expect-error`, `@deprecated`, Dart의 `// ignore:`)만 허용합니다
- 이름이 뜻을 말하지 않는 helper나 constant, 주석이 필요해 보이는 조건문
- React의 `src/internal`, `src/hooks`, `src/utils`에 새 module을 넣으면서 그 폴더 README에 절을 더하지 않은 경우
- 선언, 로직, effect, JSX 사이에 빈 줄 없이 한 덩어리로 이어 쓴 경우
- 생성 파일을 손으로 고친 경우. 토큰은 `packages/core/tokens/`를 고치고 `pnpm codegen`을 돌립니다

### 릴리스

- `packages/css`, `packages/react`, `packages/flutter`의 공개 동작을 바꾸면서 `.changeset/*.md`가 없는 경우
- 공개 API를 깨면서 changeset이 major가 아니거나 commit 제목에 `!`가 없는 경우
- README나 스토리 description이 바뀐 API를 따라가지 않는 경우

## React

`packages/react`와 `packages/css`의 변경에 적용합니다.

### Server Component 안전성

- `components/<category>/<name>/index.tsx`에 `'use client'`, hook, context가 들어간 경우. 이 파일은 `<XRoot {...props} />`를 그리는 함수와 namespace만 가집니다
- hook을 부르거나 context를 만들거나 컴포넌트를 그리는 모듈에 `'use client'`가 빠진 경우
- 순수 모듈(`style.ts`, `date.ts` 같은 로직, 타입, DOM helper, store)이나 re-export만 하는 `index.ts`에 `'use client'`가 붙은 경우
- 부품을 `child.type`이나 `Drawer.Overlay`로 비교한 경우. `elementTypeOf(child) === DrawerOverlay`처럼 부품 함수를 직접 import해 비교합니다
- 다른 컴포넌트를 알아보는 root가 그 컴포넌트의 root를 함께 받지 않는 경우(`[Avatar, AvatarRoot]`)
- 모듈을 import하거나 render할 때 `window`, `document`에 접근하는 경우. DOM이 필요한 코드는 effect와 handler 안에 둡니다

### 컴포넌트 폴더

- `index.tsx`, `root.tsx`, `style.ts`(tv Style이 있으면), 부품마다 kebab-case 파일이 아닌 경우
- 부품 파일이 `XPart`와 `XPartProps`를 export하지 않는 경우
- 공개 부품에 `displayName`(`'Drawer.Trigger'`, 하위 부품은 `'Image.Viewer.Close'`)이 없는 경우
- namespace의 부품 alias 옆에 `Props` 타입이 없는 경우(`Drawer.Trigger.Props`)
- 부품이나 `root.tsx`가 `'.'`을 `import type`이 아닌 값으로 import해 `index.tsx`를 거치는 순환이 생기는 경우
- 여러 컴포넌트가 쓰는 비공개 코드가 `internal/`이 아니라 `components/` 바로 아래 놓인 경우
- 새 컴포넌트가 Notion `유형`과 다른 category 폴더에 들어간 경우

### Tailwind와 스타일

- 실행 중에 조립한 클래스 이름(템플릿 리터럴, 접두사를 붙이는 함수). Tailwind가 생성하지 않아 조용히 동작하지 않습니다
- `cn()`, `tv()`, JSX `className` 밖에 놓인 클래스 문자열(객체 값, 상수, 배열, 스토리 `args`)
- 한 컴포넌트의 부품을 `tv()` 여러 개로 나누거나, 같은 컴포넌트의 부품을 `cn('...')`으로 따로 꾸민 경우. 부품은 하나의 `tv({ slots })` 안의 slot입니다
- 여러 부품에 퍼지는 색을 부품과 scheme 조합마다 클래스로 쓴 경우. CSS custom property(`[--chip-accent:...]`) 하나로 넘깁니다
- `text-*` 앞에 `leading-*`를 둔 경우. `cn`이 앞의 `leading-*`를 버립니다
- `font-family`를 직접 쓰거나 `font-mono`에 `text-[0.9em]`을 더한 경우
- `dark:` 대신 `prefers-color-scheme`이나 다른 방법으로 다크 모드를 판단한 경우

### 모서리와 여백

- `rounded-[14px]`처럼 손으로 계산한 radius, `p-*`와 `rounded-*`를 짝지은 padded container. `concentric-p-*`를 씁니다
- `standard`, `indicator`, `container`, `full` 밖의 radius(`rounded-sm`, `rounded-lg` 등)
- 24px 이상인 상자에 `indicator` radius를 쓴 경우

### 색

- 텍스트나 아이콘에 `primary`를 쓰거나, 옅은 brand 배경에 `primary/10`을 쓴 경우. 순서대로 `accent`, `secondary`를 씁니다
- brand fill 위 글자가 `on-primary`가 아닌 경우, `secondary` 위 글자가 `on-secondary`가 아닌 경우
- solid brand fill의 hover와 press를 `/90` 같은 투명도로 만든 경우. `--control-fill-hover`, `--control-fill-press`를 씁니다
- 구조선(필드 테두리, 카드 모서리, Divider, group 경계)에 theme 색을 쓴 경우. `--ids-color-border`가 기본입니다
- `outline`이나 `ghost` 버튼이 theme 색을 가진 경우
- 중립 상태가 한 단계씩 오르지 않는 경우: 투명 control은 rest, `muted`, `muted-hover`이고, 채워진 control은 `muted`, `muted-hover`, `muted-active`입니다
- status 색 글자에 `-strong`이 아닌 색을 쓴 경우

### Focus와 테두리

- `outline-offset`이나 직접 만든 `ring`으로 focus를 그린 경우. `focus-ring` 클래스를 씁니다
- 안쪽 input이 focus를 받는 shell에 `has-[...]:ring`을 따로 단 경우. 안쪽 요소에 `data-field-input`을 답니다
- focus나 `aria-invalid`의 테두리 색을 컴포넌트 스타일에서 다시 정한 경우
- 테두리를 `border`로 그려 focus ring과 겹치는 경우. 테두리는 `inset-ring`입니다
- 다른 필드의 shell 안에 그려지는 필드가 자기 ring을 끄지 않은 경우

### 스크롤

- 안에서 스크롤하는 요소가 `ScrollArea`를 거치지 않고 OS 스크롤바를 보이는 경우(팝업 목록, 메뉴, dialog 본문, `<textarea>`)
- 둥근 container의 모서리에 놓인 scroll area가 `rounded-[inherit]`를 받지 않은 경우

### IDS로 조합하기

- IDS 부품이 있는데 손으로 그린 경우: 선은 `Divider`, 면은 `Card`나 `Item`, 아이콘 버튼은 `IconButton`, 흐린 글자는 `Description` 부품, 라벨은 `Label`입니다
- 다른 컴포넌트 안에 있는지 감지해서 동작을 바꾸는 경우. prop으로 고르게 합니다
- 예제, 패턴, block에서 `ghost` variant를 쓴 경우

### 패키지

- `es-toolkit`에 있는 helper(`clamp`, `isEqual`, `noop`, `debounce`, `uniq` 등)를 직접 구현한 경우
- `clsx`, `tailwind-merge`, Radix, Base UI, cmdk, vaul을 들여온 경우
- `AGENTS.md`가 정한 엔진(floating-ui, tabbable, react-remove-scroll, `@internationalized/*`, culori, decimal.js, embla 등)이 있는 일을 직접 구현한 경우
- floating-ui를 `internal/overlay` 밖에서 쓰거나 embla를 `internal/slides` 밖에서 쓴 경우
- 새 `dependencies`가 bundle 밖에 남지 않는 경우, import 하나가 `.size-limit.json` 한도를 넘는 경우
- `.size-limit.json` 한도를 올리면서 commit 메시지에 이유가 없는 경우

### 문자열

- 컴포넌트 코드의 한국어 리터럴, module 최상단에서 `messages`를 읽은 경우
- 새 `t()` 키를 `internal/messages.ts`에만 넣고 `messages/en.json`의 같은 자리에 넣지 않은 경우, 키를 정렬 순서에서 벗어난 자리에 넣은 경우
- 날짜, 시간, 숫자가 `locale ?? useProviderLocale() ?? default` 순서를 따르지 않는 경우
- 개발 경고를 영어가 아닌 말로 쓰거나 catalog에 넣은 경우
- 개발 경고에 `import.meta.env.DEV`를 쓴 경우. `isDevelopment`를 씁니다

### API 관례

- 값 콜백이 `onValueChange`가 아닌 경우, 상태 콜백이 `onCheckedChange`, `onPressedChange`, `onOpenChange` 꼴이 아닌 경우
- 실제 input이 없는 곳에 `onChange`를 둔 경우
- 안쪽 native input에 root의 `onChange`를 넘겨 변경이 두 번 보고되는 경우
- 입력을 React `onChange`가 아니라 native `input`, `change` listener에서 읽어 `setState`하는 경우. 키 입력을 잃습니다
- 위젯 키를 `keyHandler`(`internal/keys.ts`) 밖에서 처리한 경우, 단축키를 `Hotkey` 타입이 아닌 문자열로 받은 경우, 키 처리에서 `stopPropagation`을 부른 경우
- 부품 props 타입이 `X.PartProps` 이름을 따르지 않는 경우, 부품이 생략됐을 때 기본값으로 대체되지 않는 경우
- group 컨트롤(RadioGroup, CheckboxGroup, Rating, ToggleGroup 같은 것)이 root에 `ref`, `id`, `tabIndex={-1}`를 두지 않거나 `focus()`를 선택된 항목에 넘기지 않는 경우
- `onClick`을 받는 Card, Item이 root를 `<button>`으로 만들어 안에 버튼이 중첩되는 경우
- native input이 없는 컨트롤이 `FormValue`로 form에 값을 넣지 않는 경우, 빈 문자열을 제출하는 경우
- form reset이 값 콜백을 부르는 경우
- 이벤트 없이 값이 바뀌는 컨트롤이 `FieldNotifyContext`를 부르지 않는 경우
- 외부 패키지에 넘기는 `components` 같은 slot map을 render 안에서 만든 경우

### Overlay

- `internal/overlay` 밖에서 layer를 만든 경우, portal이나 `<dialog>.showModal()`을 쓴 경우(Tooltip만 portal)
- floating-ui `useDismiss`를 쓴 경우
- modal backdrop이 `click`이 아니라 `pointerdown`에서 닫히는 경우
- `inert`로 페이지를 막은 경우. `ModalLayer`의 `aria-hidden`을 씁니다
- 퇴장 애니메이션을 timer로 처리한 경우. `usePresence`와 `starting:`을 씁니다
- 닫힌 뒤 focus가 열기 전 위치(`focusReturnTarget`)로 돌아가지 않는 경우

### 스토리

- `Playground`, `Gallery`, 기능별 스토리 순서를 따르지 않는 경우, `Gallery`가 없거나 `Showcase` kit을 쓰지 않는 경우
- meta가 `satisfies Meta<typeof X>`와 `tags: ['autodocs']`를 갖지 않는 경우
- 스토리 파일에 데모 컴포넌트를 따로 선언한 경우(`AGENTS.md`가 정한 예외는 제외). 데모는 `render` 안에 inline으로 씁니다
- hook을 쓰는 `render`가 `function Render()` 꼴이 아닌 경우
- 스토리가 직접 theme이나 페이지 padding을 더한 경우
- 단언할 수 있는 동작인데 `play`가 없는 경우, `play`가 `await` 뒤에 요소를 다시 찾지 않는 경우
- focus를 확인하는 input에 `data-1p-ignore`, `data-lpignore="true"`가 없는 경우
- 이유 없이 `'!test'`를 붙이거나 a11y rule을 끈 경우. 끈다면 그 스토리 description에 이유가 있어야 합니다

### Block

- block의 className이 색, 테두리, 배경, radius, 그림자, `style`을 정한 경우. 이런 것은 IDS 컴포넌트에서 와야 합니다
- 바깥 요소에 `break-keep`이 없는 경우, 데이터가 module 상수에 고정된 날짜와 숫자로 있지 않은 경우
- PC 스토리와 Mobile 스토리의 짝, `title`, `tags`, viewport 설정이 `AGENTS.md`와 다른 경우

### 테스트

- `fireEvent`나 합성 이벤트로 입력을 흉내 낸 경우. 브라우저가 테스트에서 만들 수 없는 입력에만 허용합니다
- Tab을 `userEvent.tab()`으로 누른 경우. `userEvent.keyboard('{Tab}')`을 씁니다
- 비동기로 바뀌는 DOM을 `expect.element` 대신 plain `expect`로 단언한 경우
- timer가 끝나기 전까지만 유지되는 상태를 단언한 경우
- CDP가 필요한 테스트가 `skipWithoutCdp`로 시작하지 않는 경우, 엔진별 skip에 이유가 없는 경우
- 바뀐 동작을 확인하는 테스트가 없는 경우

## Flutter

`packages/flutter`의 변경에 적용합니다. 컴포넌트는 지금 다시 만드는 중이고, 규칙의 원본은 `packages/flutter/MIGRATION.md`입니다.

### 무엇을 만드는가

- `packages/react`에 없는 컴포넌트를 먼저 만든 경우. 예외는 `bottom_navigation`뿐입니다
- prop 이름, 부품 조립, 상태 집합이 React 구현과 다른 경우. 구조, API, 상태는 React를 따릅니다
- 높이, padding, radius, 색, 상태 알파, 모션 시간이 Figma와 다른 경우. Figma에 없는 값은 React 값을 씁니다
- 컴포넌트 안에 로컬 enum을 만든 경우. `IdsSize`, `IdsVariant`로 안 되는 축은 `packages/core/tokens/enums.json`에 더합니다
- 치수와 상태 알파를 컴포넌트 파일마다 흩어 적은 경우. control surface 값은 파일 한 곳에 둡니다
- `lib/theme/`, `lib/tokens/`, `lib/src/layout/ids_axis.dart`를 지운 경우

### 파일과 공개 API

- 컴포넌트가 `lib/src/components/<name>/ids_<name>.dart`가 아니거나 이름에 `Ids` 접두사가 없는 경우
- 공개 컴포넌트를 `lib/ids.dart`에서 export하지 않은 경우, `IdsGroup`처럼 내부용 파일을 export한 경우
- 컴포넌트에 widgetbook usecase(`example/lib/components/<name>_usecase.dart`)나 위젯 테스트(`test/ids_<name>_test.dart`)가 없는 경우
- 부모 밖에서 쓰면 안 되는 부품이 영어 메시지의 `assert` 없이 조용히 실패하는 경우
- `android/`, `ios/` 같은 플랫폼 디렉터리를 추가한 경우. 이 패키지는 앱이 아닙니다
- `pubspec.yaml`의 `version`을 손으로 바꾼 경우. `pnpm version:packages`가 `package.json`에서 옮겨 적습니다

### 상태와 상호작용

- 상태를 StateMask나 덮는 레이어로 그린 경우. 상태는 배경색 알파로 표현합니다
- `IdsInteractive`가 무언가를 그리는 경우. 상태만 내보내고 배경, 링, disabled는 control surface가 정합니다
- `focusVisible`을 `FocusManager.instance.highlightMode`만으로 정한 경우. 마우스 클릭이나 터치로 얻은 focus에는 링이 없어야 합니다
- hover가 마우스가 아닌 입력에서 켜지는 경우
- `active`(누르는 중)와 `pressed`(Toggle의 켜짐)를 섞어 쓴 경우
- `disabled`가 되어도 `hovered`, `active`가 남는 경우, pointer cancel 뒤에 `active`, `hovered`가 돌아오지 않는 경우
- Enter와 Space로 `active`가 되지 않는 경우
- 스타일 우선순위가 `pressed`, `active`, `hovered` 순이 아닌 경우

### 스타일

- `Color(0x...)`처럼 색을 직접 쓴 경우. 색은 `ThemeProvider.of(context)`에서 가져옵니다
- 글자 스타일을 직접 만든 경우. `IdsTypography` 상수를 씁니다
- `colorScheme` prop을 받는 컴포넌트에서 `outline`, `ghost`가 theme 색을 쓰는 경우. 둘은 중립색입니다
- 테두리를 `Container(decoration:)`로 그린 경우. 자식이 1px 안으로 밀리므로 `DecoratedBox`, `Border.all(width: 1)`, 안쪽 `Padding`을 씁니다
- focus 링이 바깥 3px 링(ring 색 0.40)과 안쪽 1px 테두리가 아닌 경우
- `active`에서 크기가 바뀌는 경우. 배경만 바뀝니다
- disabled가 opacity 0.50이 아닌 경우
- 전환 시간이 `IdsMotion` 밖의 값인 경우, reduced motion(`MediaQuery.disableAnimationsOf`)에서도 전환이 도는 경우
- radius가 `standard`(10)가 아닌 경우

### 접근성

- 컴포넌트가 `Semantics`(button, label, enabled, Toggle은 toggled)를 스스로 주입하지 않아 앱이 감싸야 하는 경우

### 그룹

- 그룹 안의 자식이 `size ?? group.size ?? standard`, `variant ?? group.variant ?? solid` 순서를 따르지 않는 경우
- 그룹과 자식의 값이 어긋날 때 throw하는 경우
- 그룹 안의 그룹이 바깥 그룹 값을 물려받지 않는 경우

## 보지 않을 것

- ESLint, Prettier, TypeScript가 잡는 것
- 생성 파일: `packages/css/dist/ids.css`, `packages/react/src/tokens/types.ts`, `packages/flutter/lib/tokens/*.dart`
- `tests/__screenshots__`의 PNG. 디자인이 확정될 때까지 갱신하지 않습니다
- `pnpm-lock.yaml`
- 문장 다듬기 같은 취향의 문제. 문서는 틀린 내용만 지적합니다
