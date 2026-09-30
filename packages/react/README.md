# @gsainfoteam/ids-react

IDS React 컴포넌트 라이브러리.

## 설치

GitHub Packages 에서 배포한다. 퍼블릭 패키지여도 설치에 인증이 필요하다.

프로젝트 루트에 `.npmrc` 를 둔다.

```ini
@gsainfoteam:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${NODE_AUTH_TOKEN}
```

`NODE_AUTH_TOKEN` 은 `read:packages` 스코프를 가진 토큰이다. `gh` 가 있으면

```bash
gh auth refresh -s read:packages
export NODE_AUTH_TOKEN=$(gh auth token)
```

없으면 classic PAT 를 발급해 같은 환경변수에 넣는다. fine-grained 는 npm
레지스트리 지원이 제한적이다.

```bash
npm install @gsainfoteam/ids-react @gsainfoteam/ids-css
npm install tailwindcss  # peerDependency
```

## CI 설정

GitHub Actions 에서는 토큰을 따로 발급하지 않는다. `secrets.GITHUB_TOKEN` 을
그대로 쓴다. `.npmrc` 는 위와 동일하다.

```yaml
permissions:
  contents: read
  packages: read

steps:
  - uses: actions/setup-node@v4
    with:
      registry-url: https://npm.pkg.github.com
      scope: '@gsainfoteam'

  - run: npm ci
    env:
      NODE_AUTH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

`packages: read` 를 빠뜨리면 401 이 난다. `permissions` 블록을 선언하는 순간
적지 않은 권한은 전부 `none` 이 되기 때문이다.

Vercel 처럼 `gh` 도 `GITHUB_TOKEN` 도 없는 환경은 classic PAT 를 환경변수로 넣는다.

## 프레임워크별 설치

모든 프레임워크에서 할 일은 세 가지다.

- CSS 엔트리에서 `tailwindcss`, `@gsainfoteam/ids-css` 순서로 가져온다.
- `@source` 로 `@gsainfoteam/ids-react` 의 `dist` 를 스캔하게 한다. Tailwind 는 `node_modules` 를 스스로 스캔하지 않아서, 이 줄이 없으면 컴포넌트의 클래스가 CSS 에 생기지 않는다. 경로는 그 CSS 파일에서 본 상대 경로다.
- 앱 최상단을 `IdsProvider` 로 감싼다. `IdsProvider` 가 없으면 CSS 변수가 정의되지 않아 색이 보이지 않는다.

```css
@import 'tailwindcss';
@import '@gsainfoteam/ids-css';

@source '../node_modules/@gsainfoteam/ids-react/dist';
```

- 글꼴은 [`@gsainfoteam/ids-css` README](../css/README.md#폰트) 를 따른다.
- Next.js, TanStack Start, Astro 설정은 `examples/` 의 앱과 같다. CI 가 세 앱을 빌드하고, 서버가 그린 HTML 에 IDS 가 들어 있는지와 CSS 에 IDS 클래스가 생겼는지 확인한다(`pnpm examples:check`).

### Next.js (App Router)

예제: [`examples/next-app-router`](../../examples/next-app-router)

```bash
npm install next react react-dom @gsainfoteam/ids-react @gsainfoteam/ids-css
npm install -D tailwindcss @tailwindcss/postcss
```

```js
// postcss.config.mjs
export default {
  plugins: { '@tailwindcss/postcss': {} },
};
```

```css
/* app/globals.css */
@import 'tailwindcss';
@import '@gsainfoteam/ids-css';

@source '../node_modules/@gsainfoteam/ids-react/dist';
```

```tsx
// app/layout.tsx
import { IdsProvider } from '@gsainfoteam/ids-react';

import './globals.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <IdsProvider color="blue" mode="light">{children}</IdsProvider>
      </body>
    </html>
  );
}
```

- 페이지와 레이아웃은 서버 컴포넌트 그대로 둔다. `'use client'` 없이 `<Dialog.Trigger>`, `<Select.Item>`, `Button.Style()` 을 쓸 수 있다.
- 이벤트 핸들러를 넘기는 곳만 클라이언트 컴포넌트로 뺀다. 예: `onClick={() => toast.success(...)}` 을 가진 버튼(`examples/next-app-router/app/toast-button.tsx`).

```tsx
// app/page.tsx: 서버 컴포넌트
import { Button, Dialog } from '@gsainfoteam/ids-react';

