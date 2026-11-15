# IdsProvider

앱의 테마(브랜드 색, 중립과 상태 색의 방식, radius, corner shape, 배율)와 라이트/다크 모드(`mode`)를 정하는 컨텍스트 컴포넌트입니다. 앱 최상단에 한 번 둡니다.

- **테마는 앱이 줍니다.** IDS 에는 기본 색이 없습니다. `theme` 이 없으면 타입 오류입니다.
- **브랜드 색 하나로 두 모드를 칠합니다.** `primary` 하나만 있으면 됩니다. 계열마다 라이트와 다크의 역할 색(`bg-primary`, `bg-primary-soft`, `text-primary` …)을 IDS 가 APCA 대비(채움과 soft 위 글자 Lc 75, 페이지 위 색 글자와 선 Lc 60)를 지키도록 고릅니다. 팔레트 대신 색 하나를 주면 IDS 가 11단계를 만듭니다.
- **계열 여덟 개.** neutral, primary, secondary, tertiary, success, warning, danger, info 가 같은 역할 열 개를 가집니다.
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
  primary: {
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
| `primary`     | 50, 100 … 900, 950 의 11단계, 또는 색 하나. 값은 CSS 색(hex, `oklch()` …)            | 없음 (필수)         |
| `secondary`   | `primary` 와 같은 형식                                                               | [primary 에서 만든다](#secondary-와-tertiary) |
| `tertiary`    | `primary` 와 같은 형식                                                               | [primary 에서 만든다](#secondary-와-tertiary) |
| `neutral`     | `'pure'` / `'tinted'`                                                                | `'pure'`            |
| `status`      | `'harmonized'` / `'fixed'` / `{ success?, warning?, danger?, info? }`               | `'harmonized'`      |
| `radius`      | `standard` 모서리(px, 0–18). `indicator` 는 0.4배, `container` 는 1.6배              | 10                  |
| `cornerShape` | `'round'` / `'squircle'`                                                             | `'round'`           |
| `scale`       | 크기에 곱할 배율(0.5–2). TV 화면은 1.5, 키오스크는 1.25 정도                          | 1                   |

### 앱이 바꾸는 것과 IDS 가 정하는 것

| 토큰                     | 앱이 값을 바꾼다 | 앱이 단계를 더한다 | 비고                                                              |
| ------------------------ | ---------------- | ------------------ | ----------------------------------------------------------------- |
| 색                       | ✅ 브랜드 셋까지 | ❌                 | 역할 색은 IDS 가 대비로 고른다. neutral 은 tint, status 는 방식이나 색 |
| radius                   | ✅               | ❌                 | `standard` 하나를 받고 `indicator`, `container` 는 계산한다       |
| 글꼴, 타입 스케일        | ❌               | ❌                 | Pretendard GOV, Geist Mono 고정. 크기는 배율로 바꾼다              |
| corner shape             | ✅               | ❌                 | `round` / `squircle`                                              |
| 배율                     | ✅ 숫자          | ❌                 | 영역마다 줄 수 있다                                               |
| size (`standard`/`tiny`) | ❌               | ❌                 | 컴포넌트마다 값이 다르다. 내용 크기는 `className` 으로 바꾼다     |
| spacing, motion, shadow  | ❌               | ❌                 | spacing 은 배율만 따른다                                          |

- 크기를 키우는 방법은 size 단계를 더하는 것이 아니라 배율입니다. Radix `scaling`, Spectrum 의 모바일 배율, Material density 와 같은 방식입니다.

### 계열과 역할

| 역할 | 쓰임 |
| --- | --- |
| `bg-X`, `bg-X-hover`, `bg-X-active` | 채움과 그 hover, press |
| `bg-X-soft`, `bg-X-soft-hover`, `bg-X-soft-active` | 옅은 채움과 그 hover, press |
| `text-on-X` | 채움 위 글자 |
| `text-on-X-soft` | 옅은 채움 위 글자 |
| `text-X` | 채움 없는 바탕 위 글자와 아이콘 |
| `border-X` | 선 |

```tsx
<button className="bg-primary text-on-primary hover:bg-primary-hover">저장</button>
<span className="bg-danger-soft text-on-danger-soft">실패</span>
<a className="text-secondary">자세히 보기</a>
```

- `X` 는 neutral, primary, secondary, tertiary, success, warning, danger, info 중 하나입니다. 바탕 층은 `bg-surface` 와 `text-on-surface` 입니다.
- 이름은 [`packages/core/color-roles.json`](../../../../../core/color-roles.json) 한 표에서 나옵니다.
- 바뀐 이름: `secondary` → `primary-soft`, `accent` → `text-primary`, `outline` → `border-primary`, `muted` → `neutral-soft`, `on-muted` → `text-neutral`, `border` → `border-neutral`, `handle` → `bg-neutral`, `X-strong` → `text-X`.

### 팔레트에서 역할 색 고르기

브랜드와 상태 계열은 같은 규칙입니다.

| 역할 | light | dark |
| --- | --- | --- |
| `bg-X` | 600. 흰 글자도 neutral 950 글자도 Lc 75 에 못 미치면 500·700, 그다음 400·800 중 가장 읽히는 단계 | 같음 |
| `bg-X-hover`, `-active` | 600 을 글자에서 먼 쪽(흰 글자면 검정, 검은 글자면 흰색)으로 10%, 20% 섞는다 | 같음 |
| `bg-X-soft` | 100 | 950 |
| `bg-X-soft-hover`, `-active` | soft 에 `bg-X` 를 6%, 12% 섞는다 | 같음 |
| `text-on-X` | 흰색과 neutral 950 중 채움 위 Lc 가 높은 쪽 | 같음 |
| `text-on-X-soft` | 700, 800, 900, 950 중 처음 통과하는 단계 | 400, 300, 200, 100, 50 중 처음 통과하는 단계 |
| `text-X` | 600, 700, 800, 900, 950 중 처음 통과하는 단계 | 500, 400, 300, 200, 100, 50 중 처음 통과하는 단계 |
| `border-X` | `text-X` 와 같은 단계 | 같음 |

- 대비는 [APCA](https://git.apcacontrast.com/) 의 Lc 입니다. WCAG 2 의 대비비는 쓰지 않습니다.
  - WCAG 2 는 중간 밝기 채움 위의 검은 글자를 실제보다 잘 읽힌다고 봅니다. 그래서 보라색 채움 위에 검은 글자를 골랐습니다. APCA 는 글자 쪽(어두운 글자, 밝은 글자)에 따라 다르게 재서 이런 짝을 걸러 냅니다.
  - 채움과 soft 위 글자는 Lc 75(본문 글자의 기준), 페이지 위 색 글자(`text-X`)는 Lc 60(라벨, 링크, 에러 문구 같은 짧은 글자의 기준), 선과 아이콘 같은 표시의 하한은 Lc 45 입니다.
  - 계산은 `colorjs.io` 의 `contrastAPCA` 입니다(MIT).
- `text-on-X-soft` 는 soft 와 그 hover, press 에서 모두 Lc 75 를 넘어야 합니다.
- `text-X` 는 `surface` 와 `bg-X-soft` 에서 모두 Lc 60 을 넘어야 합니다. 그래서 라이트는 채움과 같거나 한 단계 진하고, 다크도 200 까지 옅어지지 않습니다.
- `border-X` 는 따로 고르지 않고 `text-X` 와 같은 단계를 씁니다. 선과 그 옆 글자가 한 색이라, invalid 필드의 테두리(`border-danger`)와 라벨, 에러 문구(`text-danger`)가 같은 색입니다. `text-X` 가 Lc 60 을 넘으므로 선의 하한 Lc 45 도 넘습니다.
- `border-neutral` 은 구조선이라 대비 규칙이 없습니다(neutral 200 / 800).
- 결과는 Material 3 의 톤과 비슷합니다. soft 위 글자는 거의 950(M3 의 on-container, 톤 10), 다크 모드의 soft 위 글자는 200 언저리(톤 80)입니다.
- Flutter 의 고정 표(`packages/flutter/lib/tokens`)는 이 규칙을 따르지 않고 예전 WCAG 표 그대로입니다. Flutter 가 런타임 팔레트를 받으면(#33) 맞춥니다.

### secondary 와 tertiary

```ts
defineIdsTheme({ primary: blue });                                  // secondary, tertiary 를 blue 에서 만든다
defineIdsTheme({ primary: blue, secondary: violet });               // tertiary 만 만든다
defineIdsTheme({ primary: blue, secondary: violet, tertiary: '#f59e0b' });
```

- 생략한 계열은 Provider 가 primary 에서 만듭니다(Material 3 의 규칙).
  - `secondary`: primary 와 같은 hue, primary 채도 비율의 1/3.
  - `tertiary`: primary 의 hue + 60°, 같은 채도 비율. 그 색이 상태 색과 너무 가까우면(아래 검증의 거리) −60° 로 돌린다.
  - 만든 계열도 [색 하나로 팔레트 만들기](#색-하나로-팔레트-만들기)와 같은 방법으로 11단계를 짓고, 위 역할 규칙으로 역할을 고릅니다.
- 채도 비율은 primary 500 의 채도를 같은 hue·밝기의 기준 팔레트 채도로 나눈 값입니다. 회색에 가까운 primary 면 secondary 와 tertiary 도 회색에 가깝습니다.
- Provider 는 세 계열을 늘 씁니다. 그래서 `colorScheme="secondary"`, `"tertiary"` 와 Chart 의 기본 세 색은 앱이 몇 계열을 주든 서로 다른 색입니다.
- 거리 검사는 앱이 준 계열만 합니다. 만든 계열이 primary 와 구별되는지는 `tests/theme-colors.test.ts` 가 17개 팔레트에서 확인합니다.

### neutral

```ts
defineIdsTheme({ primary: blue, neutral: 'tinted' });
```

- `'pure'`(기본)는 IDS 의 회색입니다. Provider 는 변수를 쓰지 않고 `ids.css` 의 값으로 그립니다.
- `'tinted'` 는 같은 밝기에 primary 의 hue 를 채도 0.02 이하로 섞습니다. 가운데 단계가 가장 많이 물들고 흰색과 가까운 끝은 거의 그대로입니다.
- 대비 규칙은 같습니다. `tests/tokens-contrast.test.ts` 가 두 방식 모두 확인합니다.

### status

```ts
defineIdsTheme({ primary: blue });                                     // 'harmonized'
defineIdsTheme({ primary: blue, status: 'fixed' });                    // green, yellow, red, sky
defineIdsTheme({ primary: blue, status: { danger: '#be123c' } });      // danger 만 앱의 색
```

- 기준 색은 success green, warning yellow, danger red, info sky 입니다(`'fixed'`).
- `'harmonized'` 는 상태 색의 hue 를 primary 쪽으로 돌립니다. 최대 15° 이고, 두 hue 거리의 절반을 넘지 않습니다. 단계별 밝기와 채도는 기준 그대로입니다.
- 돌린 색은 그 상태의 hue 범위(danger 5–31°, warning 31–108°, success 108–200°, info 200–268°) 안에 머뭅니다.
- 돌려서 primary 와 너무 가까워지거나 적록 색각에서 success·warning 과 danger 가 비슷해지면, 그 상태는 회전을 절반씩 줄이고 끝내 0 으로 돌아갑니다.
- 객체로 준 상태는 그 색으로, 나머지는 `'harmonized'` 로 정합니다.

### 색 하나로 팔레트 만들기

```ts
import { createIdsPalette, defineIdsTheme } from '@gsainfoteam/ids-react';

export const theme = defineIdsTheme({ primary: '#0d9488' });

createIdsPalette('#0d9488'); // { 50: '#f0fdfa', …, 600: '#04968d', …, 950: '#032f30' }
```

- 고른 색에서 hue 와 채도만 읽습니다. 단계별 밝기와 채도는 IDS 의 기준 팔레트 17개에서 hue 가 가까운 둘을 섞어 정합니다. 노랑과 남색의 600 은 밝기가 다릅니다.
- 고른 색이 같은 hue 의 기준보다 덜 선명하면 그 비율만큼 모든 단계의 채도를 줄입니다. 회색을 주면 회색 팔레트입니다.
- OKLCH 로 계산하고 sRGB 밖으로 나간 단계는 채도만 줄입니다. 결과는 8비트 hex 입니다.
- 만든 팔레트는 단계를 고치지 않습니다. 600 위의 글자가 Lc 75 에 모자라면 역할 규칙이 채움을 이웃 단계로 옮깁니다.
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

글꼴은 IDS 가 정합니다. 본문은 Pretendard GOV, 고정폭은 Geist Mono 입니다. `@import '@gsainfoteam/ids-css';` 가 두 글꼴의 파일까지 싣습니다.

- 테마로 글꼴을 바꾸지 않습니다. 고정폭 글꼴의 x-height 보정(0.53), Kbd 의 세로 정렬, 타입 스케일의 행간과 자간이 이 두 글꼴에서 잰 값입니다.
- 앱 콘텐츠에 다른 글꼴이 필요하면 그 요소에 `font-[…]` 를 줍니다. IDS 컴포넌트는 Pretendard GOV 로 그립니다.

### 검증

```ts
import { checkIdsTheme } from '@gsainfoteam/ids-react';

test('the app theme passes IDS', () => {
  expect(checkIdsTheme(theme)).toEqual([]);
});
```

- `{ path, message }` 목록으로 돌려줍니다.

| 문제 | `path` |
| --- | --- |
| 빠진 팔레트 단계, CSS 색이 아닌 값 | `primary.500`, `secondary`, `status.danger` … |
| 대비를 넘는 단계가 없는 역할 | 그 계열 |
| 모르는 `neutral`, `status`, `cornerShape`, 범위를 벗어난 `radius`, `scale` | 그 키 |
| 브랜드 계열 둘이 너무 가깝다 (OKLab 600 단계 거리 0.039 미만) | 뒤의 계열 |
| 브랜드 계열이 상태 색과 너무 가깝다 | 그 브랜드 계열 |
| 상태 색의 hue 가 그 상태의 범위 밖이다 | `status.X` |
| 적록 색각(deuteranopia, protanopia)에서 success 나 warning 이 danger 와 비슷하다 (0.07 미만) | `status.success`, `status.warning` |

- 거리 기준은 17개 기준 팔레트에서 나옵니다. 0.039 는 가장 가까운 두 팔레트(red, rose)의 거리이고, 0.07 은 기준 팔레트의 success·warning 과 danger 짝 중 가장 가까운 짝의 절반입니다. `tests/theme-colors.test.ts` 가 다시 계산합니다.
- primary 와 hue 가 같은 상태 색(빨간 primary 와 danger)은 가깝다고 알립니다. 의도한 것이면 `status` 로 다른 색을 줍니다.
- 개발 모드에서는 Provider 가 같은 목록을 `console.warn` 으로 알립니다. `primary` 가 아예 없으면 `console.error` 입니다.
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

  <IdsProvider.Scope theme={{ primary: promoPalette, radius: 16 }}>
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
  - 역할 색: `--ids-theme-light-bg-primary`, `--ids-theme-dark-text-on-danger-soft` … (두 모드 다). 최상위 Provider 는 primary 와 상태, 준 secondary·tertiary, `'tinted'` 일 때 neutral 과 바탕 층을 씁니다
  - 색 키를 준 Scope 는 바깥 테마와 합친 모든 계열을 다시 씁니다
  - radius: `--ids-theme-radius-standard`, `-indicator`, `-container`. `ids.css` 가 배율을 곱해 `--ids-radius-*` 로 씁니다
  - corner shape: `--ids-corner-shape`, `--ids-theme-corner-radius-scale`
- `translate` 와 `locale` 은 패키지 README 의 [문구와 언어](../../../../README.md#문구와-언어) 를 참고합니다.

## 알아둘 것

- IDS 컴포넌트는 `IdsProvider` 안에 있어야 색이 칠해집니다. 밖에 두면 CSS 변수가 정의되지 않습니다.
- `@gsainfoteam/ids-css` 를 불러오지 않아 색 변수가 비어 있으면 개발 모드에서 경고가 나옵니다.
- squircle 은 CSS `corner-shape` 로 그립니다.
  - 같은 radius 의 squircle 은 round 보다 모서리가 얕아 각져 보입니다. 그래서 squircle 테마는 모든 radius 를 1.84배로 키워, 45° 지점의 모서리 깊이를 round 와 맞춥니다.
  - `corner-shape` 를 지원하지 않는 브라우저는 둥근 모서리와 원래 radius 로 그립니다.
  - `rounded-full` 은 squircle 테마에서도 원입니다.
  - `::before` `::after` 는 자기 요소의 모양을 따릅니다. `before:rounded-[inherit]` 로 위에 칠한 hover 색이 squircle 모서리를 그대로 덮습니다.
- 최상위 Provider 는 배경을 칠하지 않습니다. 페이지 배경은 앱이 `bg-surface` 로 칠합니다.
- 최상위 Provider 는 `overlay.open` 으로 연 대화상자와 기본 `Toaster` 를 자기 요소 안(`asChild` 면 그 옆)에 그립니다. 최상위 Provider 가 여럿이면 먼저 마운트된 하나가 그립니다. 앱이 `<Toaster />` 를 직접 두면 기본 Toaster 는 물러납니다. `useOverlay()` 로 연 항목은 연 곳의 테마 변수를 받습니다.
- 서버 HTML 에는 테마 변수 말고 아무것도 더하지 않습니다. 브라우저에서는 토스트를 읽어 줄 빈 `aria-live` 영역 하나가 붙습니다. 역할(role)이 없어 스크린 리더에게 드러나지 않습니다.
- 최상위 Provider 는 Tooltip 의 지연 그룹(`TooltipDelayGroup`)도 둡니다. 툴팁 하나가 열린 뒤 곧바로 다른 툴팁에 올라가면 기다리지 않고 열립니다.
- `dark:` 변형은 두 단계 중첩까지 정확합니다. 다크 안의 라이트 안에 다시 다크를 두면 가장 안쪽은 `dark:` 에 걸리지 않습니다. 이때는 토큰 변수로 칠하면 모든 깊이에서 맞습니다.
