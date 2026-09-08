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

### Spinner

부모의 글자색을 상속하는 로딩 표시다. `standard`는 20px, `tiny`는 16px이며
모션 감소 설정에서는 회전을 멈춘다. 네이티브 span 속성과 ref를 전달할 수 있다.

```tsx
import { Button, Spinner } from '@gsainfoteam/ids-react';

// 단독 사용: role="status"와 스크린 리더 텍스트를 제공한다.
<Spinner label="불러오는 중" />

// 이미 로딩 텍스트가 있는 버튼: Spinner의 중복 알림을 생략한다.
<Button disabled aria-busy="true">
  <Spinner decorative />
  저장 중
</Button>
```

| prop | 타입 | 기본값 | 설명 |
|---|---|---|---|
| `size` | `'standard' \| 'tiny'` | `'standard'` | 표시 크기 |
| `label` | `string` | `'Loading'` | 스크린 리더용 로딩 텍스트 |
| `decorative` | `boolean` | `false` | `true`이면 접근성 트리에서 숨김 |

단독 사용 시 비어 있지 않은 `label`을 사용한다. `decorative`는 버튼 텍스트나
`IconButton`의 `aria-label` 등 다른 요소가 로딩 상태를 설명할 때 사용한다.

## 개발

```bash
pnpm storybook   # http://localhost:6006
pnpm build
pnpm typecheck
pnpm lint
```

외부 headless 라이브러리(Radix, Base UI 등)에 의존하지 않고 전부 직접 구현한다.