export default function Page() {
  return (
    <Dialog>
      <Dialog.Trigger asChild>
        <Button variant="outline">프로필 수정</Button>
      </Dialog.Trigger>
      <Dialog.Content>
        <Dialog.Title>프로필 수정</Dialog.Title>
      </Dialog.Content>
    </Dialog>
  );
}
```

### TanStack Start

예제: [`examples/tanstack-start`](../../examples/tanstack-start)

```bash
npm install @tanstack/react-start @tanstack/react-router react react-dom @gsainfoteam/ids-react @gsainfoteam/ids-css
npm install -D vite @vitejs/plugin-react tailwindcss @tailwindcss/vite
```

```ts
// vite.config.ts
import tailwindcss from '@tailwindcss/vite';
import { tanstackStart } from '@tanstack/react-start/plugin/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [tailwindcss(), tanstackStart(), react()],
});
```

```css
/* src/styles.css */
@import 'tailwindcss';
@import '@gsainfoteam/ids-css';

@source '../node_modules/@gsainfoteam/ids-react/dist';
```

```tsx
// src/routes/__root.tsx
import { IdsProvider } from '@gsainfoteam/ids-react';
import { HeadContent, Scripts, createRootRoute } from '@tanstack/react-router';

import styles from '../styles.css?url';

export const Route = createRootRoute({
  head: () => ({ links: [{ rel: 'stylesheet', href: styles }] }),
  shellComponent: ({ children }) => (
    <html lang="ko">
      <head>
        <HeadContent />
      </head>
      <body>
        <IdsProvider color="blue" mode="light">{children}</IdsProvider>
        <Scripts />
      </body>
    </html>
  ),
});
```

- 라우트는 서버에서 그린 뒤 hydrate 된다. 컴포넌트를 평소처럼 쓰면 된다.

### Astro

예제: [`examples/astro`](../../examples/astro)

```bash
npm install astro @astrojs/react react react-dom @gsainfoteam/ids-react @gsainfoteam/ids-css
npm install -D tailwindcss @tailwindcss/vite
```

```js
// astro.config.mjs
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'astro/config';

export default defineConfig({
  integrations: [react()],
  vite: { plugins: [tailwindcss()] },
});
```

```css
/* src/styles/global.css */
@import 'tailwindcss';
@import '@gsainfoteam/ids-css';

@source '../../node_modules/@gsainfoteam/ids-react/dist';
```

```astro
---
// src/pages/index.astro
import { Button, IdsProvider } from '@gsainfoteam/ids-react';
import { Demo } from '../components/demo';
import '../styles/global.css';
---
<IdsProvider color="blue" mode="light">
  <Button variant="outline">정적 버튼</Button>
</IdsProvider>
<Demo client:load />
```

- 움직이는 부분(Dialog, Select, Menu, toast)은 `client:load` 같은 지시어를 단 React island 에 둔다.
- island 는 저마다 따로 React 루트라서, `IdsProvider` 도 island 안에 둔다. 바깥의 `IdsProvider` 는 island 에 닿지 않는다.
- 지시어 없는 React 컴포넌트는 빌드 때 HTML 만 그린다. 보이기만 하는 버튼, 배지에 쓴다.

### Vite (SPA)

```bash
npm install react react-dom @gsainfoteam/ids-react @gsainfoteam/ids-css
npm install -D vite @vitejs/plugin-react tailwindcss @tailwindcss/vite
```

```ts
// vite.config.ts
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({ plugins: [tailwindcss(), react()] });
```

```css
/* src/index.css */
@import 'tailwindcss';
@import '@gsainfoteam/ids-css';

@source '../node_modules/@gsainfoteam/ids-react/dist';
```

```tsx
// src/main.tsx
import { IdsProvider } from '@gsainfoteam/ids-react';
import { createRoot } from 'react-dom/client';

import { App } from './app';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <IdsProvider color="blue" mode="light">
    <App />
  </IdsProvider>,
);
```

## IdsProvider

| prop | 타입 | 기본값 | 설명 |
|---|---|---|---|
| `color` / `defaultColor` | `IdsColor` | 바깥 Provider, 최상위는 `'blue'` | 색상 테마 (제어 / 비제어) |
| `mode` / `defaultMode` | `'light' \| 'dark' \| 'system'` | 바깥 Provider, 최상위는 `'light'` | 모드 (제어 / 비제어) |
| `onColorChange` / `onModeChange` | `(value) => void` | | 값을 바꾸려 할 때 |

```tsx
import { useTheme } from '@gsainfoteam/ids-react';

