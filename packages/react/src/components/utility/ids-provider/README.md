# IdsProvider

앱의 테마(팔레트, radius, corner shape, 배율)와 라이트/다크 모드(`mode`)를 정하는 컨텍스트 컴포넌트입니다. 앱 최상단에 한 번 둡니다.

- **테마는 앱이 줍니다.** IDS 에는 기본 색이 없습니다. `theme` 이 없으면 타입 오류입니다.
- **팔레트 하나로 두 모드를 칠합니다.** 라이트와 다크의 역할 색(primary, secondary, accent …)은 IDS 가 대비 4.5:1 을 지키도록 고릅니다. 팔레트 대신 색 하나를 주면 IDS 가 11단계를 만듭니다.
- **CSS 변수로 칠합니다.** 테마는 감싸는 요소의 inline 변수가 되고, `@gsainfoteam/ids-css` 가 `data-mode` 에 따라 연결합니다. 서버 HTML 에 들어가므로 깜빡이지 않습니다.
- **제어와 비제어.** `mode` 를 넘기면 부모가 값을 가지고, `defaultMode` 를 넘기면 Provider 가 가집니다.
- **시스템 모드.** `mode="system"` 은 운영체제의 다크 모드 설정을 따르고, 설정을 바꾸면 새로고침 없이 바로 바뀝니다.
- **배율.** `scale` 은 영역 하나를 숫자만큼(예: 1.5) 키우거나 줄입니다.
- **Scope.** `IdsProvider.Scope` 는 하위 트리의 테마 일부나 모드만 바꾸고 나머지는 물려받습니다.
- **`useTheme()`.** 어디서든 현재 테마와 모드를 읽고 `setMode`, `toggleMode` 로 바꿉니다.
- **네이티브 컨트롤.** `color-scheme` 을 함께 설정해 스크롤바, 날짜 입력, 체크박스 같은 브라우저 기본 UI 도 모드를 따릅니다.

```ts
// ids-theme.ts
import { defineIdsTheme } from '@gsainfoteam/ids-react';

export const theme = defineIdsTheme({
  palette: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bedbff',
    300: '#8ec5ff',
    400: '#51a2ff',
    500: '#2b7fff',
    600: '#155dfc',
    700: '#1447e6',
    800: '#193cb8',
    900: '#1c398e',
    950: '#162456',
  },
  radius: 12,
  cornerShape: 'squircle',
});
```

```tsx
import { IdsProvider } from '@gsainfoteam/ids-react';

import { theme } from './ids-theme';

<IdsProvider theme={theme} defaultMode="system">
  <App />
</IdsProvider>;
```

- `defineIdsTheme` 과 `checkIdsTheme` 은 순수 함수라 Server Component 에서 만들어 넘겨도 됩니다.
- 테마 객체는 모듈에 한 번 만들어 둡니다. 렌더마다 새 객체를 만들면 역할 색을 다시 계산합니다.

## 테마

| 키            | 값                                                                                   | 기본                |
| ------------- | ------------------------------------------------------------------------------------ | ------------------- |
| `palette`     | 50, 100 … 900, 950 의 11단계, 또는 색 하나. 값은 CSS 색(hex, `oklch()` …)            | 없음 (필수)         |
| `radius`      | `standard` 모서리(px, 0–18). `indicator` 는 0.4배, `container` 는 1.6배              | 10                  |
| `cornerShape` | `'round'` / `'squircle'`                                                             | `'round'`           |
| `scale`       | 크기에 곱할 배율(0.5–2). TV 화면은 1.5, 키오스크는 1.25 정도                          | 1                   |

### 앱이 바꾸는 것과 IDS 가 정하는 것

| 토큰                     | 앱이 값을 바꾼다 | 앱이 단계를 더한다 | 비고                                                              |
| ------------------------ | ---------------- | ------------------ | ----------------------------------------------------------------- |
| 색                       | ✅ 팔레트 하나   | ❌                 | 역할 색은 IDS 가 대비로 고른다. neutral, status, chart 는 고정    |
| radius                   | ✅               | ❌                 | `standard` 하나를 받고 `indicator`, `container` 는 계산한다       |
| 글꼴, 타입 스케일        | ❌               | ❌                 | Pretendard GOV, Geist Mono 고정. 크기는 배율로 바꾼다              |
| corner shape             | ✅               | ❌                 | `round` / `squircle`                                              |
| 배율                     | ✅ 숫자          | ❌                 | 영역마다 줄 수 있다                                               |
| size (`standard`/`tiny`) | ❌               | ❌                 | 컴포넌트마다 값이 다르다. 내용 크기는 `className` 으로 바꾼다     |
| spacing, motion, shadow  | ❌               | ❌                 | spacing 은 배율만 따른다                                          |

