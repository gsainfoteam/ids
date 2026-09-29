# IdsProvider

IDS 색 테마(`color`)와 라이트/다크 모드(`mode`)를 정하는 컨텍스트 컴포넌트입니다. 앱 최상단에 한 번 둡니다.

- **CSS만으로 칠합니다.** 감싸는 요소에 `data-color` 와 `data-mode` 를 붙이면 `@gsainfoteam/ids-css` 의 변수가 그 값으로 바뀝니다. JS로 색을 계산하지 않아 전환이 깜빡이지 않습니다.
- **제어와 비제어.** `mode` 를 넘기면 부모가 값을 가지고, `defaultMode` 를 넘기면 Provider가 가집니다. `color` 도 같습니다.
- **시스템 모드.** `mode="system"` 은 운영체제의 다크 모드 설정을 따르고, 설정을 바꾸면 새로고침 없이 바로 바뀝니다.
- **중첩.** 안쪽 Provider는 지정한 축만 바꾸고 나머지 축은 바깥에서 물려받습니다. 모드가 바뀌는 영역은 스스로 배경과 글자색을 칠합니다.
- **`useTheme()`.** 어디서든 현재 값을 읽고 `setColor`, `setMode`, `toggleMode` 로 바꿉니다.
- **네이티브 컨트롤.** `color-scheme` 을 함께 설정해 스크롤바, 날짜 입력, 체크박스 같은 브라우저 기본 UI도 모드를 따릅니다.

```tsx
import { IdsProvider } from '@gsainfoteam/ids-react';

<IdsProvider defaultColor="blue" defaultMode="system">
  <App />
</IdsProvider>;
```

## 제어와 비제어

```tsx
<IdsProvider />                                        // blue, light로 시작

<IdsProvider defaultColor="orange" defaultMode="dark" /> // 비제어: Provider가 값을 가진다

const [mode, setMode] = useState<IdsProvider.Mode>('light');
<IdsProvider mode={mode} onModeChange={setMode} />      // 제어: 부모가 값을 가진다
```

- 제어 모드에서 `setMode` 는 `onModeChange` 만 부릅니다. 화면은 부모가 `mode` 를 바꿀 때 바뀝니다.
- 같은 값으로 바꾸면 `onModeChange` 를 부르지 않습니다.

## 시스템 모드

```tsx
<IdsProvider defaultMode="system">
  <App />
</IdsProvider>;

const { mode, resolvedMode } = useTheme();
// mode: 'system'        사용자가 고른 값
// resolvedMode: 'dark'  실제로 칠해진 값
```

- `prefers-color-scheme` 이 바뀌면 바로 따라갑니다.
- 서버 렌더링에서는 방문자의 설정을 알 수 없어 `light` 로 그리고, 하이드레이션 직후 실제 모드로 바꿉니다. 하이드레이션 경고는 나지 않습니다.

## 중첩

```tsx
<IdsProvider defaultColor="blue" defaultMode="light">
  <Header />

  <IdsProvider mode="dark">
    {' '}
    {/* color는 바깥(blue)을 물려받는다 */}
    <Sidebar />
  </IdsProvider>

  <IdsProvider color="orange">
    {' '}
    {/* mode는 바깥(light)을 물려받는다 */}
    <PromoBanner />
  </IdsProvider>
</IdsProvider>
```

- 안쪽 Provider에서 부르는 setter는 그 축을 가진 Provider로 갑니다. 위 `Sidebar` 에서 `setColor('green')` 을 부르면 바깥 Provider의 색이 바뀝니다.
- 바깥과 모드가 다른 영역은 `--ids-color-surface` 배경과 `--ids-color-on-surface` 글자색을 칠합니다. 그렇지 않으면 다크 글자색이 라이트 배경 위에 그려집니다.
- `dark:` 변형도 가장 가까운 `data-mode` 를 따릅니다. 다크 안의 라이트 영역은 `dark:` 에 걸리지 않습니다.

## useTheme

```tsx
import { useTheme } from '@gsainfoteam/ids-react';

function ThemeMenu() {
  const { color, mode, resolvedMode, setColor, setMode, toggleMode } = useTheme();
  return (
    <>
      <Button onClick={toggleMode}>{resolvedMode === 'dark' ? '라이트로' : '다크로'}</Button>
      <Button onClick={() => setMode('system')}>시스템 설정 따르기</Button>
      <Button onClick={() => setColor('orange')}>오렌지</Button>
    </>
  );
}
```