function ThemeToggle() {
  const { toggleMode } = useTheme();
  return <button onClick={toggleMode}>모드 전환</button>;
}
```

중첩, 시스템 모드, `asChild` 는 `src/components/utility/ids-provider/README.md` 를 참고한다.

## 문구와 언어

IDS 가 스스로 그리는 문구(닫기 버튼 이름, 달력 버튼, placeholder, 검증 문구, 스크린 리더 안내)는 기본이 한국어다. 앱의 i18n 라이브러리를 `IdsProvider` 에 한 번 꽂으면 그 언어로 바뀐다.

```tsx
<IdsProvider translate={(key, values) => myT(`ids.${key}`, values)} locale="en-US">
  <App />
</IdsProvider>
```

- `translate(key, values)` 는 문구 하나를 돌려준다. `undefined` 나 키 그대로를 돌려주면 그 문구는 한국어 기본값으로 돌아간다.
- `key` 는 점으로 이은 경로(`'dialog.close'`, `'textArea.remaining'`)다. 타입은 `IdsMessageKey` 로 가져온다.
- `values` 는 문구에 끼울 값(`{ count: 3 }`)이다. 문구는 ICU 메시지 문법이라 `{count, plural, one {…} other {…}}` 를 앱의 라이브러리가 포맷한다.
- `locale` 은 날짜, 시간, 숫자, 국가 이름 형식에만 쓴다. 컴포넌트에 준 `locale` 이 이긴다.
- 안쪽 `IdsProvider` 는 `translate`, `locale` 을 주지 않으면 바깥 것을 물려받고, 주면 그 안에서 바꾼다.
- `translate` 는 함수라서, Next.js App Router 에서는 `IdsProvider` 를 감싼 클라이언트 컴포넌트에서 넘긴다.

### 카탈로그

패키지가 중첩 JSON 카탈로그 두 개를 내보낸다. 앱 번역 파일의 시작점이다.

```ts
import ko from '@gsainfoteam/ids-react/messages/ko.json'; // 한국어 기본값과 같다
import en from '@gsainfoteam/ids-react/messages/en.json';
```

```json
{ "calendar": { "previousMonth": "Previous month", "weekNumber": "Week {week}" }, "dialog": { "close": "Close" } }
```

- 앱 카탈로그의 `ids` 아래에 그대로 붙이면 `ids.dialog.close` 로 읽힌다. 바꾸고 싶은 문구만 고친다.
- 빠진 키는 한국어 기본값으로 나온다. 새 버전에서 문구가 늘어도 깨지지 않는다.

### next-intl

```tsx
'use client';

export function IdsWithIntl({ children }: { children: React.ReactNode }) {
  const t = useTranslations('ids');
  const locale = useLocale();
  return (
    <IdsProvider translate={(key, values) => (t.has(key) ? t(key, values) : undefined)} locale={locale}>
      {children}
    </IdsProvider>
  );
}
```

- `messages/en.json` 을 앱 카탈로그의 `"ids"` 아래에 둔다.

### i18next

```tsx
export function IdsWithI18next({ children }: { children: React.ReactNode }) {
  const { t, i18n } = useTranslation();
  const translate: IdsTranslate = (key, values) =>
    i18n.exists(`ids.${key}`) ? t(`ids.${key}`, values) : undefined;
  return <IdsProvider translate={translate} locale={i18n.language}>{children}</IdsProvider>;
}
```

- 리소스의 `ids` 아래에 카탈로그를 둔다. ICU 문법(`{count}`, plural)을 읽으려면 [`i18next-icu`](https://github.com/i18next/i18next-icu) 를 쓴다.

### react-intl

FormatJS 는 평평한 id 를 쓰므로 카탈로그를 한 번 펼친다.

```tsx
const flatten = (tree: object, prefix = ''): Record<string, string> =>
  Object.fromEntries(
    Object.entries(tree).flatMap(([key, value]) =>
      typeof value === 'string' ? [[prefix + key, value]] : Object.entries(flatten(value, `${prefix}${key}.`)),
    ),
  );

