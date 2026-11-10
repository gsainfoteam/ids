# 리뷰 지침

규칙의 원본은 `AGENTS.md`(`RULES.md`)입니다. 여기에는 그중 리뷰에서 특히 놓치기 쉬운 것만 적습니다.

## 볼 것

- **Server Component 안전성**
  - `components/<category>/<name>/index.tsx`에 `'use client'`, hook, context가 들어간 경우
  - hook을 부르거나 context를 만드는 모듈에 `'use client'`가 빠진 경우, 반대로 순수 모듈(`style.ts`, 로직, 타입)에 붙은 경우
  - 부품을 `child.type`으로 비교한 경우. `elementTypeOf`를 써야 합니다
- **Tailwind 클래스**
  - 런타임에 조립한 클래스 이름(템플릿 리터럴, 접두사 함수)
  - `cn()`, `tv()`, JSX `className` 밖에 놓인 클래스 문자열
  - 한 컴포넌트의 부품을 `tv()` 여러 개로 나누거나 `cn('...')`으로 따로 꾸민 경우
  - `rounded-[..]`를 손으로 계산한 경우, `concentric-p-*` 대신 `p-*`와 `rounded-*`를 짝지은 경우
  - 텍스트나 아이콘에 `primary`를 쓰거나, 옅은 배경에 `primary/10`을 쓴 경우
- **문자열**
  - 컴포넌트 코드에 한국어 리터럴을 쓴 경우
  - `useTranslate()` 키를 `internal/messages.ts`에만 넣고 `messages/en.json`에는 넣지 않은 경우
- **API 관례**
  - 값 콜백이 `onValueChange`가 아닌 경우
  - 안쪽 native input에 바깥 `onChange`를 그대로 넘겨 변경이 두 번 보고되는 경우
  - 스크롤하는 요소가 `ScrollArea`를 거치지 않는 경우
  - Escape나 바깥 클릭 처리에 floating-ui `useDismiss`를 쓴 경우
- **IDS로 조합하기**
  - IDS 부품이 있는데 손으로 만든 테두리, 버튼, 배경을 쓴 경우(`Divider`, `IconButton`, `Card`, `Item`, `Label`)
- **개발 경고**
  - `import.meta.env.DEV`를 쓴 경우. `isDevelopment`를 써야 합니다
- **스토리**
  - 스토리 파일에 데모 컴포넌트를 따로 선언한 경우(`AGENTS.md`의 예외는 제외)
  - `Gallery` 스토리가 빠진 경우
- **Bundle budget**
  - `.size-limit.json`의 한도를 올리면서 commit 메시지에 이유가 없는 경우

## 보지 않을 것

- ESLint, Prettier, TypeScript가 잡는 것
- 생성 파일: `packages/css/dist/ids.css`, `packages/react/src/tokens/types.ts`, `packages/flutter/lib/tokens/*.dart`
- `tests/__screenshots__`의 PNG. 디자인이 확정될 때까지 갱신하지 않습니다
- `pnpm-lock.yaml`