| 값             | 뜻                                                                    |
| -------------- | --------------------------------------------------------------------- |
| `color`        | 현재 색 테마                                                          |
| `mode`         | 고른 모드. `light` / `dark` / `system`                                |
| `resolvedMode` | 실제로 칠해진 모드. `light` / `dark`                                  |
| `setColor`     | 색 테마를 바꾼다                                                      |
| `setMode`      | 모드를 바꾼다                                                         |
| `toggleMode`   | `resolvedMode` 의 반대로 바꾼다. `system` 이었으면 명시적인 값이 된다 |

- Provider 밖에서 부르면 `blue`, `light` 와 아무 일도 하지 않는 setter를 돌려줍니다.

## asChild

```tsx
<IdsProvider asChild color="green" mode="dark">
  <section>…</section> {/* 감싸는 div 없이 section에 data-color, data-mode가 붙는다 */}
</IdsProvider>
```

- 레이아웃 때문에 요소를 하나 더 두기 어려울 때 씁니다. 자식은 요소 하나여야 합니다.

## 속성

| 속성                                  | 기본 / 동작                                                                                          |
| ------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `color` / `defaultColor`              | `blue` / `orange` / `green`. 둘 다 없으면 바깥을 물려받는다                                          |
| `onColorChange`                       | 색 테마를 바꾸려 할 때                                                                               |
| `mode` / `defaultMode`                | `light` / `dark` / `system`. 둘 다 없으면 바깥을 물려받는다                                          |
| `onModeChange`                        | 모드를 바꾸려 할 때                                                                                  |
| `translate`                           | `(key, values) => string \| undefined`. IDS 문구를 앱의 i18n 으로 바꾼다. 없으면 바깥을 물려받는다   |
| `locale`                              | 날짜, 시간, 숫자, 국가 이름의 BCP 47 locale. 없으면 바깥을 물려받는다. 컴포넌트의 `locale` 이 이긴다 |
| `asChild`                             | 자식 요소에 속성을 붙인다                                                                            |
| `className` / `style` / `ref` / 그 외 | 감싸는 요소(또는 자식)로 간다                                                                        |

- 최상위 Provider는 둘 다 없으면 `blue`, `light` 로 시작합니다.
- 요소에는 `data-color`, `data-mode`(항상 `light` / `dark`), `style.colorScheme` 이 붙습니다.
- `translate` 와 `locale` 은 패키지 README 의 [문구와 언어](../../../../README.md#문구와-언어) 를 참고합니다.

## 알아둘 것

- IDS 컴포넌트는 `IdsProvider` 안에 있어야 색이 칠해집니다. 밖에 두면 CSS 변수가 정의되지 않습니다.
- `@gsainfoteam/ids-css` 를 불러오지 않아 색 변수가 비어 있으면 개발 모드에서 경고가 나옵니다.
- 최상위 Provider는 배경을 칠하지 않습니다. 페이지 배경은 앱이 `bg-(--ids-color-surface)` 로 칠합니다.
- 최상위 Provider는 `overlay.open` 으로 연 대화상자와 기본 `Toaster` 를 자기 요소 안(`asChild` 면 그 옆)에 그립니다. 최상위 Provider가 여럿이면 먼저 마운트된 하나가 그립니다. 앱이 `<Toaster />` 를 직접 두면 기본 Toaster 는 물러납니다.
- 서버 HTML 에는 아무것도 더하지 않습니다. 브라우저에서는 토스트를 읽어 줄 빈 `aria-live` 영역 하나가 붙습니다. 역할(role)이 없어 스크린 리더에게 드러나지 않습니다.
- 최상위 Provider는 Tooltip 의 지연 그룹(`TooltipDelayGroup`)도 둡니다. 툴팁 하나가 열린 뒤 곧바로 다른 툴팁에 올라가면 기다리지 않고 열립니다.
- `dark:` 변형은 두 단계 중첩까지 정확합니다. 다크 안의 라이트 안에 다시 다크를 두면 가장 안쪽은 `dark:` 에 걸리지 않습니다. 이때는 토큰 변수로 칠하면 모든 깊이에서 맞습니다.