<IntlProvider locale="en" messages={{ ...flatten(en, 'ids.'), ...appMessages }}>
  <IdsWithIntl>{children}</IdsWithIntl>
</IntlProvider>;

function IdsWithIntl({ children }: { children: React.ReactNode }) {
  const intl = useIntl();
  const translate: IdsTranslate = (key, values) =>
    intl.messages[`ids.${key}`] ? intl.formatMessage({ id: `ids.${key}` }, values) : undefined;
  return <IdsProvider translate={translate} locale={intl.locale}>{children}</IdsProvider>;
}
```

## 인터랙션 state

IDS는 hover / press / focus의 **소유권을 컴포넌트 안에 둔다.**  
외부 구독·controlled 인터랙션 API는 두지 않고, 아래 두 길로만 바깥에 노출한다.

실행 예시는 Storybook `Foundations/InteractiveState`를 참고한다.

### 1. 노드 로컬 (부모 → 자식)

같은 컴포넌트 안·자손이 상태에 반응할 때.  
`variant` / `children` 등에 `(state) => value`를 넘긴다.

```tsx
<Button variant={(s) => (s.hovered ? 'solid' : 'outline')}>
  {(s) => (s.hovered ? 'Hovered' : 'Idle')}
</Button>
```

DOM에는 `data-hovered` 등이 붙으므로, 자손 스타일만 필요하면 CSS `group` / 셀렉터로도 충분하다.

### 2. Mirror (sibling)

형제끼리 JS로 같은 인터랙션에 반응해야 할 때.  
`onInteractionChange`로 부모가 **복사본만** 받는다. 소유권·핸들러는 계속 `<Button>`에 있다.

```tsx
function Row() {
  const [interaction, setInteraction] = useState(INTERACTIVE_STATE_DEFAULTS);

  return (
    <>
      <Button variant="outline" onInteractionChange={setInteraction}>
        Hover me
      </Button>
      {interaction.hovered && <Hint />}
    </>
  );
}
```

정리:

| 목표 | 방법 |
|---|---|
| IDS 컴포넌트 + 자손만 반응 | 노드 로컬 `(s) => …` |
| IDS 컴포넌트 + sibling **스타일만** | `peer` / `group` + `data-*` |
| sibling이 **JS로 분기** | `onInteractionChange` (mirror) |

### 하지 않는 것

- `hovered` 등을 controlled prop으로 올리는 것
- 컴포넌트마다 Context로 hover를 바깥에 뿌리는 구조
- 범용 sibling 구독 / store subscribe API
- sibling JS를 위해 `Button.Style` + 훅을 다시 조립하는 것 (Button이 이미 하는 일의 중복)

Tabs·Menu처럼 **진짜 compound**가 생기면 그때 Root Context(또는 store)를 도입한다.

## 지원 브라우저

| 브라우저 | 최소 버전 | 테스트 엔진 (Playwright 1.63) |
| --- | --- | --- |
| Chrome, Edge | 114 | Chromium 153 |
| Firefox | 128 | Firefox 155 |
| Safari (macOS, iOS) | 17 | WebKit 26.6 |

- 최소 버전은 IDS 가 기대는 기능에서 나옵니다. top layer 에 올리는 `popover` API(Chrome 114, Firefox 125, Safari 17)와 Tailwind CSS v4(Chrome 111, Firefox 128, Safari 16.4)입니다.
- 아래 기능은 없는 브라우저에서 모양만 덜 다듬어집니다.
  - `@starting-style` 이 없으면 여는 애니메이션 없이 바로 나타납니다.
  - relative color syntax(Chrome 119, Firefox 128, Safari 18)가 없으면 브랜드 채움의 hover 와 press 가 글자색에서 멀어지는 대신 90%, 80% 로 흐려집니다.
  - `cap` 단위(Safari 17.2)가 없으면 Kbd 가 글자 가운데가 아니라 기준선에 맞춰 놓입니다.
- 모든 브라우저 테스트가 CI(ubuntu)에서 세 엔진으로 돕니다. macOS 에서는 `pnpm test` 가 Chromium 만 돌리고, `pnpm test:browsers` 가 Docker 의 Playwright Linux 이미지에서 세 엔진을 모두 돌립니다.
- 엔진마다 건너뛰는 테스트와 그 이유:
  - CDP(Chrome DevTools Protocol)로 누른 채 끌기, 터치, IME 조합, 키 반복, 미디어와 시간대 흉내, 응답 붙잡기를 하는 테스트는 Chromium 에서만 돕니다. Firefox 와 WebKit 에는 CDP 가 없습니다.
  - FileField 의 붙여넣기 테스트는 Firefox 에서 건너뜁니다. Firefox 는 스크립트로 만든 paste 이벤트의 `clipboardData` 를 버리고, 테스트는 OS 의 파일을 붙여넣을 수 없습니다.

## 접근성

- 목표 기준은 WCAG 2.2 AA 이고, 키보드와 역할은 WAI-ARIA APG 패턴을 따릅니다.
- 컴포넌트별 키보드, 역할과 ARIA, 알려진 한계, 스크린 리더 수동 점검표는 [접근성 준수 안내](../../docs/accessibility.md) 에 있습니다.

## 컴포넌트

### Button

```tsx
import { Button } from '@gsainfoteam/ids-react';

