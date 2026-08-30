# @gsainfoteam/ids-react

IDS React 컴포넌트 라이브러리.

## 설치

GitHub Packages에서 배포한다. 퍼블릭 패키지여도 설치에 인증이 필요하다.

### 1. 토큰 준비

`gh` 가 깔려 있으면 PAT 를 따로 만들지 않아도 된다. 이미 로그인한 토큰에
스코프만 더한다.

```bash
gh auth refresh -s read:packages          # 최초 1회
export NODE_AUTH_TOKEN=$(gh auth token)   # ~/.zshrc 에 넣어둔다
```

`gh` 를 안 쓰거나 Vercel 처럼 `gh` 가 없는 환경이면 PAT 를 만든다.
GitHub > Settings > Developer settings > Personal access tokens > **Tokens (classic)**
에서 `read:packages` 만 체크한다. fine-grained 토큰은 npm 레지스트리 지원이
제한적이라 classic 을 쓴다. 발급한 값을 `NODE_AUTH_TOKEN` 환경변수로 넣는다.

### 2. 프로젝트 루트에 `.npmrc` 를 만든다

```ini
@gsainfoteam:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${NODE_AUTH_TOKEN}
```

**`${NODE_AUTH_TOKEN}` 은 이 글자 그대로 적는다.** 토큰 값으로 바꾸지 않는다.
npm 이 설치할 때 환경변수에서 읽어 채운다. 파일에 토큰을 직접 적으면 커밋돼서 새어나간다.

`.npmrc` 는 커밋해도 된다. 토큰이 들어 있지 않다.

### 3. 설치

```bash
npm install @gsainfoteam/ids-react @gsainfoteam/ids-css
npm install tailwindcss  # peerDependency
```

`bun` 도 같은 `.npmrc` 를 읽는다.

```bash
bun add @gsainfoteam/ids-react @gsainfoteam/ids-css tailwindcss
```

registry 줄만 두고 `_authToken` 을 빼면 npm 도 bun 도 401 로 거부한다.
퍼블릭 패키지여도 익명 설치가 안 된다.

### GitHub Actions 에서 설치할 때

토큰을 따로 발급하지 않는다. `secrets.GITHUB_TOKEN` 을 그대로 넘긴다.
`.npmrc` 는 위와 동일하다.

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

## 설정

CSS 엔트리포인트에서 import:

```css
@import "@gsainfoteam/ids-css";
@import "tailwindcss";
```

앱 최상단에 `ThemeProvider` 추가:

```tsx
import { ThemeProvider } from '@gsainfoteam/ids-react';

function App() {
  return (
    <ThemeProvider color="blue" mode="light">
      {/* 앱 전체 */}
    </ThemeProvider>
  );
}
```

`ThemeProvider` 없이는 CSS 변수가 정의되지 않아 색상이 렌더링되지 않는다.

## ThemeProvider

| prop | 타입 | 기본값 | 설명 |
|---|---|---|---|
| `color` | `IdsColor` | `'blue'` | 색상 테마 |
| `mode` | `IdsMode` | `'light'` | 라이트/다크 모드 |

```tsx
import { useTheme } from '@gsainfoteam/ids-react';

function ThemeToggle() {
  const { toggleMode } = useTheme();
  return <button onClick={toggleMode}>모드 전환</button>;
}
```

## 인터랙션 state

IDS는 hover / press / focus의 **소유권을 컴포넌트 안에 둔다.**  
외부 구독·controlled 인터랙션 API는 두지 않고, 아래 두 길로만 바깥에 노출한다.

실행 예시는 Storybook `Patterns/Interactive state`를 참고한다.

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
| `size` | `'standard' \| 'tiny'` | `'standard'` |
| `disabled` | `boolean` | `false` |

## 개발

```bash
pnpm storybook   # http://localhost:6006
pnpm build
pnpm typecheck
pnpm lint
```

외부 headless 라이브러리(Radix, Base UI 등)에 의존하지 않고 전부 직접 구현한다.