- 크기를 키우는 방법은 size 단계를 더하는 것이 아니라 배율입니다. Radix `scaling`, Spectrum 의 모바일 배율, Material density 와 같은 방식입니다.

### 팔레트에서 역할 색 고르기

| 역할           | light                               | dark                               |
| -------------- | ----------------------------------- | ---------------------------------- |
| `primary`      | 600                                 | 600                                |
| `secondary`    | 100                                 | 950                                |
| `outline`      | 200                                 | 800                                |
| `on-primary`   | 흰색이 4.5:1 을 넘으면 흰색, 아니면 neutral 950 | 같음                     |
| `on-secondary` | 700, 800, 900 중 처음 통과하는 단계 | 400, 300, 200 중 처음 통과하는 단계 |
| `accent`       | 600, 700, 800, 900 중 처음 통과하는 단계 | 500, 400, 300 중 처음 통과하는 단계 |

- `on-secondary` 는 `secondary` 와 그 hover(6%), press(12%) 틴트에서 모두 4.5:1 을 넘어야 합니다.
- `accent` 는 `surface` 와 `secondary` 에서 모두 4.5:1 을 넘어야 합니다.
- neutral, status(success, warning, danger, info), chart 색은 IDS 가 정하고 바뀌지 않습니다.
- 이 규칙으로 Tailwind 계열 17색 팔레트를 돌리면 이전 IDS 의 고정 표와 같은 값이 나옵니다.

### 색 하나로 팔레트 만들기

```ts
import { createIdsPalette, defineIdsTheme } from '@gsainfoteam/ids-react';

export const theme = defineIdsTheme({ palette: '#0d9488' });

createIdsPalette('#0d9488'); // { 50: '#f0fdfa', …, 600: '#04968d', …, 950: '#032f30' }
```

- 고른 색에서 hue 와 채도만 읽습니다. 단계별 밝기와 채도는 IDS 의 기준 팔레트 17개에서 hue 가 가까운 둘을 섞어 정합니다. 노랑과 남색의 600 은 밝기가 다릅니다.
- 고른 색이 같은 hue 의 기준보다 덜 선명하면 그 비율만큼 모든 단계의 채도를 줄입니다. 회색을 주면 회색 팔레트입니다.
- OKLCH 로 계산하고 sRGB 밖으로 나간 단계는 채도만 줄입니다. 결과는 8비트 hex 입니다.
- 만든 팔레트는 역할 색 규칙을 늘 통과합니다. 600 위의 글자가 4.5:1 에 모자라면 600 의 밝기를 가장 가까운 통과 지점으로 옮깁니다.
- 고른 색이 팔레트에 그대로 들어간다는 보장은 없습니다. 브랜드 색이 정확히 들어가야 하면 `createIdsPalette` 의 결과를 고쳐 11단계 객체로 넘깁니다.

### 배율

```tsx
<IdsProvider theme={theme}>
  <App />
  <IdsProvider.Scope theme={{ scale: 1.5 }}>
    <TvRoute /> {/* 이 아래만 1.5배 */}
  </IdsProvider.Scope>
</IdsProvider>
```

- 곱하는 것: Tailwind `--spacing`(그래서 `h-9`, `p-4`, `gap-2` 같은 크기와 간격), 글자 크기, `--ids-size-*`, radius.
- 곱하지 않는 것: 테두리 두께, focus ring, 그림자, 줄 간격 비율.
- 글자 크기, 크기 토큰, radius 는 CSS `round()` 로 px 에 맞춥니다. `--spacing` 은 `p-4` 처럼 곱해 쓰는 단위라 반올림하지 않습니다.
- 안쪽 Scope 의 `scale` 은 바깥 배율에 곱하지 않고 바꿉니다. `1` 을 주면 원래 크기로 돌아옵니다.
- Popover, Menu 같은 레이어의 간격(`sideOffset`)과 폭도 배율을 따릅니다. `overlay.open` 으로 연 항목은 연 곳의 배율을 받습니다.
- 앱이 쓴 `w-[320px]` 같은 px 값은 배율을 따르지 않습니다. 배율을 따라야 하면 `w-80` 이나 `--spacing(80)` 으로 씁니다.

### 글꼴

글꼴은 IDS 가 정합니다. 본문은 Pretendard GOV, 고정폭은 Geist Mono 입니다. 앱은 CSS 에서 파일만 싣습니다.

```css
@import '@gsainfoteam/ids-css/fonts.css';
```