<Button variant="solid" size="standard" onClick={() => {}}>
  클릭
</Button>
```

| prop | 타입 | 기본값 |
|---|---|---|
| `variant` | `'solid' \| 'soft' \| 'outline' \| 'ghost'` | `'solid'` |
| `colorScheme` | `'primary' \| 'neutral' \| 'danger' \| 'success' \| 'warning' \| 'info'` | `'primary'` |
| `size` | `'standard' \| 'tiny'` | `'standard'` |
| `disabled` | `boolean` | `false` |

`asChild`, `focusableWhenDisabled` 와 로딩 합성은 [Button API](./src/components/action/button/README.md) 를 참고하세요.

### Spinner

부모의 글자색을 상속하는 로딩 표시다. 크기를 주지 않으면 버튼 안에서는 버튼의 아이콘 크기,
그 밖에서는 글자 크기를 따른다. 모션 감소 설정에서는 회전 대신 천천히 깜빡인다.

```tsx
import { Button, Spinner } from '@gsainfoteam/ids-react';

// 단독 사용: 잠시 뒤 role="status"로 "불러오는 중"을 한 번 알린다.
<Spinner aria-label="댓글을 불러오는 중" />

// 버튼 안: 스스로 알림을 빼서 버튼 이름에 섞이지 않는다.
<Button disabled aria-busy="true">
  <Spinner />
  저장 중