- 테마로 글꼴을 바꾸지 않습니다. 고정폭 글꼴의 x-height 보정(0.53), Kbd 의 세로 정렬, 타입 스케일의 행간과 자간이 이 두 글꼴에서 잰 값입니다.
- 앱 콘텐츠에 다른 글꼴이 필요하면 그 요소에 `font-[…]` 를 줍니다. IDS 컴포넌트는 Pretendard GOV 로 그립니다.
- `fonts.css` 를 가져오지 않으면 그 글꼴이 설치된 기기에서만 보이고, 나머지는 `sans-serif` 로 그립니다.

### 검증

```ts
import { checkIdsTheme } from '@gsainfoteam/ids-react';

test('the app theme passes IDS', () => {
  expect(checkIdsTheme(theme)).toEqual([]);
});
```

- 빠진 팔레트 단계, CSS 색이 아닌 값, 4.5:1 을 넘는 단계가 없는 역할, 범위를 벗어난 `radius` 와 `scale`, 모르는 `cornerShape` 를 `{ path, message }` 목록으로 돌려줍니다.
- 개발 모드에서는 Provider 가 같은 목록을 `console.warn` 으로 알립니다. 팔레트가 아예 없으면 `console.error` 입니다.
- 통과하지 못한 역할은 마지막 후보 단계로 그립니다. 화면은 깨지지 않지만 대비가 모자랍니다.

## 제어와 비제어

```tsx
<IdsProvider theme={theme} />                                        // light 로 시작

<IdsProvider theme={theme} defaultMode="dark" />                     // 비제어: Provider 가 값을 가진다

const [mode, setMode] = useState<IdsProvider.Mode>('light');
<IdsProvider theme={theme} mode={mode} onModeChange={setMode} />     // 제어: 부모가 값을 가진다
```

- 제어 모드에서 `setMode` 는 `onModeChange` 만 부릅니다. 화면은 부모가 `mode` 를 바꿀 때 바뀝니다.
- 같은 값으로 바꾸면 `onModeChange` 를 부르지 않습니다.
- 테마를 바꾸려면 다른 `theme` 객체를 넘깁니다.

## 시스템 모드

```tsx
<IdsProvider theme={theme} defaultMode="system">
  <App />
</IdsProvider>;

const { mode, resolvedMode } = useTheme();
// mode: 'system'        사용자가 고른 값
// resolvedMode: 'dark'  실제로 칠해진 값
```

- `prefers-color-scheme` 이 바뀌면 바로 따라갑니다.
- 서버 렌더링에서는 방문자의 설정을 알 수 없어 `light` 로 그리고, 하이드레이션 직후 실제 모드로 바꿉니다. 두 모드의 역할 색이 처음부터 HTML 에 있어서 색을 다시 받아 오지 않습니다.

## Scope

```tsx
<IdsProvider theme={theme} defaultMode="light">
  <Header />

  <IdsProvider.Scope mode="dark">
    {/* 테마는 바깥을 물려받는다 */}
    <Sidebar />
  </IdsProvider.Scope>

  <IdsProvider.Scope theme={{ palette: promoPalette, radius: 16 }}>
    {/* mode 와 배율은 바깥을 물려받는다 */}
    <PromoBanner />
  </IdsProvider.Scope>
</IdsProvider>
```

- `IdsProvider.Scope` 의 `theme` 은 모든 키가 선택입니다. 준 키만 그 아래에서 바뀝니다.
- `mode` 를 주지 않은 Scope 에서 부르는 `setMode` 는 mode 를 가진 바깥 Provider 로 갑니다.
- 바깥과 모드가 다른 영역은 `--ids-color-surface` 배경과 `--ids-color-on-surface` 글자색을 칠합니다. 그렇지 않으면 다크 글자색이 라이트 배경 위에 그려집니다.
- `dark:` 변형도 가장 가까운 `data-mode` 를 따릅니다. 다크 안의 라이트 영역은 `dark:` 에 걸리지 않습니다.
- `IdsProvider` 를 다른 `IdsProvider` 안에 두어도 됩니다. 그때도 `theme` 은 전부 줘야 하고, 대화상자와 토스트는 가장 바깥 Provider 가 그립니다.

## useTheme

```tsx
import { useTheme } from '@gsainfoteam/ids-react';

function ThemeMenu() {
  const { theme, scale, mode, resolvedMode, setMode, toggleMode } = useTheme();
  return (
    <>
      <Button onClick={toggleMode}>{resolvedMode === 'dark' ? '라이트로' : '다크로'}</Button>
      <Button onClick={() => setMode('system')}>시스템 설정 따르기</Button>
    </>
  );
}
```

| 값             | 뜻                                                                    |
| -------------- | --------------------------------------------------------------------- |
| `theme`        | 가장 가까운 Provider 까지 합친 테마                                   |
| `scale`        | 가장 가까운 Provider 의 배율. 아무도 주지 않았으면 `undefined`        |
| `mode`         | 고른 모드. `light` / `dark` / `system`                                |
| `resolvedMode` | 실제로 칠해진 모드. `light` / `dark`                                  |
| `setMode`      | 모드를 바꾼다                                                         |
| `toggleMode`   | `resolvedMode` 의 반대로 바꾼다. `system` 이었으면 명시적인 값이 된다 |

- Provider 밖에서 부르면 빈 `theme`, `light` 와 아무 일도 하지 않는 setter 를 돌려줍니다.

## asChild

```tsx
<IdsProvider.Scope asChild mode="dark">
  <section>…</section> {/* 감싸는 div 없이 section 에 data-mode 와 테마 변수가 붙는다 */}
</IdsProvider.Scope>
```

- 레이아웃 때문에 요소를 하나 더 두기 어려울 때 씁니다. 자식은 요소 하나여야 합니다.

## 속성

| 속성                                  | 기본 / 동작                                                                                          |
| ------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `theme`                               | `IdsProvider` 는 필수(`IdsTheme`), `IdsProvider.Scope` 는 선택(`IdsThemeOverrides`)                  |
| `mode` / `defaultMode`                | `light` / `dark` / `system`. 둘 다 없으면 바깥을 물려받고, 가장 바깥은 `light`                       |
| `onModeChange`                        | 모드를 바꾸려 할 때                                                                                  |
| `translate`                           | `(key, values) => string \| undefined`. IDS 문구를 앱의 i18n 으로 바꾼다. 없으면 바깥을 물려받는다   |
| `locale`                              | 날짜, 시간, 숫자, 국가 이름의 BCP 47 locale. 없으면 바깥을 물려받는다. 컴포넌트의 `locale` 이 이긴다 |
| `asChild`                             | 자식 요소에 속성을 붙인다                                                                            |
| `className` / `style` / `ref` / 그 외 | 감싸는 요소(또는 자식)로 간다                                                                        |

- 요소에는 `data-mode`(항상 `light` / `dark`), `style.colorScheme`, 준 테마의 변수, `scale` 을 준 경우 `--ids-scale` 변수와 `data-scale` 이 붙습니다.
  - 역할 색: `--ids-theme-light-primary`, `--ids-theme-dark-primary` … (두 모드 다)
  - radius: `--ids-theme-radius-standard`, `-indicator`, `-container`. `ids.css` 가 배율을 곱해 `--ids-radius-*` 로 씁니다
  - corner shape: `--ids-corner-shape`
- `translate` 와 `locale` 은 패키지 README 의 [문구와 언어](../../../../README.md#문구와-언어) 를 참고합니다.

## 알아둘 것

- IDS 컴포넌트는 `IdsProvider` 안에 있어야 색이 칠해집니다. 밖에 두면 CSS 변수가 정의되지 않습니다.
- `@gsainfoteam/ids-css` 를 불러오지 않아 색 변수가 비어 있으면 개발 모드에서 경고가 나옵니다.
- squircle 은 CSS `corner-shape` 로 그립니다. 지원하지 않는 브라우저는 둥근 모서리로 그립니다. `rounded-full` 은 squircle 테마에서도 원입니다.
- 최상위 Provider 는 배경을 칠하지 않습니다. 페이지 배경은 앱이 `bg-(--ids-color-surface)` 로 칠합니다.
- 최상위 Provider 는 `overlay.open` 으로 연 대화상자와 기본 `Toaster` 를 자기 요소 안(`asChild` 면 그 옆)에 그립니다. 최상위 Provider 가 여럿이면 먼저 마운트된 하나가 그립니다. 앱이 `<Toaster />` 를 직접 두면 기본 Toaster 는 물러납니다. `useOverlay()` 로 연 항목은 연 곳의 테마 변수를 받습니다.
- 서버 HTML 에는 테마 변수 말고 아무것도 더하지 않습니다. 브라우저에서는 토스트를 읽어 줄 빈 `aria-live` 영역 하나가 붙습니다. 역할(role)이 없어 스크린 리더에게 드러나지 않습니다.
- 최상위 Provider 는 Tooltip 의 지연 그룹(`TooltipDelayGroup`)도 둡니다. 툴팁 하나가 열린 뒤 곧바로 다른 툴팁에 올라가면 기다리지 않고 열립니다.
- `dark:` 변형은 두 단계 중첩까지 정확합니다. 다크 안의 라이트 안에 다시 다크를 두면 가장 안쪽은 `dark:` 에 걸리지 않습니다. 이때는 토큰 변수로 칠하면 모든 깊이에서 맞습니다.