</Button>
```

| prop | 타입 | 기본값 | 설명 |
|---|---|---|---|
| `size` | `'standard' \| 'tiny'` | 주변을 따름 | 표시 크기 |
| `aria-label` | `string` | `'불러오는 중'` | 스크린 리더가 읽을 문장 |
| `decorative` | `boolean` | 주변을 보고 결정 | `true`면 알리지 않고, `false`면 버튼 안에서도 알림 |

자세한 동작은 `src/components/feedback/spinner/README.md` 를 참고한다.

## 개발

```bash
pnpm storybook   # http://localhost:6006
pnpm build
pnpm typecheck
pnpm lint
```

외부 headless 라이브러리(Radix, Base UI 등)에 의존하지 않고 전부 직접 구현한다.

### 시각 회귀

- 모든 `Gallery` 스토리를 라이트와 다크로 찍어 `tests/__screenshots__` 의 기준 이미지와 비교합니다.
- 기준 이미지는 Playwright Linux 이미지(`mcr.microsoft.com/playwright`, `linux/amd64`) 안에서만 만듭니다. 글꼴, 래스터라이저, Chromium 빌드가 같아야 픽셀이 같기 때문입니다. macOS 나 일반 CI 러너에서는 이 테스트를 건너뜁니다.
- Docker 가 필요합니다.

```bash
pnpm test:visual          # 기준 이미지와 비교. 다르면 packages/react/.vitest/visual 에 실제와 차이 이미지를 남긴다
pnpm test:visual:update   # 의도한 변화라면 기준 이미지를 다시 만든다. 새 PNG 를 변경과 같은 커밋에 넣는다
```

## Field

`Field`는 Label/Description/Hint/Error를 입력에 자동 연결합니다.
일반 사용은 `@gsainfoteam/ids-react`, 선택형 RHF 자동 연동은
`@gsainfoteam/ids-react/react-hook-form`에서 가져옵니다.
[Field API와 연결 계약](./src/components/field/README.md)을 참고하세요.

## TextArea

`TextArea`는 여러 줄 입력과 위·아래 도구 영역을 합성하고, `autoResize`와
`minRows`/`maxRows`로 높이를 제한합니다. Field의 라벨·오류 및 선택적 RHF 어댑터와 연결됩니다.
[TextArea API와 예제](./src/components/text-area/README.md)를 참고하세요.

## NumberField

`NumberField`는 숫자/null 값, 소수점 증감, 통화·백분율 표시와 Input/Stepper/Clear 합성을 제공합니다.
RHF에는 `controlMode="value"`로 연결합니다. [NumberField API와 값 계약](./src/components/number-field/README.md)을 참고하세요.

## PasswordField

`PasswordField`는 native 비밀번호 입력과 표시 전환, Input/VisibilityToggle 합성을 제공합니다.
Field의 라벨·오류 및 RHF의 native 등록을 지원합니다. [PasswordField API](./src/components/password-field/README.md)를 참고하세요.

## OTPField

`OTPField`는 여러 칸에 입력한 코드를 하나의 문자열로 관리하고, 붙여넣기·자동 이동·마스킹을 지원합니다.
RHF에는 `controlMode="value"`로 연결합니다. [OTPField API와 편집 규칙](./src/components/otp-field/README.md)을 참고하세요.

## Select

검색·그룹·다중 선택과 키보드 탐색을 지원합니다. RHF는 `controlMode="value"`를 사용합니다. [Select API](./src/components/select/README.md).

## TelField

전화번호 자동 포맷과 검색 가능한 국가 선택을 제공합니다. [TelField API](./src/components/tel-field/README.md).

## ColorField

색상 패널·팔레트·투명도와 HEX/RGB/HSL 형식 입력을 제공합니다. [ColorField API](./src/components/color-field/README.md).

## ChipField

검색·다중 선택·새 태그 생성과 칩 삭제를 지원합니다. [ChipField API](./src/components/chip-field/README.md).

## FileField

파일 선택·드롭·목록 삭제와 형식·크기·개수 제한을 지원합니다. [FileField API](./src/components/file-field/README.md).

## Calendar

단일·범위·다중 날짜 선택과 키보드 월 탐색을 제공합니다. [Calendar API](./src/components/data/calendar/README.md).

## DateField

Calendar 팝업으로 날짜·기간·여러 날짜를 선택하고, 날짜를 글자로 칠 수도 있습니다. [DateField API](./src/components/form/date-field/README.md).

## TimePicker

시·분·초 컬럼과 12/24시간제를 지원합니다. [TimePicker API](./src/components/data/time-picker/README.md).

## TimeField

TimePicker 팝업으로 시간을 선택합니다. [TimeField API](./src/components/form/time-field/README.md).

## DateTimeField

Calendar와 TimePicker로 일시를 선택합니다. [DateTimeField API](./src/components/form/date-time-field/README.md).

## Interaction feedback

Button/Toggle 계열은 색상·그림자·투명도·포인터 누름 배율만 150ms로 전환합니다. 키보드 포커스에서는 전환과 누름 배율을 적용하지 않으며 reduced-motion도 지원합니다. TextField 계열은 색상만 전환하고 포커스 표시는 즉시 반영합니다. IdsProvider는 `color-scheme`도 모드에 맞춰 네이티브 폼 컨트롤과 스크롤바에 전달합니다.

## Rating

반 점 평점 선택·키보드 조작·커스텀 그래픽·표시 전용 모드를 지원합니다. RHF는 `controlMode="value"`를 사용합니다. [Rating API](./src/components/rating/README.md).

## FloatingButton

화면 모서리에 떠 있는 아이콘/확장형 주 동작 버튼입니다. safe area, 읽는 방향, 링크 합성과 비활성 상태를 챙깁니다. [FloatingButton API](./src/components/action/floating-button/README.md).

## QRCode

값을 토큰 색의 SVG QR 코드로 그립니다. 둥근 모듈과 점, 파인더 모양, 가운데 로고, 다크 모드 반전을 지원합니다. [QRCode API](./src/components/data/qr-code/README.md).

## Marquee

로고, 공지, 숫자를 한 방향으로 끊김 없이 흘리는 CSS 애니메이션 띠입니다. 멈춤 버튼, 포인터와 포커스에 잠시 멈춤, 동작 줄이기, 오른쪽에서 왼쪽 문서를 챙깁니다. [Marquee API](./src/components/data/marquee/README.md).
